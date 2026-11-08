import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-BSy5z8Vz.js
var import_jsx_runtime = require_jsx_runtime();
function SearchError({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-3xl",
			children: "Search didn’t finish"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-lg text-muted",
			children: error instanceof Error ? error.message : "Search didn’t finish."
		})]
	});
}
//#endregion
export { SearchError as errorComponent };
