// BookFinder static site. Plain browser JS; data from public APIs (Open Library) and data/home-shelves.json.
const OL = "https://openlibrary.org";
const SEARCH_FIELDS = "key,title,author_name,cover_i,isbn,first_publish_year,series_name,series_position,ratings_average,ratings_count,number_of_pages_median";
const SERIES = ["Harry Potter", "The Lord of the Rings", "Percy Jackson", "Dune", "The Hunger Games", "Sherlock Holmes", "A Court of Thorns and Roses", "The Stormlight Archive"];
const TRAILS = [
  { label: "All cat books", q: "cats fiction" },
  { label: "Ninja cats", q: "ninja cat" },
  { label: "The Cat in the Hat", q: "The Cat in the Hat" },
  { label: "Warrior cats", q: "Warriors Erin Hunter" },
  { label: "The cat who…", q: "The Cat Who mysteries" },
  { label: "Puss in Boots", q: "Puss in Boots" },
  { label: "Catwings", q: "Catwings" },
];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const $ = (sel, root = document) => root.querySelector(sel);
const params = new URLSearchParams(location.search);

function seriesLabel(name, pos) {
  if (!name && !pos) return null;
  const p = pos && /^\d+(\.\d+)?$/.test(pos) ? `Book ${pos}` : pos;
  return name && p ? `${name} · ${p}` : name || p;
}

function coverSrc(b) {
  if (b.image) return b.image;
  if (b.coverId != null) return `https://covers.openlibrary.org/b/id/${b.coverId}-L.jpg`;
  if (b.isbn) return `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg`;
  return null;
}

function cover(b) {
  const src = coverSrc(b);
  const title = b.title || "";
  if (src) {
    return `<div class="aspect-2/3 overflow-hidden rounded-md bg-paper-deep shadow-[0_14px_22px_-16px_rgba(28,25,21,0.85),0_1px_2px_rgba(28,25,21,0.18)] ring-1 ring-ink/10 transition duration-200 group-hover:-translate-y-1">
      <img src="${esc(src)}" alt="" loading="lazy" decoding="async" class="h-full w-full object-cover" onerror="this.parentNode.innerHTML='<div class=&quot;flex h-full flex-col justify-between p-3&quot;><span class=&quot;font-serif text-2xl leading-none text-accent&quot;>${esc(title.trim().slice(0, 1).toUpperCase() || "B")}</span><span class=&quot;line-clamp-4 font-serif text-sm leading-snug text-ink&quot;>${esc(title)}</span></div>'"></div>`;
  }
  return `<div class="flex aspect-2/3 flex-col justify-between overflow-hidden rounded-md bg-paper-deep p-3 ring-1 ring-ink/10"><span class="font-serif text-2xl leading-none text-accent">${esc(title.trim().slice(0, 1).toUpperCase() || "B")}</span><span class="line-clamp-4 font-serif text-sm leading-snug text-ink">${esc(title)}</span></div>`;
}

function bookCard(b) {
  const series = seriesLabel(b.seriesName, b.seriesPosition);
  const authors = (b.authors || []).join(", ") || "Unknown author";
  const rating = b.rating != null ? `<span class="inline-flex items-center gap-1 text-ink"><span class="tabular-nums">${Number(b.rating).toFixed(1)}</span></span>` : `<span>No rating</span>`;
  const body = `${cover(b)}<div class="min-w-0">
      ${series ? `<p class="truncate text-xs text-accent">${esc(series)}</p>` : ""}
      <h3 class="mt-0.5 font-serif text-base leading-snug text-ink group-hover:text-accent sm:text-lg"><span class="line-clamp-2">${esc(b.title)}</span></h3>
      <p class="mt-1 truncate text-sm text-muted">${esc(authors)}</p>
      <p class="mt-1 flex items-center gap-2 text-sm text-muted">${rating}${b.year ? `<span class="tabular-nums">${esc(b.year)}</span>` : ""}</p>
    </div>`;
  const href = b.query ? `search.html?q=${encodeURIComponent(b.query)}&page=1&sort=match` : `book.html?id=${encodeURIComponent(b.id)}`;
  return `<a href="${href}" class="group flex min-w-0 flex-col gap-3">${body}</a>`;
}

function bookRow(books) {
  return `<div class="shelf-row mt-4 -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
    ${books.map((b) => `<div class="w-36 shrink-0 snap-start sm:w-auto">${bookCard(b)}</div>`).join("")}</div>`;
}

