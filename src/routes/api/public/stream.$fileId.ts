import { createFileRoute } from "@tanstack/react-router";

const ID_RE = /^[A-Za-z0-9_-]{10,80}$/;

async function proxy(fileId: string, range: string | null, method: "GET" | "HEAD") {
  if (!ID_RE.test(fileId)) return new Response("Bad id", { status: 400 });

  const upstream = await fetch(
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
    {
      method,
      headers: range ? { Range: range } : {},
      redirect: "follow",
    },
  );

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "audio/mpeg");
  for (const h of ["content-length", "content-range", "accept-ranges", "etag"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

export const Route = createFileRoute("/api/public/stream/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) =>
        proxy(params.fileId, request.headers.get("range"), "GET"),
      HEAD: async ({ request, params }) =>
        proxy(params.fileId, request.headers.get("range"), "HEAD"),
    },
  },
});
