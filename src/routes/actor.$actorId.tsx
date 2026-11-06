import { createFileRoute, notFound } from "@tanstack/react-router";
import { Play, Shuffle, Heart } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { usePlayer } from "@/context/player";
import { useLibrary } from "@/context/library";
import { Poster } from "@/components/Poster";
import { MovieCard } from "@/components/MovieCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/actor/$actorId")({
  head: () => ({
    meta: [
      { title: "Actor Filmography & Songs | Raagam" },
      {
        name: "description",
        content: "Every movie of this actor with the complete song list for each album.",
      },
      { property: "og:title", content: "Actor Filmography & Songs | Raagam" },
      {
        property: "og:description",
        content: "Browse an actor's movies and play all their film songs.",
      },
    ],
  }),
  component: ActorPage,
});

function ActorPage() {
  const { actorId } = Route.useParams();
  const { actors, moviesOfActor, allSongs } = useCatalog();
  const { playQueue } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();

  const actor = actors.find((a) => a.id === actorId);
  if (!actor) throw notFound();
  const movies = moviesOfActor(actorId);
  const songs = allSongs.filter((s) => movies.some((m) => m.id === s.movieId));
  const liked = isFavorite("actor", actor.id);

  return (
    <div className="animate-rise">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
        <Poster
          title=""
          seed={actor.id}
          rounded="rounded-full"
          className="aspect-square w-32 sm:w-44"
        />
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Actor</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-5xl">{actor.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {movies.length} movies · {songs.length} songs
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => playQueue(songs)}
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow"
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
              onClick={() => toggleFavorite("actor", actor.id)}
              aria-label="Favorite actor"
              className={cn(
                "rounded-full border border-border bg-surface p-2.5 hover:bg-surface-2",
                liked && "text-accent",
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-bold">Movies</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
