import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { seriesLabel, type BookHit } from "@/lib/books";
import { Cover } from "@/components/cover";

export function BookCard({ book }: { book: BookHit }) {
  const series = seriesLabel(book.seriesName, book.seriesPosition);
  const className = "group flex min-w-0 flex-col gap-3";
  const body = (
    <>
      <Cover coverId={book.coverId} isbn={book.isbn} image={book.image} title={book.title} />
      <div className="min-w-0">
        {series ? <p className="truncate text-xs text-accent">{series}</p> : null}
        <h3 className="mt-0.5 font-serif text-base leading-snug text-ink group-hover:text-accent sm:text-lg">
          <span className="line-clamp-2">{book.title}</span>
        </h3>
        <p className="mt-1 truncate text-sm text-muted">{book.authors.join(", ") || "Unknown author"}</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted">
          {book.rating != null ? (
            <span className="inline-flex items-center gap-1 text-ink">
              <Star className="size-3.5 fill-accent text-accent" aria-hidden />
              <span className="tabular-nums">{book.rating.toFixed(1)}</span>
            </span>
          ) : (
            <span>No rating</span>
          )}
          {book.year ? <span className="tabular-nums">{book.year}</span> : null}
        </p>
      </div>
    </>
  );
  if (book.query) {
    return (
      <Link to="/search" search={{ q: book.query, page: 1, sort: "match" }} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <Link to="/book/$workId" params={{ workId: book.id }} className={className}>
      {body}
    </Link>
  );
}

export function BookRow({ books }: { books: BookHit[] }) {
  return (
    <div className="shelf-row mt-4 -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
      {books.map((book) => (
        <div key={book.id} className="w-36 shrink-0 snap-start sm:w-auto">
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
}