import { w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Route$2 } from "./router-Bfot1cWr.mjs";
import { t as BookCard } from "./book-card-D1J3EtS7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cats-MVkI1sIo.js
var import_jsx_runtime = require_jsx_runtime();
var TRAILS = [
	{
		label: "All cat books",
		q: "cats fiction"
	},
	{
		label: "Ninja cats",
		q: "ninja cat"
	},
	{
		label: "The Cat in the Hat",
		q: "The Cat in the Hat"
	},
	{
		label: "Warrior cats",
		q: "Warriors Erin Hunter"
	},
	{
		label: "The cat who…",
		q: "The Cat Who mysteries"
	},
	{
		label: "Puss in Boots",
		q: "Puss in Boots"
	},
	{
		label: "Catwings",
		q: "Catwings"
	}
];
function CatPage() {
	const { shelves } = Route$2.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-center gap-8 sm:grid-cols-[16rem_1fr] sm:gap-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/ninja-cat.jpg",
					alt: "Ninja Cat, a black cat in a dark wrap and headband, one paw resting on a book",
					width: 800,
					height: 800,
					className: "aspect-square w-full max-w-64 rounded-2xl border border-line object-cover sm:max-w-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tracking-wide text-accent",
							children: "The cat section"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 font-serif text-4xl leading-tight sm:text-5xl",
							children: "Ninja Cat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-lg text-muted",
							children: "Night librarian. The headband is for the late shift, the book is non-negotiable, and this shelf is every cat story we can find."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl",
				children: "Start here"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: TRAILS.map((trail) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					search: {
						q: trail.q,
						page: 1,
						sort: "match"
					},
					className: "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-ink",
					children: trail.label
				}, trail.label))
			})] }),
			shelves.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: shelf.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: shelf.note
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					search: {
						q: shelf.q,
						page: 1,
						sort: "match"
					},
					className: "inline-flex min-h-11 items-center text-sm font-medium text-accent",
					children: "See all"
				})]
			}), shelf.hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6",
				children: shelf.hits.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCard, { book }, book.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "This shelf is quiet right now. Try one of the searches above."
			})] }, shelf.title))
		]
	});
}
//#endregion
export { CatPage as component };
