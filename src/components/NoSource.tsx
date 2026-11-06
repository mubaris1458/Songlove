import { FolderArchive } from "lucide-react";

export function NoSource() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-border bg-surface p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-brand-foreground shadow-glow">
        <FolderArchive className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">No music source connected</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        All demo songs have been removed. Your Google Drive folder currently holds a
        single 3.65&nbsp;GB archive, <span className="font-medium">songs.music.zip</span>,
        and Drive cannot stream audio from inside a ZIP file.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Extract the archive and upload the individual MP3 files (with your metadata file
        and album art) to the same Drive folder. The catalog will fill in from your own
        songs — nothing else will ever be shown here.
      </p>
    </div>
  );
}
