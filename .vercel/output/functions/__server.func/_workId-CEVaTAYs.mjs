import { w as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_workId-CEVaTAYs.js
var import_jsx_runtime = require_jsx_runtime();
function BookError({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl",
				children: "That book didn’t load"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: error instanceof Error ? error.message : "That book didn’t load."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent",
				children: "Back to BookFinder"
			})
		]
	});
}
//#endregion
export { BookError as errorComponent };
