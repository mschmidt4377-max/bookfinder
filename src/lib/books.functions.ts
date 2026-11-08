import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import {
  cleanText,
  decodeEntities,
  lowestAbeOffer,
  safeHttps,
  type BookDetail,
  type BookHit,
  type HomeResponse,
  type Offer,
  type RatingSummary,
  type Review,
  type SearchResponse,
  type Sort,
  isSort,
} from "@/lib/books";

const UA = "BookFinder/1.0 (book catalog)";
const OL = "http://openlibrary.org";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const HIT_FIELDS = [
  "key",
  "title",
  "author_name",
  "author_key",
  "cover_i",
  "isbn",
  "first_publish_year",
  "series_key",
  "series_name",
  "series_position",
  "ratings_average",
  "ratings_count",
  "number_of_pages_median",
].join(",");

const FULL_FIELDS = [
  HIT_FIELDS,
  "isbn",
  "ia",
  "ebook_access",
  "edition_count",
  "want_to_read_count",
  "already_read_count",
  "currently_reading_count",
  "first_sentence",
  "has_fulltext",
  "public_scan_b",
  "lending_identifier_s",
].join(",");

type CacheEntry = { exp: number; value: unknown };
const mem = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = mem.get(key);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.value as T);
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const promise = fn()
    .then((value) => {
      if (mem.size > 80) {
        const oldest = mem.keys().next().value;
        if (oldest) mem.delete(oldest);
      }
      mem.set(key, { exp: Date.now() + ttlMs, value });
      inflight.delete(key);
      return value;
    })
    .catch((error: unknown) => {
      inflight.delete(key);
      throw error;
    });
  inflight.set(key, promise);
  return promise;
}

function requestText(url: string, ms: number, userAgent: string, accept: string): Promise<{ status: number; body: string }> {
  const target = new URL(url);
  if (target.hostname !== "openlibrary.org") {
    return fetch(url, {
      headers: { "User-Agent": userAgent, Accept: accept },
      signal: AbortSignal.timeout(ms),
    }).then(async (res) => ({ status: res.status, body: await res.text() }));
  }

  const once = () =>
    new Promise<{ status: number; body: string }>((resolve, reject) => {
      const req = http.request(
        target,
        { method: "GET", headers: { "User-Agent": userAgent, Accept: accept, Host: "openlibrary.org" } },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }));
        },
      );
      req.setTimeout(ms, () => req.destroy(new Error("timeout")));
      req.on("error", reject);
      req.end();
    });

  return once().catch((error: NodeJS.ErrnoException) => {
    if (error?.code === "ECONNRESET" || error?.code === "ECONNREFUSED") return once();
    throw error;
  });
}

async function fetchText(url: string, ms: number, userAgent = UA): Promise<string> {
  const res = await requestText(url, ms, userAgent, "text/html,application/json");
  if (res.status < 200 || res.status >= 300) throw new Error(String(res.status));
  return res.body;
}

async function fetchJson(url: string, ms = 8000): Promise<unknown> {
  const res = await requestText(url, ms, UA, "application/json");
  if (res.status < 200 || res.status >= 300) throw new Error(String(res.status));
  return JSON.parse(res.body) as unknown;
}

async function soft<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error(error);
    return null;
  }
}

type OlDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  author_key?: string[];
  cover_i?: number;
  first_publish_year?: number;
  series_key?: string[];
  series_name?: string[];
  series_position?: string[];
  ratings_average?: number;
  ratings_count?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  ia?: string[];
  ebook_access?: string;
  edition_count?: number;
  want_to_read_count?: number;
  already_read_count?: number;
  currently_reading_count?: number;
  first_sentence?: string[];
  has_fulltext?: boolean;
  public_scan_b?: boolean;
  lending_identifier_s?: string;
};

function asDoc(value: unknown): OlDoc | null {
  if (!value || typeof value !== "object") return null;
  return value as OlDoc;
}

