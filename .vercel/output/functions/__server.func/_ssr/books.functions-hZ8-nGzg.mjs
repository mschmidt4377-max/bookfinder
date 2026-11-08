import { a as lowestAbeOffer, i as isSort, l as safeHttps, t as cleanText } from "./books-BrqERjoo.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/books.functions-hZ8-nGzg.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var UA = "BookFinder/1.0 (book catalog)";
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
var HIT_FIELDS = [
	"key",
	"title",
	"author_name",
	"author_key",
	"cover_i",
	"first_publish_year",
	"series_key",
	"series_name",
	"series_position",
	"ratings_average",
	"ratings_count",
	"number_of_pages_median"
].join(",");
var FULL_FIELDS = [
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
	"lending_identifier_s"
].join(",");
var mem = /* @__PURE__ */ new Map();
var inflight = /* @__PURE__ */ new Map();
function cached(key, ttlMs, fn) {
	const hit = mem.get(key);
	if (hit && hit.exp > Date.now()) return Promise.resolve(hit.value);
	const pending = inflight.get(key);
	if (pending) return pending;
	const promise = fn().then((value) => {
		if (mem.size > 80) {
			const oldest = mem.keys().next().value;
			if (oldest) mem.delete(oldest);
		}
		mem.set(key, {
			exp: Date.now() + ttlMs,
			value
		});
		inflight.delete(key);
		return value;
	}).catch((error) => {
		inflight.delete(key);
		throw error;
	});
	inflight.set(key, promise);
	return promise;
}
async function fetchText(url, ms, userAgent = UA) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": userAgent,
			Accept: "text/html,application/json"
		},
		signal: AbortSignal.timeout(ms)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.text();
}
async function fetchJson(url, ms = 8e3) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA,
			Accept: "application/json"
		},
		signal: AbortSignal.timeout(ms)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.json();
}
async function soft(promise) {
	try {
		return await promise;
	} catch (error) {
		console.error(error);
		return null;
	}
}
function asDoc(value) {
	if (!value || typeof value !== "object") return null;
	return value;
}
function workId(key) {
	if (!key) return null;
	const id = key.replace(/^\/works\//, "");
	return /^OL\d+W$/.test(id) ? id : null;
}
function slot(doc, seriesKey) {
	const keys = doc.series_key ?? [];
	const index = seriesKey ? Math.max(0, keys.indexOf(seriesKey)) : 0;
	const name = doc.series_name?.[index] ?? doc.series_name?.[0] ?? null;
	const position = doc.series_position?.[index] ?? doc.series_position?.[0] ?? null;
	return {
		name: typeof name === "string" ? name : null,
		position: position == null ? null : String(position)
	};
}
function mapHit(doc, seriesKey) {
	const id = workId(doc.key);
	if (!id || !doc.title) return null;
	const series = slot(doc, seriesKey);
	return {
		id,
		title: doc.title,
		authors: (doc.author_name ?? []).filter((name) => typeof name === "string").slice(0, 3),
		year: typeof doc.first_publish_year === "number" ? doc.first_publish_year : null,
		coverId: typeof doc.cover_i === "number" && doc.cover_i > 0 ? doc.cover_i : null,
		rating: typeof doc.ratings_average === "number" && doc.ratings_average >= 1 ? doc.ratings_average : null,
		ratingCount: typeof doc.ratings_count === "number" ? doc.ratings_count : null,
		seriesName: series.name,
		seriesPosition: series.position,
		pages: typeof doc.number_of_pages_median === "number" ? doc.number_of_pages_median : null
	};
}
async function olSearch(params) {
	const url = new URL("https://openlibrary.org/search.json");
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
	const data = await fetchJson(url.toString(), 9e3);
	return {
		numFound: typeof data.numFound === "number" ? data.numFound : 0,
		docs: (data.docs ?? []).map(asDoc).filter((doc) => !!doc)
	};
}
function candidateIsbns(isbns) {
	const clean = (isbns ?? []).map((isbn) => isbn.replace(/[^0-9Xx]/g, "")).filter((isbn) => /^\d{13}$/.test(isbn));
	const english = [...new Set(clean.filter((isbn) => isbn.startsWith("9780") || isbn.startsWith("9781")))];
	return (english.length ? english : [...new Set(clean)]).slice(0, 3);
}
async function cheapestAbe(isbns) {
	const hits = (await Promise.all(isbns.map(async (isbn) => {
		const url = `https://www.abebooks.com/servlet/SearchResults?isbn=${encodeURIComponent(isbn)}&sortby=2`;
		try {
			const html = await fetchText(url, 8e3, BROWSER_UA);
			const offer = lowestAbeOffer(html);
			return offer ? {
				...offer,
				url
			} : null;
		} catch (error) {
			console.error(error);
			return null;
		}
	}))).filter((hit) => !!hit);
	hits.sort((a, b) => a.total - b.total);
	return hits[0] ?? null;
}
function englishOpening(sentences) {
	const list = (sentences ?? []).map((sentence) => cleanText(sentence)).filter((sentence) => sentence.length > 8 && sentence.length < 280);
	if (!list.length) return null;
	const scored = list.map((sentence) => {
		return {
			sentence,
			score: (sentence.match(/[A-Za-z]/g) ?? []).length / sentence.length
		};
	});
	scored.sort((a, b) => b.score - a.score);
	return scored[0].score > .55 ? scored[0].sentence : null;
}
function norm(value) {
	return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}
function titleScore(title, author, resultTitle, resultAuthor) {
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
function itemPrice(item) {
	const amount = item.price ?? item.trackPrice ?? item.collectionPrice;
	if (typeof amount === "number" && Number.isFinite(amount) && amount >= 0 && amount < 400) return Math.round(amount * 100) / 100;
	if (item.formattedPrice && /free/i.test(item.formattedPrice)) return 0;
	return null;
}
async function appleMatch(term, entity, title, author) {
	const url = new URL("https://itunes.apple.com/search");
	url.searchParams.set("term", term);
	url.searchParams.set("country", "us");
	url.searchParams.set("limit", "8");
	url.searchParams.set("entity", entity);
	if (entity === "ebook") url.searchParams.set("media", "ebook");
	const data = await fetchJson(url.toString(), 7e3);
	let best = null;
	for (const item of data.results ?? []) {
		const resultTitle = item.trackName || item.collectionName || "";
		const score = titleScore(title, author, resultTitle, item.artistName || "");
		const price = itemPrice(item);
		const link = safeHttps(item.trackViewUrl || item.collectionViewUrl);
		if (score < 6 || price == null || !link) continue;
		if (item.currency && item.currency !== "USD" && price !== 0) continue;
		const hit = {
			trackId: typeof item.trackId === "number" ? item.trackId : null,
			title: resultTitle,
			price,
			url: link,
			rating: typeof item.averageUserRating === "number" ? item.averageUserRating : null,
			ratingCount: typeof item.userRatingCount === "number" ? item.userRatingCount : null
		};
		if (!best || score > best.score) best = {
			score,
			hit
		};
	}
	return best?.hit ?? null;
}
async function appleReviews(trackId) {
	const raw = (await fetchJson(`https://itunes.apple.com/us/rss/customerreviews/id=${trackId}/sortBy=mostHelpful/json`, 7e3)).feed?.entry;
	const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
	const reviews = [];
	for (const entry of entries) {
		if (!entry || typeof entry !== "object") continue;
		const row = entry;
		const rating = Number(row["im:rating"]?.label);
		const body = cleanText(row.content?.label || "");
		const title = cleanText(row.title?.label || "");
		if (!title || body.length < 8 || !Number.isFinite(rating) || rating < 1 || rating > 5) continue;
		reviews.push({
			source: "Apple Books",
			author: cleanText(row.author?.name?.label || "Reader") || "Reader",
			title,
			body: body.length > 420 ? `${body.slice(0, 417).trim()}…` : body,
			rating
		});
		if (reviews.length >= 6) break;
	}
	return reviews;
}
async function gutenberg(title, author) {
	const url = new URL("https://gutendex.com/books/");
	url.searchParams.set("search", `${title} ${author}`.trim());
	const data = await fetchJson(url.toString(), 7e3);
	let best = null;
	for (const book of data.results ?? []) {
		const score = titleScore(title, author, book.title || "", (book.authors ?? []).map((person) => person.name || "").join(" "));
		if (score < 6) continue;
		if (!best || score > best.score) best = {
			score,
			book
		};
	}
	if (!best?.book.formats) return null;
	const formats = best.book.formats;
	const readKey = Object.keys(formats).find((key) => key.startsWith("text/html"));
	const epubKey = Object.keys(formats).find((key) => key.includes("epub"));
	const kindleKey = Object.keys(formats).find((key) => key.includes("mobipocket"));
	return {
		read: safeHttps(readKey ? formats[readKey] : null),
		epub: safeHttps(epubKey ? formats[epubKey] : null),
		kindle: safeHttps(kindleKey ? formats[kindleKey] : null)
	};
}
function positionValue(position) {
	if (!position) return 9999;
	const value = Number.parseFloat(position);
	return Number.isFinite(value) ? value : 9999;
}
function sortSeries(books) {
	return [...books].sort((a, b) => {
		const delta = positionValue(a.seriesPosition) - positionValue(b.seriesPosition);
		if (delta !== 0) return delta;
		return (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title);
	});
}
function dedupe(books) {
	const seen = /* @__PURE__ */ new Set();
	const result = [];
	for (const book of books) {
		if (seen.has(book.id)) continue;
		seen.add(book.id);
		result.push(book);
	}
	return result;
}
var SKIP_SUBJECTS = /* @__PURE__ */ new Set([
	"accessible book",
	"protected daisy",
	"in library",
	"lending library",
	"overdrive",
	"internet archive wishlist",
	"long now manual for civilization",
	"open library staff picks"
]);
function offer(partial) {
	return {
		id: partial.id ?? `${partial.channel}-${partial.vendor}-${partial.format}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
		vendor: partial.vendor,
		channel: partial.channel,
		format: partial.format,
		price: partial.price,
		detail: partial.detail,
		url: partial.url
	};
}
function sortBuy(offers) {
	return [...offers].sort((a, b) => {
		if (a.price == null && b.price == null) return 0;
		if (a.price == null) return 1;
		if (b.price == null) return -1;
		return a.price - b.price;
	});
}
async function loadSearch(q, page, sort) {
	const params = {
		q,
		fields: HIT_FIELDS,
		limit: 24,
		offset: (page - 1) * 24
	};
	if (sort === "rating") params.sort = "rating";
	if (sort === "new") params.sort = "new";
	const data = await olSearch(params);
	return {
		q,
		page,
		sort,
		numFound: data.numFound,
		hits: data.docs.map((doc) => mapHit(doc)).filter((hit) => !!hit)
	};
}
var searchBooks_createServerFn_handler = createServerRpc({
	id: "781da4dbc8209dce4177e08814ac7b9823270f09fb542b37bd685555cc718ab5",
	name: "searchBooks",
	filename: "src/lib/books.functions.ts"
}, (opts) => searchBooks.__executeServer(opts));
var searchBooks = createServerFn({ method: "GET" }).validator((input) => {
	const q = (input?.q || "").trim().slice(0, 140);
	if (q.length < 1) throw new Error("Type a title, author, or ISBN.");
	return {
		q,
		page: Math.min(20, Math.max(1, Math.floor(Number(input.page) || 1))),
		sort: isSort(input.sort) ? input.sort : "match"
	};
}).handler(searchBooks_createServerFn_handler, async ({ data }) => {
	try {
		return await cached(`search:${data.sort}:${data.page}:${data.q.toLowerCase()}`, 6e5, () => loadSearch(data.q, data.page, data.sort));
	} catch (error) {
		console.error(error);
		throw new Error("Search is busy right now. Try again in a moment.");
	}
});
var HOME_SHELVES = [
	{
		id: "trending",
		title: "Trending today",
		note: "What people are opening on Open Library.",
		q: ""
	},
	{
		id: "fantasy",
		title: "Fantasy",
		note: "Magic, quests, and the series people finish.",
		q: "fantasy fiction"
	},
	{
		id: "mystery",
		title: "Mystery",
		note: "Detectives, secrets, and last-page twists.",
		q: "mystery detective"
	},
	{
		id: "romance",
		title: "Romance",
		note: "Love stories, from the classics to right now.",
		q: "romance novel"
	},
	{
		id: "scifi",
		title: "Science fiction",
		note: "Futures, ships, and what-ifs.",
		q: "science fiction novel"
	},
	{
		id: "horror",
		title: "Horror",
		note: "The shelf you read with the lights on.",
		q: "horror fiction"
	},
	{
		id: "ya",
		title: "Young adult",
		note: "School-year favorites and series starters.",
		q: "young adult fiction"
	},
	{
		id: "classics",
		title: "Classics",
		note: "Books that stuck around. Older ones are often free to read.",
		q: "classic literature"
	}
];
function shelfKey(hit) {
	return hit.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function readableTitle(title) {
	const letters = title.match(/\p{L}/gu) ?? [];
	if (letters.length < 2) return title.trim().length >= 2;
	return letters.filter((letter) => /\p{Script=Latin}/u.test(letter)).length / letters.length >= .6;
}
function takeHits(docs, take, seen) {
	const hits = [];
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
var getHomeShelves_createServerFn_handler = createServerRpc({
	id: "85a67fc7072f3a0f66d4a88458c0733796b9fc8ba8b5e46b02a8fec5c8c458dd",
	name: "getHomeShelves",
	filename: "src/lib/books.functions.ts"
}, (opts) => getHomeShelves.__executeServer(opts));
var getHomeShelves = createServerFn({ method: "GET" }).handler(getHomeShelves_createServerFn_handler, async () => {
	const empty = HOME_SHELVES.map((shelf) => ({
		...shelf,
		hits: []
	}));
	try {
		return await cached("home:shelves:v1", 9e5, async () => {
			const [trendingRaw, ...searches] = await Promise.all([soft(fetchJson("https://openlibrary.org/trending/daily.json?limit=24", 8e3)), ...HOME_SHELVES.slice(1).map((shelf) => soft(olSearch({
				q: shelf.q,
				language: "eng",
				sort: "readinglog",
				fields: HIT_FIELDS,
				limit: 40
			})))]);
			const seen = /* @__PURE__ */ new Set();
			return { shelves: HOME_SHELVES.map((shelf, index) => {
				const docs = index === 0 ? trendingRaw?.works ?? [] : searches[index - 1]?.docs ?? [];
				return {
					...shelf,
					hits: takeHits(docs, 12, seen)
				};
			}) };
		});
	} catch (error) {
		console.error(error);
		return { shelves: empty };
	}
});
var CAT_SHELVES = [
	{
		title: "Stories with cats",
		note: "Tales where a cat is the point, not a footnote.",
		q: "cat stories"
	},
	{
		title: "Warrior cats",
		note: "The clan books, starting with the best-known titles.",
		q: "Warriors Erin Hunter"
	},
	{
		title: "The cat who…",
		note: "Mysteries and odd little cat books.",
		q: "The Cat Who"
	},
	{
		title: "For smaller readers",
		note: "Kittens, picture books, and early reads.",
		q: "kittens"
	},
	{
		title: "Puss in Boots",
		note: "The boot-wearing cat, in every telling we can find.",
		q: "Puss in Boots"
	},
	{
		title: "Catwings",
		note: "Ursula K. Le Guin’s winged-cat stories.",
		q: "Catwings"
	}
];
var getCatShelves_createServerFn_handler = createServerRpc({
	id: "db8d5992e030cf40cfdb680ad22c7ed0d4dc0467a1d69955034be84b0190c2ed",
	name: "getCatShelves",
	filename: "src/lib/books.functions.ts"
}, (opts) => getCatShelves.__executeServer(opts));
var getCatShelves = createServerFn({ method: "GET" }).handler(getCatShelves_createServerFn_handler, async () => {
	try {
		return await cached("cats:shelves:v3", 9e5, async () => {
			return { shelves: await Promise.all(CAT_SHELVES.map(async (shelf) => {
				try {
					const data = await olSearch({
						q: shelf.q,
						fields: HIT_FIELDS,
						limit: 24,
						language: "eng"
					});
					const seen = /* @__PURE__ */ new Set();
					const hits = data.docs.map((doc) => mapHit(doc)).filter((hit) => !!hit && readableTitle(hit.title)).filter((hit) => {
						const key = shelfKey(hit);
						if (!key || seen.has(key)) return false;
						seen.add(key);
						return true;
					}).slice(0, 12);
					return {
						title: shelf.title,
						note: shelf.note,
						q: shelf.q,
						hits
					};
				} catch (error) {
					console.error(error);
					return {
						title: shelf.title,
						note: shelf.note,
						q: shelf.q,
						hits: []
					};
				}
			})) };
		});
	} catch (error) {
		console.error(error);
		return { shelves: CAT_SHELVES.map((shelf) => ({
			title: shelf.title,
			note: shelf.note,
			q: shelf.q,
			hits: []
		})) };
	}
});
async function loadBook(id) {
	const doc = (await olSearch({
		q: `key:/works/${id}`,
		fields: FULL_FIELDS,
		limit: 1
	})).docs[0];
	const book = doc ? mapHit(doc) : null;
	if (!doc || !book || book.id !== id) throw new Error("We couldn't find that book.");
	const author = book.authors[0] ?? "";
	const seriesKey = doc.series_key?.[0];
	const seriesName = book.seriesName;
	const authorKey = doc.author_key?.[0];
	const isbnChoices = candidateIsbns(doc.isbn);
	const year = book.year;
	const [workRaw, ratingsRaw, seriesDocs, authorDocs, ebookPack, audio, gut, abe] = await Promise.all([
		soft(fetchJson(`https://openlibrary.org/works/${id}.json`, 7e3)),
		soft(fetchJson(`https://openlibrary.org/works/${id}/ratings.json`, 7e3)),
		seriesKey ? soft((async () => {
			const english = await olSearch({
				q: `series_key:${seriesKey}`,
				fields: HIT_FIELDS,
				limit: 40,
				language: "eng"
			});
			return english.docs.length >= 2 ? english.docs : (await olSearch({
				q: `series_key:${seriesKey}`,
				fields: HIT_FIELDS,
				limit: 40
			})).docs;
		})()) : Promise.resolve(null),
		authorKey ? soft(olSearch({
			q: `author_key:${authorKey}`,
			fields: HIT_FIELDS,
			limit: 12,
			language: "eng",
			sort: "editions"
		}).then((result) => result.docs)) : Promise.resolve(null),
		soft((async () => {
			const ebook = await appleMatch(`${book.title} ${author}`, "ebook", book.title, author);
			return {
				ebook,
				reviews: (ebook?.trackId ? await soft(appleReviews(ebook.trackId)) : null) ?? []
			};
		})()),
		soft(appleMatch(`${book.title} ${author}`, "audiobook", book.title, author)),
		year != null && year <= 1930 ? soft(gutenberg(book.title, author)) : Promise.resolve(null),
		cheapestAbe(isbnChoices)
	]);
	const work = workRaw && typeof workRaw === "object" ? workRaw : {};
	const descriptionRaw = typeof work.description === "string" ? work.description : work.description?.value;
	const description = descriptionRaw ? cleanText(descriptionRaw) : null;
	const excerptRaw = work.excerpts?.[0]?.excerpt;
	const excerpt = typeof excerptRaw === "string" ? excerptRaw : excerptRaw?.value;
	const opening = englishOpening(excerpt ? [excerpt, ...doc.first_sentence ?? []] : doc.first_sentence);
	const subjects = (Array.isArray(work.subjects) ? work.subjects : []).filter((subject) => typeof subject === "string").map((subject) => subject.trim()).filter((subject) => subject.length > 1 && subject.length < 42 && !SKIP_SUBJECTS.has(subject.toLowerCase())).slice(0, 8);
	const ratingsJson = ratingsRaw && typeof ratingsRaw === "object" ? ratingsRaw : {};
	const histogram = [
		5,
		4,
		3,
		2,
		1
	].map((star) => ({
		star,
		count: Number(ratingsJson.counts?.[String(star)] ?? 0) || 0
	}));
	const olAverage = typeof ratingsJson.summary?.average === "number" ? ratingsJson.summary.average : book.rating;
	const olCount = typeof ratingsJson.summary?.count === "number" ? ratingsJson.summary.count : book.ratingCount ?? 0;
	const seriesBooks = sortSeries(dedupe((seriesDocs ?? []).map((item) => mapHit(item, seriesKey)).filter((hit) => !!hit)));
	const series = seriesBooks.length > 1 && seriesName ? {
		name: seriesName,
		books: seriesBooks
	} : null;
	const moreByAuthor = dedupe((authorDocs ?? []).map((item) => mapHit(item)).filter((hit) => !!hit)).filter((hit) => hit.id !== id && !seriesBooks.some((item) => item.id === hit.id)).slice(0, 8);
	const ebook = ebookPack?.ebook ?? null;
	const reviews = ebookPack?.reviews ?? [];
	const read = [];
	const buy = [];
	if (gut?.read) read.push(offer({
		vendor: "Project Gutenberg",
		channel: "read",
		format: "Read online",
		price: 0,
		detail: "Public domain",
		url: gut.read
	}));
	if (gut?.epub) read.push(offer({
		vendor: "Project Gutenberg",
		channel: "read",
		format: "EPUB",
		price: 0,
		detail: "Download",
		url: gut.epub
	}));
	if (gut?.kindle) read.push(offer({
		vendor: "Project Gutenberg",
		channel: "read",
		format: "Kindle",
		price: 0,
		detail: "Download",
		url: gut.kindle
	}));
	const ia = doc.lending_identifier_s || doc.ia?.[0];
	if (ia && (doc.ebook_access === "public" || doc.public_scan_b)) read.push(offer({
		vendor: "Internet Archive",
		channel: "read",
		format: "Read online",
		price: 0,
		detail: "Full scan",
		url: `https://archive.org/details/${encodeURIComponent(ia)}`
	}));
	else if (ia && doc.ebook_access === "borrowable") read.push(offer({
		vendor: "Open Library",
		channel: "read",
		format: "Borrow",
		price: 0,
		detail: "Free loan · account required",
		url: `https://openlibrary.org/borrow/ia/${encodeURIComponent(ia)}`
	}));
	if (ebook && ebook.price === 0) read.push(offer({
		vendor: "Apple Books",
		channel: "read",
		format: "Ebook",
		price: 0,
		detail: "Free download",
		url: ebook.url
	}));
	const nameQuery = encodeURIComponent([book.title, author].filter(Boolean).join(" ").trim());
	const abeSearchUrl = `https://www.abebooks.com/servlet/SearchResults?kn=${nameQuery}&sortby=2`;
	read.push(offer({
		vendor: "Your library",
		channel: "read",
		format: "Library ebook",
		price: null,
		detail: "Check Libby / OverDrive",
		url: `https://www.overdrive.com/search?q=${nameQuery}`
	}));
	read.push(offer({
		vendor: "WorldCat",
		channel: "read",
		format: "Nearby libraries",
		price: null,
		detail: "Find a copy to borrow",
		url: `https://search.worldcat.org/search?q=${nameQuery}`
	}));
	if (ebook && ebook.price > 0) buy.push(offer({
		vendor: "Apple Books",
		channel: "buy",
		format: "Ebook",
		price: ebook.price,
		detail: "Instant download",
		url: ebook.url
	}));
	if (audio && audio.price > 0) buy.push(offer({
		vendor: "Apple Books",
		channel: "buy",
		format: "Audiobook",
		price: audio.price,
		detail: "Narrated edition",
		url: audio.url
	}));
	if (abe) {
		const isNew = /^new\b/i.test(abe.condition);
		const shipping = abe.shipping === 0 ? "free shipping" : `${new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(abe.item)} + ${new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(abe.shipping)} shipping`;
		buy.push(offer({
			vendor: "AbeBooks",
			channel: "buy",
			format: isNew ? "New print" : "Used print",
			price: abe.total,
			detail: `${abe.condition} · ${shipping}`,
			url: abeSearchUrl
		}));
	}
	if (!buy.some((item) => item.vendor === "AbeBooks")) buy.push(offer({
		vendor: "AbeBooks",
		channel: "buy",
		format: "Used print",
		price: null,
		detail: "Compare used copies",
		url: abeSearchUrl
	}));
	const shops = [
		offer({
			vendor: "Amazon",
			channel: "buy",
			format: "Print & ebook",
			price: null,
			detail: "New and used",
			url: `https://www.amazon.com/s?k=${nameQuery}`
		}),
		offer({
			vendor: "Bookshop.org",
			channel: "buy",
			format: "New print",
			price: null,
			detail: "Supports independent bookstores",
			url: `https://bookshop.org/search?keywords=${nameQuery}`
		}),
		offer({
			vendor: "Barnes & Noble",
			channel: "buy",
			format: "Print & ebook",
			price: null,
			detail: "Store and online",
			url: `https://www.barnesandnoble.com/s/${nameQuery}`
		}),
		offer({
			vendor: "ThriftBooks",
			channel: "buy",
			format: "Used print",
			price: null,
			detail: "Used copies",
			url: `https://www.thriftbooks.com/browse/?b.search=${nameQuery}`
		}),
		offer({
			vendor: "Better World Books",
			channel: "buy",
			format: "New & used",
			price: null,
			detail: "Ships used and new",
			url: `https://www.betterworldbooks.com/search/results?q=${nameQuery}`
		}),
		offer({
			vendor: "Kobo",
			channel: "buy",
			format: "Ebook",
			price: null,
			detail: "Ebook stores",
			url: `https://www.kobo.com/us/en/search?query=${nameQuery}`
		}),
		offer({
			vendor: "eBay",
			channel: "buy",
			format: "Print",
			price: null,
			detail: "Sorted by lowest price + shipping",
			url: `https://www.ebay.com/sch/i.html?_nkw=${nameQuery}&_sop=15`
		})
	];
	for (const shop of shops) buy.push(shop);
	const priced = sortBuy(buy);
	const lowestOffer = priced.find((item) => item.price != null && item.price > 0);
	const free = read.find((item) => item.price === 0);
	const ratings = {
		average: olAverage,
		count: olCount ?? 0,
		histogram,
		appleAverage: ebook?.rating ?? audio?.rating ?? null,
		appleCount: ebook?.ratingCount ?? audio?.ratingCount ?? null,
		want: typeof doc.want_to_read_count === "number" ? doc.want_to_read_count : null,
		reading: typeof doc.currently_reading_count === "number" ? doc.currently_reading_count : null,
		finished: typeof doc.already_read_count === "number" ? doc.already_read_count : null
	};
	return {
		book: {
			...book,
			rating: olAverage,
			ratingCount: olCount ?? book.ratingCount
		},
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
		lowest: lowestOffer ? {
			price: lowestOffer.price,
			vendor: lowestOffer.vendor,
			format: lowestOffer.format,
			url: lowestOffer.url
		} : null,
		freeRead: free ? {
			vendor: free.vendor,
			url: free.url
		} : null
	};
}
var getBook_createServerFn_handler = createServerRpc({
	id: "75244e050693b14a2bc03e50b8ded832937fae5517df36203cb68a67acb40d4f",
	name: "getBook",
	filename: "src/lib/books.functions.ts"
}, (opts) => getBook.__executeServer(opts));
var getBook = createServerFn({ method: "GET" }).validator((input) => {
	const id = (input?.id || "").trim();
	if (!/^OL\d+W$/.test(id)) throw new Error("That book link doesn't look right.");
	return { id };
}).handler(getBook_createServerFn_handler, async ({ data }) => {
	try {
		return await cached(`book:v3:${data.id}`, 9e5, () => loadBook(data.id));
	} catch (error) {
		if (error instanceof Error && /couldn't find|doesn't look right/.test(error.message)) throw error;
		console.error(error);
		throw new Error("We couldn't load that book. Try again in a moment.");
	}
});
//#endregion
export { getBook_createServerFn_handler, getCatShelves_createServerFn_handler, getHomeShelves_createServerFn_handler, searchBooks_createServerFn_handler };
