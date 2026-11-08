import { i as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as compactCount, s as prettyQuery } from "./books-BrqERjoo.mjs";
import { r as Route$1 } from "./router-Bfot1cWr.mjs";
import { t as BookCard } from "./book-card-D1J3EtS7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-D2EsLyWH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SORTS = [
	{
		id: "match",
		label: "Best match"
	},
	{
		id: "rating",
		label: "Top rated"
	},
	{
		id: "new",
		label: "Newest"
	}
];
function SearchPage() {
	const data = Route$1.useLoaderData();
	const search = Route$1.useSearch();
	(0, import_react.useEffect)(() => {
		const q = search.q.trim();
		if (!q || q.toLowerCase().startsWith("subject:")) return;
		try {
			const current = JSON.parse(localStorage.getItem("bookfinder-recent") || "[]");
			const next = [q, ...(Array.isArray(current) ? current.filter((item) => typeof item === "string") : []).filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 6);
			localStorage.setItem("bookfinder-recent", JSON.stringify(next));
		} catch {}
	}, [search.q]);
	if (!search.q.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-4xl",
			children: "Search any book"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-lg text-muted",
			children: "Try a title, an author, or an ISBN. Harry Potter, Octavia Butler, or 9780439023528."
		})]
	});
	const label = prettyQuery(search.q);
	const start = data.hits.length ? (data.page - 1) * 24 + 1 : 0;
	const end = (data.page - 1) * 24 + data.hits.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				"aria-live": "polite",
				children: data.numFound ? `${compactCount(data.numFound)} books · showing ${start}–${end}` : "No books matched"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: SORTS.map((sort) => {
					const active = search.sort === sort.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/search",
						search: {
							q: search.q,
							page: 1,
							sort: sort.id
						},
						className: `inline-flex min-h-11 items-center rounded-full px-4 text-sm ${active ? "bg-ink text-card" : "border border-line bg-card text-ink"}`,
						"aria-current": active ? "true" : void 0,
						children: sort.label
					}, sort.id);
				})
			})]
		}),
		data.hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
			children: data.hits.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCard, { book }, book.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 max-w-lg text-muted",
			children: "Nothing came up for that. Check the spelling, or search the author instead of the full title."
		}),
		data.numFound > 24 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 flex items-center justify-between gap-4",
			children: [
				data.page > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					search: {
						q: search.q,
						page: data.page - 1,
						sort: search.sort
					},
					className: "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 text-sm",
					children: "Previous"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted tabular-nums",
					children: ["Page ", data.page]
				}),
				end < data.numFound && data.page < 20 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					search: {
						q: search.q,
						page: data.page + 1,
						sort: search.sort
					},
					className: "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 text-sm",
					children: "Next"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			]
		}) : null
	] });
}
//#endregion
export { SearchPage as component };