function workId(key: string | undefined): string | null {
  if (!key) return null;
  const id = key.replace(/^\/works\//, "");
  return /^OL\d+W$/.test(id) ? id : null;
}

function slot(doc: OlDoc, seriesKey?: string): { name: string | null; position: string | null } {
  const keys = doc.series_key ?? [];
  const index = seriesKey ? Math.max(0, keys.indexOf(seriesKey)) : 0;
  const name = doc.series_name?.[index] ?? doc.series_name?.[0] ?? null;
  const position = doc.series_position?.[index] ?? doc.series_position?.[0] ?? null;
  return {
    name: typeof name === "string" ? name : null,
    position: position == null ? null : String(position),
  };
}

function mapHit(doc: OlDoc, seriesKey?: string): BookHit | null {
  const id = workId(doc.key);
  if (!id || !doc.title) return null;
  const series = slot(doc, seriesKey);
  return {
    id,
    title: doc.title,
    authors: (doc.author_name ?? []).filter((name) => typeof name === "string").slice(0, 3),
    year: typeof doc.first_publish_year === "number" ? doc.first_publish_year : null,
    coverId: typeof doc.cover_i === "number" && doc.cover_i > 0 ? doc.cover_i : null,
    isbn: (doc.isbn ?? []).map((code) => code.replace(/[^0-9Xx]/g, "")).find((code) => code.length === 13 || code.length === 10) ?? null,
    rating: typeof doc.ratings_average === "number" && doc.ratings_average >= 1 ? doc.ratings_average : null,
    ratingCount: typeof doc.ratings_count === "number" ? doc.ratings_count : null,
    seriesName: series.name,
    seriesPosition: series.position,
    pages: typeof doc.number_of_pages_median === "number" ? doc.number_of_pages_median : null,
  };
}

async function olSearch(params: Record<string, string | number>, ms = 9000): Promise<{ numFound: number; docs: OlDoc[] }> {
  const url = new URL(`${OL}/search.json`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const data = (await fetchJson(url.toString(), ms)) as { numFound?: number; docs?: unknown[] };
  return {
    numFound: typeof data.numFound === "number" ? data.numFound : 0,
    docs: (data.docs ?? []).map(asDoc).filter((doc): doc is OlDoc => !!doc),
  };
}

function candidateIsbns(isbns: string[] | undefined): string[] {
  const clean = (isbns ?? [])
    .map((isbn) => isbn.replace(/[^0-9Xx]/g, ""))
    .filter((isbn) => /^\d{13}$/.test(isbn));
  const english = [...new Set(clean.filter((isbn) => isbn.startsWith("9780") || isbn.startsWith("9781")))];
  const pool = english.length ? english : [...new Set(clean)];
  return pool.slice(0, 3);
}

async function cheapestAbe(isbns: string[]) {
  const found = await Promise.all(
    isbns.map(async (isbn) => {
      const url = `https://www.abebooks.com/servlet/SearchResults?isbn=${encodeURIComponent(isbn)}&sortby=2`;
      try {
        const html = await fetchText(url, 4500, BROWSER_UA);
        const offer = lowestAbeOffer(html);
        return offer ? { ...offer, url } : null;
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
  );
  const hits = found.filter((hit): hit is NonNullable<(typeof found)[number]> => !!hit);
  hits.sort((a, b) => a.total - b.total);
  return hits[0] ?? null;
}

function englishOpening(sentences: string[] | undefined): string | null {
  const list = (sentences ?? []).map((sentence) => cleanText(sentence)).filter((sentence) => sentence.length > 8 && sentence.length < 280);
  if (!list.length) return null;
  const scored = list.map((sentence) => {
    const letters = (sentence.match(/[A-Za-z]/g) ?? []).length;
    return { sentence, score: letters / sentence.length };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0.55 ? scored[0].sentence : null;
}

function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleScore(title: string, author: string, resultTitle: string, resultAuthor: string): number {
  const rt = norm(resultTitle);
  if (!rt || /study guide|summary|sparknotes|cliffsnotes|supersummary|workbook|analysis of/.test(rt)) return 0;
  const qt = norm(title);
  let score = 0;
  if (rt === qt) score += 5;
  else if (rt.startsWith(qt) || qt.startsWith(rt)) score += 3;
  else if (rt.includes(qt) || qt.includes(rt)) score += 2;
  const last = norm(author).split(" ").filter(Boolean).pop();
  if (last && last.length > 2 && norm(resultAuthor).includes(last)) score += 3;
  return score;
}

type ItunesItem = {
  trackId?: number;
  trackName?: string;
  collectionName?: string;
  artistName?: string;
  price?: number;
  trackPrice?: number;
  collectionPrice?: number;
  formattedPrice?: string;
  currency?: string;
  trackViewUrl?: string;
  collectionViewUrl?: string;
  averageUserRating?: number;
  userRatingCount?: number;
};

type StoreHit = {
  trackId: number | null;
  title: string;
  price: number;
  url: string;
  rating: number | null;
  ratingCount: number | null;
};

function itemPrice(item: ItunesItem): number | null {
  const amount = item.price ?? item.trackPrice ?? item.collectionPrice;
  if (typeof amount === "number" && Number.isFinite(amount) && amount >= 0 && amount < 400) {
    return Math.round(amount * 100) / 100;
  }
  if (item.formattedPrice && /free/i.test(item.formattedPrice)) return 0;
  return null;
}

async function appleMatch(term: string, entity: "ebook" | "audiobook", title: string, author: string): Promise<StoreHit | null> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("country", "us");
  url.searchParams.set("limit", "8");
  url.searchParams.set("entity", entity);
  if (entity === "ebook") url.searchParams.set("media", "ebook");
  const data = (await fetchJson(url.toString(), 4500)) as { results?: ItunesItem[] };
  let best: { score: number; hit: StoreHit } | null = null;
  for (const item of data.results ?? []) {
    const resultTitle = item.trackName || item.collectionName || "";
    const score = titleScore(title, author, resultTitle, item.artistName || "");
    const price = itemPrice(item);
    const link = safeHttps(item.trackViewUrl || item.collectionViewUrl);
    if (score < 6 || price == null || !link) continue;
    if (item.currency && item.currency !== "USD" && price !== 0) continue;
    const hit: StoreHit = {
      trackId: typeof item.trackId === "number" ? item.trackId : null,
      title: resultTitle,
      price,
      url: link,
      rating: typeof item.averageUserRating === "number" ? item.averageUserRating : null,
      ratingCount: typeof item.userRatingCount === "number" ? item.userRatingCount : null,
    };
    if (!best || score > best.score) best = { score, hit };
  }
  return best?.hit ?? null;
}

async function appleReviews(trackId: number): Promise<Review[]> {
  const url = `https://itunes.apple.com/us/rss/customerreviews/id=${trackId}/sortBy=mostHelpful/json`;
  const data = (await fetchJson(url, 4000)) as { feed?: { entry?: unknown } };
  const raw = data.feed?.entry;
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const reviews: Review[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as {
      title?: { label?: string };
      content?: { label?: string };
      "im:rating"?: { label?: string };
      author?: { name?: { label?: string } };
    };
    const rating = Number(row["im:rating"]?.label);
    const body = cleanText(row.content?.label || "");
    const title = cleanText(row.title?.label || "");
    if (!title || body.length < 8 || !Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    reviews.push({
      source: "Apple Books",
      author: cleanText(row.author?.name?.label || "Reader") || "Reader",
      title,
      body: body.length > 420 ? `${body.slice(0, 417).trim()}…` : body,
      rating,
    });
    if (reviews.length >= 6) break;
  }
  return reviews;
}

type GutBook = {
  title?: string;
  authors?: { name?: string }[];
  formats?: Record<string, string>;
};

async function gutenberg(title: string, author: string): Promise<{ read: string | null; epub: string | null; kindle: string | null } | null> {
  const url = new URL("https://gutendex.com/books/");
  url.searchParams.set("search", `${title} ${author}`.trim());
  const data = (await fetchJson(url.toString(), 4000)) as { results?: GutBook[] };
  let best: { score: number; book: GutBook } | null = null;
  for (const book of data.results ?? []) {
    const score = titleScore(title, author, book.title || "", (book.authors ?? []).map((person) => person.name || "").join(" "));
    if (score < 6) continue;
    if (!best || score > best.score) best = { score, book };
  }
  if (!best?.book.formats) return null;
  const formats = best.book.formats;
  const readKey = Object.keys(formats).find((key) => key.startsWith("text/html"));
  const epubKey = Object.keys(formats).find((key) => key.includes("epub"));
  const kindleKey = Object.keys(formats).find((key) => key.includes("mobipocket"));
  return {
    read: safeHttps(readKey ? formats[readKey] : null),
    epub: safeHttps(epubKey ? formats[epubKey] : null),
    kindle: safeHttps(kindleKey ? formats[kindleKey] : null),
  };
}

function positionValue(position: string | null): number {
  if (!position) return 9999;
  const value = Number.parseFloat(position);
  return Number.isFinite(value) ? value : 9999;
}

function sortSeries(books: BookHit[]): BookHit[] {
  return [...books].sort((a, b) => {
    const delta = positionValue(a.seriesPosition) - positionValue(b.seriesPosition);
    if (delta !== 0) return delta;
    return (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title);
  });
}

function dedupe(books: BookHit[]): BookHit[] {
  const seen = new Set<string>();
  const result: BookHit[] = [];
  for (const book of books) {
    if (seen.has(book.id)) continue;
    seen.add(book.id);
    result.push(book);
  }
  return result;
}

const SKIP_SUBJECTS = new Set([
  "accessible book",
  "protected daisy",
  "in library",
  "lending library",
  "overdrive",
  "internet archive wishlist",
  "long now manual for civilization",
  "open library staff picks",
]);

function offer(partial: Omit<Offer, "id"> & { id?: string }): Offer {
  return {
    id: partial.id ?? `${partial.channel}-${partial.vendor}-${partial.format}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    vendor: partial.vendor,
    channel: partial.channel,
    format: partial.format,
    price: partial.price,
    detail: partial.detail,
    url: partial.url,
  };
}

function sortBuy(offers: Offer[]): Offer[] {
  return [...offers].sort((a, b) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });
}

async function loadSearch(q: string, page: number, sort: Sort): Promise<SearchResponse> {
  if (/^espa[nñ]ol$/i.test(q)) {
    const hits = await spanishShelfHits();
    const start = (page - 1) * 24;
    return { q, page, sort, numFound: hits.length, hits: hits.slice(start, start + 24) };
  }
  if (/^new york times best sellers$/i.test(q)) {
    const hits = await nytHits();
    const start = (page - 1) * 24;
    return { q, page, sort, numFound: hits.length, hits: hits.slice(start, start + 24) };
  }
  if (/^hilarious$/i.test(q)) {
    const hits = await hilariousShelfHits();
    const start = (page - 1) * 24;
    return { q, page, sort, numFound: hits.length, hits: hits.slice(start, start + 24) };
  }
  try {
    const found = await archiveSearch(q, page, sort);
    const hits = rankHits(q, found.hits);
    if (hits.length) return { ...found, hits, numFound: Math.max(hits.length, found.numFound) };
  } catch (error) {
    console.error(error);
  }
  const known = searchKnown(q);
  if (known.length) return { q, page, sort, numFound: known.length, hits: known };
  throw new Error("Search is busy right now. Try again in a moment.");
}

type ArchiveDoc = {
  identifier?: string;
  title?: string;
  creator?: string | string[];
  year?: number | string;
  description?: string | string[];
  openlibrary_work?: string;
};

function archiveQuery(q: string): string {
  const cleaned = q.replace(/[()"\\[\]]/g, " ").replace(/\s+/g, " ").trim();
  const digits = cleaned.replace(/[-\s]/g, "");
  if (/^(97[89])?\d{9}[\dXx]$/.test(digits)) return `isbn:${digits} AND mediatype:texts`;
  return `(title:(${cleaned}) OR creator:(${cleaned})) AND mediatype:texts`;
}

async function archiveDocs(q: string, page: number, sort: Sort, ms = 8000): Promise<{ numFound: number; docs: ArchiveDoc[] }> {
  const url = new URL("https://archive.org/advancedsearch.php");
  url.searchParams.set("q", q);
  url.searchParams.set("rows", "24");
  url.searchParams.set("page", String(page));
  url.searchParams.set("output", "json");
  for (const field of ["identifier", "title", "creator", "year", "description", "openlibrary_work"]) {
    url.searchParams.append("fl[]", field);
  }
  if (sort === "new") url.searchParams.append("sort[]", "year desc");
  const data = (await fetchJson(url.toString(), ms)) as { response?: { numFound?: number; docs?: ArchiveDoc[] } };
  return { numFound: data.response?.numFound ?? 0, docs: data.response?.docs ?? [] };
}

function archiveHit(doc: ArchiveDoc, id: string): BookHit | null {
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  if (!title) return null;
  const creators = (Array.isArray(doc.creator) ? doc.creator : doc.creator ? [doc.creator] : [])
    .map((name) => String(name).replace(/,\s*\d{4}-.*$/, "").trim())
    .filter(Boolean);
  const year = typeof doc.year === "number" ? doc.year : Number(doc.year);
  return {
    id,
    title,
    authors: creators.slice(0, 3),
    year: Number.isFinite(year) ? year : null,
    coverId: null,
    isbn: null,
    image: doc.identifier && /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(doc.identifier) ? `/covers/${doc.identifier}` : null,
    rating: null,
    ratingCount: null,
    seriesName: null,
    seriesPosition: null,
    pages: null,
  };
}

async function hitsFromQuery(q: string): Promise<BookHit[]> {
  const found = await soft(archiveDocs(q, 1, "match", 7000));
  const seen = new Set<string>();
  const hits: BookHit[] = [];
  for (const doc of found?.docs ?? []) {
    const id = typeof doc.openlibrary_work === "string" ? doc.openlibrary_work : "";
    if (!/^OL\d+W$/.test(id) || seen.has(id)) continue;
    const hit = archiveHit(doc, id);
    if (!hit || !readableTitle(hit.title) || /\b(pdf|epub|screenplay|index|journal)\b/i.test(hit.title)) continue;
    seen.add(id);
    hits.push(hit);
  }
  return hits;
}

async function catalogHits(q: string, broad = false): Promise<BookHit[]> {
  if (/\bOR\b/.test(q)) {
    const titles = q.split(/\s+OR\s+/i).map((part) => part.replace(/"/g, "").trim()).filter(Boolean);
    const hits: BookHit[] = [];
    const seen = new Set<string>();
    for (const title of titles) {
      const list = await hitsFromQuery(`title:(${plainTerm(title)}) AND mediatype:texts`);
      const hit = list.find((item) => titleFits(item.title, title) && !seen.has(item.id));
      if (!hit) continue;
      seen.add(hit.id);
      hits.push(hit);
    }
    return hits;
  }
  const cleaned = plainTerm(q);
  if (!broad) {
    return hitsFromQuery(`collection:internetarchivebooks AND (subject:(${cleaned}) OR title:(${cleaned})) AND language:English`);
  }
  const skip = new Set(["fiction", "novel", "novels", "literature", "popular", "stories", "story"]);
  const word = cleaned.split(" ").find((part) => part.length > 3 && !skip.has(part.toLowerCase())) || cleaned;
  return hitsFromQuery(`collection:internetarchivebooks AND subject:(${word}) AND language:English`);
}

function paint(hit: BookHit): BookHit {
  const remote = hit.image?.match(/archive\.org\/services\/img\/([^/?#]+)/)?.[1];
  if (!remote || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(remote)) return hit;
  return { ...hit, image: `/covers/${remote}` };
}

const knownBooks: BookHit[] = [];

function remember(hits: BookHit[]) {
  const seen = new Set(knownBooks.map((book) => book.id));
  for (const hit of hits) {
    if (!hit?.title || seen.has(hit.id)) continue;
    seen.add(hit.id);
    knownBooks.push(hit);
  }
  if (knownBooks.length > 900) knownBooks.splice(0, knownBooks.length - 900);
}

function rankHits(q: string, hits: BookHit[]): BookHit[] {
  const wanted = foldTitle(q);
  const score = (hit: BookHit) => {
    const title = foldTitle(hit.title).replace(/^(the|a|an)/, "");
    const author = foldTitle(hit.authors.join(" "));
    if (!wanted) return 5;
    if (title === wanted) return 0;
    if (title.startsWith(wanted)) return 1;
    if (title.includes(wanted)) return 2;
    if (author.includes(wanted)) return 3;
    return 4;
  };
  const ranked = [...hits].sort((a, b) => score(a) - score(b) || a.title.length - b.title.length);
  const exact = ranked.some((hit) => score(hit) === 0);
  const kept = ranked.filter((hit) => score(hit) <= (exact ? 1 : 2));
  return (kept.length ? kept : ranked.filter((hit) => score(hit) < 4)).slice(0, 24);
}

function searchKnown(q: string): BookHit[] {
  return rankHits(q, knownBooks);
}

async function archiveSearch(q: string, page: number, sort: Sort): Promise<SearchResponse> {
  const found = await archiveDocs(archiveQuery(q), page, sort);
  const seen = new Set<string>();
  const hits: BookHit[] = [];
  for (const doc of found.docs) {
    const id = typeof doc.openlibrary_work === "string" && /^OL\d+W$/.test(doc.openlibrary_work) ? doc.openlibrary_work : "";
    if (!id || seen.has(id)) continue;
    const hit = archiveHit(doc, id);
    if (!hit) continue;
    seen.add(id);
    hits.push(hit);
  }
  return { q, page, sort, numFound: found.numFound, hits };
}

export const searchBooks = createServerFn({ method: "GET" })
  .validator((input: { q: string; page?: number; sort?: string }) => {
    const q = (input?.q || "").trim().slice(0, 140);
    if (q.length < 1) throw new Error("Type a title, author, or ISBN.");
    const page = Math.min(20, Math.max(1, Math.floor(Number(input.page) || 1)));
    const sort = isSort(input.sort) ? input.sort : "match";
    return { q, page, sort };
  })
  .handler(async ({ data }): Promise<SearchResponse> => {
    try {
      return await cached(`search:v7:${data.sort}:${data.page}:${data.q.toLowerCase()}`, 10 * 60 * 1000, () =>
        loadSearch(data.q, data.page, data.sort),
      ).then((result) => {
        const hits = result.hits.map(paint);
        remember(hits);
        return { ...result, hits };
      });
    } catch (error) {
      console.error(error);
      throw new Error("Search is busy right now. Try again in a moment.");
    }
  });

const HOME_SHELVES: { id: string; title: string; note: string; q: string }[] = [
  { id: "trending", title: "Trending today", note: "The books people are buying right now.", q: "" },
  { id: "espanol", title: "Español", note: "Novelas y clásicos en español.", q: "español" },
  { id: "nyt", title: "New York Times Best Sellers", note: "This week's hardcover fiction and nonfiction.", q: "new york times best sellers" },
  { id: "hilarious", title: "Hilarious", note: "Books that are actually funny.", q: "hilarious" },
  { id: "fantasy", title: "Fantasy", note: "Magic, quests, and the series people finish.", q: "fantasy fiction" },
  { id: "mystery", title: "Mystery", note: "Detectives, secrets, and last-page twists.", q: "mystery detective" },
  { id: "romance", title: "Romance", note: "Love stories, from the classics to right now.", q: "romance novel" },
  { id: "scifi", title: "Science fiction", note: "Futures, ships, and what-ifs.", q: "science fiction novel" },
  { id: "horror", title: "Horror", note: "The shelf you read with the lights on.", q: "horror fiction" },
  { id: "ya", title: "Young adult", note: "School-year favorites and series starters.", q: "young adult fiction" },
  { id: "classics", title: "Classics", note: "Books that stuck around. Older ones are often free to read.", q: "classic literature" },
  { id: "biography", title: "Biography", note: "Lives, told by the people who lived them.", q: "biography memoir" },
  { id: "thriller", title: "Thriller", note: "Fast plots that are hard to put down.", q: "thriller novel" },
  { id: "historical", title: "Historical fiction", note: "Stories set in another time.", q: "historical fiction" },
  { id: "adventure", title: "Adventure", note: "Journeys, survival, and a long way from home.", q: "adventure fiction" },
  { id: "graphic", title: "Graphic novels", note: "Stories told in panels.", q: 'Maus OR Watchmen OR Persepolis OR "Fun Home" OR Nimona OR Blankets' },
  { id: "nonfiction", title: "Nonfiction", note: "Ideas and books about the real world.", q: "popular nonfiction" },
  { id: "children", title: "Children's", note: "Picture books and chapter books for younger readers.", q: '"Charlotte\'s Web" OR Matilda OR "Winnie-the-Pooh" OR "The Cat in the Hat" OR "Goodnight Moon" OR "Where the Wild Things Are"' },
  { id: "crime", title: "Crime", note: "Heists, cases, and the people who solve them.", q: "crime fiction" },
  { id: "stories", title: "Short stories", note: "Collections you can finish in a sitting.", q: "short stories" },
];

function foldTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function plainTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[()"\\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFits(got: string, wanted: string): boolean {
  const left = foldTitle(got);
  const right = foldTitle(wanted);
  if (left.length < 4 || right.length < 4) return false;
  if (left === right || left.startsWith(right) || right.startsWith(left)) return true;
  return left.includes(right) && left.length <= right.length + 40;
}

const SPANISH_BOOKS: { q: string; title: string }[] = [
  { q: "Cien años de soledad García Márquez", title: "Cien años de soledad" },
  { q: "Don Quijote de la Mancha Cervantes", title: "Don Quijote" },
  { q: "Pedro Páramo Juan Rulfo", title: "Pedro Páramo" },
  { q: "La casa de los espíritus Isabel Allende", title: "La casa de los espíritus" },
  { q: "Rayuela Julio Cortázar", title: "Rayuela" },
  { q: "El amor en los tiempos del cólera García Márquez", title: "El amor en los tiempos del cólera" },
  { q: "La sombra del viento Carlos Ruiz Zafón", title: "La sombra del viento" },
  { q: "Como agua para chocolate Laura Esquivel", title: "Como agua para chocolate" },
  { q: "El principito Saint-Exupéry", title: "El principito" },
  { q: "Ficciones Jorge Luis Borges", title: "Ficciones" },
  { q: "El túnel Ernesto Sábato", title: "El túnel" },
  { q: "Los detectives salvajes Roberto Bolaño", title: "Los detectives salvajes" },
  { q: "Crónica de una muerte anunciada García Márquez", title: "Crónica de una muerte anunciada" },
  { q: "La ciudad y los perros Mario Vargas Llosa", title: "La ciudad y los perros" },
];

async function collectSpanish(): Promise<BookHit[]> {
  const hits: BookHit[] = [];
  for (let index = 0; index < SPANISH_BOOKS.length; index += 4) {
    const slice = SPANISH_BOOKS.slice(index, index + 4);
    const wave = await Promise.all(
      slice.map(async (book) => {
        const title = plainTerm(book.title);
        const author = plainTerm(book.q.replace(book.title, "")).split(" ").filter(Boolean).at(-1) || title;
        const found = await soft(archiveDocs(`title:(${title}) AND creator:(${author}) AND mediatype:texts`, 1, "match", 6000));
        const match = (found?.docs ?? []).find((doc) => {
          const id = typeof doc.openlibrary_work === "string" ? doc.openlibrary_work : "";
          return /^OL\d+W$/.test(id) && titleFits(typeof doc.title === "string" ? doc.title : "", book.title);
        });
        return match?.openlibrary_work ? archiveHit(match, match.openlibrary_work) : null;
      }),
    );
    for (const hit of wave) if (hit) hits.push(hit);
  }
  return hits;
}

async function spanishShelfHits(): Promise<BookHit[]> {
  try {
    return await cached("spanish:shelf:v3", 6 * 60 * 60 * 1000, async () => {
      const hits = await collectSpanish();
      if (hits.length < 4) throw new Error("spanish shelf unavailable");
      return hits;
    });
  } catch (error) {
    console.error(error);
    return collectSpanish();
  }
}

async function trendingHits(): Promise<BookHit[]> {
  return cached("trending:apple:v2", 3 * 60 * 60 * 1000, async () => {
    const data = (await fetchJson("https://itunes.apple.com/us/rss/topebooks/limit=20/json", 8000)) as {
      feed?: { entry?: unknown };
    };
    const entries = Array.isArray(data.feed?.entry) ? data.feed.entry : [];
    const hits: BookHit[] = [];
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      const row = entry as {
        "im:name"?: { label?: string };
        "im:artist"?: { label?: string };
        "im:image"?: { label?: string }[];
      };
      const title = cleanText(row["im:name"]?.label || "");
      const author = cleanText(row["im:artist"]?.label || "");
      if (title.length < 2) continue;
      hits.push({
        id: `trend-${foldTitle(title)}`,
        title,
        authors: author ? [author] : [],
        year: null,
        coverId: null,
        isbn: null,
        image: row["im:image"]?.at(-1)?.label || null,
        rating: null,
        ratingCount: null,
        seriesName: null,
        seriesPosition: null,
        pages: null,
        query: `${title} ${author}`.trim(),
      });
      if (hits.length >= 12) break;
    }
    if (!hits.length) throw new Error("trending unavailable");
    return hits;
  });
}

async function spanishDocs(): Promise<OlDoc[]> {
  return cached("spanish:books:v1", 6 * 60 * 60 * 1000, async () => {
  const found: (OlDoc | null)[] = SPANISH_BOOKS.map(() => null);

  async function fill(indexes: number[]) {
    for (let index = 0; index < indexes.length; index += 4) {
      const slice = indexes.slice(index, index + 4);
      const wave = await Promise.all(
        slice.map((bookIndex) =>
          soft(olSearch({ q: SPANISH_BOOKS[bookIndex].q, language: "spa", fields: HIT_FIELDS, limit: 8 }, 6000)),
        ),
      );
      wave.forEach((result, waveIndex) => {
        const bookIndex = slice[waveIndex];
        const wanted = foldTitle(SPANISH_BOOKS[bookIndex].title);
        const match = (result?.docs ?? []).find((doc) => {
          const title = typeof doc.title === "string" ? foldTitle(doc.title) : "";
          return title.length >= 6 && (title.includes(wanted) || wanted.includes(title));
        });
        if (match) found[bookIndex] = match;
      });
    }
  }

  const indexes = SPANISH_BOOKS.map((_, index) => index);
  await fill(indexes);
  await fill(indexes.filter((index) => !found[index]));
  return found.filter((doc): doc is OlDoc => !!doc);
  });
}

const HILARIOUS_BOOKS: { q: string; title: string }[] = [
  { q: "The Hitchhiker's Guide to the Galaxy Douglas Adams", title: "The Hitchhiker's Guide to the Galaxy" },
  { q: "Good Omens Neil Gaiman Terry Pratchett", title: "Good Omens" },
  { q: "The Princess Bride William Goldman", title: "The Princess Bride" },
  { q: "Catch-22 Joseph Heller", title: "Catch-22" },
  { q: "A Confederacy of Dunces John Kennedy Toole", title: "A Confederacy of Dunces" },
  { q: "Guards! Guards! Terry Pratchett", title: "Guards! Guards!" },
  { q: "Me Talk Pretty One Day David Sedaris", title: "Me Talk Pretty One Day" },
  { q: "Bossypants Tina Fey", title: "Bossypants" },
  { q: "Born a Crime Trevor Noah", title: "Born a Crime" },
  { q: "Three Men in a Boat Jerome K. Jerome", title: "Three Men in a Boat" },
  { q: "Cold Comfort Farm Stella Gibbons", title: "Cold Comfort Farm" },
  { q: "Where'd You Go, Bernadette Maria Semple", title: "Where'd You Go, Bernadette" },
  { q: "Hyperbole and a Half Allie Brosh", title: "Hyperbole and a Half" },
  { q: "Notes from a Small Island Bill Bryson", title: "Notes from a Small Island" },
];

async function hilariousDocs(): Promise<OlDoc[]> {
  return cached("hilarious:books:v1", 6 * 60 * 60 * 1000, async () => {
  const found: (OlDoc | null)[] = HILARIOUS_BOOKS.map(() => null);

  async function fill(indexes: number[]) {
    for (let index = 0; index < indexes.length; index += 4) {
      const slice = indexes.slice(index, index + 4);
      const wave = await Promise.all(
        slice.map((bookIndex) =>
          soft(olSearch({ q: HILARIOUS_BOOKS[bookIndex].q, language: "eng", fields: HIT_FIELDS, limit: 12 }, 6000)),
        ),
      );
      wave.forEach((result, waveIndex) => {
        const bookIndex = slice[waveIndex];
        const wanted = foldTitle(HILARIOUS_BOOKS[bookIndex].title);
        const match = (result?.docs ?? []).find((doc) => {
          const raw = typeof doc.title === "string" ? doc.title : "";
          const title = foldTitle(raw);
          if (title.length < 6 || wanted.length < 6) return false;
          if (/^(trivia|studyguide|summary|cliffnotes|sparknotes|analysis)/.test(title)) return false;
          return title === wanted || title.startsWith(wanted) || (wanted.startsWith(title) && title.length >= wanted.length * 0.85);
        });
        if (match) found[bookIndex] = match;
      });
    }
  }

  const indexes = HILARIOUS_BOOKS.map((_, index) => index);
  await fill(indexes);
  await fill(indexes.filter((index) => !found[index]));
  return found.filter((doc): doc is OlDoc => !!doc);
  });
}

async function hilariousShelfHits(): Promise<BookHit[]> {
  try {
    return await cached("hilarious:shelf:v3", 6 * 60 * 60 * 1000, async () => {
      const hits: BookHit[] = [];
      for (let index = 0; index < HILARIOUS_BOOKS.length; index += 2) {
        const slice = HILARIOUS_BOOKS.slice(index, index + 2);
        const wave = await Promise.all(
          slice.map(async (book) => {
            const title = plainTerm(book.title);
            const author = plainTerm(book.q.replace(book.title, "")).split(" ").filter(Boolean).at(-1) || title;
            const found = await soft(archiveDocs(`title:(${title}) AND creator:(${author}) AND mediatype:texts`, 1, "match", 6000));
            const match = (found?.docs ?? []).find((doc) => {
              const id = typeof doc.openlibrary_work === "string" ? doc.openlibrary_work : "";
              return /^OL\d+W$/.test(id) && titleFits(typeof doc.title === "string" ? doc.title : "", book.title);
            });
            return match?.openlibrary_work ? archiveHit(match, match.openlibrary_work) : null;
          }),
        );
        for (const hit of wave) if (hit) hits.push(hit);
      }
      if (hits.length < 4) throw new Error("hilarious shelf unavailable");
      return hits;
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

const NYT_LIST_URL = "https://www.beaufortcountylibrary.org/_functions/nytPrint";

function nytImage(isbn: string): string | null {
  return /^978\d{10}$/.test(isbn) ? `https://static01.nyt.com/bestsellers/images/${isbn}.jpg` : null;
}

function titlesMatch(got: string, wanted: string): boolean {
  const left = foldTitle(got);
  const right = foldTitle(wanted);
  if (left.length < 6 || right.length < 6) return false;
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function parseNytList(html: string): { title: string; author: string; isbn: string }[] {
  return html
    .split('<article class="book">')
    .slice(1)
    .map((article) => {
      const title = decodeEntities(article.match(/class="book-title"[^>]*>([^<]+)/)?.[1] ?? "").trim();
      const author = decodeEntities(article.match(/class="book-author">(?:by )?([^<]+)/)?.[1] ?? "")
        .replace(/^by\s+/i, "")
        .trim();
      const isbn = article.match(/97[89]\d{10}/)?.[0] ?? "";
      return { title, author, isbn };
    })
    .filter((book) => book.title.length > 1);
}

async function resolveNyt(book: { title: string; author: string; isbn: string }): Promise<BookHit> {
  return {
    id: `nyt-${book.isbn || foldTitle(book.title)}`,
    title: book.title,
    authors: book.author ? [book.author] : [],
    year: null,
    coverId: null,
    isbn: book.isbn || null,
    image: nytImage(book.isbn),
    rating: null,
    ratingCount: null,
    seriesName: null,
    seriesPosition: null,
    pages: null,
    query: `${book.title} ${book.author}`.trim(),
  };
}

async function nytHits(): Promise<BookHit[]> {
  try {
    return await cached("nyt:bestsellers:v1", 6 * 60 * 60 * 1000, async () => {
      const html = await fetchText(NYT_LIST_URL, 12000, BROWSER_UA);
      const books = parseNytList(html).slice(0, 30);
      if (books.length < 5) throw new Error("bestseller list unavailable");
      const hits: BookHit[] = [];
      for (let index = 0; index < books.length; index += 4) {
        const wave = await Promise.all(books.slice(index, index + 4).map((book) => resolveNyt(book)));
        hits.push(...wave);
      }
      return hits;
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

function shelfKey(hit: BookHit): string {
  return hit.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function readableTitle(title: string): boolean {
  const letters = title.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) return title.trim().length >= 2;
  const latin = letters.filter((letter) => /\p{Script=Latin}/u.test(letter)).length;
  return latin / letters.length >= 0.6;
}

function takeHits(docs: unknown[], take: number, seen: Set<string>): BookHit[] {
  const hits: BookHit[] = [];
  for (const doc of docs) {
    const parsed = asDoc(doc);
    const hit = parsed ? mapHit(parsed) : null;
    if (!hit || !readableTitle(hit.title)) continue;
    const key = shelfKey(hit);
    if (!key || seen.has(key) || seen.has(hit.id)) continue;
    seen.add(key);
    seen.add(hit.id);
    hits.push(hit);
    if (hits.length >= take) break;
  }
  return hits;
}

function takeReady(hits: BookHit[], take: number, seen: Set<string>): BookHit[] {
  const picked: BookHit[] = [];
  for (const hit of hits) {
    const key = shelfKey(hit);
    if (!key || seen.has(key) || seen.has(hit.id)) continue;
    seen.add(key);
    seen.add(hit.id);
    picked.push(hit);
    if (picked.length >= take) break;
  }
  return picked;
}

async function namedHits(books: { title: string; author: string }[]): Promise<BookHit[]> {
  const hits: BookHit[] = [];
  for (let index = 0; index < books.length; index += 2) {
    const wave = await Promise.all(
      books.slice(index, index + 2).map(async (book) => {
        const titleQuery = `title:(${plainTerm(book.title)}) AND mediatype:texts`;
        const found = await soft(
          archiveDocs(`title:(${plainTerm(book.title)}) AND creator:(${plainTerm(book.author)}) AND mediatype:texts`, 1, "match", 6000),
        );
        const pick = (docs: ArchiveDoc[] | undefined) =>
          (docs ?? []).find((doc) => {
            const id = typeof doc.openlibrary_work === "string" ? doc.openlibrary_work : "";
            return /^OL\d+W$/.test(id) && titleFits(typeof doc.title === "string" ? doc.title : "", book.title);
          });
        let match = pick(found?.docs);
        if (!match) match = pick((await soft(archiveDocs(titleQuery, 1, "match", 6000)))?.docs);
        return match?.openlibrary_work ? archiveHit(match, match.openlibrary_work) : null;
      }),
    );
    for (const hit of wave) if (hit) hits.push(hit);
  }
  return hits;
}

const CURATED_SHELVES: Record<string, { title: string; author: string }[]> = {
  fantasy: [
    { title: "The Hobbit", author: "Tolkien" },
    { title: "A Game of Thrones", author: "Martin" },
    { title: "The Name of the Wind", author: "Rothfuss" },
    { title: "Harry Potter and the Sorcerer's Stone", author: "Rowling" },
    { title: "The Lion, the Witch and the Wardrobe", author: "Lewis" },
    { title: "Mistborn", author: "Sanderson" },
  ],
  romance: [
    { title: "Pride and Prejudice", author: "Austen" },
    { title: "Jane Eyre", author: "Bronte" },
    { title: "Outlander", author: "Gabaldon" },
    { title: "The Notebook", author: "Sparks" },
    { title: "Me Before You", author: "Moyes" },
    { title: "Beach Read", author: "Henry" },
  ],
  horror: [
    { title: "Dracula", author: "Stoker" },
    { title: "Frankenstein", author: "Shelley" },
    { title: "The Shining", author: "King" },
    { title: "The Haunting of Hill House", author: "Jackson" },
    { title: "Interview with the Vampire", author: "Rice" },
    { title: "Mexican Gothic", author: "Moreno-Garcia" },
  ],
  classics: [
    { title: "Pride and Prejudice", author: "Austen" },
    { title: "Moby-Dick", author: "Melville" },
    { title: "Great Expectations", author: "Dickens" },
    { title: "The Odyssey", author: "Homer" },
    { title: "Crime and Punishment", author: "Dostoevsky" },
    { title: "Nineteen Eighty-Four", author: "Orwell" },
  ],
  thriller: [
    { title: "The Girl on the Train", author: "Hawkins" },
    { title: "The Da Vinci Code", author: "Brown" },
    { title: "The Silence of the Lambs", author: "Harris" },
    { title: "Jurassic Park", author: "Crichton" },
    { title: "The Firm", author: "Grisham" },
    { title: "Gone Girl", author: "Flynn" },
  ],
};

export const getHomeShelves = createServerFn({ method: "GET" }).handler(async (): Promise<HomeResponse> => {
  const empty = HOME_SHELVES.map((shelf) => ({ ...shelf, hits: [] as BookHit[] }));
  try {
    const savedRaw = await readFile(path.join(process.cwd(), "data", "home-shelves.json"), "utf8");
    const saved = JSON.parse(savedRaw) as HomeResponse;
    if (saved.shelves?.length >= 8) {
      const shelves = saved.shelves.map((shelf) => ({ ...shelf, hits: shelf.hits.map(paint) }));
      remember(shelves.flatMap((shelf) => shelf.hits));
      return { shelves };
    }
  } catch {
    /* build live if there is no saved shelf */
  }
  try {
    const data = await cached("home:shelves:v19", 30 * 60 * 1000, async () => {
      async function searchShelf(shelf: { id: string; q: string }, broad = false) {
        if (!shelf.q || shelf.id === "espanol" || shelf.id === "nyt" || shelf.id === "hilarious") return [] as BookHit[];
        return catalogHits(shelf.q, broad);
      }

      const spanishPromise = spanishShelfHits();
      const nytPromise = nytHits();
      const trendingPromise = trendingHits();
      const genres = HOME_SHELVES.slice(1);
      const searches: BookHit[][] = [];
      for (let index = 0; index < genres.length; index += 2) {
        const wave = await Promise.all(genres.slice(index, index + 2).map((shelf) => searchShelf(shelf)));
        searches.push(...wave);
      }
      const missing = genres
        .map((shelf, index) => ({ shelf, index }))
        .filter((item) => item.shelf.q && !/\bOR\b/.test(item.shelf.q) && (searches[item.index]?.length ?? 0) < 4);
      for (let index = 0; index < missing.length; index += 2) {
        const wave = await Promise.all(missing.slice(index, index + 2).map((item) => searchShelf(item.shelf, true)));
        wave.forEach((hits, waveIndex) => {
          const slot = missing[index + waveIndex].index;
          if (hits.length > (searches[slot]?.length ?? 0)) searches[slot] = hits;
        });
      }
      const funny = await hilariousShelfHits();
      for (const item of genres.map((shelf, index) => ({ shelf, index })).filter((item) => CURATED_SHELVES[item.shelf.id] && (searches[item.index]?.length ?? 0) < 4)) {
        const hits = await namedHits(CURATED_SHELVES[item.shelf.id]);
        if (hits.length > (searches[item.index]?.length ?? 0)) searches[item.index] = hits;
      }
      const [trending, spanish, nyt] = await Promise.all([trendingPromise, spanishPromise, nytPromise]);
      const shelves = HOME_SHELVES.map((shelf, index) => {
        const own = new Set<string>();
        if (shelf.id === "nyt") return { ...shelf, hits: takeReady(nyt, 24, own) };
        if (shelf.id === "hilarious") return { ...shelf, hits: takeReady(funny, 14, own) };
        if (shelf.id === "espanol") return { ...shelf, hits: takeReady(spanish, 14, own) };
        if (shelf.id === "trending") return { ...shelf, hits: takeReady(trending, 12, own) };
        return { ...shelf, hits: takeReady(searches[index - 1] ?? [], 12, own) };
      });
      return { shelves };
    });
    const painted = data.shelves.map((shelf) => ({ ...shelf, hits: shelf.hits.map(paint) }));
    remember(painted.flatMap((shelf) => shelf.hits));
    return { shelves: painted };
  } catch (error) {
    console.error(error);
    return { shelves: empty };
  }
});

const CAT_SHELVES: { title: string; note: string; q: string; books: { title: string; author: string }[] }[] = [
  {
    title: "Stories with cats",
    note: "Tales where a cat is the point, not a footnote.",
    q: "cat stories",
    books: [
      { title: "The Travelling Cat Chronicles", author: "Arikawa" },
      { title: "The Guest Cat", author: "Hiraide" },
      { title: "I Am a Cat", author: "Soseki" },
      { title: "Dewey", author: "Myron" },
      { title: "If Cats Disappeared from the World", author: "Kawamura" },
    ],
  },
  {
    title: "Warrior cats",
    note: "The clan books, starting with the best-known titles.",
    q: "Warriors Erin Hunter",
    books: [
      { title: "Into the Wild", author: "Hunter" },
      { title: "Fire and Ice", author: "Hunter" },
      { title: "Forest of Secrets", author: "Hunter" },
      { title: "Rising Storm", author: "Hunter" },
    ],
  },
  {
    title: "The cat who…",
    note: "Mysteries and odd little cat books.",
    q: "The Cat Who",
    books: [
      { title: "The Cat Who Could Read Backwards", author: "Braun" },
      { title: "The Cat Who Ate Danish Modern", author: "Braun" },
      { title: "The Cat Who Saw Red", author: "Braun" },
      { title: "The Cat Who Played Brahms", author: "Braun" },
    ],
  },
  {
    title: "For smaller readers",
    note: "Kittens, picture books, and early reads.",
    q: "kittens",
    books: [
      { title: "The Cat in the Hat", author: "Seuss" },
      { title: "Kitten's First Full Moon", author: "Henkes" },
      { title: "Pete the Cat", author: "Litwin" },
      { title: "Millions of Cats", author: "Gag" },
    ],
  },
  {
    title: "Puss in Boots",
    note: "The boot-wearing cat, in every telling we can find.",
    q: "Puss in Boots",
    books: [
      { title: "Puss in Boots", author: "Perrault" },
      { title: "Puss in Boots", author: "Light" },
    ],
  },
  {
    title: "Catwings",
    note: "Ursula K. Le Guin’s winged-cat stories.",
    q: "Catwings",
    books: [
      { title: "Catwings", author: "Le Guin" },
      { title: "Catwings Return", author: "Le Guin" },
    ],
  },
];

export const getCatShelves = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await cached("cats:shelves:v6", 30 * 60 * 1000, async () => {
      const shelves = [];
      for (const shelf of CAT_SHELVES) {
        const hits = (await namedHits(shelf.books)).map(paint);
        remember(hits);
        shelves.push({ title: shelf.title, note: shelf.note, q: shelf.q, hits });
      }
      return { shelves };
    });
  } catch (error) {
    console.error(error);
    return {
      shelves: CAT_SHELVES.map((shelf) => ({ title: shelf.title, note: shelf.note, q: shelf.q, hits: [] as BookHit[] })),
    };
  }
});

async function archiveBook(id: string): Promise<BookDetail> {
  const found = await archiveDocs(`openlibrary_work:${id} AND mediatype:texts`, 1, "match");
  const doc = found.docs[0];
  const book = doc ? archiveHit(doc, id) : null;
  if (!book) throw new Error("We couldn't find that book.");
  const author = book.authors[0] ?? "";
  const nameQuery = encodeURIComponent([book.title, author].filter(Boolean).join(" ").trim());
  const descriptionRaw = Array.isArray(doc?.description) ? doc.description[0] : doc?.description;
  const description = descriptionRaw ? cleanText(String(descriptionRaw)) : null;
  const read: Offer[] = [
    offer({
      vendor: "Your library",
      channel: "read",
      format: "Library ebook",
      price: null,
      detail: "Check Libby / OverDrive",
      url: `https://www.overdrive.com/search?q=${nameQuery}`,
    }),
    offer({
      vendor: "Internet Archive",
      channel: "read",
      format: "Read online",
      price: 0,
      detail: "Scan on Archive.org",
      url: doc?.identifier ? `https://archive.org/details/${encodeURIComponent(doc.identifier)}` : `https://archive.org/search?query=${nameQuery}`,
    }),
  ];
  const buy: Offer[] = [
    offer({ vendor: "Amazon", channel: "buy", format: "Print & ebook", price: null, detail: "New and used", url: `https://www.amazon.com/s?k=${nameQuery}` }),
    offer({ vendor: "Bookshop.org", channel: "buy", format: "New print", price: null, detail: "Supports independent bookstores", url: `https://bookshop.org/search?keywords=${nameQuery}` }),
    offer({ vendor: "Barnes & Noble", channel: "buy", format: "Print & ebook", price: null, detail: "Store and online", url: `https://www.barnesandnoble.com/s/${nameQuery}` }),
    offer({ vendor: "AbeBooks", channel: "buy", format: "Used print", price: null, detail: "Compare used copies", url: `https://www.abebooks.com/servlet/SearchResults?kn=${nameQuery}&sortby=2` }),
  ];
  return {
    book,
    description: description && description.length > 40 ? description : null,
    opening: null,
    subjects: [],
    editionCount: null,
    ratings: {
      average: null,
      count: 0,
      histogram: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
      appleAverage: null,
      appleCount: null,
      want: null,
      reading: null,
      finished: null,
    },
    series: null,
    moreByAuthor: [],
    authorName: author || null,
    read,
    buy,
    reviews: [],
    lowest: null,
    freeRead: { vendor: "Internet Archive", url: read[1].url },
  };
}

async function loadBook(id: string): Promise<BookDetail> {
  const archivePromise = archiveBook(id).catch((error) => {
    console.error(error);
    return null;
  });
  let found: { docs: OlDoc[] };
  let workRaw: unknown = null;
  let ratingsRaw: unknown = null;
  try {
    const pack = await Promise.all([
      olSearch({ q: `key:/works/${id}`, fields: FULL_FIELDS, limit: 1 }, 1200),
      soft(fetchJson(`${OL}/works/${id}.json`, 1200)),
      soft(fetchJson(`${OL}/works/${id}/ratings.json`, 1200)),
    ]);
    found = pack[0];
    workRaw = pack[1];
    ratingsRaw = pack[2];
  } catch (error) {
    console.error(error);
    const fallback = await archivePromise;
    if (fallback) return { ...fallback, book: paint(fallback.book) };
    throw new Error("We couldn't load that book. Try again in a moment.");
  }
  const doc = found.docs[0];
  const book = doc ? mapHit(doc) : null;
  if (!doc || !book || book.id !== id) {
    const fallback = await archivePromise;
    if (fallback) return { ...fallback, book: paint(fallback.book) };
    throw new Error("We couldn't find that book.");
  }

  const author = book.authors[0] ?? "";
  const seriesKey = doc.series_key?.[0];
  const seriesName = book.seriesName;
  const authorKey = doc.author_key?.[0];
  const isbnChoices = candidateIsbns(doc.isbn).slice(0, 1);
  const year = book.year;

  const [seriesDocs, authorDocs, ebookPack, audio, gut, abe] = await Promise.all([
    seriesKey
      ? soft(
          olSearch({ q: `series_key:${seriesKey}`, fields: HIT_FIELDS, limit: 24, language: "eng" }, 5000).then(
            (result) => result.docs,
          ),
        )
      : Promise.resolve(null),
    authorKey
      ? soft(
          olSearch({
            q: `author_key:${authorKey}`,
            fields: HIT_FIELDS,
            limit: 8,
            language: "eng",
            sort: "editions",
          }, 5000).then((result) => result.docs),
        )
      : Promise.resolve(null),
    soft(
      (async () => {
        const ebook = await appleMatch(`${book.title} ${author}`, "ebook", book.title, author);
        const reviews = ebook?.trackId ? await soft(appleReviews(ebook.trackId)) : null;
        return { ebook, reviews: reviews ?? [] };
      })(),
    ),
    soft(appleMatch(`${book.title} ${author}`, "audiobook", book.title, author)),
    year != null && year <= 1930 ? soft(gutenberg(book.title, author)) : Promise.resolve(null),
    cheapestAbe(isbnChoices),
  ]);

  const work = (workRaw && typeof workRaw === "object" ? workRaw : {}) as {
    description?: string | { value?: string };
    subjects?: unknown[];
    excerpts?: { excerpt?: string | { value?: string } }[];
  };
  const descriptionRaw = typeof work.description === "string" ? work.description : work.description?.value;
  const description = descriptionRaw ? cleanText(descriptionRaw) : null;
  const excerptRaw = work.excerpts?.[0]?.excerpt;
  const excerpt = typeof excerptRaw === "string" ? excerptRaw : excerptRaw?.value;
  const opening = englishOpening(excerpt ? [excerpt, ...(doc.first_sentence ?? [])] : doc.first_sentence);

  const subjects = (Array.isArray(work.subjects) ? work.subjects : [])
    .filter((subject): subject is string => typeof subject === "string")
    .map((subject) => subject.trim())
    .filter((subject) => subject.length > 1 && subject.length < 42 && !SKIP_SUBJECTS.has(subject.toLowerCase()))
    .slice(0, 8);

  const ratingsJson = (ratingsRaw && typeof ratingsRaw === "object" ? ratingsRaw : {}) as {
    summary?: { average?: number; count?: number };
    counts?: Record<string, number>;
  };
  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: Number(ratingsJson.counts?.[String(star)] ?? 0) || 0,
  }));
  const olAverage = typeof ratingsJson.summary?.average === "number" ? ratingsJson.summary.average : book.rating;
  const olCount = typeof ratingsJson.summary?.count === "number" ? ratingsJson.summary.count : book.ratingCount ?? 0;

  const seriesBooks = sortSeries(
    dedupe((seriesDocs ?? []).map((item) => mapHit(item, seriesKey)).filter((hit): hit is BookHit => !!hit)),
  );
  const series = seriesBooks.length > 1 && seriesName ? { name: seriesName, books: seriesBooks } : null;

  const moreByAuthor = dedupe((authorDocs ?? []).map((item) => mapHit(item)).filter((hit): hit is BookHit => !!hit))
    .filter((hit) => hit.id !== id && !seriesBooks.some((item) => item.id === hit.id))
    .slice(0, 8);

  const ebook = ebookPack?.ebook ?? null;
  const reviews = ebookPack?.reviews ?? [];
  const read: Offer[] = [];
  const buy: Offer[] = [];

  if (gut?.read) {
    read.push(offer({ vendor: "Project Gutenberg", channel: "read", format: "Read online", price: 0, detail: "Public domain", url: gut.read }));
  }
  if (gut?.epub) {
    read.push(offer({ vendor: "Project Gutenberg", channel: "read", format: "EPUB", price: 0, detail: "Download", url: gut.epub }));
  }
  if (gut?.kindle) {
    read.push(offer({ vendor: "Project Gutenberg", channel: "read", format: "Kindle", price: 0, detail: "Download", url: gut.kindle }));
  }

  const ia = doc.lending_identifier_s || doc.ia?.[0];
  if (ia && (doc.ebook_access === "public" || doc.public_scan_b)) {
    read.push(
      offer({
        vendor: "Internet Archive",
        channel: "read",
        format: "Read online",
        price: 0,
        detail: "Full scan",
        url: `https://archive.org/details/${encodeURIComponent(ia)}`,
      }),
    );
  } else if (ia && doc.ebook_access === "borrowable") {
    read.push(
      offer({
        vendor: "Open Library",
        channel: "read",
        format: "Borrow",
        price: 0,
        detail: "Free loan · account required",
        url: `https://openlibrary.org/borrow/ia/${encodeURIComponent(ia)}`,
      }),
    );
  }

  if (ebook && ebook.price === 0) {
    read.push(offer({ vendor: "Apple Books", channel: "read", format: "Ebook", price: 0, detail: "Free download", url: ebook.url }));
  }

  const nameQuery = encodeURIComponent([book.title, author].filter(Boolean).join(" ").trim());
  const abeSearchUrl = `https://www.abebooks.com/servlet/SearchResults?kn=${nameQuery}&sortby=2`;
  read.push(
    offer({
      vendor: "Your library",
      channel: "read",
      format: "Library ebook",
      price: null,
      detail: "Check Libby / OverDrive",
      url: `https://www.overdrive.com/search?q=${nameQuery}`,
    }),
  );
  read.push(
    offer({
      vendor: "WorldCat",
      channel: "read",
      format: "Nearby libraries",
      price: null,
      detail: "Find a copy to borrow",
      url: `https://search.worldcat.org/search?q=${nameQuery}`,
    }),
  );

  if (ebook && ebook.price > 0) {
    buy.push(offer({ vendor: "Apple Books", channel: "buy", format: "Ebook", price: ebook.price, detail: "Instant download", url: ebook.url }));
  }
  if (audio && audio.price > 0) {
    buy.push(offer({ vendor: "Apple Books", channel: "buy", format: "Audiobook", price: audio.price, detail: "Narrated edition", url: audio.url }));
  }

  if (abe) {
    const isNew = /^new\b/i.test(abe.condition);
    const shipping =
      abe.shipping === 0
        ? "free shipping"
        : `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(abe.item)} + ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(abe.shipping)} shipping`;
    buy.push(
      offer({
        vendor: "AbeBooks",
        channel: "buy",
        format: isNew ? "New print" : "Used print",
        price: abe.total,
        detail: `${abe.condition} · ${shipping}`,
        url: abeSearchUrl,
      }),
    );
  }
  if (!buy.some((item) => item.vendor === "AbeBooks")) {
    buy.push(offer({ vendor: "AbeBooks", channel: "buy", format: "Used print", price: null, detail: "Compare used copies", url: abeSearchUrl }));
  }

  const shops: Offer[] = [
    offer({
      vendor: "Amazon",
      channel: "buy",
      format: "Print & ebook",
      price: null,
      detail: "New and used",
      url: `https://www.amazon.com/s?k=${nameQuery}`,
    }),
    offer({
      vendor: "Bookshop.org",
      channel: "buy",
      format: "New print",
      price: null,
      detail: "Supports independent bookstores",
      url: `https://bookshop.org/search?keywords=${nameQuery}`,
    }),
    offer({
      vendor: "Barnes & Noble",
      channel: "buy",
      format: "Print & ebook",
      price: null,
      detail: "Store and online",
      url: `https://www.barnesandnoble.com/s/${nameQuery}`,
    }),
    offer({
      vendor: "ThriftBooks",
      channel: "buy",
      format: "Used print",
      price: null,
      detail: "Used copies",
      url: `https://www.thriftbooks.com/browse/?b.search=${nameQuery}`,
    }),
    offer({
      vendor: "Better World Books",
      channel: "buy",
      format: "New & used",
      price: null,
      detail: "Ships used and new",
      url: `https://www.betterworldbooks.com/search/results?q=${nameQuery}`,
    }),
    offer({
      vendor: "Kobo",
      channel: "buy",
      format: "Ebook",
      price: null,
      detail: "Ebook stores",
      url: `https://www.kobo.com/us/en/search?query=${nameQuery}`,
    }),
    offer({
      vendor: "eBay",
      channel: "buy",
      format: "Print",
      price: null,
      detail: "Sorted by lowest price + shipping",
      url: `https://www.ebay.com/sch/i.html?_nkw=${nameQuery}&_sop=15`,
    }),
  ];
  for (const shop of shops) buy.push(shop);

  const priced = sortBuy(buy);
  const lowestOffer = priced.find((item) => item.price != null && item.price > 0);
  const free = read.find((item) => item.price === 0);

  const ratings: RatingSummary = {
    average: olAverage,
    count: olCount ?? 0,
    histogram,
    appleAverage: ebook?.rating ?? audio?.rating ?? null,
    appleCount: ebook?.ratingCount ?? audio?.ratingCount ?? null,
    want: typeof doc.want_to_read_count === "number" ? doc.want_to_read_count : null,
    reading: typeof doc.currently_reading_count === "number" ? doc.currently_reading_count : null,
    finished: typeof doc.already_read_count === "number" ? doc.already_read_count : null,
  };

  return {
    book: { ...book, rating: olAverage, ratingCount: olCount ?? book.ratingCount },
    description: description && description.length > 40 ? description : description,
    opening,
    subjects,
    editionCount: typeof doc.edition_count === "number" ? doc.edition_count : null,
    ratings,
    series,
    moreByAuthor,
    authorName: author || null,
    read,
    buy: priced,
    reviews,
    lowest: lowestOffer
      ? { price: lowestOffer.price as number, vendor: lowestOffer.vendor, format: lowestOffer.format, url: lowestOffer.url }
      : null,
    freeRead: free ? { vendor: free.vendor, url: free.url } : null,
  };
}

export const getBook = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => {
    const id = (input?.id || "").trim();
    if (!/^OL\d+W$/.test(id)) throw new Error("That book link doesn't look right.");
    return { id };
  })
  .handler(async ({ data }): Promise<BookDetail> => {
    try {
      return await cached(`book:v4:${data.id}`, 60 * 60 * 1000, () => loadBook(data.id));
    } catch (error) {
      if (error instanceof Error && /couldn't find|doesn't look right/.test(error.message)) throw error;
      console.error(error);
      throw new Error("We couldn't load that book. Try again in a moment.");
    }
  });
