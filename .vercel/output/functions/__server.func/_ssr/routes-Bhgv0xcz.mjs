import { i as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Route$3, o as SERIES } from "./router-Bfot1cWr.mjs";
import { t as BookCard } from "./book-card-D1J3EtS7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bhgv0xcz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { shelves } = Route$3.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium tracking-wide text-accent",
						children: "BookFinder · Find books easily"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-serif text-4xl leading-tight sm:text-5xl",
						children: "Search any book. See the whole series."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-lg text-muted",
						children: "Look up a title, author, or ISBN. Open a book for reviews, every volume in the series, free ways to read, and the lowest price we can confirm."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-center gap-6 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[8rem_1fr] sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/ninja-cat.jpg",
					alt: "",
					width: 800,
					height: 800,
					className: "aspect-square w-32 rounded-xl object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium tracking-wide text-accent",
						children: "The cat section"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-serif text-2xl",
						children: "Meet Ninja Cat"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-muted",
						children: "Night librarian with a book under one paw. The cat shelf is stories, picture books, and the clan series."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/cats",
						className: "mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card",
						children: "Open the cat section"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recent, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl",
				children: "Start a series"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: SERIES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					search: {
						q: name,
						page: 1,
						sort: "match"
					},
					className: "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-ink",
					children: name
				}, name))
			})] }),
			shelves.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: shelf.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: shelf.note
				})] }), shelf.q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					search: {
						q: shelf.q,
						page: 1,
						sort: "match"
					},
					className: "inline-flex min-h-11 items-center text-sm font-medium text-accent",
					children: "See all"
				}) : null]
			}), shelf.hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6",
				children: shelf.hits.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCard, { book }, book.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "This shelf is unavailable right now. Search above and you can still find anything."
			})] }, shelf.id))
		]
	});
}
function Recent() {
	const [items, setItems] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			const parsed = JSON.parse(localStorage.getItem("bookfinder-recent") || "[]");
			setItems(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 6) : []);
		} catch {
			setItems([]);
		}
	}, []);
	if (!items?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-serif text-2xl",
		children: "Recent searches"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 flex flex-wrap gap-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/search",
			search: {
				q: item,
				page: 1,
				sort: "match"
			},
			className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card",
			children: item
		}, item))
	})] });
}
//#endregion
export { Home as component };
