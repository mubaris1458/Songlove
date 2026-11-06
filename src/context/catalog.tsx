import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  movies as baseMovies,
  actorSlug,
  type Movie,
  type PlayableSong,
  type Song,
} from "@/data/catalog";

type MovieOverride = Partial<Pick<Movie, "title" | "year" | "hero" | "musicDirector">>;
type SongOverride = Partial<Pick<Song, "title" | "singers">>;

type Overrides = {
  movies: Record<string, MovieOverride>;
  songs: Record<string, SongOverride>;
  hiddenSongs: string[];
  hiddenMovies: string[];
  extraSongs: Record<string, Song[]>;
};

const EMPTY: Overrides = {
  movies: {},
  songs: {},
  hiddenSongs: [],
  hiddenMovies: [],
  extraSongs: {},
};

const KEY = "raaga.catalog.overrides.v1";

type CatalogState = {
  movies: Movie[];
  allSongs: PlayableSong[];
  actors: { id: string; name: string }[];
  getMovie: (id: string) => Movie | undefined;
  songsOfMovie: (id: string) => PlayableSong[];
  moviesOfActor: (actorId: string) => Movie[];
  getSongs: (ids: string[]) => PlayableSong[];
  search: (q: string) => {
    movies: Movie[];
    songs: PlayableSong[];
    actors: { id: string; name: string }[];
    artists: string[];
  };
  updateMovie: (id: string, patch: MovieOverride) => void;
  updateSong: (id: string, patch: SongOverride) => void;
  removeSong: (id: string) => void;
  removeMovie: (id: string) => void;
  addSong: (movieId: string, title: string, singers: string[], url: string) => void;
  resetOverrides: () => void;
};

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ov, setOv] = useState<Overrides>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setOv({ ...EMPTY, ...(JSON.parse(raw) as Overrides) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(ov));
  }, [ov, hydrated]);

  const movies = useMemo(
    () =>
      baseMovies
        .filter((m) => !ov.hiddenMovies.includes(m.id))
        .map((m) => ({
          ...m,
          ...ov.movies[m.id],
          songs: [...m.songs, ...(ov.extraSongs[m.id] ?? [])]
            .filter((s) => !ov.hiddenSongs.includes(s.id))
            .map((s) => ({ ...s, ...ov.songs[s.id] })),
        })),
    [ov],
  );

  const allSongs = useMemo<PlayableSong[]>(
    () =>
      movies.flatMap((m) =>
        m.songs.map((s) => ({
          ...s,
          movieId: m.id,
          movieTitle: m.title,
          year: m.year,
          hero: m.hero,
          musicDirector: m.musicDirector,
        })),
      ),
    [movies],
  );

  const actors = useMemo(
    () =>
      Array.from(new Set(movies.map((m) => m.hero).filter(Boolean))).map((name) => ({
        id: actorSlug(name),
        name,
      })),
    [movies],
  );


  const search = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return { movies: [], songs: [], actors: [], artists: [] };
      const has = (v: string) => v.toLowerCase().includes(q);
      const mm = movies.filter(
        (m) =>
          has(m.title) ||
          has(m.hero) ||
          has(m.musicDirector) ||
          has(String(m.year)) ||
          m.songs.some((s) => has(s.title) || s.singers.some(has)),
      );
      const ss = allSongs.filter(
        (s) =>
          has(s.title) ||
          s.singers.some(has) ||
          has(s.movieTitle) ||
          has(s.musicDirector) ||
          has(s.hero) ||
          has(String(s.year)),
      );
      const aa = actors.filter((a) => has(a.name));
      const artists = new Set<string>();
      for (const s of allSongs) {
        for (const singer of s.singers) if (has(singer)) artists.add(singer);
        if (has(s.musicDirector)) artists.add(s.musicDirector);
      }
      return { movies: mm, songs: ss, actors: aa, artists: [...artists] };
    },
    [movies, allSongs, actors],
  );

  const value = useMemo<CatalogState>(
    () => ({
      movies,
      allSongs,
      actors,
      getMovie: (id) => movies.find((m) => m.id === id),
      songsOfMovie: (id) => allSongs.filter((s) => s.movieId === id),
      moviesOfActor: (actorId) => movies.filter((m) => actorSlug(m.hero) === actorId),
      getSongs: (ids) =>
        ids
          .map((id) => allSongs.find((s) => s.id === id))
          .filter((s): s is PlayableSong => Boolean(s)),
      search,
      updateMovie: (id, patch) =>
        setOv((o) => ({ ...o, movies: { ...o.movies, [id]: { ...o.movies[id], ...patch } } })),
      updateSong: (id, patch) =>
        setOv((o) => ({ ...o, songs: { ...o.songs, [id]: { ...o.songs[id], ...patch } } })),
      removeSong: (id) =>
        setOv((o) => ({ ...o, hiddenSongs: [...new Set([...o.hiddenSongs, id])] })),
      removeMovie: (id) =>
        setOv((o) => ({ ...o, hiddenMovies: [...new Set([...o.hiddenMovies, id])] })),
      addSong: (movieId, title, singers, url) =>
        setOv((o) => {
          const id = `custom-${movieId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          const existing = o.extraSongs[movieId] ?? [];
          if (existing.some((s) => s.id === id)) return o;
          return {
            ...o,
            extraSongs: {
              ...o.extraSongs,
              [movieId]: [...existing, { id, title, singers, duration: 210, url }],
            },
          };
        }),
      resetOverrides: () => setOv(EMPTY),
    }),
    [movies, allSongs, actors, search],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
