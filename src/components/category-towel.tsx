import { Link } from "@tanstack/react-router";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GENRES, SERIES } from "@/lib/categories";

export function CategoryMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="category-menu"
        onClick={() => setOpen((value) => !value)}
        aria-label="Categories"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm sm:px-3 ${open ? "bg-ink text-card" : "text-ink hover:bg-paper-deep"}`}
      >
        <LayoutGrid className="size-4 sm:hidden" aria-hidden />
        <span className="hidden sm:inline">Categories</span>
        <ChevronDown className={`hidden size-4 sm:block ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div
        id="category-menu"
        hidden={!open}
        className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-card p-4"
      >
        <p className="text-xs font-medium tracking-wide text-muted">Genres</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Link
              key={genre.label}
              to="/search"
              search={{ q: genre.q, page: 1, sort: "match" }}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 text-sm hover:border-ink"
            >
              {genre.label}
            </Link>
          ))}
          <Link
            to="/cats"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card"
          >
            Cats
          </Link>
        </div>
        <p className="mt-4 text-xs font-medium tracking-wide text-muted">Series</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERIES.map((name) => (
            <Link
              key={name}
              to="/search"
              search={{ q: name, page: 1, sort: "match" }}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 text-sm hover:border-ink"
            >
              {name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
