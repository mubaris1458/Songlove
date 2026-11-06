import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlayableSong } from "@/data/catalog";

type Repeat = "off" | "all" | "one";

type PlayerState = {
  queue: PlayableSong[];
  index: number;
  current: PlayableSong | null;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: Repeat;
  progress: number;
  duration: number;
  volume: number;
  playQueue: (songs: PlayableSong[], startIndex?: number, shuffle?: boolean) => void;
  playSong: (song: PlayableSong) => void;
  addToQueue: (songs: PlayableSong[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  jumpTo: (i: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

function shuffled<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i]!, a[j]!] = [a[j]!, a[i]!];
  }
  return a;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<PlayableSong[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>("off");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const current = queue[index] ?? null;

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i + 1 < queue.length) return i + 1;
      return repeat === "all" ? 0 : i;
    });
    setIsPlaying((p) => (index + 1 < queue.length || repeat === "all" ? true : p));
  }, [queue.length, repeat, index]);

  const prev = useCallback(() => {
    const el = audioRef.current;
    if (el && el.currentTime > 4) {
      el.currentTime = 0;
      return;
    }
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  useEffect(() => {
    const el = ensureAudio();
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnd = () => {
      if (repeat === "one") {
        el.currentTime = 0;
        void el.play();
        return;
      }
      if (index + 1 < queue.length) setIndex(index + 1);
      else if (repeat === "all" && queue.length) setIndex(0);
      else setIsPlaying(false);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [ensureAudio, index, queue.length, repeat]);

  useEffect(() => {
    const el = ensureAudio();
    if (!el || !current) return;
    const abs = new URL(current.url, window.location.origin).href;
    if (el.src !== abs) {
      el.src = current.url;
      el.load();
      setProgress(0);
    }
    if (isPlaying) void el.play().catch(() => setIsPlaying(false));
    else el.pause();
  }, [current, isPlaying, ensureAudio]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !current)
      return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.singers.join(", "),
      album: `${current.movieTitle} (${current.year})`,
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
  }, [current, isPlaying, next, prev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA"].includes(t.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.code === "MediaTrackNext") next();
      if (e.code === "MediaTrackPrevious") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const playQueue = useCallback(
    (songs: PlayableSong[], startIndex = 0, doShuffle = false) => {
      if (!songs.length) return;
      const list = doShuffle ? shuffled(songs) : songs;
      setShuffle(doShuffle);
      setQueue(list);
      setIndex(doShuffle ? 0 : startIndex);
      setIsPlaying(true);
    },
    [],
  );

  const value = useMemo<PlayerState>(
    () => ({
      queue,
      index,
      current,
      isPlaying,
      shuffle,
      repeat,
      progress,
      duration,
      volume,
      playQueue,
      playSong: (song) => playQueue([song], 0, false),
      addToQueue: (songs) => setQueue((q) => [...q, ...songs]),
      toggle: () => setIsPlaying((p) => !p),
      next,
      prev,
      seek: (t) => {
        const el = audioRef.current;
        if (el) el.currentTime = t;
        setProgress(t);
      },
      setVolume: setVolumeState,
      toggleShuffle: () => {
        setShuffle((s) => {
          if (!s && queue.length > 1) {
            const cur = queue[index]!;
            const rest = shuffled(queue.filter((_, i) => i !== index));
            setQueue([cur, ...rest]);
            setIndex(0);
          }
          return !s;
        });
      },
      cycleRepeat: () =>
        setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
      jumpTo: (i) => {
        setIndex(i);
        setIsPlaying(true);
      },
    }),
    [
      queue,
      index,
      current,
      isPlaying,
      shuffle,
      repeat,
      progress,
      duration,
      volume,
      playQueue,
      next,
      prev,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
