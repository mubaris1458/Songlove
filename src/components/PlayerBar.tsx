import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  Download,
  ListMusic,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { usePlayer } from "@/context/player";
import { useLibrary } from "@/context/library";
import { formatTime } from "@/data/catalog";
import { Poster } from "./Poster";
import { downloadFile } from "@/lib/download";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function PlayerBar() {
  const {
    current,
    isPlaying,
    toggle,
    next,
    prev,
    progress,
    duration,
    seek,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    queue,
    index,
    jumpTo,
    volume,
    setVolume,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [expanded, setExpanded] = useState(false);

  if (!current) return null;
  const liked = isFavorite("song", current.id);
  const total = duration || current.duration;

  const controls = (size: "sm" | "lg") => (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <button
        onClick={toggleShuffle}
        aria-label="Shuffle"
        className={cn(
          "rounded-lg p-2 transition-colors",
          shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Shuffle className="h-4 w-4" />
      </button>
      <button
        onClick={prev}
        aria-label="Previous"
        className="rounded-lg p-2 text-foreground"
      >
        <SkipBack className="h-5 w-5" />
      </button>
      <button
        onClick={toggle}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={cn(
          "flex items-center justify-center rounded-full gradient-brand text-brand-foreground shadow-glow transition-transform hover:scale-105",
          size === "lg" ? "h-16 w-16" : "h-11 w-11",
        )}
      >
        {isPlaying ? (
          <Pause className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
        ) : (
          <Play className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
        )}
      </button>
      <button onClick={next} aria-label="Next" className="rounded-lg p-2 text-foreground">
        <SkipForward className="h-5 w-5" />
      </button>
      <button
        onClick={cycleRepeat}
        aria-label="Repeat"
        className={cn(
          "rounded-lg p-2 transition-colors",
          repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
      </button>
    </div>
  );

  const seekBar = (
    <div className="flex items-center gap-2">
      <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">
        {formatTime(progress)}
      </span>
      <Slider
        value={[Math.min(progress, total)]}
        max={total || 1}
        step={1}
        onValueChange={(v) => seek(v[0] ?? 0)}
        aria-label="Seek"
        className="flex-1"
      />
      <span className="w-9 text-[11px] tabular-nums text-muted-foreground">
        {formatTime(total)}
      </span>
    </div>
  );

  const queueList = (
    <div className="mt-4 max-h-[60vh] space-y-1 overflow-y-auto pr-1">
      {queue.map((s, i) => (
        <button
          key={`${s.id}-${i}`}
          onClick={() => jumpTo(i)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
            i === index ? "bg-surface-2" : "hover:bg-surface",
          )}
        >
          <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-sm",
                i === index && "text-primary",
              )}
            >
              {s.title}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {s.singers.join(", ")}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{formatTime(s.duration)}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Expanded full-screen player */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-300",
          expanded ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 page-glow" />
        <div className="relative z-10 flex items-center justify-between p-4">
          <button
            onClick={() => setExpanded(false)}
            aria-label="Collapse player"
            className="rounded-lg p-2 text-muted-foreground"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {current.movieTitle} · {current.year}
          </p>
          <span className="w-10" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 pb-10">
          <Poster
            title={current.movieTitle}
            subtitle={`${current.hero} · ${current.musicDirector}`}
            seed={current.movieId}
            className="aspect-square w-full rounded-3xl"
          />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">{current.title}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {current.singers.join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite("song", current.id)}
                aria-label="Favorite"
                className={cn("p-2", liked ? "text-accent" : "text-muted-foreground")}
              >
                <Heart className={cn("h-5 w-5", liked && "fill-current")} />
              </button>
              <button
                onClick={() =>
                  downloadFile(current.url, `${current.movieTitle} - ${current.title}.mp3`)
                }
                aria-label="Download"
                className="p-2 text-muted-foreground"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
          {seekBar}
          {controls("lg")}
          <div className="flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              aria-label="Volume"
              onValueChange={(v) => setVolume((v[0] ?? 0) / 100)}
              className="max-w-40 flex-1"
            />
            <Sheet>
              <SheetTrigger className="ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                <ListMusic className="h-4 w-4" /> Queue
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-surface">
                <SheetHeader>
                  <SheetTitle>Up next</SheetTitle>
                </SheetHeader>
                {queueList}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mini player */}
      <div className="fixed inset-x-0 bottom-[57px] z-40 border-t border-border bg-surface/95 backdrop-blur md:bottom-0 md:left-60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-2.5">
          <button
            onClick={() => setExpanded(true)}
            aria-label="Open player"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <Poster
              title={current.movieTitle}
              seed={current.movieId}
              className="h-11 w-11 shrink-0 rounded-lg [&>div:last-child]:hidden"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{current.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {current.singers.join(", ")}
              </span>
            </span>
          </button>

          <div className="hidden flex-1 flex-col gap-1 md:flex">
            {controls("sm")}
            {seekBar}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"} className="p-2">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <button onClick={next} aria-label="Next" className="p-2">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          <Sheet>
            <SheetTrigger
              aria-label="Queue"
              className="hidden rounded-lg p-2 text-muted-foreground hover:text-foreground md:block"
            >
              <ListMusic className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-surface">
              <SheetHeader>
                <SheetTitle>Up next</SheetTitle>
              </SheetHeader>
              {queueList}
            </SheetContent>
          </Sheet>
        </div>
        <div className="h-0.5 w-full bg-surface-2 md:hidden">
          <div
            className="h-full gradient-brand transition-[width]"
            style={{ width: `${total ? (progress / total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </>
  );
}