function shell(page) {
  const q = page === "search" ? params.get("q") || "" : "";
  return `<div class="min-h-screen bg-paper text-ink">
    <header class="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div class="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2 px-4 py-2 sm:grid-cols-[auto_1fr] sm:gap-6 sm:py-3">
        <a href="index.html" class="flex min-w-0 shrink-0 items-center gap-2.5">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink sm:size-11"><span aria-hidden>📖</span></span>
          <span class="min-w-0"><span class="block font-serif text-lg leading-none sm:text-xl">BookFinder</span><span class="mt-1 hidden text-xs text-muted sm:block">Find books easily</span></span>
        </a>
        <nav class="flex items-center justify-end gap-3 text-sm"><a href="cats.html" class="min-h-11 inline-flex items-center">Cats</a></nav>
        <form class="relative col-span-2 min-w-0 sm:col-span-2" role="search" action="search.html" method="get">
          <label for="book-search" class="sr-only">Search books</label>
          <input id="book-search" name="q" value="${esc(q)}" placeholder="Title, author, or ISBN" enterkeyhint="search" class="h-12 w-full rounded-full border border-line bg-card pr-28 pl-5 text-ink placeholder:text-muted" />
          <input type="hidden" name="page" value="1" /><input type="hidden" name="sort" value="match" />
          <button type="submit" class="absolute top-1.5 right-1.5 bottom-1.5 min-w-20 rounded-full bg-accent px-4 text-sm font-medium text-accent-ink">Search</button>
        </form>
      </div>
    </header>
    <main id="main" class="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:pt-8"></main>
    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>BookFinder · Find books easily</p>
        <p class="max-w-xl">Book data from Open Library. Prices and shop links are not shown on this static version.</p>
      </div>
    </footer>
  </div>`;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function mapDoc(d) {
  return {
    id: (d.key || "").replace("/works/", ""),
    title: d.title || "Untitled",
    authors: d.author_name || [],
    year: d.first_publish_year ?? null,
    coverId: d.cover_i ?? null,
    isbn: d.isbn?.[0] ?? null,
    image: null,
    rating: d.ratings_average ?? null,
    seriesName: d.series_name?.[0] ?? null,
    seriesPosition: d.series_position?.[0] ?? null,
  };
}

// ---- pages ----
async function renderHome(main) {
  const recent = (() => { try { const v = JSON.parse(localStorage.getItem("bookfinder-recent") || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 6) : []; } catch { return []; } })();
  const data = await getJson("data/home-shelves.json");
  const shelves = data.shelves || [];
  main.innerHTML = `
    <div class="flex flex-col gap-10 sm:gap-12">
      <section class="max-w-2xl">
        <p class="text-sm font-medium tracking-wide text-accent">Find books easily</p>
        <h1 class="mt-3 font-serif text-3xl leading-tight sm:text-5xl">Search any book. See the whole series.</h1>
        <p class="mt-3 text-base text-muted sm:mt-4 sm:text-lg">Look up a title, author, or ISBN. Open a book for reviews, every volume in the series, and free ways to read.</p>
      </section>
      <section class="grid grid-cols-[5.5rem_1fr] items-center gap-4 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[8rem_1fr] sm:p-5">
        <img src="ninja-cat.jpg" alt="" width="800" height="800" class="aspect-square w-full rounded-xl object-cover" />
        <div>
          <p class="text-sm font-medium tracking-wide text-accent">The cat section</p>
          <h2 class="mt-1 font-serif text-2xl">Meet Ninja Cat</h2>
          <p class="mt-2 max-w-xl text-muted">Night librarian with a book under one paw. The cat shelf is stories, picture books, and the clan series.</p>
          <a href="cats.html" class="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card">Open the cat section</a>
        </div>
      </section>
      ${recent.length ? `<section><h2 class="font-serif text-2xl">Recent searches</h2><div class="mt-4 flex flex-wrap gap-2">${recent.map((r) => `<a href="search.html?q=${encodeURIComponent(r)}&page=1&sort=match" class="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card">${esc(r)}</a>`).join("")}</div></section>` : ""}
      <section><h2 class="font-serif text-2xl">Start a series</h2><div class="mt-4 flex flex-wrap gap-2">${SERIES.map((s) => `<a href="search.html?q=${encodeURIComponent(s)}&page=1&sort=match" class="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-ink">${esc(s)}</a>`).join("")}</div></section>
      ${shelves.map((s) => `<section>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div><h2 class="font-serif text-2xl">${esc(s.title)}</h2><p class="mt-1 text-sm text-muted">${esc(s.note)}</p></div>
          ${s.q ? `<a href="search.html?q=${encodeURIComponent(s.q)}&page=1&sort=match" class="inline-flex min-h-11 items-center text-sm font-medium text-accent">See all</a>` : ""}
        </div>
        ${s.hits && s.hits.length ? bookRow(s.hits) : `<p class="mt-4 text-muted">This shelf is unavailable right now. Search above and you can still find anything.</p>`}
      </section>`).join("")}
    </div>`;
}

async function renderSearch(main) {
  const q = (params.get("q") || "").trim();
  const page = Math.max(1, Number(params.get("page") || 1));
  if (!q) { main.innerHTML = `<p class="text-muted">Type a title, author, or ISBN above.</p>`; return; }
  main.innerHTML = `<p class="text-muted">Searching…</p>`;
  try {
    const sort = params.get("sort") === "rating" ? "&sort=rating" : "";
    const data = await getJson(`${OL}/search.json?q=${encodeURIComponent(q)}&fields=${SEARCH_FIELDS}&limit=24&page=${page}${sort}`);
    const books = (data.docs || []).map(mapDoc);
    try { const r = JSON.parse(localStorage.getItem("bookfinder-recent") || "[]"); localStorage.setItem("bookfinder-recent", JSON.stringify([q, ...r.filter((x) => x !== q)].slice(0, 6))); } catch {}
    const pages = Math.ceil((data.numFound || 0) / 24);
    const nav = (p, label) => `<a href="search.html?q=${encodeURIComponent(q)}&page=${p}&sort=${esc(params.get("sort") || "match")}" class="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm">${label}</a>`;
    main.innerHTML = `<h1 class="font-serif text-3xl">Results for “${esc(q)}”</h1>
      <p class="mt-1 text-sm text-muted">${(data.numFound || 0).toLocaleString()} matches · page ${page} of ${Math.max(pages, 1)}</p>
      ${books.length ? `<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">${books.map((b) => `<div class="min-w-0">${bookCard(b)}</div>`).join("")}</div>` : `<p class="mt-6 text-muted">Nothing found. Try a different spelling or just the author’s name.</p>`}
      <div class="mt-8 flex gap-2">${page > 1 ? nav(page - 1, "← Previous") : ""}${page < pages ? nav(page + 1, "Next →") : ""}</div>`;
  } catch (e) {
    main.innerHTML = `<p class="text-muted">Search is unavailable right now (${esc(e.message)}). Try again in a minute.</p>`;
  }
}

async function renderBook(main) {
  const id = params.get("id") || "";
  if (!/^OL\d+W$/.test(id)) { main.innerHTML = `<p class="text-muted">That book link is not valid.</p>`; return; }
  try {
    const w = await getJson(`${OL}/works/${id}.json`);
    const desc = typeof w.description === "string" ? w.description : w.description?.value || "";
    const cov = w.covers?.[0];
    main.innerHTML = `<div class="grid gap-8 sm:grid-cols-[16rem_1fr]">
      <div class="aspect-2/3 max-w-64 overflow-hidden rounded-md bg-paper-deep ring-1 ring-ink/10">${cov ? `<img src="https://covers.openlibrary.org/b/id/${cov}-L.jpg" alt="" class="h-full w-full object-cover" />` : ""}</div>
      <div><h1 class="font-serif text-4xl leading-tight">${esc(w.title)}</h1>
        ${desc ? `<p class="mt-4 max-w-2xl whitespace-pre-line text-muted">${esc(desc)}</p>` : `<p class="mt-4 text-muted">No description on file.</p>`}
        <p class="mt-6"><a class="text-accent" href="${OL}/works/${esc(id)}" rel="noopener">More on Open Library →</a></p>
        <p class="mt-2"><a class="text-accent" href="search.html?q=${encodeURIComponent(w.title || "")}&page=1&sort=match">Search for this title →</a></p>
      </div></div>`;
  } catch (e) {
    main.innerHTML = `<p class="text-muted">This book could not be loaded (${esc(e.message)}).</p>`;
  }
}

async function renderCats(main) {
  const shelves = await Promise.all(TRAILS.map(async (t) => {
    try {
      const d = await getJson(`${OL}/search.json?q=${encodeURIComponent(t.q)}&fields=${SEARCH_FIELDS}&limit=6`);
      return { title: t.label, q: t.q, hits: (d.docs || []).map(mapDoc) };
    } catch { return { title: t.label, q: t.q, hits: [] }; }
  }));
  main.innerHTML = `<div class="flex flex-col gap-12">
    <section class="grid items-center gap-8 sm:grid-cols-[16rem_1fr] sm:gap-10">
      <img src="ninja-cat.jpg" alt="Ninja Cat, a black cat in a dark wrap and headband, one paw resting on a book" width="800" height="800" class="aspect-square w-full max-w-64 rounded-2xl border border-line object-cover sm:max-w-none" />
      <div class="max-w-xl"><p class="text-sm font-medium tracking-wide text-accent">The cat section</p><h1 class="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Ninja Cat</h1><p class="mt-4 text-lg text-muted">Night librarian. The headband is for the late shift, the book is non-negotiable, and this shelf is every cat story we can find.</p></div>
    </section>
    <section><h2 class="font-serif text-2xl">Start here</h2><div class="mt-4 flex flex-wrap gap-2">${TRAILS.map((t) => `<a href="search.html?q=${encodeURIComponent(t.q)}&page=1&sort=match" class="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-ink">${esc(t.label)}</a>`).join("")}</div></section>
    ${shelves.map((s) => `<section><div class="flex flex-wrap items-end justify-between gap-3"><h2 class="font-serif text-2xl">${esc(s.title)}</h2><a href="search.html?q=${encodeURIComponent(s.q)}&page=1&sort=match" class="inline-flex min-h-11 items-center text-sm font-medium text-accent">See all</a></div>${s.hits.length ? bookRow(s.hits) : `<p class="mt-4 text-muted">This shelf is quiet right now. Try one of the searches above.</p>`}</section>`).join("")}
  </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  document.body.innerHTML = shell(page);
  const main = $("#main");
  const run = { home: renderHome, search: renderSearch, book: renderBook, cats: renderCats }[page];
  if (run) run(main).catch((e) => { main.innerHTML = `<p class="text-muted">Something went wrong loading this page (${esc(e.message)}).</p>`; });
});
