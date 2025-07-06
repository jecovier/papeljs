var F = Object.defineProperty;
var Y = (n, t, e) =>
  t in n
    ? F(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e })
    : (n[t] = e);
var l = (n, t, e) => Y(n, typeof t != "symbol" ? t + "" : t, e);
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) o(r);
  new MutationObserver((r) => {
    for (const i of r)
      if (i.type === "childList")
        for (const a of i.addedNodes)
          a.tagName === "LINK" && a.rel === "modulepreload" && o(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(r) {
    const i = {};
    return (
      r.integrity && (i.integrity = r.integrity),
      r.referrerPolicy && (i.referrerPolicy = r.referrerPolicy),
      r.crossOrigin === "use-credentials"
        ? (i.credentials = "include")
        : r.crossOrigin === "anonymous"
        ? (i.credentials = "omit")
        : (i.credentials = "same-origin"),
      i
    );
  }
  function o(r) {
    if (r.ep) return;
    r.ep = !0;
    const i = e(r);
    fetch(r.href, i);
  }
})();
const N = "data-slot",
  L = "data-preserve",
  b = "data-intercepted",
  R = "data-nointercepted",
  f = "data-prefetch",
  p = "data-prefetched",
  K = "loading-started",
  X = "loading-finished";
var g = ((n) => (
    (n.GET = "GET"),
    (n.POST = "POST"),
    (n.PUT = "PUT"),
    (n.PATCH = "PATCH"),
    (n.DELETE = "DELETE"),
    n
  ))(g || {}),
  M = ((n) => (
    (n.HTML = "text/html"),
    (n.JSON = "application/json"),
    (n.TEXT = "text/plain"),
    n
  ))(M || {}),
  c = ((n) => (
    (n.IsLoading = "is-loading"),
    (n.IsIndeterminate = "is-indeterminate"),
    (n.BeforeLoading = "before-loading"),
    (n.AfterLoading = "after-loading"),
    n
  ))(c || {});
function E(n, t) {
  t.replaceChildren(...Array.from(n.children).map((e) => e.cloneNode(!0)));
}
function O(n) {
  return n
    ? new DOMParser().parseFromString(n, "text/html")
    : document.implementation.createHTMLDocument();
}
function u(n, t) {
  document.dispatchEvent(new CustomEvent(n, t));
}
class D {
  constructor() {
    l(this, "config", {});
  }
  async load(t, e = g.GET, o, r) {
    if (!t) return console.error("URL is required to load HTML"), "";
    try {
      const { headers: i, ...a } = r || {},
        d = await fetch(t, {
          method: e,
          headers: { "Content-Type": M.HTML, ...i },
          ...(o ? { body: JSON.stringify(o) } : {}),
          ...a,
        });
      if (!d.ok) throw new Error(`Failed to load ${t}: ${d.statusText}`);
      return await d.text();
    } catch (i) {
      return console.error("Error loading HTML: ", i), "";
    }
  }
  async loadHTMLDocument(t, e = g.GET, o, r) {
    const i = await this.load(t, e, o, r);
    return O(i);
  }
  async firstToMatch(t, e) {
    for (const o of t) {
      const r = await this.load(o);
      if (r && e(r)) return r;
    }
    return console.error("None of the urls could be loaded"), "";
  }
}
class W {
  constructor() {
    l(this, "currentLayouts", []);
    l(this, "loadedLayouts", []);
  }
  resetLayouts() {
    this.currentLayouts = [];
  }
  render(t, e, o) {
    const r = this._formatTag(e);
    if (!o) throw new Error("layout is required");
    this.currentLayouts.push(r),
      !this.isAlreadyRendered(r) &&
        (this.loadedLayouts.push(r),
        this._copyElementAttributes(o.body, t.body),
        this._replaceContent(o.body, t.body));
  }
  markAsRendered(t) {
    this.currentLayouts.push(this._formatTag(t));
  }
  replaceSlotContents(t) {
    document.querySelectorAll("slot").forEach((o) => {
      const r = o.getAttribute("name") || "default",
        i = t.find((a) => a.slot === r);
      i && o.innerHTML !== i.content.innerHTML && E(i.content, o);
    });
  }
  isAlreadyRendered(t) {
    return this.loadedLayouts.includes(t);
  }
  getSlotsContents(t) {
    const e = [];
    return (
      t.querySelectorAll(`slot, [slot], [${N}]`).forEach((r) => {
        const i = r.getAttribute("slot") || r.getAttribute(N) || "default";
        e.push({ slot: i, content: r });
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
      r = e.head;
    if (o.innerHTML) {
      if (o.innerHTML && !r.innerHTML) {
        E(o, r);
        return;
      }
      this._mergeElements(o, r);
    }
  }
  _mergeElements(t, e) {
    const o = e.innerHTML;
    Array.from(t.children).forEach((r) => {
      if (this._elementIsPapelScript(r)) return;
      const i = r.outerHTML;
      o.includes(i) || e.appendChild(r);
    });
  }
  consolidateLayouts() {
    const t = new Set(this.currentLayouts),
      e = new Set(this.loadedLayouts);
    this.currentLayouts
      .filter((r) => !e.has(r))
      .forEach((r) => {
        const i = document.querySelector(`link[href$="${r}"]`);
        i == null || i.remove();
      }),
      (this.loadedLayouts = Array.from(t)),
      (this.currentLayouts = []);
  }
  _replaceContent(t, e) {
    const o = e.querySelectorAll(`[${L}]`),
      r = new Map();
    o.forEach((i, a) => {
      const d = i.getAttribute(L) ?? `preserve-${a}`;
      r.set(d, i);
    }),
      E(t, e),
      r.forEach((i, a) => {
        const d = e.querySelector(`[${L}="${a}"]`);
        d ? d.replaceWith(i) : e.insertBefore(i, e.firstChild);
      });
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
class k {
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
    t.querySelectorAll(`a:not([${b}]):not([${R}]):not([target])`).forEach(
      (e) => {
        if (e instanceof HTMLAnchorElement) {
          if (!this._shouldIntercept(new URL(e.href))) {
            e.setAttribute(R, "true");
            return;
          }
          e.setAttribute(b, "true"),
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
class H {
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
        const r = await this._prefetchRequest(e.href),
          a = new DOMParser().parseFromString(r, "text/html");
        this.imagePrefetch(a), this.templateImagePrefetch(a);
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
      (i) => {
        if (this._isLocalLink(i)) {
          if (this._isAlreadyPrefetched(i)) {
            i.setAttribute(p, "true");
            return;
          }
          o.observe(i);
        }
      }
    );
  }
  _getIntersectionObserver(t) {
    return new IntersectionObserver((e) => {
      e.forEach((o) => {
        if (o.isIntersecting) {
          const r = o.target;
          if ((r.setAttribute(p, "true"), this._isAlreadyPrefetched(r))) return;
          t(r), this.loadedUrls.push(r.href);
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
    return this.htmlLoader.load(t, g.GET, void 0, { priority: "low" });
  }
}
class $ {
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
        const r = e.length > 0 ? e[e.length - 1] : "";
        return e.push(`${r}/${o}`), e;
      }, []);
  }
  getMatchingLinks() {
    return this.allLinks
      ? Array.from(this.allLinks).filter((t) => {
          const e = new URL(t.href, window.location.origin);
          if (e.origin !== window.location.origin) return !1;
          const o = this.normalizePath(e.pathname),
            r = this.ensureIndexPath(o),
            i = this.ensureIndexPath(this.currentPath);
          return this.cumulativePaths.includes(o) || r === i;
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
class U {
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
        u(K), this.triggerLoadingAnimation();
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
      u(X);
  }
}
const h = {
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
class Z {
  constructor(t = h.CACHE_MAX_SIZE) {
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
          ? t[e.reduce((i, a, d) => (a.timestamp < e[i].timestamp ? d : i), 0)]
          : null,
      r =
        e.length > 0
          ? t[
              e.reduce(
                (i, a, d) => (a.accessCount > e[i].accessCount ? d : i),
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
      mostAccessed: r,
    };
  }
  evictLRU() {
    if (this.cache.size === 0) return;
    let t = null,
      e = Date.now();
    for (const [o, r] of this.cache.entries())
      r.timestamp < e && ((e = r.timestamp), (t = o));
    t && this.cache.delete(t);
  }
  async prewarm(t, e) {
    const o = t.map(async (r) => {
      if (!this.has(r))
        try {
          const i = await e(r);
          this.set(r, i);
        } catch (i) {
          console.warn(`Failed to prewarm cache for ${r}:`, i);
        }
    });
    await Promise.all(o);
  }
  cleanup(t = 5 * 60 * 1e3) {
    const e = Date.now();
    for (const [o, r] of this.cache.entries())
      e - r.timestamp > t && this.cache.delete(o);
  }
}
const S = new D(),
  s = new W(),
  _ = new k(),
  J = new H(S),
  j = new $(),
  m = new U(),
  C = new Z();
async function Q() {
  try {
    m.startLoadingAnimation();
    const n = s.getSlotsContents(document),
      t = z(document),
      e = t.shift();
    e && (await V(e)),
      await Promise.all(t.map((o) => B(o))),
      s.replaceSlotContents(n),
      m.stopLoadingAnimation(),
      s.consolidateLayouts(),
      G(document),
      u(h.EVENTS.PAGE_LOADED);
  } catch (n) {
    console.error("Error loading page:", n),
      m.stopLoadingAnimation(),
      u(h.EVENTS.PAGE_LOAD_ERROR, { error: n });
  }
}
async function q(n) {
  try {
    m.startLoadingAnimation(), s.resetLayouts();
    const t = await x(n.toString()),
      e = s.getSlotsContents(t),
      o = z(t),
      r = o.shift();
    await tt(async () => {
      r && (await V(r)),
        await Promise.all(o.map((i) => B(i))),
        s.replaceSlotContents(e),
        m.stopLoadingAnimation(),
        s.consolidateLayouts(),
        G(document),
        u(h.EVENTS.PAGE_LOADED);
    });
  } catch (t) {
    console.error("Error loading fetched page:", t),
      m.stopLoadingAnimation(),
      u(h.EVENTS.PAGE_LOAD_ERROR, { error: t });
  }
}
async function x(n) {
  const t = C.get(n);
  if (t) return t;
  const e = await S.load(n),
    o = O(e);
  return C.set(n, o), o;
}
function z(n, t = !0) {
  const e = n.querySelectorAll(h.SELECTORS.LAYOUT_LINKS),
    o = Array.from(e)
      .map((r) => r.getAttribute("href") ?? "")
      .filter((r) => r.length > 0);
  return o.length && t && e.forEach((r) => r.remove()), o;
}
function tt(n) {
  if (_.isNavigationAvailable()) {
    document.startViewTransition(n);
    return;
  }
  n();
}
async function V(n) {
  if (s.isAlreadyRendered(n)) {
    s.markAsRendered(n);
    return;
  }
  try {
    const t = await S.loadHTMLDocument(n);
    s.render(document, n, t),
      s.mergeHeads(t, document),
      u(h.EVENTS.LAYOUT_RENDERED, { layoutUrl: n });
  } catch (t) {
    throw (console.error(`Error rendering base layout ${n}:`, t), t);
  }
}
async function B(n) {
  if (s.isAlreadyRendered(n)) {
    s.markAsRendered(n);
    return;
  }
  try {
    const t = await x(n),
      e = s.getSlotsContents(t);
    s.markAsRendered(n),
      s.replaceSlotContents(e),
      s.mergeHeads(t, document),
      u(h.EVENTS.LAYOUT_RENDERED, { layoutUrl: n });
  } catch (t) {
    throw (console.error(`Error rendering partial layout ${n}:`, t), t);
  }
}
function G(n) {
  _.startInterception(n),
    _.onNavigate(q),
    J.startPrefetch(n),
    j.highlightMatchingLinks(n);
}
function et() {
  return new D();
}
function nt() {
  return new k();
}
function rt(n) {
  return new H(n);
}
function ot() {
  return new $();
}
function it() {
  return new U();
}
let y, A, T, w, v;
function at() {
  return y || (y = et()), y;
}
function P() {
  return A || (A = nt()), A;
}
function st() {
  return T || (T = rt(at())), T;
}
function ct() {
  return w || (w = ot()), w;
}
function I() {
  return v || (v = it()), v;
}
const lt = {
  interceptLinks(n) {
    P().startInterception(n), P().onNavigate(q);
  },
  prefetchLinks(n) {
    st().startPrefetch(n);
  },
  highlightMatchingLinks(n) {
    ct().highlightMatchingLinks(n);
  },
  navigate(n) {
    P().navigate(n);
  },
  startLoading() {
    I().startLoadingAnimation();
  },
  stopLoading() {
    I().stopLoadingAnimation();
  },
};
window.addEventListener(
  "load",
  () => {
    Q();
  },
  { once: !0 }
);
window.papel = lt;
