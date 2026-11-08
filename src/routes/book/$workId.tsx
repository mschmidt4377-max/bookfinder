import { createFileRoute, Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { BookCard } from "@/components/book-card";
import { Cover } from "@/components/cover";
import { Stars } from "@/components/stars";
import { compactCount, money, seriesLabel, subjectQuery, type Offer } from "@/lib/books";
import { getBook } from "@/lib/books.functions";

export const Route = createFileRoute("/book/$workId")({
  loader: ({ params }) => getBook({ data: { id: params.workId } }),
  component: BookPage,
  pendingComponent: BookPending,
  errorComponent: BookError,
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.book.title} · BookFinder` : "Book · BookFinder" }],
  }),
});

function BookPage() {
  const data = Route.useLoaderData();
  const { book } = data;
  const seriesText = seriesLabel(book.seriesName, book.seriesPosition);
  const [expanded, setExpanded] = useState(false);
  const long = (data.description?.length ?? 0) > 520;
  const description = data.description && long && !expanded ? `${data.description.slice(0, 500).trim()}…` : data.description;
  const cheapest = data.buy.find((offer) => offer.price != null);

  const jumps = [
    data.series ? ["#series", "Series"] : null,
    ["#read", "Read"],
    ["#buy", "Buy"],
    ["#reviews", "Reviews"],
  ].filter((item): item is [string, string] => !!item);

  return (
    <article className="flex flex-col gap-10">
      <BackLink />

      <header className="grid gap-5 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <div className="mx-auto w-40 sm:mx-0 sm:w-auto">
          <Cover coverId={book.coverId} isbn={book.isbn} image={book.image} title={book.title} eager />
        </div>
        <div className="min-w-0">
          {seriesText ? <p className="text-sm text-accent">{seriesText}</p> : null}
          <h1 className="mt-1 font-serif text-3xl leading-tight sm:text-5xl">{book.title}</h1>
          <p className="mt-2 text-lg text-muted">{book.authors.join(", ") || "Unknown author"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Stars value={book.rating} />
              <span className="tabular-nums">{book.rating != null ? book.rating.toFixed(1) : "No rating"}</span>
              {book.ratingCount ? <span className="text-muted tabular-nums">{compactCount(book.ratingCount)} ratings</span> : null}
            </span>
            {book.year ? <span className="text-muted tabular-nums">{book.year}</span> : null}
            {book.pages ? <span className="text-muted tabular-nums">{book.pages} pages</span> : null}
            {data.editionCount ? <span className="text-muted tabular-nums">{compactCount(data.editionCount)} editions</span> : null}
          </div>
          {data.opening ? (
            <blockquote className="mt-4 max-w-xl border-l-2 border-accent pl-4 font-serif text-lg text-ink">“{data.opening}”</blockquote>
          ) : null}

          <div className="mt-5 rounded-2xl border border-line bg-card p-4">
            {data.freeRead ? (
              <p className="text-sm text-muted">
                Read free on{" "}
                <a className="font-medium text-accent underline decoration-line underline-offset-4" href={data.freeRead.url} target="_blank" rel="noreferrer">
                  {data.freeRead.vendor}
                </a>
                {data.lowest ? <span> · or buy from {money(data.lowest.price)}</span> : null}
              </p>
            ) : null}
            {data.lowest ? (
              <a href={data.lowest.url} target="_blank" rel="noreferrer" className="mt-1 flex items-end justify-between gap-4">
                <span>
                  <span className="block text-sm text-muted">Lowest confirmed price</span>
                  <span className="font-serif text-4xl tabular-nums">{money(data.lowest.price)}</span>
                  <span className="mt-1 block text-sm">
                    {data.lowest.format} · {data.lowest.vendor}
                  </span>
                </span>
                <ArrowUpRight className="mb-1 size-5 shrink-0 text-muted" aria-hidden />
              </a>
            ) : data.freeRead ? null : (
              <p className="text-sm text-muted">No confirmed price yet. Compare the shops below — they open a live search for this book.</p>
            )}
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto" aria-label="On this page">
            {jumps.map(([href, label]) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {data.series ? (
        <section id="series" className="scroll-mt-28">
          <h2 className="font-serif text-2xl">The whole series</h2>
          <p className="mt-1 text-sm text-muted">{data.series.name}, in reading order when we know it.</p>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
            {data.series.books.map((item) => {
              const current = item.id === book.id;
              return (
                <Link
                  key={item.id}
                  to="/book/$workId"
                  params={{ workId: item.id }}
                  className={`group w-28 shrink-0 sm:w-32 ${current ? "rounded-xl ring-2 ring-accent ring-offset-2 ring-offset-paper" : ""}`}
                  aria-current={current ? "page" : undefined}
                >
                  <Cover coverId={item.coverId} isbn={item.isbn} image={item.image} title={item.title} />
                  <p className="mt-2 text-xs text-accent">
                    {item.seriesPosition && /^\d+(\.\d+)?$/.test(item.seriesPosition) ? `Book ${item.seriesPosition}` : item.seriesPosition || "Related"}
                  </p>
                  <p className="line-clamp-2 font-serif text-sm leading-snug">{item.title}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <OfferSection id="read" title="Where to read" note="Free copies and library loans first." offers={data.read} />
        <OfferSection
          id="buy"
          title="Where to buy"
          note="Cheapest confirmed price first. “See price” opens that shop’s search."
          offers={data.buy}
          cheapestId={cheapest?.id}
        />
      </div>

      <section id="reviews" className="scroll-mt-28">
        <h2 className="font-serif text-2xl">Reviews</h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <div className="rounded-2xl border border-line bg-card p-4">
            <p className="font-serif text-4xl tabular-nums">{data.ratings.average != null ? data.ratings.average.toFixed(1) : "—"}</p>
            <Stars value={data.ratings.average} />
            <p className="mt-1 text-sm text-muted">
              {data.ratings.count ? `${compactCount(data.ratings.count)} Open Library ratings` : "No Open Library ratings yet"}
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              {data.ratings.histogram.map((row) => {
                const max = Math.max(...data.ratings.histogram.map((item) => item.count), 1);
                const width = row.count === 0 ? 0 : Math.round((row.count / max) * 100);
                return (
                  <div key={row.star} className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-3 tabular-nums">{row.star}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
                    </span>
                    <span className="w-8 text-right tabular-nums">{compactCount(row.count)}</span>
                  </div>
                );
              })}
            </div>
            {data.ratings.appleAverage != null ? (
              <p className="mt-4 text-sm">
                Apple Books <span className="tabular-nums">{data.ratings.appleAverage.toFixed(1)}</span>
                {data.ratings.appleCount ? <span className="text-muted"> · {compactCount(data.ratings.appleCount)}</span> : null}
              </p>
            ) : null}
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Want" value={data.ratings.want} />
              <Stat label="Reading" value={data.ratings.reading} />
              <Stat label="Finished" value={data.ratings.finished} />
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            {data.reviews.length ? (
              data.reviews.map((review) => (
                <article key={`${review.author}-${review.title}`} className="rounded-2xl border border-line bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{review.title}</h3>
                    <Stars value={review.rating} />
                  </div>
                  <p className="mt-2 text-sm leading-6">{review.body}</p>
                  <p className="mt-2 text-xs text-muted">
                    {review.author} · {review.source}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted">
                Written reviews show up when Apple Books has them for this edition. The bars are real Open Library ratings.
              </p>
            )}
          </div>
        </div>
      </section>

      {description || data.subjects.length ? (
        <section className="max-w-3xl">
          <h2 className="font-serif text-2xl">About this book</h2>
          {description ? <p className="mt-3 leading-7 text-ink">{description}</p> : null}
          {long ? (
            <button type="button" className="mt-2 min-h-11 text-sm font-medium text-accent" onClick={() => setExpanded((open) => !open)}>
              {expanded ? "Show less" : "Show more"}
            </button>
          ) : null}
          {data.subjects.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.subjects.map((subject) => (
                <Link
                  key={subject}
                  to="/search"
                  search={{ q: subjectQuery(subject), page: 1, sort: "rating" }}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm"
                >
                  {subject}
                </Link>
              ))}
            </div>
          ) : null}
          <p className="mt-4 text-sm">
            <a
              className="text-accent underline decoration-line underline-offset-4"
              href={`https://openlibrary.org/works/${book.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open Library record
            </a>
          </p>
        </section>
      ) : null}

      {data.moreByAuthor.length ? (
        <section>
          <h2 className="font-serif text-2xl">More by {data.authorName}</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
            {data.moreByAuthor.map((item) => (
              <BookCard key={item.id} book={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl bg-paper px-1 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tabular-nums">{value != null ? compactCount(value) : "—"}</dd>
    </div>
  );
}

function OfferSection({
  id,
  title,
  note,
  offers,
  cheapestId,
}: {
  id: string;
  title: string;
  note: string;
  offers: Offer[];
  cheapestId?: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="border-b border-line px-4 py-4">
        <h2 className="font-serif text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </div>
      <ul className="divide-y divide-line">
        {offers.map((item) => {
          const lowest = item.id === cheapestId;
          return (
            <li key={item.id} className={lowest ? "bg-paper" : undefined}>
              <a href={item.url} target="_blank" rel="noreferrer" className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-paper">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.vendor}</span>
                    {lowest ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">Lowest</span> : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {item.format}
                    {item.detail ? ` · ${item.detail}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right font-serif text-lg tabular-nums">{priceText(item)}</span>
                <ArrowUpRight className="size-4 shrink-0 text-muted" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function priceText(item: Offer): string {
  if (item.price === 0) return "Free";
  if (item.price == null) return item.channel === "read" ? "Check" : "See price";
  return money(item.price);
}

function BackLink() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-ink"
      onClick={() => (canGoBack ? router.history.back() : router.navigate({ to: "/" }))}
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back
    </button>
  );
}

function BookPending() {
  return (
    <div className="grid gap-6 sm:grid-cols-[11rem_1fr]">
      <div className="aspect-2/3 animate-pulse rounded-xl bg-paper-deep" />
      <div className="flex flex-col gap-3">
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-paper-deep" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-paper-deep" />
        <div className="mt-4 h-28 animate-pulse rounded-2xl bg-paper-deep" />
      </div>
    </div>
  );
}

function BookError({ error }: ErrorComponentProps) {
  return (
    <div className="py-10">
      <h1 className="font-serif text-3xl">That book didn’t load</h1>
      <p className="mt-3 text-muted">{error instanceof Error ? error.message : "That book didn’t load."}</p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent">
        Back to BookFinder
      </Link>
    </div>
  );
}
