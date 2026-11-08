import { createFileRoute, Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookCard } from "@/components/book-card";
import { compactCount, prettyQuery, readSearch, type SearchResponse, type Sort } from "@/lib/books";
import { searchBooks } from "@/lib/books.functions";

export const Route = createFileRoute("/search")({
  validateSearch: (search) => readSearch(search as Record<string, unknown>),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }): Promise<SearchResponse> => {
    const q = deps.q.trim();
    if (!q) return { q: "", page: 1, sort: "match", numFound: 0, hits: [] };
    return searchBooks({ data: { q, page: deps.page, sort: deps.sort } });
  },
  component: SearchPage,
  pendingComponent: SearchPending,
  errorComponent: SearchError,
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.q ? `${prettyQuery(loaderData.q)} · BookFinder` : "Search · BookFinder" }],
  }),
});

const SORTS: { id: Sort; label: string }[] = [
  { id: "match", label: "Best match" },
  { id: "rating", label: "Top rated" },
  { id: "new", label: "Newest" },
];

function SearchPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  useEffect(() => {
    const q = search.q.trim();
    if (!q || q.toLowerCase().startsWith("subject:")) return;
    try {
      const current = JSON.parse(localStorage.getItem("bookfinder-recent") || "[]") as unknown;
      const list = Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : [];
      const next = [q, ...list.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 6);
      localStorage.setItem("bookfinder-recent", JSON.stringify(next));
    } catch {
      /* ignore private mode */
    }
  }, [search.q]);

  if (!search.q.trim()) {
    return (
      <div className="py-10">
        <h1 className="font-serif text-4xl">Search any book</h1>
        <p className="mt-3 max-w-lg text-muted">Try a title, an author, or an ISBN. Harry Potter, Octavia Butler, or 9780439023528.</p>
      </div>
    );
  }

  const label = prettyQuery(search.q);
  const start = data.hits.length ? (data.page - 1) * 24 + 1 : 0;
  const end = (data.page - 1) * 24 + data.hits.length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">{label}</h1>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            {data.numFound ? `${compactCount(data.numFound)} books · showing ${start}–${end}` : "No books matched"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((sort) => {
            const active = search.sort === sort.id;
            return (
              <Link
                key={sort.id}
                to="/search"
                search={{ q: search.q, page: 1, sort: sort.id }}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${active ? "bg-ink text-card" : "border border-line bg-card text-ink"}`}
                aria-current={active ? "true" : undefined}
              >
                {sort.label}
              </Link>
            );
          })}
        </div>
      </div>

      {data.hits.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {data.hits.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p className="mt-10 max-w-lg text-muted">Nothing came up for that. Check the spelling, or search the author instead of the full title.</p>
      )}

      {data.numFound > 24 ? (
        <div className="mt-10 flex items-center justify-between gap-4">
          {data.page > 1 ? (
            <Link
              to="/search"
              search={{ q: search.q, page: data.page - 1, sort: search.sort }}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 text-sm"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted tabular-nums">Page {data.page}</span>
          {end < data.numFound && data.page < 20 ? (
            <Link
              to="/search"
              search={{ q: search.q, page: data.page + 1, sort: search.sort }}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 text-sm"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </div>
  );
}

function SearchPending() {
  return (
    <div>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-paper-deep" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="aspect-2/3 animate-pulse rounded-xl bg-paper-deep" />
        ))}
      </div>
    </div>
  );
}

function SearchError({ error }: ErrorComponentProps) {
  return (
    <div className="py-10">
      <h1 className="font-serif text-3xl">Search didn’t finish</h1>
      <p className="mt-3 max-w-lg text-muted">{error instanceof Error ? error.message : "Search didn’t finish."}</p>
    </div>
  );
}
