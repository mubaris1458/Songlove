export type Song = {
  id: string;
  title: string;
  singers: string[];
  duration: number;
  url: string;
};

export type Movie = {
  id: string;
  title: string;
  year: number;
  hero: string;
  musicDirector: string;
  language: string;
  addedAt: string;
  plays: number;
  songs: Song[];
};

export type Actor = {
  id: string;
  name: string;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type RawMovie = {
  title: string;
  year: number;
  musicDirector: string;
  songs: [string, string[], number, string][];
};

import driveCatalog from "./drive-catalog.json";

const RAW = driveCatalog as RawMovie[];

export const driveStreamUrl = (fileId: string) =>
  `/api/public/stream/${fileId}`;

// Catalog is populated only from the user's own Google Drive files.
// No demo, sample or placeholder audio is permitted here.
export const movies: Movie[] = RAW.map((m, i) => ({
  id: slug(`${m.title}-${m.year}-${i}`),
  title: m.title,
  year: m.year,
  hero: m.musicDirector === "Unknown" ? "" : m.musicDirector,
  musicDirector: m.musicDirector,
  language: "Tamil",
  addedAt: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  plays: RAW.length - i,
  songs: m.songs.map((s) => ({
    id: s[3],
    title: s[0],
    singers: s[1],
    duration: s[2],
    url: driveStreamUrl(s[3]),
  })),
}));


export const actors: Actor[] = Array.from(
  new Set(movies.map((m) => m.hero)),
).map((name) => ({ id: slug(name), name }));

export const musicDirectors = Array.from(
  new Set(movies.map((m) => m.musicDirector)),
);

export type PlayableSong = Song & {
  movieId: string;
  movieTitle: string;
  year: number;
  hero: string;
  musicDirector: string;
};

export const allSongs: PlayableSong[] = movies.flatMap((m) =>
  m.songs.map((s) => ({
    ...s,
    movieId: m.id,
    movieTitle: m.title,
    year: m.year,
    hero: m.hero,
    musicDirector: m.musicDirector,
  })),
);

export const songById = new Map(allSongs.map((s) => [s.id, s]));
export const movieById = new Map(movies.map((m) => [m.id, m]));
export const actorById = new Map(actors.map((a) => [a.id, a]));

export const moviesOfActor = (actorId: string) =>
  movies.filter((m) => slug(m.hero) === actorId);

export const actorSlug = slug;

export const songsOfMovie = (movieId: string): PlayableSong[] =>
  allSongs.filter((s) => s.movieId === movieId);

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { movies: [], songs: [], actors: [], artists: [] as string[] };
  const match = (v: string) => v.toLowerCase().includes(q);

  const matchedMovies = movies.filter(
    (m) =>
      match(m.title) ||
      match(m.hero) ||
      match(m.musicDirector) ||
      match(String(m.year)) ||
      m.songs.some((s) => match(s.title) || s.singers.some(match)),
  );

  const matchedSongs = allSongs.filter(
    (s) =>
      match(s.title) ||
      s.singers.some(match) ||
      match(s.movieTitle) ||
      match(s.musicDirector) ||
      match(s.hero) ||
      match(String(s.year)),
  );

  const matchedActors = actors.filter((a) => match(a.name));

  const artistNames = new Set<string>();
  for (const s of allSongs) {
    for (const singer of s.singers) if (match(singer)) artistNames.add(singer);
    if (match(s.musicDirector)) artistNames.add(s.musicDirector);
  }

  return {
    movies: matchedMovies,
    songs: matchedSongs,
    actors: matchedActors,
    artists: [...artistNames],
  };
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
