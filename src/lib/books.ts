export const SORTS = ["match", "rating", "new"] as const;
export type Sort = (typeof SORTS)[number];

export type BookHit = {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  coverId: number | null;
  isbn: string | null;
  rating: number | null;
  ratingCount: number | null;
  seriesName: string | null;
  seriesPosition: string | null;
  pages: number | null;
  /** Set when the book should open a search instead of a catalog page. */
  query?: string;
  /** Direct cover URL when Open Library has no cover. */
  image?: string | null;
};

export type Review = {
  source: "Apple Books";
  author: string;
  title: string;
  body: string;
  rating: number;
};

export type Offer = {
  id: string;
  vendor: string;
  channel: "read" | "buy";
  format: string;
  price: number | null;
  detail: string;
  url: string;
};

export type RatingSummary = {
  average: number | null;
  count: number;
  histogram: { star: number; count: number }[];
  appleAverage: number | null;
  appleCount: number | null;
  want: number | null;
  reading: number | null;
  finished: number | null;
};

export type BookDetail = {
  book: BookHit;
  description: string | null;
  opening: string | null;
  subjects: string[];
  editionCount: number | null;
  ratings: RatingSummary;
  series: { name: string; books: BookHit[] } | null;
  moreByAuthor: BookHit[];
  authorName: string | null;
  read: Offer[];
  buy: Offer[];
  reviews: Review[];
  lowest: { price: number; vendor: string; format: string; url: string } | null;
  freeRead: { vendor: string; url: string } | null;
};

export type SearchResponse = {
  q: string;
  page: number;
  sort: Sort;
  numFound: number;
  hits: BookHit[];
};

export type BookShelf = {
  id: string;
  title: string;
  note: string;
  q: string;
  hits: BookHit[];
};

export type HomeResponse = {
  shelves: BookShelf[];
};

export function isSort(value: unknown): value is Sort {
  return value === "match" || value === "rating" || value === "new";
}

export function readSearch(search: Record<string, unknown>): {
  q: string;
  page: number;
  sort: Sort;
} {
  const q = typeof search.q === "string" ? search.q : "";
  const raw = typeof search.page === "number" ? search.page : Number(search.page);
  const page = Number.isFinite(raw) ? Math.min(20, Math.max(1, Math.floor(raw))) : 1;
  return { q, page, sort: isSort(search.sort) ? search.sort : "match" };
}

export function prettyQuery(q: string): string {
  const trimmed = q.trim();
  if (/^espa[nñ]ol$/i.test(trimmed)) return "Español";
  if (/^new york times best sellers$/i.test(trimmed)) return "New York Times Best Sellers";
  if (/^hilarious$/i.test(trimmed)) return "Hilarious";
  const match = q.match(/^subject:(?:"(.+)"|(\S+))$/i);
  if (!match) return q;
  return (match[1] || match[2] || q).replace(/_/g, " ");
}

export function coverUrl(id: number, size: "M" | "L" = "L"): string {
  return `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;
}

export function isbnCoverUrl(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`;
}

export function money(amount: number): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function compactCount(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: n >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);
}

export function seriesLabel(name: string | null, position: string | null): string | null {
  if (!name && !position) return null;
  const pos =
    position && /^\d+(\.\d+)?$/.test(position) ? `Book ${position}` : position;
  if (name && pos) return `${name} · ${pos}`;
  return name || pos;
}

export function cleanText(input: string): string {
  return decodeEntities(input)
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_#>`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)))
    .replace(/&nbsp;/g, " ")
    .replace(new RegExp("&" + "quot;", "g"), '"')
    .replace(new RegExp("&#39;|&" + "apos;", "g"), "'")
    .replace(new RegExp("&" + "lt;", "g"), "<")
    .replace(new RegExp("&" + "gt;", "g"), ">")
    .replace(new RegExp("&" + "amp;", "g"), "&");
}

export function safeHttps(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.protocol === "http:") url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
}

export type UsedOffer = {
  item: number;
  shipping: number;
  total: number;
  condition: string;
};

/** Lowest AbeBooks listing total (item + shipping) from a search results page. */
export function lowestAbeOffer(html: string): UsedOffer | null {
  const prices = [...html.matchAll(/data-test-id="listing-price">[^$]{0,12}\$[\s\u00a0]*([\d,]+\.\d{2})/gi)].map(
    (match) => Number(match[1].replace(/,/g, "")),
  );
  const conditions = [...html.matchAll(/data-test-id="listing-condition">([^<]+)</g)].map((match) =>
    decodeEntities(match[1]).replace(/\s+/g, " ").trim(),
  );
  const offers: UsedOffer[] = [];

  for (let i = 0; i < prices.length; i++) {
    const item = prices[i];
    if (!Number.isFinite(item) || item < 0.5 || item > 400) continue;
    const block =
      html.match(new RegExp(`data-test-id="item-shipping-price-${i}"[\\s\\S]{0,420}`))?.[0] ?? "";
    if (!block) continue;
    let shipping = 0;
    if (/free shipping/i.test(block)) {
      shipping = 0;
    } else {
      const ship = block.match(/\$[\s\u00a0]*([\d,]+\.\d{2})/);
      if (!ship) continue;
      shipping = Number(ship[1].replace(/,/g, ""));
    }
    if (!Number.isFinite(shipping) || shipping < 0 || shipping > 80) continue;
    offers.push({
      item,
      shipping,
      total: Math.round((item + shipping) * 100) / 100,
      condition: conditions[i] || "Used",
    });
  }

  offers.sort((a, b) => a.total - b.total);
  return offers[0] ?? null;
}

export function subjectQuery(subject: string): string {
  const cleaned = subject.trim();
  return cleaned.includes(" ") ? `subject:"${cleaned}"` : `subject:${cleaned.replace(/\s+/g, "_")}`;
}
