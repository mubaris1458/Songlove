import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
};

export type FavKind = "song" | "movie" | "actor" | "artist";

type LibraryState = {
  favorites: Record<FavKind, string[]>;
  playlists: Playlist[];
  isFavorite: (kind: FavKind, id: string) => boolean;
  toggleFavorite: (kind: FavKind, id: string) => void;
  createPlaylist: (name: string) => Playlist;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (id: string, songIds: string[]) => void;
  removeFromPlaylist: (id: string, songId: string) => void;
};

const KEY = "raaga.library.v1";
const empty: Record<FavKind, string[]> = { song: [], movie: [], actor: [], artist: [] };

const LibraryContext = createContext<LibraryState | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Record<FavKind, string[]>>(empty);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          favorites?: Record<FavKind, string[]>;
          playlists?: Playlist[];
        };
        setFavorites({ ...empty, ...(parsed.favorites ?? {}) });
        setPlaylists(parsed.playlists ?? []);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ favorites, playlists }));
  }, [favorites, playlists, hydrated]);

  const toggleFavorite = useCallback((kind: FavKind, id: string) => {
    setFavorites((f) => {
      const list = f[kind];
      return {
        ...f,
        [kind]: list.includes(id) ? list.filter((x) => x !== id) : [id, ...list],
      };
    });
  }, []);

  const value = useMemo<LibraryState>(
    () => ({
      favorites,
      playlists,
      isFavorite: (kind, id) => favorites[kind].includes(id),
      toggleFavorite,
      createPlaylist: (name) => {
        const pl: Playlist = {
          id: `pl_${Date.now().toString(36)}`,
          name,
          songIds: [],
          createdAt: new Date().toISOString(),
        };
        setPlaylists((p) => [pl, ...p]);
        return pl;
      },
      renamePlaylist: (id, name) =>
        setPlaylists((p) => p.map((x) => (x.id === id ? { ...x, name } : x))),
      deletePlaylist: (id) => setPlaylists((p) => p.filter((x) => x.id !== id)),
      addToPlaylist: (id, songIds) =>
        setPlaylists((p) =>
          p.map((x) =>
            x.id === id
              ? { ...x, songIds: [...new Set([...x.songIds, ...songIds])] }
              : x,
          ),
        ),
      removeFromPlaylist: (id, songId) =>
        setPlaylists((p) =>
          p.map((x) =>
            x.id === id ? { ...x, songIds: x.songIds.filter((s) => s !== songId) } : x,
          ),
        ),
    }),
    [favorites, playlists, toggleFavorite],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
