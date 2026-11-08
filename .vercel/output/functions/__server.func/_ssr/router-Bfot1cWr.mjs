import { i as __toESM } from "../_runtime.mjs";
import { C as useRouter, S as useNavigate, Z as require_react, _ as Outlet, b as createRootRoute, d as Scripts, f as HeadContent, g as createRouter, m as useRouterState, v as lazyRouteComponent, w as require_jsx_runtime, x as Link, y as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as readSearch, i as isSort, s as prettyQuery } from "./books-BrqERjoo.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as Cat, i as ChevronDown, o as BookOpen, r as Search, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/books.functions-D031gRCQ.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var searchBooks = createServerFn({ method: "GET" }).validator((input) => {
	const q = (input?.q || "").trim().slice(0, 140);
	if (q.length < 1) throw new Error("Type a title, author, or ISBN.");
	return {
		q,
		page: Math.min(20, Math.max(1, Math.floor(Number(input.page) || 1))),
		sort: isSort(input.sort) ? input.sort : "match"
	};
}).handler(createSsrRpc("781da4dbc8209dce4177e08814ac7b9823270f09fb542b37bd685555cc718ab5"));
var getHomeShelves = createServerFn({ method: "GET" }).handler(createSsrRpc("85a67fc7072f3a0f66d4a88458c0733796b9fc8ba8b5e46b02a8fec5c8c458dd"));
var getCatShelves = createServerFn({ method: "GET" }).handler(createSsrRpc("db8d5992e030cf40cfdb680ad22c7ed0d4dc0467a1d69955034be84b0190c2ed"));
var getBook = createServerFn({ method: "GET" }).validator((input) => {
	const id = (input?.id || "").trim();
	if (!/^OL\d+W$/.test(id)) throw new Error("That book link doesn't look right.");
	return { id };
}).handler(createSsrRpc("75244e050693b14a2bc03e50b8ded832937fae5517df36203cb68a67acb40d4f"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-Bfot1cWr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-2xl",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var GENRES = [
	{
		label: "Fantasy",
		q: "fantasy fiction"
	},
	{
		label: "Mystery",
		q: "mystery detective"
	},
	{
		label: "Romance",
		q: "romance novel"
	},
	{
		label: "Science fiction",
		q: "science fiction novel"
	},
	{
		label: "Horror",
		q: "horror fiction"
	},
	{
		label: "Young adult",
		q: "young adult fiction"
	},
	{
		label: "Classics",
		q: "classic literature"
	},
	{
		label: "History",
		q: "history"
	},
	{
		label: "Poetry",
		q: "poetry"
	}
];
var SERIES = [
	"Harry Potter",
	"The Lord of the Rings",
	"Percy Jackson",
	"Dune",
	"The Hunger Games",
	"Sherlock Holmes",
	"A Court of Thorns and Roses",
	"The Stormlight Archive"
];
function CategoryMenu() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const rootRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		function onKey(event) {
			if (event.key === "Escape") setOpen(false);
		}
		function onPointer(event) {
			if (!rootRef.current?.contains(event.target)) setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		document.addEventListener("pointerdown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			document.removeEventListener("pointerdown", onPointer);
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": open,
			"aria-controls": "category-menu",
			onClick: () => setOpen((value) => !value),
			className: `inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm ${open ? "bg-ink text-card" : "text-ink hover:bg-paper-deep"}`,
			children: ["Categories", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
				className: `size-4 ${open ? "rotate-180" : ""}`,
				"aria-hidden": true
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			id: "category-menu",
			hidden: !open,
			className: "absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-card p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted",
					children: "Genres"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [GENRES.map((genre) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/search",
						search: {
							q: genre.q,
							page: 1,
							sort: "match"
						},
						onClick: () => setOpen(false),
						className: "inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 text-sm hover:border-ink",
						children: genre.label
					}, genre.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/cats",
						onClick: () => setOpen(false),
						className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card",
						children: "Cats"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs font-medium tracking-wide text-muted",
					children: "Series"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: SERIES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/search",
						search: {
							q: name,
							page: 1,
							sort: "match"
						},
						onClick: () => setOpen(false),
						className: "inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 text-sm hover:border-ink",
						children: name
					}, name))
				})
			]
		})]
	});
}
function Shell({ children }) {
	const navigate = useNavigate();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const urlQuery = useRouterState({ select: (state) => {
		const search = state.location.search;
		return typeof search?.q === "string" ? search.q : "";
	} });
	const [q, setQ] = (0, import_react.useState)(urlQuery);
	(0, import_react.useEffect)(() => {
		setQ(urlQuery);
	}, [urlQuery]);
	function onSubmit(event) {
		event.preventDefault();
		const query = q.trim();
		if (!query) return;
		navigate({
			to: "/search",
			search: {
				q: query,
				page: 1,
				sort: "match"
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto] sm:gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 shrink-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
									className: "size-5",
									"aria-hidden": true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-serif text-xl leading-none",
									children: "BookFinder"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-xs text-muted",
									children: "Find books easily"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-1 sm:order-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cats",
								"aria-current": path === "/cats" ? "page" : void 0,
								className: `inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm ${path === "/cats" ? "bg-ink text-card" : "text-ink hover:bg-paper-deep"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cat, {
									className: "size-4",
									"aria-hidden": true
								}), "Cats"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryMenu, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit,
							className: "relative col-span-2 min-w-0 sm:col-span-1 sm:order-2",
							role: "search",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "book-search",
									className: "sr-only",
									children: "Search books"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									className: "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted",
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "book-search",
									value: q,
									onChange: (event) => setQ(event.target.value),
									placeholder: "Title, author, or ISBN",
									enterKeyHint: "search",
									className: `w-full rounded-full border border-line bg-card pr-28 pl-12 text-ink placeholder:text-muted ${path === "/" ? "h-14" : "h-12"}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "absolute top-1.5 right-1.5 bottom-1.5 min-w-20 rounded-full bg-accent px-4 text-sm font-medium text-accent-ink",
									children: "Search"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-6xl px-4 pt-8 pb-16",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "BookFinder · Find books easily" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl",
						children: "Confirmed prices come from Apple Books and AbeBooks used listings, including shipping. Other shops open a live search."
					})]
				})
			})
		]
	});
}
var styles_default = "/assets/styles-zsCaAEqf.css";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "BookFinder — Find books easily" },
			{
				name: "description",
				content: "Search any book, see the whole series, read reviews, and find the cheapest place to read or buy it."
			},
			{
				name: "theme-color",
				content: "#f4efe6"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,560;1,9..144,520&family=Instrument+Sans:ital,wght@0,400..600;1,400&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$3 = () => import("./routes-Bhgv0xcz.mjs");
var Route$3 = createFileRoute("/")({
	loader: () => getHomeShelves(),
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	pendingComponent: HomePending
});
function HomePending() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6",
		children: Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-2/3 animate-pulse rounded-xl bg-paper-deep" }, index))
	});
}
var $$splitComponentImporter$2 = () => import("./cats-MVkI1sIo.mjs");
var Route$2 = createFileRoute("/cats")({
	loader: () => getCatShelves(),
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	pendingComponent: CatPending,
	head: () => ({ meta: [{ title: "Cats · BookFinder" }] })
});
function CatPending() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8 sm:grid-cols-[16rem_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square max-w-64 animate-pulse rounded-2xl bg-paper-deep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-2/3 animate-pulse rounded-lg bg-paper-deep" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-full animate-pulse rounded bg-paper-deep" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-4/5 animate-pulse rounded bg-paper-deep" })
			]
		})]
	});
}
var $$splitErrorComponentImporter$1 = () => import("./search-BSy5z8Vz.mjs");
var $$splitComponentImporter$1 = () => import("./search-D2EsLyWH.mjs");
var Route$1 = createFileRoute("/search")({
	validateSearch: (search) => readSearch(search),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const q = deps.q.trim();
		if (!q) return {
			q: "",
			page: 1,
			sort: "match",
			numFound: 0,
			hits: []
		};
		return searchBooks({ data: {
			q,
			page: deps.page,
			sort: deps.sort
		} });
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	pendingComponent: SearchPending,
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
	head: ({ loaderData }) => ({ meta: [{ title: loaderData?.q ? `${prettyQuery(loaderData.q)} · BookFinder` : "Search · BookFinder" }] })
});
function SearchPending() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-48 animate-pulse rounded-lg bg-paper-deep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
		children: Array.from({ length: 8 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-2/3 animate-pulse rounded-xl bg-paper-deep" }, index))
	})] });
}
var $$splitErrorComponentImporter = () => import("../_workId-CEVaTAYs.mjs");
var $$splitComponentImporter = () => import("../_workId-D_EXnWu1.mjs");
var Route = createFileRoute("/book/$workId")({
	loader: ({ params }) => getBook({ data: { id: params.workId } }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	pendingComponent: BookPending,
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.book.title} · BookFinder` : "Book · BookFinder" }] })
});
function BookPending() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 sm:grid-cols-[11rem_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-2/3 animate-pulse rounded-xl bg-paper-deep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-2/3 animate-pulse rounded-lg bg-paper-deep" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-1/3 animate-pulse rounded bg-paper-deep" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-28 animate-pulse rounded-2xl bg-paper-deep" })
			]
		})]
	});
}
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	CatsRoute: Route$2.update({
		id: "/cats",
		path: "/cats",
		getParentRoute: () => Route$4
	}),
	SearchRoute: Route$1.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => Route$4
	}),
	BookWorkIdRoute: Route.update({
		id: "/book/$workId",
		path: "/book/$workId",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		scrollRestoration: true
	});
}
//#endregion
export { Route$3 as a, Route$2 as i, Route as n, SERIES as o, Route$1 as r, router_exports as t };
