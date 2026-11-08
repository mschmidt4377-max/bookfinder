import { useEffect, useRef, useState } from "react";
import { ScrollText } from "lucide-react";

const UPDATES: { title: string; detail: string }[] = [
  {
    title: "Hilarious",
    detail: "A category of books that are actually funny, from Hitchhiker's Guide to Bossypants.",
  },
  {
    title: "Dark mode",
    detail: "A moon button in the header switches the paper background to a warm dark theme.",
  },
  {
    title: "New York Times Best Sellers",
    detail: "A shelf and a category for this week's hardcover fiction and nonfiction.",
  },
  {
    title: "Español",
    detail: "Spanish novels and classics, including Cien años de soledad and Don Quijote.",
  },
  {
    title: "More books",
    detail: "Biography, Thriller, Historical fiction, Adventure, Graphic novels, Nonfiction, Children's, Crime, and Short stories.",
  },
  {
    title: "Categories menu",
    detail: "Categories moved to the top-right corner. The old Browse row was removed.",
  },
  {
    title: "Ninja Cat",
    detail: "A cat section for cat stories, picture books, and the clan series.",
  },
  {
    title: "Buy links",
    detail: "Shop links search by the book name, and the lowest confirmed price is marked.",
  },
  {
    title: "BookFinder",
    detail: "Search any book, see the series, read reviews, and find places to read or buy it.",
  },
];

export function UpdatesMenu() {
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
        aria-controls="updates-menu"
        onClick={() => setOpen((value) => !value)}
        aria-label="Updates"
        className={`inline-flex min-h-11 items-center rounded-full px-2.5 text-sm sm:px-3 ${open ? "bg-ink text-card" : "text-ink hover:bg-paper-deep"}`}
      >
        <ScrollText className="size-4 sm:hidden" aria-hidden />
        <span className="hidden sm:inline">Updates</span>
      </button>
      <div
        id="updates-menu"
        hidden={!open}
        className="absolute right-0 z-30 mt-2 max-h-[min(24rem,70vh)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-line bg-card p-4"
      >
        <p className="font-serif text-lg">Updates</p>
        <p className="mt-1 text-sm text-muted">What has been added to BookFinder.</p>
        <ol className="mt-4 flex flex-col gap-4">
          {UPDATES.map((update) => (
            <li key={update.title}>
              <p className="text-sm font-medium">{update.title}</p>
              <p className="mt-1 text-sm text-muted">{update.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
