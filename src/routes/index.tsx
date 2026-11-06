import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Play, Shuffle } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { usePlayer } from "@/context/player";
import { MovieCard } from "@/components/MovieCard";
import { Poster } from "@/components/Poster";
import { Section, Row } from "@/components/Section";
import { NoSource } from "@/components/NoSource";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raagam — Tamil Movie Music Streaming, Free & Ad-Free" },
      {
        name: "description",
        content:
          "Stream and download Tamil film songs by movie, actor, singer or music director. Free, ad-free, mobile-first music streaming.",
      },
      { property: "og:title", content: "Raagam — Tamil Movie Music Streaming" },
      {
        property: "og:description",
        content: "Browse movies, actors and albums. Play, queue and download songs free.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { movies, allSongs, actors, songsOfMovie } = useCatalog();
  const { playQueue } = usePlayer();

  const recentlyAdded = useMemo(
    () => [...movies].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 10),
    [movies],
  );
  const trending = useMemo(
    () => [...movies].sort((a, b) => b.plays - a.plays).slice(0, 10),
    [movies],
  );
  const latest = useMemo(
    () => [...movies].sort((a, b) => b.year - a.year).slice(0, 10),
    [movies],
  );
  const azMovies = useMemo(
    () => [...movies].sort((a, b) => a.title.localeCompare(b.title)),
    [movies],
  );
  const hero = trending[0];

  if (!movies.length) {
    return (
      <div className="animate-rise">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Raagam</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Your songs, only yours.</h1>
        </header>
        <NoSource />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10 animate-rise">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Raagam</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
          Every movie. Every song.
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {movies.length} movies · {allSongs.length} songs · no ads, ever.
        </p>
        {hero ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => playQueue(songsOfMovie(hero.id))}
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              <Play className="h-4 w-4" /> Play {hero.title}
            </button>
            <button
              onClick={() => playQueue(allSongs, 0, true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
            >
              <Shuffle className="h-4 w-4" /> Shuffle everything
            </button>
          </div>
        ) : null}
      </header>


      <Section title="Recently Added">
        <Row>
          {recentlyAdded.map((m) => (
            <MovieCard key={m.id} movie={m} wide />
          ))}
        </Row>
      </Section>

      <Section title="Trending Movies">
        <Row>
          {trending.map((m) => (
            <MovieCard key={m.id} movie={m} wide />
          ))}
        </Row>
      </Section>

      {actors.length ? (
      <Section title="Popular Actors">
        <Row>
          {actors.map((a) => (
            <Link
              key={a.id}
              to="/actor/$actorId"
              params={{ actorId: a.id }}
              className="w-32 shrink-0 text-center"
            >
              <Poster
                title=""
                seed={a.id}
                rounded="rounded-full"
                className="aspect-square w-32 transition-transform hover:-translate-y-1"
              />
              <p className="mt-2 truncate text-sm font-medium">{a.name}</p>
            </Link>
          ))}
        </Row>
      </Section>
      ) : null}


      <Section title="Latest Albums">
        <Row>
          {latest.map((m) => (
            <MovieCard key={m.id} movie={m} wide />
          ))}
        </Row>
      </Section>

      <Section
        title="A–Z Movies"
        action={
          <Link to="/movies" className="text-sm text-primary">
            View all
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {azMovies.slice(0, 10).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </Section>
    </div>
  );
}
