import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/context/library";
import { toast } from "sonner";

export function AddToPlaylistDialog({
  songIds,
  label,
  open,
  onOpenChange,
}: {
  songIds: string[];
  label: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { playlists, addToPlaylist, createPlaylist } = useLibrary();
  const [name, setName] = useState("");

  const add = (id: string, plName: string) => {
    addToPlaylist(id, songIds);
    toast.success(`Added ${label} to ${plName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface">
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => add(pl.id, pl.name)}
              className="flex w-full items-center justify-between rounded-xl bg-surface-2 px-4 py-3 text-left text-sm hover:bg-secondary"
            >
              <span>{pl.name}</span>
              <span className="text-xs text-muted-foreground">
                {pl.songIds.length} songs
              </span>
            </button>
          ))}
          {playlists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No playlists yet.</p>
          ) : null}
        </div>
        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const pl = createPlaylist(name.trim());
            setName("");
            add(pl.id, pl.name);
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            className="bg-surface-2"
          />
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
