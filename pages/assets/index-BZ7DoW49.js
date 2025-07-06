var x = Object.defineProperty;
var z = (r, t, e) =>
  t in r
    ? x(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e })
    : (r[t] = e);
var l = (r, t, e) => z(r, typeof t != "symbol" ? t + "" : t, e);
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) o(n);
  new MutationObserver((n) => {
    for (const s of n)
      if (s.type === "childList")
        for (const i of s.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && o(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(n) {
    const s = {};
    return (
      n.integrity && (s.integrity = n.integrity),
      n.referrerPolicy && (s.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials"
        ? (s.credentials = "include")
        : n.crossOrigin === "anonymous"
        ? (s.credentials = "omit")
        : (s.credentials = "same-origin"),
      s
    );
  }
  function o(n) {
    if (n.ep) return;
    n.ep = !0;
    const s = e(n);
    fetch(n.href, s);
  }
})();
const w = "data-slot",
  g = "data-preserve",
  v = "data-intercepted",
  _ = "data-nointercepted",
  f = "data-prefetch",
  p = "data-prefetched",
  V = "loading-started",
  B = "loading-finished";
var L = ((r) => (
    (r.GET = "GET"),
    (r.POST = "POST"),
    (r.PUT = "PUT"),
    (r.PATCH = "PATCH"),
    (r.DELETE = "DELETE"),
    r
  ))(L || {}),
  b = ((r) => (
    (r.HTML = "text/html"),
    (r.JSON = "application/json"),
    (r.TEXT = "text/plain"),
    r
  ))(b || {}),
  c = ((r) => (
    (r.IsLoading = "is-loading"),
    (r.IsIndeterminate = "is-indeterminate"),
    (r.BeforeLoading = "before-loading"),
    (r.AfterLoading = "after-loading"),
    r
  ))(c || {});
function E(r, t) {
  t.replaceChildren(...Array.from(r.children).map((e) => e.cloneNode(!0)));
}
function R(r) {
  return r
    ? new DOMParser().parseFromString(r, "text/html")
    : document.implementation.createHTMLDocument();
}
function h(r, t) {
  document.dispatchEvent(new CustomEvent(r, t));
}
class C {
  constructor() {
    l(this, "config", {});
  }
  async load(t, e = L.GET, o, n) {
    if (!t) return console.error("URL is required to load HTML"), "";
    try {
      const s = await fetch(t, {
        method: e,
        headers: { "Content-Type": b.HTML },
        ...(o ? { body: JSON.stringify(o) } : {}),
        ...n,
      });
      if (!s.ok) throw new Error(`Failed to load ${t}: ${s.statusText}`);
      return await s.text();
    } catch (s) {
      return console.error("Error loading HTML: ", s), "";
    }
  }
  async loadHTMLDocument(t, e = L.GET, o, n) {
    const s = await this.load(t, e, o, n);
    return R(s);
  }
  async firstToMatch(t, e) {
    for (const o of t) {
      const n = await this.load(o);
      if (n && e(n)) return n;
    }
    return console.error("None of the urls could be loaded"), "";
  }
}
class G {
  constructor() {
    l(this, "currentLayouts", []);
    l(this, "loadedLayouts", []);
  }
  resetLayouts() {
    this.currentLayouts = [];
  }
  render(t, e, o) {
    const n = this._formatTag(e);
    if (!o) throw new Error("layout is required");
    this.currentLayouts.push(n),
      !this.isAlreadyRendered(n) &&
        (this.loadedLayouts.push(n),
        this._copyElementAttributes(o.body, t.body),
        this._replaceContent(o.body, t.body));
  }
  markAsRendered(t) {
    this.currentLayouts.push(this._formatTag(t));
  }
  replaceSlotContents(t) {
    document.querySelectorAll("slot").forEach((o) => {
      const n = o.getAttribute("name") || "default",
        s = t.find((i) => i.slot === n);
      s && o.innerHTML !== s.content.innerHTML && E(s.content, o);
    });
  }
  isAlreadyRendered(t) {
    return this.loadedLayouts.includes(t);
  }
  getSlotsContents(t) {
    const e = [];
    return (
      t.querySelectorAll(`slot, [slot], [${w}]`).forEach((n) => {
        const s = n.getAttribute("slot") || n.getAttribute(w) || "default";
        e.push({ slot: s, content: n });
      }),
      e
    );
  }
  _copyElementAttributes(t, e) {
    Array.from(t.attributes).forEach((o) => {
      e.setAttribute(o.name, o.value);
    });
  }
  mergeHeads(t, e) {
    const o = t.head,
      n = e.head;
    if (o.innerHTML) {
      if (o.innerHTML && !n.innerHTML) {
        E(o, n);
        return;
      }
      this._mergeElements(o, n);
    }
  }
  _mergeElements(t, e) {
    const o = e.innerHTML;
    Array.from(t.children).forEach((n) => {
      if (this._elementIspapelcript(n)) return;
      const s = n.outerHTML;
      o.includes(s) || e.appendChild(n);
    });
  }
  consolidateLayouts() {
    const t = new Set(this.currentLayouts),
      e = new Set(this.loadedLayouts);
    this.currentLayouts
      .filter((n) => !e.has(n))
      .forEach((n) => {
        const s = document.querySelector(`link[href$="${n}"]`);
        s == null || s.remove();
      }),
      (this.loadedLayouts = Array.from(t)),
      (this.currentLayouts = []);
  }
  _replaceContent(t, e) {
    const o = e.querySelectorAll(`[${g}]`),
      n = new Map();
    o.forEach((s, i) => {
      const d = s.getAttribute(g) ?? `preserve-${i}`;
      n.set(d, s);
    }),
      E(t, e),
      n.forEach((s, i) => {
        const d = e.querySelector(`[${g}="${i}"]`);
        d ? d.replaceWith(s) : e.insertBefore(s, e.firstChild);
      });
  }
  _elementIspapelcript(t) {
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
class N {
  constructor() {
    l(this, "navigationCallback");
    l(this, "scrollPositions");
    (this.navigationCallback = async () => {}),
      (this.scrollPositions = new Map()),
      window.addEventListener("popstate", (t) => {
        const e = new URL(location.href);
        this._handlePopState(e, t);
      });
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
    t.querySelectorAll(`a:not([${v}]):not([${_}]):not([target])`).forEach(
      (e) => {
        if (e instanceof HTMLAnchorElement) {
          if (!this._shouldIntercept(new URL(e.href))) {
            e.setAttribute(_, "true");
            return;
          }
          e.setAttribute(v, "true"),
            e.addEventListener("click", (o) =>
              this._handleLinkClick.bind(this)(o, e)
            );
        }
      }
    );
  }
  async _handleLinkClick(t, e) {
    t.preventDefault(), this.navigate(e.href);
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
    await this.navigationCallback(t), this._restoreScrollPosition(t);
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
class I {
  constructor(t) {
    l(this, "loadedUrls", []);
    this.htmlLoader = t;
  }
  startPrefetch(t) {
    this._addObserverToLinks(t, async (e) => {
      const o = e.getAttribute(f);
      if (o !== "all") {
        this._prefetchRequest(e.href);
        return;
      }
      if (o === "all") {
        const n = await this._prefetchRequest(e.href),
          i = new DOMParser().parseFromString(n, "text/html");
        this.imagePrefetch(i), this.templateImagePrefetch(i);
      }
    });
  }
  imagePrefetch(t) {
    t.querySelectorAll(`img[${f}]`).forEach((o) => {
      this._prefetchRequest(o.src), this.loadedUrls.push(o.src);
    });
  }
  templateImagePrefetch(t) {
    t.querySelectorAll("template").forEach((o) => {
      this.imagePrefetch(o.content);
    });
  }
  _addObserverToLinks(t, e) {
    const o = this._getIntersectionObserver(e);
    t.querySelectorAll(`a[${f}]:not([${f}="none"]):not([${p}])`).forEach(
      (s) => {
        if (this._isLocalLink(s)) {
          if (this._isAlreadyPrefetched(s)) {
            s.setAttribute(p, "true");
            return;
          }
          o.observe(s);
        }
      }
    );
  }
  _getIntersectionObserver(t) {
    return new IntersectionObserver((e) => {
      e.forEach((o) => {
        if (o.isIntersecting) {
          const n = o.target;
          if ((n.setAttribute(p, "true"), this._isAlreadyPrefetched(n))) return;
          t(n), this.loadedUrls.push(n.href);
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
    return this.htmlLoader.load(t, L.GET, void 0, { priority: "low" });
  }
}
class M {
  constructor() {
    l(this, "currentPath");
    l(this, "cumulativePaths");
    l(this, "allLinks");
    (this.currentPath = this.normalizePath(window.location.pathname)),
      (this.cumulativePaths = this.getCumulativePaths()),
      (this.allLinks = document.querySelectorAll("a"));
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
      .reduce((e, o) => {
        const n = e.length > 0 ? e[e.length - 1] : "";
        return e.push(`${n}/${o}`), e;
      }, []);
  }
  getMatchingLinks() {
    return this.allLinks
      ? Array.from(this.allLinks).filter((t) => {
          const e = this.normalizePath(
              new URL(t.href, window.location.origin).pathname
            ),
            o = this.ensureIndexPath(e),
            n = this.ensureIndexPath(this.currentPath);
          return this.cumulativePaths.includes(e) || o === n;
        })
      : [];
  }
  clearPreviousMatches() {
    var t;
    (t = this.allLinks) == null ||
      t.forEach((e) => e.classList.remove("pl-path-match"));
  }
  highlightMatchingLinks(t) {
    (this.currentPath = this.normalizePath(window.location.pathname)),
      (this.cumulativePaths = this.getCumulativePaths()),
      (this.allLinks = t.querySelectorAll("a")),
      this.clearPreviousMatches(),
      this.getMatchingLinks().forEach((o) => {
        o.classList.add("pl-path-match");
      });
  }
}
class O {
  constructor() {
    l(this, "startAnimationTimeout", null);
  }
  startLoadingAnimation() {
    document.body.classList.contains(c.IsLoading) ||
      document.body.classList.contains(c.BeforeLoading) ||
      document.body.classList.contains(c.IsIndeterminate) ||
      (this.startAnimationTimeout &&
        (clearTimeout(this.startAnimationTimeout),
        (this.startAnimationTimeout = null)),
      document.body.classList.add(c.BeforeLoading),
      (this.startAnimationTimeout = setTimeout(() => {
        h(V), this.triggerLoadingAnimation();
      }, 200)));
  }
  triggerLoadingAnimation() {
    document.body.classList.add(c.IsLoading),
      document.body.classList.remove(c.BeforeLoading),
      (this.startAnimationTimeout = setTimeout(() => {
        document.body.classList.add(c.IsIndeterminate);
      }, 2e3));
  }
  stopLoadingAnimation() {
    this.startAnimationTimeout &&
      (clearTimeout(this.startAnimationTimeout),
      (this.startAnimationTimeout = null)),
      (document.body.classList.contains(c.IsLoading) ||
        document.body.classList.contains(c.IsIndeterminate)) &&
        (document.body.classList.add(c.AfterLoading),
        setTimeout(() => {
          document.body.classList.remove(c.AfterLoading);
        }, 500)),
      document.body.classList.remove(c.IsLoading),
      document.body.classList.remove(c.BeforeLoading),
      document.body.classList.remove(c.IsIndeterminate),
      h(B);
  }
}
const u = {
  REQUEST_TIMEOUT: 1e4,
  CACHE_MAX_SIZE: 50,
  EVENTS: {
    PAGE_LOADED: "page-loaded",
    PAGE_LOAD_ERROR: "page-load-error",
    LAYOUT_RENDERED: "layout-rendered",
    CACHE_CLEARED: "cache-cleared",
  },
  SELECTORS: {
    LAYOUT_LINKS: "link[data-layout]",
    SLOTS: "slot, [slot], [data-slot]",
    PRESERVE_ELEMENTS: "[data-preserve]",
  },
  PREFETCH: { ENABLED: !0, DELAY: 100, MAX_CONCURRENT: 3 },
  VIEW_TRANSITIONS: { ENABLED: !0, FALLBACK_DURATION: 300 },
};
class F {
  constructor(t = u.CACHE_MAX_SIZE) {
    l(this, "cache", new Map());
    l(this, "maxSize");
    this.maxSize = t;
  }
  get(t) {
    const e = this.cache.get(t);
    return e
      ? (e.accessCount++,
        (e.timestamp = Date.now()),
        this.cache.delete(t),
        this.cache.set(t, e),
        e.document.cloneNode(!0))
      : null;
  }
  set(t, e) {
    this.cache.size >= this.maxSize && this.evictLRU();
    const o = {
      document: e.cloneNode(!0),
      timestamp: Date.now(),
      accessCount: 1,
    };
    this.cache.set(t, o);
  }
  has(t) {
    return this.cache.has(t);
  }
  delete(t) {
    return this.cache.delete(t);
  }
  clear() {
    this.cache.clear();
  }
  getStats() {
    const t = Array.from(this.cache.keys()),
      e = Array.from(this.cache.values()),
      o =
        e.length > 0
          ? t[e.reduce((s, i, d) => (i.timestamp < e[s].timestamp ? d : s), 0)]
          : null,
      n =
        e.length > 0
          ? t[
              e.reduce(
                (s, i, d) => (i.accessCount > e[s].accessCount ? d : s),
                0
              )
            ]
          : null;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0,
      keys: t,
      oldestEntry: o,
      mostAccessed: n,
    };
  }
  evictLRU() {
    if (this.cache.size === 0) return;
    let t = null,
      e = Date.now();
    for (const [o, n] of this.cache.entries())
      n.timestamp < e && ((e = n.timestamp), (t = o));
    t && this.cache.delete(t);
  }
  async prewarm(t, e) {
    const o = t.map(async (n) => {
      if (!this.has(n))
        try {
          const s = await e(n);
          this.set(n, s);
        } catch (s) {
          console.warn(`Failed to prewarm cache for ${n}:`, s);
        }
    });
    await Promise.all(o);
  }
  cleanup(t = 5 * 60 * 1e3) {
    const e = Date.now();
    for (const [o, n] of this.cache.entries())
      e - n.timestamp > t && this.cache.delete(o);
  }
}
const T = new C(),
  a = new G(),
  A = new N(),
  Y = new I(T),
  K = new M(),
  m = new O(),
  P = new F();
async function X() {
  try {
    m.startLoadingAnimation();
    const r = a.getSlotsContents(document),
      t = H(document),
      e = t.shift();
    e && (await $(e)),
      await Promise.all(t.map((o) => U(o))),
      a.replaceSlotContents(r),
      m.stopLoadingAnimation(),
      a.consolidateLayouts(),
      q(document),
      h(u.EVENTS.PAGE_LOADED);
  } catch (r) {
    console.error("Error loading page:", r),
      m.stopLoadingAnimation(),
      h(u.EVENTS.PAGE_LOAD_ERROR, { error: r });
  }
}
async function D(r) {
  try {
    m.startLoadingAnimation(), a.resetLayouts();
    const t = await k(r.toString()),
      e = a.getSlotsContents(t),
      o = H(t),
      n = o.shift();
    await W(async () => {
      n && (await $(n)),
        await Promise.all(o.map((s) => U(s))),
        a.replaceSlotContents(e),
        m.stopLoadingAnimation(),
        a.consolidateLayouts(),
        q(document),
        h(u.EVENTS.PAGE_LOADED);
    });
  } catch (t) {
    console.error("Error loading fetched page:", t),
      m.stopLoadingAnimation(),
      h(u.EVENTS.PAGE_LOAD_ERROR, { error: t });
  }
}
async function k(r) {
  const t = P.get(r);
  if (t) return t;
  const e = await T.load(r),
    o = R(e);
  return P.set(r, o), o;
}
function H(r, t = !0) {
  const e = r.querySelectorAll(u.SELECTORS.LAYOUT_LINKS),
    o = Array.from(e)
      .map((n) => n.getAttribute("href") ?? "")
      .filter((n) => n.length > 0);
  return o.length && t && e.forEach((n) => n.remove()), o;
}
function W(r) {
  if (A.isNavigationAvailable()) {
    document.startViewTransition(r);
    return;
  }
  r();
}
async function $(r) {
  if (a.isAlreadyRendered(r)) {
    a.markAsRendered(r);
    return;
  }
  try {
    const t = await T.loadHTMLDocument(r);
    a.render(document, r, t),
      a.mergeHeads(t, document),
      h(u.EVENTS.LAYOUT_RENDERED, { layoutUrl: r });
  } catch (t) {
    throw (console.error(`Error rendering base layout ${r}:`, t), t);
  }
}
async function U(r) {
  if (a.isAlreadyRendered(r)) {
    a.markAsRendered(r);
    return;
  }
  try {
    const t = await k(r),
      e = a.getSlotsContents(t);
    a.markAsRendered(r),
      a.replaceSlotContents(e),
      a.mergeHeads(t, document),
      h(u.EVENTS.LAYOUT_RENDERED, { layoutUrl: r });
  } catch (t) {
    throw (console.error(`Error rendering partial layout ${r}:`, t), t);
  }
}
function q(r) {
  A.startInterception(r),
    A.onNavigate(D),
    Y.startPrefetch(r),
    K.highlightMatchingLinks(r);
}
const Z = new C(),
  y = new N(),
  J = new I(Z),
  j = new M(),
  S = new O(),
  Q = {
    interceptLinks(r) {
      y.startInterception(r), y.onNavigate(D);
    },
    prefetchLinks(r) {
      J.startPrefetch(r);
    },
    highlightMatchingLinks(r) {
      j.highlightMatchingLinks(r);
    },
    navigate(r) {
      y.navigate(r);
    },
    startLoading() {
      S.startLoadingAnimation();
    },
    stopLoading() {
      S.stopLoadingAnimation();
    },
  };
window.addEventListener(
  "load",
  () => {
    X();
  },
  { once: !0 }
);
window.papel = Q;
