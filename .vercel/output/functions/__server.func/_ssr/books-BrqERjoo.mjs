//#region node_modules/.nitro/vite/services/ssr/assets/books-BrqERjoo.js
function isSort(value) {
	return value === "match" || value === "rating" || value === "new";
}
function readSearch(search) {
	const q = typeof search.q === "string" ? search.q : "";
	const raw = typeof search.page === "number" ? search.page : Number(search.page);
	return {
		q,
		page: Number.isFinite(raw) ? Math.min(20, Math.max(1, Math.floor(raw))) : 1,
		sort: isSort(search.sort) ? search.sort : "match"
	};
}
function prettyQuery(q) {
	const match = q.match(/^subject:(?:"(.+)"|(\S+))$/i);
	if (!match) return q;
	return (match[1] || match[2] || q).replace(/_/g, " ");
}
function coverUrl(id, size = "L") {
	return `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;
}
function money(amount) {
	if (amount === 0) return "Free";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(amount);
}
function compactCount(n) {
	return new Intl.NumberFormat("en-US", {
		notation: n >= 1e4 ? "compact" : "standard",
		maximumFractionDigits: 1
	}).format(n);
}
function seriesLabel(name, position) {
	if (!name && !position) return null;
	const pos = position && /^\d+(\.\d+)?$/.test(position) ? `Book ${position}` : position;
	if (name && pos) return `${name} · ${pos}`;
	return name || pos;
}
function cleanText(input) {
	return decodeEntities(input).replace(/<[^>]+>/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_#>`]+/g, "").replace(/\s+/g, " ").trim();
}
function decodeEntities(input) {
	return input.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num))).replace(/&nbsp;/g, " ").replace(/* @__PURE__ */ new RegExp("&quot;", "g"), "\"").replace(/* @__PURE__ */ new RegExp("&#39;|&apos;", "g"), "'").replace(/* @__PURE__ */ new RegExp("&lt;", "g"), "<").replace(/* @__PURE__ */ new RegExp("&gt;", "g"), ">").replace(/* @__PURE__ */ new RegExp("&amp;", "g"), "&");
}
function safeHttps(raw) {
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
/** Lowest AbeBooks listing total (item + shipping) from a search results page. */
function lowestAbeOffer(html) {
	const prices = [...html.matchAll(/data-test-id="listing-price">[^$]{0,12}\$[\s\u00a0]*([\d,]+\.\d{2})/gi)].map((match) => Number(match[1].replace(/,/g, "")));
	const conditions = [...html.matchAll(/data-test-id="listing-condition">([^<]+)</g)].map((match) => decodeEntities(match[1]).replace(/\s+/g, " ").trim());
	const offers = [];
	for (let i = 0; i < prices.length; i++) {
		const item = prices[i];
		if (!Number.isFinite(item) || item < .5 || item > 400) continue;
		const block = html.match(new RegExp(`data-test-id="item-shipping-price-${i}"[\\s\\S]{0,420}`))?.[0] ?? "";
		if (!block) continue;
		let shipping = 0;
		if (/free shipping/i.test(block)) shipping = 0;
		else {
			const ship = block.match(/\$[\s\u00a0]*([\d,]+\.\d{2})/);
			if (!ship) continue;
			shipping = Number(ship[1].replace(/,/g, ""));
		}
		if (!Number.isFinite(shipping) || shipping < 0 || shipping > 80) continue;
		offers.push({
			item,
			shipping,
			total: Math.round((item + shipping) * 100) / 100,
			condition: conditions[i] || "Used"
		});
	}
	offers.sort((a, b) => a.total - b.total);
	return offers[0] ?? null;
}
function subjectQuery(subject) {
	const cleaned = subject.trim();
	return cleaned.includes(" ") ? `subject:"${cleaned}"` : `subject:${cleaned.replace(/\s+/g, "_")}`;
}
//#endregion
export { lowestAbeOffer as a, readSearch as c, subjectQuery as d, isSort as i, safeHttps as l, compactCount as n, money as o, coverUrl as r, prettyQuery as s, cleanText as t, seriesLabel as u };
