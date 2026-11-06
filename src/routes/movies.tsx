import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useCatalog } from "@/context/catalog";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "All Movies A–Z | Raagam" },
      {
        name: "description",
        content: "Browse every movie soundtrack A to Z and play all its songs together.",
      },
      { property: "og:title", content: "All Movies A–Z | Raagam" },
      {
        property: "og:description",
        content: "Complete alphabetical movie list with full song albums.",
      },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const { movies } = useCatalog();
  const groups = useMemo(() => {
    const map = new Map<string, typeof movies>();
    for (const m of [...movies].sort((a, b) => a.title.localeCompare(b.title))) {
      const letter = m.title[0]!.toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), m]);
    }
    return [...map.entries()];
  }, [movies]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">All Movies</h1>
      {groups.map(([letter, list]) => (
        <section key={letter} className="mb-8 animate-rise">
          <h2 className="mb-3 text-lg font-bold text-primary">{letter}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {list.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
