import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Shuffle, Download, Heart, Share2, ListPlus } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { usePlayer } from "@/context/player";
import { useLibrary } from "@/context/library";
import { Poster } from "@/components/Poster";
import { SongRow } from "@/components/SongRow";
import { AddToPlaylistDialog } from "@/components/AddToPlaylistDialog";
import { downloadMany, shareLink } from "@/lib/download";
import { actorSlug } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/movie/$movieId")({
  head: () => ({
    meta: [
      { title: "Movie Songs | Raagam" },
      {
        name: "description",
        content: "All songs from this movie in one album — play, queue and download.",
      },
      { property: "og:title", content: "Movie Songs | Raagam" },
      {
        property: "og:description",
        content: "Full soundtrack with play all, shuffle and album download.",
      },
    ],
  }),
  component: MoviePage,
});

function MoviePage() {
  const { movieId } = Route.useParams();
  const { getMovie, songsOfMovie } = useCatalog();
  const { playQueue } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [dialogSongs, setDialogSongs] = useState<string[] | null>(null);

  const movie = getMovie(movieId);
  if (!movie) throw notFound();
  const songs = songsOfMovie(movie.id);
  const liked = isFavorite("movie", movie.id);

  return (
    <div className="animate-rise">
      <div className="flex flex-col gap-6 sm:flex-row">
        <Poster
          title={movie.title}
          seed={movie.id}
          className="aspect-[2/3] w-40 shrink-0 sm:w-56 [&>div:last-child]:hidden"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-primary">Album</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-5xl">{movie.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {movie.year} · {movie.language} · {songs.length} songs
          </p>
          <p className="mt-1 text-sm">
            {movie.hero ? (
              <>
                Hero:{" "}
                <Link
                  to="/actor/$actorId"
                  params={{ actorId: actorSlug(movie.hero) }}
                  className="text-primary hover:underline"
                >
                  {movie.hero}
                </Link>{" "}
                ·{" "}
              </>
            ) : null}
            Music: <span className="text-foreground">{movie.musicDirector}</span>
          </p>


          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => playQueue(songs)}
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105"
            >
              <Play className="h-4 w-4" /> Play All
            </button>
            <button
              onClick={() => playQueue(songs, 0, true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-2"
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
            <button
              onClick={() => {
                toast.success(`Downloading ${songs.length} songs`);
                void downloadMany(
                  songs.map((s) => ({
                    url: s.url,
                    filename: `${movie.title} - ${s.title}.mp3`,
                  })),
                );
              }}
              aria-label="Download album"
              className="rounded-full border border-border bg-surface p-2.5 hover:bg-surface-2"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleFavorite("movie", movie.id)}
              aria-label="Favorite movie"
              className={cn(
                "rounded-full border border-border bg-surface p-2.5 hover:bg-surface-2",
                liked && "text-accent",
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
            <button
              onClick={() =>
                void shareLink(movie.title, window.location.href).then((r) =>
                  toast.success(r === "copied" ? "Link copied" : "Shared"),
                )
              }
              aria-label="Share"
              className="rounded-full border border-border bg-surface p-2.5 hover:bg-surface-2"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDialogSongs(songs.map((s) => s.id))}
              aria-label="Add album to playlist"
              className="rounded-full border border-border bg-surface p-2.5 hover:bg-surface-2"
            >
              <ListPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-1">
        {songs.map((s, i) => (
          <SongRow
            key={s.id}
            song={s}
            index={i}
            showMovie={false}
            onPlay={() => playQueue(songs, i)}
            onAddToPlaylist={(song) => setDialogSongs([song.id])}
          />
        ))}
      </div>

      <AddToPlaylistDialog
        songIds={dialogSongs ?? []}
        label={dialogSongs && dialogSongs.length > 1 ? movie.title : "song"}
        open={dialogSongs !== null}
        onOpenChange={(v) => !v && setDialogSongs(null)}
      />
    </div>
  );
}
