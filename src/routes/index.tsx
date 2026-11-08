import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookRow } from "@/components/book-card";
import { SERIES } from "@/lib/categories";
import { getHomeShelves } from "@/lib/books.functions";

export const Route = createFileRoute("/")({
  loader: () => getHomeShelves(),
  component: Home,
  pendingComponent: HomePending,
});

function Home() {
  const { shelves } = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <section className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-accent">Find books easily</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">Search any book. See the whole series.</h1>
        <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
          Look up a title, author, or ISBN. Open a book for reviews, every volume in the series, free ways to read, and the lowest price we can confirm.
        </p>
      </section>

      <section className="grid grid-cols-[5.5rem_1fr] items-center gap-4 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[8rem_1fr] sm:p-5">
        <img
          src="/ninja-cat.jpg"
          alt=""
          width={800}
          height={800}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <div>
          <p className="text-sm font-medium tracking-wide text-accent">The cat section</p>
          <h2 className="mt-1 font-serif text-2xl">Meet Ninja Cat</h2>
          <p className="mt-2 max-w-xl text-muted">Night librarian with a book under one paw. The cat shelf is stories, picture books, and the clan series.</p>
          <Link
            to="/cats"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card"
          >
            Open the cat section
          </Link>
        </div>
      </section>

      <Recent />

      <section>
        <h2 className="font-serif text-2xl">Start a series</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERIES.map((name) => (
            <Link
              key={name}
              to="/search"
              search={{ q: name, page: 1, sort: "match" }}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-ink"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      {shelves.map((shelf) => (
        <section key={shelf.id}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">{shelf.title}</h2>
              <p className="mt-1 text-sm text-muted">{shelf.note}</p>
            </div>
            {shelf.q ? (
              <Link
                to="/search"
                search={{ q: shelf.q, page: 1, sort: "match" }}
                className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
              >
                See all
              </Link>
            ) : null}
          </div>
          {shelf.hits.length ? (
            <BookRow books={shelf.hits} />
          ) : (
            <p className="mt-4 text-muted">This shelf is unavailable right now. Search above and you can still find anything.</p>
          )}
        </section>
      ))}
    </div>
  );
}

function HomePending() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="aspect-2/3 animate-pulse rounded-xl bg-paper-deep" />
      ))}
    </div>
  );
}

function Recent() {
  const [items, setItems] = useState<string[] | null>(null);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("bookfinder-recent") || "[]") as unknown;
      setItems(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 6) : []);
    } catch {
      setItems([]);
    }
  }, []);
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="font-serif text-2xl">Recent searches</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item}
            to="/search"
            search={{ q: item, page: 1, sort: "match" }}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card"
          >
            {item}
          </Link>
        ))}
      </div>
    </section>
  );
}
