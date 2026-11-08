import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CategoryMenu } from "@/components/category-towel";
import { UpdatesMenu } from "@/components/updates-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const urlQuery = useRouterState({
    select: (state) => {
      const search = state.location.search as { q?: unknown };
      return typeof search?.q === "string" ? search.q : "";
    },
  });
  const [q, setQ] = useState(urlQuery);

  useEffect(() => {
    setQ(urlQuery);
  }, [urlQuery]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate({ to: "/search", search: { q: query, page: 1, sort: "match" } });
  }

  const roomy = path === "/";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2 px-4 py-2 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:py-3">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink sm:size-11">
              <BookOpen className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-lg leading-none sm:text-xl">BookFinder</span>
              <span className="mt-1 hidden text-xs text-muted sm:block">Find books easily</span>
            </span>
          </Link>
          <div className="flex items-center justify-end gap-1 sm:order-3">
            <ThemeToggle />
            <UpdatesMenu />
            <CategoryMenu />
          </div>
          <form onSubmit={onSubmit} className="relative col-span-2 min-w-0 sm:col-span-1 sm:order-2" role="search">
            <label htmlFor="book-search" className="sr-only">
              Search books
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="book-search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Title, author, or ISBN"
              enterKeyHint="search"
              className={`w-full rounded-full border border-line bg-card pr-28 pl-12 text-ink placeholder:text-muted ${roomy ? "h-14" : "h-12"}`}
            />
            <button
              type="submit"
              className="absolute top-1.5 right-1.5 bottom-1.5 min-w-20 rounded-full bg-accent px-4 text-sm font-medium text-accent-ink"
            >
              Search
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-[max(4rem,env(safe-area-inset-bottom))] sm:pt-8">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>BookFinder · Find books easily</p>
          <p className="max-w-xl">
            Confirmed prices come from Apple Books and AbeBooks used listings, including shipping. Other shops open a live search.
          </p>
        </div>
      </footer>
    </div>
  );
}
