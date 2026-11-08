import { createFileRoute } from "@tanstack/react-router";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), ".cache", "covers");

export const Route = createFileRoute("/covers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(id)) return new Response("Bad cover", { status: 400 });
        const file = path.join(DIR, `${id}.jpg`);
        try {
          const cached = await readFile(file);
          if (cached.length > 800) {
            return new Response(cached, {
              headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=604800" },
            });
          }
        } catch {
          /* not cached yet */
        }
        const upstream = await fetch(`https://archive.org/services/img/${id}`, {
          headers: { "User-Agent": "BookFinder/1.0 (book catalog)", Accept: "image/jpeg,image/*" },
          signal: AbortSignal.timeout(8000),
        });
        if (!upstream.ok) return new Response(null, { status: 404 });
        const bytes = Buffer.from(await upstream.arrayBuffer());
        if (bytes.length < 800) return new Response(null, { status: 404 });
        await mkdir(DIR, { recursive: true }).catch(() => {});
        await writeFile(file, bytes).catch(() => {});
        return new Response(bytes, {
          headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=604800" },
        });
      },
    },
  },
});
