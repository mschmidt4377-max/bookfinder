import { i as __toESM } from "./_runtime.mjs";
import { C as useRouter, Z as require_react, p as useCanGoBack, w as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { d as subjectQuery, n as compactCount, o as money, u as seriesLabel } from "./_ssr/books-BrqERjoo.mjs";
import { c as ArrowLeft, n as Star, s as ArrowUpRight } from "./_libs/lucide-react.mjs";
import { n as Route } from "./_ssr/router-Bfot1cWr.mjs";
import { n as Cover, t as BookCard } from "./_ssr/book-card-D1J3EtS7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_workId-D_EXnWu1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Stars({ value }) {
	const rounded = value == null ? 0 : Math.round(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center gap-0.5",
		"aria-label": value == null ? "No rating yet" : `${value.toFixed(1)} out of 5`,
		children: [
			1,
			2,
			3,
			4,
			5
		].map((star) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
			"aria-hidden": true,
			className: star <= rounded ? "size-4 fill-accent text-accent" : "size-4 text-line",
			strokeWidth: 1.75
		}, star))
	});
}
function BookPage() {
	const data = Route.useLoaderData();
	const { book } = data;
	const seriesText = seriesLabel(book.seriesName, book.seriesPosition);
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const long = (data.description?.length ?? 0) > 520;
	const description = data.description && long && !expanded ? `${data.description.slice(0, 500).trim()}…` : data.description;
	const cheapest = data.buy.find((offer) => offer.price != null);
	const jumps = [
		data.series ? ["#series", "Series"] : null,
		["#read", "Read"],
		["#buy", "Buy"],
		["#reviews", "Reviews"]
	].filter((item) => !!item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex flex-col gap-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackLink, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "grid gap-6 sm:grid-cols-[11rem_1fr] sm:gap-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
					coverId: book.coverId,
					title: book.title,
					eager: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						seriesText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-accent",
							children: seriesText
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-serif text-4xl leading-tight sm:text-5xl",
							children: book.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-lg text-muted",
							children: book.authors.join(", ") || "Unknown author"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: book.rating }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums",
											children: book.rating != null ? book.rating.toFixed(1) : "No rating"
										}),
										book.ratingCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted tabular-nums",
											children: [compactCount(book.ratingCount), " ratings"]
										}) : null
									]
								}),
								book.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted tabular-nums",
									children: book.year
								}) : null,
								book.pages ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted tabular-nums",
									children: [book.pages, " pages"]
								}) : null,
								data.editionCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted tabular-nums",
									children: [compactCount(data.editionCount), " editions"]
								}) : null
							]
						}),
						data.opening ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
							className: "mt-4 max-w-xl border-l-2 border-accent pl-4 font-serif text-lg text-ink",
							children: [
								"“",
								data.opening,
								"”"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 rounded-2xl border border-line bg-card p-4",
							children: [data.freeRead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									"Read free on",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "font-medium text-accent underline decoration-line underline-offset-4",
										href: data.freeRead.url,
										target: "_blank",
										rel: "noreferrer",
										children: data.freeRead.vendor
									}),
									data.lowest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · or buy from ", money(data.lowest.price)] }) : null
								]
							}) : null, data.lowest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: data.lowest.url,
								target: "_blank",
								rel: "noreferrer",
								className: "mt-1 flex items-end justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm text-muted",
										children: "Lowest confirmed price"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-serif text-4xl tabular-nums",
										children: money(data.lowest.price)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block text-sm",
										children: [
											data.lowest.format,
											" · ",
											data.lowest.vendor
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
									className: "mb-1 size-5 shrink-0 text-muted",
									"aria-hidden": true
								})]
							}) : data.freeRead ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "No confirmed price yet. Compare the shops below — they open a live search for this book."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "mt-4 flex gap-2 overflow-x-auto",
							"aria-label": "On this page",
							children: jumps.map(([href, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href,
								className: "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm",
								children: label
							}, href))
						})
					]
				})]
			}),
			data.series ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "series",
				className: "scroll-mt-28",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "The whole series"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [data.series.name, ", in reading order when we know it."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex gap-4 overflow-x-auto pb-2",
						children: data.series.books.map((item) => {
							const current = item.id === book.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/book/$workId",
								params: { workId: item.id },
								className: `group w-28 shrink-0 sm:w-32 ${current ? "rounded-xl ring-2 ring-accent ring-offset-2 ring-offset-paper" : ""}`,
								"aria-current": current ? "page" : void 0,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
										coverId: item.coverId,
										title: item.title,
										size: "M"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-accent",
										children: item.seriesPosition && /^\d+(\.\d+)?$/.test(item.seriesPosition) ? `Book ${item.seriesPosition}` : item.seriesPosition || "Related"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "line-clamp-2 font-serif text-sm leading-snug",
										children: item.title
									})
								]
							}, item.id);
						})
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferSection, {
					id: "read",
					title: "Where to read",
					note: "Free copies and library loans first.",
					offers: data.read
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferSection, {
					id: "buy",
					title: "Where to buy",
					note: "Cheapest confirmed price first. “See price” opens that shop’s search.",
					offers: data.buy,
					cheapestId: cheapest?.id
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "reviews",
				className: "scroll-mt-28",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: "Reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-6 lg:grid-cols-[16rem_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-line bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-serif text-4xl tabular-nums",
								children: data.ratings.average != null ? data.ratings.average.toFixed(1) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: data.ratings.average }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: data.ratings.count ? `${compactCount(data.ratings.count)} Open Library ratings` : "No Open Library ratings yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-col gap-1.5",
								children: data.ratings.histogram.map((row) => {
									const max = Math.max(...data.ratings.histogram.map((item) => item.count), 1);
									const width = row.count === 0 ? 0 : Math.round(row.count / max * 100);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-3 tabular-nums",
												children: row.star
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block h-full rounded-full bg-accent",
													style: { width: `${width}%` }
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-8 text-right tabular-nums",
												children: compactCount(row.count)
											})
										]
									}, row.star);
								})
							}),
							data.ratings.appleAverage != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 text-sm",
								children: [
									"Apple Books ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums",
										children: data.ratings.appleAverage.toFixed(1)
									}),
									data.ratings.appleCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: [" · ", compactCount(data.ratings.appleCount)]
									}) : null
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid grid-cols-3 gap-2 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Want",
										value: data.ratings.want
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Reading",
										value: data.ratings.reading
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Finished",
										value: data.ratings.finished
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3",
						children: data.reviews.length ? data.reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-medium",
										children: review.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: review.rating })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6",
									children: review.body
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-muted",
									children: [
										review.author,
										" · ",
										review.source
									]
								})
							]
						}, `${review.author}-${review.title}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Written reviews show up when Apple Books has them for this edition. The bars are real Open Library ratings."
						})
					})]
				})]
			}),
			description || data.subjects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "About this book"
					}),
					description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 leading-7 text-ink",
						children: description
					}) : null,
					long ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-2 min-h-11 text-sm font-medium text-accent",
						onClick: () => setExpanded((open) => !open),
						children: expanded ? "Show less" : "Show more"
					}) : null,
					data.subjects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: data.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/search",
							search: {
								q: subjectQuery(subject),
								page: 1,
								sort: "rating"
							},
							className: "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm",
							children: subject
						}, subject))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-accent underline decoration-line underline-offset-4",
							href: `https://openlibrary.org/works/${book.id}`,
							target: "_blank",
							rel: "noreferrer",
							children: "Open Library record"
						})
					})
				]
			}) : null,
			data.moreByAuthor.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-serif text-2xl",
				children: ["More by ", data.authorName]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8",
				children: data.moreByAuthor.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCard, { book: item }, item.id))
			})] }) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-paper px-1 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular-nums",
			children: value != null ? compactCount(value) : "—"
		})]
	});
}
function OfferSection({ id, title, note, offers, cheapestId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id,
		className: "scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-line px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: note
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line",
			children: offers.map((item) => {
				const lowest = item.id === cheapestId;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: lowest ? "bg-paper" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: item.url,
						target: "_blank",
						rel: "noreferrer",
						className: "flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-paper",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: item.vendor
									}), lowest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink",
										children: "Lowest"
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 block text-sm text-muted",
									children: [item.format, item.detail ? ` · ${item.detail}` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-right font-serif text-lg tabular-nums",
								children: priceText(item)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
								className: "size-4 shrink-0 text-muted",
								"aria-hidden": true
							})
						]
					})
				}, item.id);
			})
		})]
	});
}
function priceText(item) {
	if (item.price === 0) return "Free";
	if (item.price == null) return item.channel === "read" ? "Check" : "See price";
	return money(item.price);
}
function BackLink() {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-ink",
		onClick: () => canGoBack ? router.history.back() : router.navigate({ to: "/" }),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
			className: "size-4",
			"aria-hidden": true
		}), "Back"]
	});
}
//#endregion
export { BookPage as component };
