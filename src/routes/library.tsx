import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Shuffle, Trash2, Pencil } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { useLibrary } from "@/context/library";
import { usePlayer } from "@/context/player";
import { MovieCard } from "@/components/MovieCard";
import { SongRow } from "@/components/SongRow";
import { Poster } from "@/components/Poster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your Library — Favorites & Playlists | Raagam" },
      {
        name: "description",
        content: "Your liked songs, movies and actors plus every playlist you created.",
      },
      { property: "og:title", content: "Your Library | Raagam" },
      {
        property: "og:description",
        content: "Favorites and playlists saved on your device.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { favorites, playlists, createPlaylist, deletePlaylist, renamePlaylist, removeFromPlaylist } =
    useLibrary();
  const { getSongs, movies, actors } = useCatalog();
  const { playQueue } = usePlayer();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const likedSongs = getSongs(favorites.song);
  const likedMovies = movies.filter((m) => favorites.movie.includes(m.id));
  const likedActors = actors.filter((a) => favorites.actor.includes(a.id));

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Your Library</h1>
      <Tabs defaultValue="songs">
        <TabsList className="bg-surface">
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="actors">Actors</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="mt-6">
          {likedSongs.length ? (
            <>
              <div className="mb-4 flex gap-2">
                <Button onClick={() => playQueue(likedSongs)}>
                  <Play className="h-4 w-4" /> Play all
                </Button>
                <Button variant="secondary" onClick={() => playQueue(likedSongs, 0, true)}>
                  <Shuffle className="h-4 w-4" /> Shuffle
                </Button>
              </div>
              <div className="space-y-1">
                {likedSongs.map((s, i) => (
                  <SongRow key={s.id} song={s} onPlay={() => playQueue(likedSongs, i)} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No liked songs yet.</p>
          )}
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {likedMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
          {!likedMovies.length ? (
            <p className="text-sm text-muted-foreground">No liked movies yet.</p>
          ) : null}
        </TabsContent>

        <TabsContent value="actors" className="mt-6">
          <div className="flex flex-wrap gap-4">
            {likedActors.map((a) => (
              <Link key={a.id} to="/actor/$actorId" params={{ actorId: a.id }} className="w-28 text-center">
                <Poster title="" seed={a.id} rounded="rounded-full" className="aspect-square w-28" />
                <p className="mt-2 truncate text-sm">{a.name}</p>
              </Link>
            ))}
          </div>
          {!likedActors.length ? (
            <p className="text-sm text-muted-foreground">No liked actors yet.</p>
          ) : null}
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <form
            className="mb-6 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                createPlaylist(name.trim());
                setName("");
              }
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New playlist name"
              className="max-w-xs bg-surface"
            />
            <Button type="submit">Create</Button>
          </form>

          <div className="space-y-6">
            {playlists.map((pl) => {
              const songs = getSongs(pl.songIds);
              return (
                <div key={pl.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {editing === pl.id ? (
                      <Input
                        autoFocus
                        defaultValue={pl.name}
                        onBlur={(e) => {
                          renamePlaylist(pl.id, e.target.value || pl.name);
                          setEditing(null);
                        }}
                        className="max-w-xs bg-surface-2"
                      />
                    ) : (
                      <h3 className="text-lg font-bold">{pl.name}</h3>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {songs.length} songs
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="sm" onClick={() => playQueue(songs)} disabled={!songs.length}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => playQueue(songs, 0, true)}
                        disabled={!songs.length}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditing(pl.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePlaylist(pl.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {songs.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <SongRow song={s} onPlay={() => playQueue(songs, i)} />
                        </div>
                        <button
                          onClick={() => removeFromPlaylist(pl.id, s.id)}
                          aria-label="Remove from playlist"
                          className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {!playlists.length ? (
              <p className="text-sm text-muted-foreground">No playlists yet.</p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
