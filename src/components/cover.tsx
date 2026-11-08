import { useState } from "react";
import { coverUrl, isbnCoverUrl } from "@/lib/books";

export function Cover({
  coverId,
  isbn = null,
  title,
  image = null,
  eager = false,
}: {
  coverId: number | null;
  isbn?: string | null;
  title: string;
  image?: string | null;
  eager?: boolean;
}) {
  const sources = [
    image,
    coverId != null ? coverUrl(coverId, "L") : null,
    isbn ? isbnCoverUrl(isbn) : null,
  ].filter((src): src is string => !!src);
  const [index, setIndex] = useState(0);
  const src = sources[index];

  function next() {
    setIndex((current) => current + 1);
  }

  return (
    <div className="aspect-2/3 overflow-hidden rounded-md bg-paper-deep shadow-[0_14px_22px_-16px_rgba(28,25,21,0.85),0_1px_2px_rgba(28,25,21,0.18)] ring-1 ring-ink/10 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_28px_-14px_rgba(28,25,21,0.9)]">
      {src ? (
        <img
          src={src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
          onError={next}
          onLoad={(event) => {
            const img = event.currentTarget;
            if (img.naturalWidth < 20 || img.naturalHeight < 20) next();
          }}
        />
      ) : (
        <div
          className="flex h-full flex-col justify-between p-3"
          style={{
            background: `color-mix(in oklab, var(--color-accent) ${12 + (title.length % 4) * 6}%, var(--color-paper-deep))`,
          }}
        >
          <span className="font-serif text-2xl leading-none text-accent">{title.trim().slice(0, 1).toUpperCase() || "B"}</span>
          <span className="line-clamp-4 font-serif text-sm leading-snug text-ink">{title}</span>
        </div>
      )}
    </div>
  );
}
