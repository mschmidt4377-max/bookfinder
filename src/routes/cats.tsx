import { createFileRoute, Link } from "@tanstack/react-router";
import { BookRow } from "@/components/book-card";
import { getCatShelves } from "@/lib/books.functions";

const TRAILS = [
  { label: "All cat books", q: "cats fiction" },
  { label: "Ninja cats", q: "ninja cat" },
  { label: "The Cat in the Hat", q: "The Cat in the Hat" },
  { label: "Warrior cats", q: "Warriors Erin Hunter" },
  { label: "The cat who…", q: "The Cat Who mysteries" },
  { label: "Puss in Boots", q: "Puss in Boots" },
  { label: "Catwings", q: "Catwings" },
];

export const Route = createFileRoute("/cats")({
  loader: () => getCatShelves(),
  component: CatPage,
  pendingComponent: CatPending,
  head: () => ({
    meta: [{ title: "Cats · BookFinder" }],
  }),
});

function CatPage() {
  const { shelves } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-12">
      <section className="grid items-center gap-8 sm:grid-cols-[16rem_1fr] sm:gap-10">
        <img
          src="/ninja-cat.jpg"
          alt="Ninja Cat, a black cat in a dark wrap and headband, one paw resting on a book"
          width={800}
          height={800}
          className="aspect-square w-full max-w-64 rounded-2xl border border-line object-cover sm:max-w-none"
        />
        <div className="max-w-xl">
          <p className="text-sm font-medium tracking-wide text-accent">The cat section</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Ninja Cat</h1>
          <p className="mt-4 text-lg text-muted">
            Night librarian. The headband is for the late shift, the book is non-negotiable, and this shelf is every cat story we can find.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Start here</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRAILS.map((trail) => (
            <Link
              key={trail.label}
              to="/search"
              search={{ q: trail.q, page: 1, sort: "match" }}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-ink"
            >
              {trail.label}
            </Link>
          ))}
        </div>
      </section>

      {shelves.map((shelf) => (
        <section key={shelf.title}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">{shelf.title}</h2>
              <p className="mt-1 text-sm text-muted">{shelf.note}</p>
            </div>
            <Link
              to="/search"
              search={{ q: shelf.q, page: 1, sort: "match" }}
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
            >
              See all
            </Link>
          </div>
          {shelf.hits.length ? (
            <BookRow books={shelf.hits} />
          ) : (
            <p className="mt-4 text-muted">This shelf is quiet right now. Try one of the searches above.</p>
          )}
        </section>
      ))}
    </div>
  );
}

function CatPending() {
  return (
    <div className="grid gap-8 sm:grid-cols-[16rem_1fr]">
      <div className="aspect-square max-w-64 animate-pulse rounded-2xl bg-paper-deep" />
      <div className="flex flex-col gap-3">
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-paper-deep" />
        <div className="h-4 w-full animate-pulse rounded bg-paper-deep" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-paper-deep" />
      </div>
    </div>
  );
}
