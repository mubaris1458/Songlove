import { Link } from "@tanstack/react-router";
import { Heart, ListPlus, Download, Play, Pause } from "lucide-react";
import type { PlayableSong } from "@/data/catalog";
import { formatTime } from "@/data/catalog";
import { usePlayer } from "@/context/player";
import { useLibrary } from "@/context/library";
import { downloadFile } from "@/lib/download";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SongRow({
  song,
  index,
  onPlay,
  showMovie = true,
  onAddToPlaylist,
}: {
  song: PlayableSong;
  index?: number;
  onPlay: () => void;
  showMovie?: boolean;
  onAddToPlaylist?: (song: PlayableSong) => void;
}) {
  const { current, isPlaying, toggle } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const active = current?.id === song.id;
  const liked = isFavorite("song", song.id);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors sm:px-3",
        active ? "bg-surface-2" : "hover:bg-surface",
      )}
    >
      <button
        onClick={() => (active ? toggle() : onPlay())}
        aria-label={active && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-foreground transition-transform group-hover:scale-105"
      >
        {active && isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      {typeof index === "number" ? (
        <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {index + 1}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            active && "text-primary",
          )}
        >
          {song.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {song.singers.join(", ")}
          {showMovie ? ` · ${song.movieTitle}` : ""}
        </p>
      </div>

      {showMovie ? (
        <Link
          to="/movie/$movieId"
          params={{ movieId: song.movieId }}
          className="hidden shrink-0 text-xs text-muted-foreground hover:text-primary lg:block"
        >
          {song.year}
        </Link>
      ) : null}

      <span className="hidden w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:block">
        {formatTime(song.duration)}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        {onAddToPlaylist ? (
          <button
            onClick={() => onAddToPlaylist(song)}
            aria-label="Add to playlist"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ListPlus className="h-4 w-4" />
          </button>
        ) : null}
        <button
          onClick={() => toggleFavorite("song", song.id)}
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          className={cn(
            "rounded-lg p-2 transition-colors",
            liked ? "text-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
        </button>
        <button
          onClick={() => {
            downloadFile(song.url, `${song.movieTitle} - ${song.title}.mp3`);
            toast.success(`Downloading ${song.title}`);
          }}
          aria-label={`Download ${song.title}`}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
