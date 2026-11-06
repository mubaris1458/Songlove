export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadMany(
  files: { url: string; filename: string }[],
  onProgress?: (i: number) => void,
) {
  for (let i = 0; i < files.length; i++) {
    const f = files[i]!;
    downloadFile(f.url, f.filename);
    onProgress?.(i + 1);
    await new Promise((r) => setTimeout(r, 700));
  }
}

export async function shareLink(title: string, url: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  await navigator.clipboard?.writeText(url);
  return "copied";
}
