import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { Movie } from "@/data/catalog";
import { Poster } from "./Poster";
import { usePlayer } from "@/context/player";
import { songsOfMovie } from "@/data/catalog";

export function MovieCard({ movie, wide = false }: { movie: Movie; wide?: boolean }) {
  const { playQueue } = usePlayer();

  return (
    <div className={wide ? "w-44 shrink-0 sm:w-52" : ""}>
      <Link
        to="/movie/$movieId"
        params={{ movieId: movie.id }}
        className="group relative block"
      >
        <Poster
          title={movie.title}
          subtitle={`${movie.hero || movie.musicDirector} · ${movie.year}`}
          seed={movie.id}
          className="aspect-[2/3] w-full transition-transform duration-300 group-hover:-translate-y-1"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            playQueue(songsOfMovie(movie.id));
          }}
          aria-label={`Play ${movie.title}`}
          className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full gradient-brand text-brand-foreground opacity-0 shadow-glow transition-all group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Play className="h-5 w-5" />
        </button>
      </Link>
    </div>
  );
}
