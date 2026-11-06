import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { usePlayer } from "@/context/player";
import { MovieCard } from "@/components/MovieCard";
import { SongRow } from "@/components/SongRow";
import { Poster } from "@/components/Poster";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Songs, Movies, Actors & Singers | Raagam" },
      {
        name: "description",
        content:
          "Instant search across movies, songs, actors, singers, music directors, albums and years.",
      },
      { property: "og:title", content: "Search | Raagam" },
      {
        property: "og:description",
        content: "Find any Tamil film song by movie, actor, singer, composer or year.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const { search } = useCatalog();
  const { playQueue } = usePlayer();
  const res = search(q);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Search</h1>
      <div className="sticky top-2 z-20 mb-8 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Movies, songs, actors, singers, music directors, years…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {!q ? (
        <p className="text-sm text-muted-foreground">
          Try “Kamal”, “A.R. Rahman”, “Shreya Ghoshal” or “2023”.
        </p>
      ) : null}

      {res.actors.length ? (
        <section className="mb-8 animate-rise">
          <h2 className="mb-3 text-lg font-bold">Actors</h2>
          <div className="flex flex-wrap gap-4">
            {res.actors.map((a) => (
              <Link
                key={a.id}
                to="/actor/$actorId"
                params={{ actorId: a.id }}
                className="w-28 text-center"
              >
                <Poster title="" seed={a.id} rounded="rounded-full" className="aspect-square w-28" />
                <p className="mt-2 truncate text-sm">{a.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {res.artists.length ? (
        <section className="mb-8 animate-rise">
          <h2 className="mb-3 text-lg font-bold">Artists</h2>
          <div className="flex flex-wrap gap-2">
            {res.artists.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {res.movies.length ? (
        <section className="mb-8 animate-rise">
          <h2 className="mb-3 text-lg font-bold">Movies</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {res.movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      ) : null}

      {res.songs.length ? (
        <section className="mb-8 animate-rise">
          <h2 className="mb-3 text-lg font-bold">Songs</h2>
          <div className="space-y-1">
            {res.songs.slice(0, 60).map((s, i) => (
              <SongRow key={s.id} song={s} onPlay={() => playQueue(res.songs, i)} />
            ))}
          </div>
        </section>
      ) : null}

      {q && !res.movies.length && !res.songs.length && !res.actors.length ? (
        <p className="text-sm text-muted-foreground">No results for “{q}”.</p>
      ) : null}
    </div>
  );
}
