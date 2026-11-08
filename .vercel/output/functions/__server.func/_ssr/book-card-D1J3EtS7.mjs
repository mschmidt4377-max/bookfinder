import { i as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as coverUrl, u as seriesLabel } from "./books-BrqERjoo.mjs";
import { n as Star } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-card-D1J3EtS7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Cover({ coverId, title, size = "L", eager = false }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const show = coverId != null && !failed;
	const initial = title.trim().slice(0, 1).toUpperCase() || "B";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "aspect-2/3 overflow-hidden rounded-xl bg-paper-deep",
		children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: coverUrl(coverId, size),
			alt: "",
			loading: eager ? "eager" : "lazy",
			className: "h-full w-full object-cover transition duration-200 group-hover:scale-105",
			onError: () => setFailed(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-full items-center justify-center font-serif text-3xl text-muted",
			children: initial
		})
	});
}
function BookCard({ book }) {
	const series = seriesLabel(book.seriesName, book.seriesPosition);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/book/$workId",
		params: { workId: book.id },
		className: "group flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
			coverId: book.coverId,
			title: book.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				series ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-accent",
					children: series
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-0.5 font-serif text-lg leading-snug text-ink group-hover:text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "line-clamp-2",
						children: book.title
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate text-sm text-muted",
					children: book.authors.join(", ") || "Unknown author"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 flex items-center gap-2 text-sm text-muted",
					children: [book.rating != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
							className: "size-3.5 fill-accent text-accent",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: book.rating.toFixed(1)
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No rating" }), book.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: book.year
					}) : null]
				})
			]
		})]
	});
}
//#endregion
export { Cover as n, BookCard as t };
