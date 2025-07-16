var z = Object.defineProperty;
var Y = (n, t, e) =>
  t in n
    ? z(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e })
    : (n[t] = e);
var l = (n, t, e) => Y(n, typeof t != "symbol" ? t + "" : t, e);
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) r(o);
  new MutationObserver((o) => {
    for (const a of o)
      if (a.type === "childList")
        for (const c of a.addedNodes)
          c.tagName === "LINK" && c.rel === "modulepreload" && r(c);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(o) {
    const a = {};
    return (
      o.integrity && (a.integrity = o.integrity),
      o.referrerPolicy && (a.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (a.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (a.credentials = "omit")
          : (a.credentials = "same-origin"),
      a
    );
  }
  function r(o) {
    if (o.ep) return;
    o.ep = !0;
    const a = e(o);
    fetch(o.href, a);
  }
})();
const S = "data-slot",
  g = "data-preserve",
  b = "data-intercepted",
  C = "data-nointercepted",
  m = "data-prefetch",
  L = "data-prefetched",
  W = "loading-started",
  K = "loading-finished";
var I = ((n) => ((n.GET = "GET"), (n.POST = "POST"), n))(I || {}),
  R = ((n) => ((n.HTML = "text/html"), n))(R || {}),
  s = ((n) => (
    (n.IsLoading = "is-loading"),
    (n.IsIndeterminate = "is-indeterminate"),
    (n.BeforeLoading = "before-loading"),
    (n.AfterLoading = "after-loading"),
    n
  ))(s || {});
function p(n, t) {
  t.replaceChildren(...Array.from(n.children).map((e) => e.cloneNode(!0)));
}
function M(n) {
  return n
    ? new DOMParser().parseFromString(n, "text/html")
    : document.implementation.createHTMLDocument();
}
function h(n, t) {
  document.dispatchEvent(new CustomEvent(n, t));
}
const d = {
  CACHE_MAX_SIZE: 50,
  CACHE_NAME: "papel-fetch",
  EVENTS: {
    PAGE_LOADED: "page-loaded",
    PAGE_LOAD_ERROR: "page-load-error",
    LAYOUT_RENDERED: "layout-rendered",
  },
  SELECTORS: {
    LAYOUT_LINKS: "link[data-layout], link[rel='layout']",
    SLOTS: "slot, [slot], [data-slot]",
  },
  PREFETCH: { ENABLED: !0 },
  VIEW_TRANSITIONS: { ENABLED: !0 },
};
class O {
  constructor() {
    l(this, "config", {});
  }
  async load(t) {
    if (!t) return (console.error("URL is required to load HTML"), "");
    const e = await this.getCache();
    if (e) {
      const r = await e.match(t);
      if (r) return await r.text();
    }
    try {
      const r = await this.fetchHtml(t);
      return (e && (await e.put(t, r.clone())), await r.text());
    } catch (r) {
      return (console.error("Error loading HTML: ", r, t), "");
    }
  }
  async getCache() {
    try {
      return await caches.open(d.CACHE_NAME);
    } catch (t) {
      return (console.error("Error opening cache: ", t), null);
    }
  }
  async fetchHtml(t, e) {
    const r = await fetch(t, {
      method: I.GET,
      headers: { "Content-Type": R.HTML },
      ...e,
    });
    if (!r.ok) throw new Error(`Failed to load ${t}: ${r.statusText}`);
    return r;
  }
  async loadHTMLDocument(t) {
    const e = await this.load(t);
    return M(e);
  }
  async firstToMatch(t, e) {
    for (const r of t) {
      const o = await this.load(r);
      if (o && e(o)) return o;
    }
    return (console.error("None of the urls could be loaded", t), "");
  }
  async clearCache() {
    const t = await this.getCache();
    t && (await t.delete(d.CACHE_NAME), console.log("Cache cleared"));
  }
}
class X {
  constructor() {
    l(this, "currentLayouts", []);
    l(this, "loadedLayouts", []);
  }
  resetLayouts() {
    ((this.currentLayouts = []), (this.loadedLayouts = []));
  }
  render(t, e, r) {
    const o = this._formatTag(e);
    if (!r) throw new Error("layout is required");
    (this.currentLayouts.push(o),
      !this.isAlreadyRendered(o) &&
        (this.loadedLayouts.push(o),
        this._copyElementAttributes(r.body, t.body),
        this._replaceContent(r.body, t.body)));
  }
  markAsRendered(t) {
    this.currentLayouts.push(this._formatTag(t));
  }
  replaceSlotContents(t) {
    document.querySelectorAll("slot").forEach((r) => {
      const o = r.getAttribute("name") || "default",
        a = t.find((c) => c.slot === o);
      a && r.innerHTML !== a.content.innerHTML && p(a.content, r);
    });
  }
  isAlreadyRendered(t) {
    return this.loadedLayouts.includes(t);
  }
  getSlotsContents(t) {
    const e = [];
    return (
      t.querySelectorAll(`slot, [slot], [${S}]`).forEach((o) => {
        const a = o.getAttribute("slot") || o.getAttribute(S) || "default";
        e.push({ slot: a, content: o });
      }),
      e
    );
  }
  _copyElementAttributes(t, e) {
    Array.from(t.attributes).forEach((r) => {
      e.setAttribute(r.name, r.value);
    });
  }
  mergeHeads(t, e) {
    const r = t.head,
      o = e.head;
    if (r.innerHTML) {
      if (r.innerHTML && !o.innerHTML) {
        p(r, o);
        return;
      }
      this._mergeElements(r, o);
    }
  }
  _mergeElements(t, e) {
    const r = e.innerHTML;
    Array.from(t.children).forEach((o) => {
      if (this._elementIsPapelScript(o)) return;
      const a = o.outerHTML;
      r.includes(a) || e.appendChild(o);
    });
  }
  consolidateLayouts() {
    const t = new Set(this.currentLayouts),
      e = new Set(this.loadedLayouts);
    (this.currentLayouts
      .filter((o) => !e.has(o))
      .forEach((o) => {
        const a = document.querySelector(`link[href$="${o}"]`);
        a == null || a.remove();
      }),
      (this.loadedLayouts = Array.from(t)),
      (this.currentLayouts = []));
  }
  _replaceContent(t, e) {
    const r = e.querySelectorAll(`[${g}]`),
      o = new Map();
    (r.forEach((a, c) => {
      const u = a.getAttribute(g) ?? `preserve-${c}`;
      o.set(u, a);
    }),
      p(t, e),
      o.forEach((a, c) => {
        const u = e.querySelector(`[${g}="${c}"]`);
        u ? u.replaceWith(a) : e.insertBefore(a, e.firstChild);
      }));
  }
  _elementIsPapelScript(t) {
    var e;
    return (
      t.tagName === "SCRIPT" &&
      !!((e = t.getAttribute("src")) != null && e.includes("papel"))
    );
  }
  _formatTag(t) {
    return t.endsWith(".html") ? t : `${t.replace(/\/$/, "")}/index.html`;
  }
}
class H {
  constructor() {
    l(this, "navigationCallback");
    l(this, "scrollPositions");
    ((this.navigationCallback = async () => {}),
      (this.scrollPositions = new Map()),
      window.addEventListener("popstate", (t) => {
        const e = new URL(location.href);
        this._handlePopState(e, t);
      }));
  }
  onNavigate(t) {
    this.navigationCallback = t;
  }
  startInterception(t) {
    this._interceptLinks(t);
  }
  isNavigationAvailable() {
    return "navigation" in window && typeof window.navigation < "u";
  }
  _isLocalUrl(t) {
    return t.origin === location.origin;
  }
  _shouldIntercept(t) {
    return this._isLocalUrl(t) && !!this.navigationCallback;
  }
  _interceptLinks(t) {
    t.querySelectorAll(
      `a:not([${b}]):not([${C}]):not([target]):not([href^="${location.origin}"]):not([download])`,
    ).forEach((e) => {
      if (e instanceof HTMLAnchorElement) {
        if (!this._shouldIntercept(new URL(e.href))) {
          e.setAttribute(C, "true");
          return;
        }
        (e.setAttribute(b, "true"),
          e.addEventListener("click", (r) =>
            this._handleLinkClick.bind(this)(r, e),
          ));
      }
    });
  }
  async _handleLinkClick(t, e) {
    (t.preventDefault(), this.navigate(e.href));
  }
  navigate(t) {
    const e = new URL(t);
    this._shouldIntercept(e) &&
      (this.scrollPositions.set(location.href, {
        x: window.scrollX,
        y: window.scrollY,
      }),
      this._addNavigationToBrowserHistory(e),
      this._handleNavigation(e));
  }
  _addNavigationToBrowserHistory(t) {
    window.history.pushState({}, "", t);
  }
  async _handleNavigation(t) {
    (await this.navigationCallback(t), this._restoreScrollPosition(t));
  }
  _handlePopState(t, e) {
    if (this._shouldIntercept(t)) {
      if ((e.preventDefault(), this.isNavigationAvailable())) {
        document.startViewTransition(() => this._handleNavigation(t));
        return;
      }
      this._handleNavigation(t);
    }
  }
  _restoreScrollPosition(t) {
    window.scrollTo(0, 0);
  }
}
class k {
  constructor(t) {
    l(this, "loadedUrls", []);
    this.htmlLoader = t;
  }
  startPrefetch(t) {
    this._addObserverToLinks(t, async (e) => {
      const r = e.getAttribute(m);
      if (r !== "all") {
        await this._prefetchRequest(e.href);
        return;
      }
      if (r === "all") {
        const o = await this._prefetchRequest(e.href),
          c = new DOMParser().parseFromString(o, "text/html");
        (this.imagePrefetch(c), this.templateImagePrefetch(c));
      }
    });
  }
  imagePrefetch(t) {
    t.querySelectorAll(`img[${m}]`).forEach((r) => {
      (this._prefetchRequest(r.src), this.loadedUrls.push(r.src));
    });
  }
  templateImagePrefetch(t) {
    t.querySelectorAll("template").forEach((r) => {
      this.imagePrefetch(r.content);
    });
  }
  _addObserverToLinks(t, e) {
    const r = this._getIntersectionObserver(e);
    t.querySelectorAll(`a[${m}]:not([${m}="none"]):not([${L}])`).forEach(
      (a) => {
        if (this._isLocalLink(a)) {
          if (this._isAlreadyPrefetched(a)) {
            a.setAttribute(L, "true");
            return;
          }
          r.observe(a);
        }
      },
    );
  }
  _getIntersectionObserver(t) {
    return new IntersectionObserver((e) => {
      e.forEach((r) => {
        if (r.isIntersecting) {
          const o = r.target;
          if ((o.setAttribute(L, "true"), this._isAlreadyPrefetched(o))) return;
          (t(o), this.loadedUrls.push(o.href));
        }
      });
    });
  }
  _isAlreadyPrefetched(t) {
    return this.loadedUrls.includes(t.href);
  }
  _isLocalLink(t) {
    return t.hostname === window.location.hostname;
  }
  async _prefetchRequest(t) {
    return this.htmlLoader.load(t);
  }
}
class $ {
  constructor() {
    l(this, "currentPath");
    l(this, "cumulativePaths");
    l(this, "allLinks");
    ((this.currentPath = this.normalizePath(window.location.pathname)),
      (this.cumulativePaths = this.getCumulativePaths()),
      (this.allLinks = document.querySelectorAll("a")));
  }
  normalizePath(t) {
    return t.endsWith("/") ? t.slice(0, -1) : t;
  }
  ensureIndexPath(t) {
    return /\.[a-zA-Z0-9]+$/.test(t) ? t : `${t}/index.html`;
  }
  getCumulativePaths() {
    return this.currentPath
      .split("/")
      .filter((e) => e !== "")
      .reduce((e, r) => {
        const o = e.length > 0 ? e[e.length - 1] : "";
        return (e.push(`${o}/${r}`), e);
      }, []);
  }
  getMatchingLinks() {
    return this.allLinks
      ? Array.from(this.allLinks).filter((t) => {
          const e = new URL(t.href, window.location.origin);
          if (e.origin !== window.location.origin) return !1;
          const r = this.normalizePath(e.pathname),
            o = this.ensureIndexPath(r),
            a = this.ensureIndexPath(this.currentPath);
          return this.cumulativePaths.includes(r) || o === a;
        })
      : [];
  }
  clearPreviousMatches() {
    var t;
    (t = this.allLinks) == null ||
      t.forEach((e) => e.classList.remove("pl-path-match"));
  }
  highlightMatchingLinks(t) {
    ((this.currentPath = this.normalizePath(window.location.pathname)),
      (this.cumulativePaths = this.getCumulativePaths()),
      (this.allLinks = t.querySelectorAll("a")),
      this.clearPreviousMatches(),
      this.getMatchingLinks().forEach((r) => {
        r.classList.add("pl-path-match");
      }));
  }
}
class D {
  constructor() {
    l(this, "startAnimationTimeout", null);
  }
  startLoadingAnimation() {
    document.body.classList.contains(s.IsLoading) ||
      document.body.classList.contains(s.BeforeLoading) ||
      document.body.classList.contains(s.IsIndeterminate) ||
      (this.startAnimationTimeout &&
        (clearTimeout(this.startAnimationTimeout),
        (this.startAnimationTimeout = null)),
      document.body.classList.add(s.BeforeLoading),
      (this.startAnimationTimeout = setTimeout(() => {
        (h(W), this.triggerLoadingAnimation());
      }, 200)));
  }
  triggerLoadingAnimation() {
    (document.body.classList.add(s.IsLoading),
      document.body.classList.remove(s.BeforeLoading),
      (this.startAnimationTimeout = setTimeout(() => {
        document.body.classList.add(s.IsIndeterminate);
      }, 2e3)));
  }
  stopLoadingAnimation() {
    (this.startAnimationTimeout &&
      (clearTimeout(this.startAnimationTimeout),
      (this.startAnimationTimeout = null)),
      (document.body.classList.contains(s.IsLoading) ||
        document.body.classList.contains(s.IsIndeterminate)) &&
        (document.body.classList.add(s.AfterLoading),
        setTimeout(() => {
          document.body.classList.remove(s.AfterLoading);
        }, 500)),
      document.body.classList.remove(s.IsLoading),
      document.body.classList.remove(s.BeforeLoading),
      document.body.classList.remove(s.IsIndeterminate),
      h(K));
  }
}
const q = new O(),
  i = new X(),
  _ = new H(),
  Z = new k(q),
  j = new $(),
  f = new D();
async function J() {
  try {
    f.startLoadingAnimation();
    const n = i.getSlotsContents(document),
      t = x(document),
      e = t.shift();
    (e && (await B(e)),
      await Promise.all(t.map((r) => G(r))),
      i.replaceSlotContents(n),
      i.consolidateLayouts(),
      F(document),
      h(d.EVENTS.PAGE_LOADED));
  } catch (n) {
    (console.error("Error loading page:", n),
      h(d.EVENTS.PAGE_LOAD_ERROR, { error: n }));
  } finally {
    f.stopLoadingAnimation();
  }
}
async function U(n) {
  try {
    (f.startLoadingAnimation(), i.resetLayouts());
    const t = await P(n.toString()),
      e = i.getSlotsContents(t),
      r = x(t),
      o = r.shift();
    (o && (await B(o)),
      await Promise.all(r.map((a) => G(a))),
      await Q(async () => {
        (i.replaceSlotContents(e),
          i.consolidateLayouts(),
          F(document),
          h(d.EVENTS.PAGE_LOADED));
      }));
  } catch (t) {
    (console.error("Error loading fetched page:", t),
      h(d.EVENTS.PAGE_LOAD_ERROR, { error: t }));
  } finally {
    f.stopLoadingAnimation();
  }
}
async function P(n) {
  const t = await q.load(n);
  return M(t);
}
function x(n, t = !0) {
  const e = n.querySelectorAll(d.SELECTORS.LAYOUT_LINKS),
    r = Array.from(e)
      .map((o) => o.getAttribute("href") ?? "")
      .filter((o) => o.length > 0);
  return (r.length && t && e.forEach((o) => o.remove()), r);
}
function Q(n) {
  if (_.isNavigationAvailable()) {
    document.startViewTransition(n);
    return;
  }
  n();
}
function V(n) {
  return n.endsWith(".html") ? n : `${n.replace(/\/$/, "")}/index.html`;
}
async function B(n) {
  if (i.isAlreadyRendered(n)) {
    i.markAsRendered(n);
    return;
  }
  try {
    const t = await P(V(n));
    (i.render(document, n, t),
      i.mergeHeads(t, document),
      h(d.EVENTS.LAYOUT_RENDERED, { layoutUrl: n }));
  } catch (t) {
    throw (console.error(`Error rendering base layout ${n}:`, t), t);
  }
}
async function G(n) {
  if (i.isAlreadyRendered(n)) {
    i.markAsRendered(n);
    return;
  }
  try {
    const t = await P(V(n)),
      e = i.getSlotsContents(t);
    (i.markAsRendered(n),
      i.replaceSlotContents(e),
      i.mergeHeads(t, document),
      h(d.EVENTS.LAYOUT_RENDERED, { layoutUrl: n }));
  } catch (t) {
    throw (console.error(`Error rendering partial layout ${n}:`, t), t);
  }
}
function F(n) {
  (_.startInterception(n),
    _.onNavigate(U),
    Z.startPrefetch(n),
    j.highlightMatchingLinks(n));
}
let y, E, A, T, w;
function tt() {
  return (y || (y = new O()), y);
}
function v() {
  return (E || (E = new H()), E);
}
function et() {
  return (A || (A = new k(tt())), A);
}
function nt() {
  return (T || (T = new $()), T);
}
function N() {
  return (w || (w = new D()), w);
}
const rt = {
  interceptLinks(n) {
    (v().startInterception(n), v().onNavigate(U));
  },
  prefetchLinks(n) {
    et().startPrefetch(n);
  },
  highlightMatchingLinks(n) {
    nt().highlightMatchingLinks(n);
  },
  navigate(n) {
    v().navigate(n);
  },
  startLoading() {
    N().startLoadingAnimation();
  },
  stopLoading() {
    N().stopLoadingAnimation();
  },
};
window.addEventListener(
  "load",
  () => {
    J();
  },
  { once: !0 },
);
window.papel = rt;
