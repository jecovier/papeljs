var t = Object.defineProperty,
  e = (e, n, i) =>
    ((e, n, i) =>
      n in e
        ? t(e, n, { enumerable: !0, configurable: !0, writable: !0, value: i })
        : (e[n] = i))(e, "symbol" != typeof n ? n + "" : n, i);
!(function () {
  const t = document.createElement("link").relList;
  if (!(t && t.supports && t.supports("modulepreload"))) {
    for (const t of document.querySelectorAll('link[rel="modulepreload"]'))
      e(t);
    new MutationObserver((t) => {
      for (const n of t)
        if ("childList" === n.type)
          for (const t of n.addedNodes)
            "LINK" === t.tagName && "modulepreload" === t.rel && e(t);
    }).observe(document, { childList: !0, subtree: !0 });
  }
  function e(t) {
    if (t.ep) return;
    t.ep = !0;
    const e = (function (t) {
      const e = {};
      return (
        t.integrity && (e.integrity = t.integrity),
        t.referrerPolicy && (e.referrerPolicy = t.referrerPolicy),
        "use-credentials" === t.crossOrigin
          ? (e.credentials = "include")
          : "anonymous" === t.crossOrigin
            ? (e.credentials = "omit")
            : (e.credentials = "same-origin"),
        e
      );
    })(t);
    fetch(t.href, e);
  }
})();
const n = "data-slot",
  i = "data-preserve",
  o = "data-intercepted",
  a = "data-nointercepted",
  r = "data-prefetch",
  s = "data-prefetched";
var c = ((t) => ((t.GET = "GET"), (t.POST = "POST"), t))(c || {}),
  l = ((t) => ((t.HTML = "text/html"), t))(l || {}),
  d = ((t) => (
    (t.IsLoading = "is-loading"),
    (t.IsIndeterminate = "is-indeterminate"),
    (t.BeforeLoading = "before-loading"),
    (t.AfterLoading = "after-loading"),
    t
  ))(d || {});
function h(t, e) {
  e.replaceChildren(...Array.from(t.children).map((t) => t.cloneNode(!0)));
}
function u(t) {
  if (!t) return document.implementation.createHTMLDocument();
  return new DOMParser().parseFromString(t, "text/html");
}
function m(t, e) {
  document.dispatchEvent(new CustomEvent(t, e));
}
const f = "/_error.html",
  g = "papel-fetch",
  L = {
    PAGE_LOADED: "page-loaded",
    PAGE_LOAD_ERROR: "page-load-error",
    LAYOUT_RENDERED: "layout-rendered",
  },
  y = {
    LAYOUT_LINKS: "link[data-layout], link[rel='layout']",
    SLOTS: "slot, [slot], [data-slot]",
  };
class p {
  constructor() {
    e(this, "config", {});
  }
  async load(t) {
    if (!t) throw new Error("URL is required to load HTML");
    const e = await this.getCache();
    if (e) {
      const n = await e.match(t);
      if (n) return await n.text();
    }
    try {
      const n = await this.fetchHtml(t);
      return (e && (await e.put(t, n.clone())), await n.text());
    } catch (n) {
      throw new Error(`Failed to load ${t}`);
    }
  }
  async getCache() {
    try {
      return await caches.open(g);
    } catch (t) {
      return null;
    }
  }
  async fetchHtml(t, e) {
    const n = await fetch(t, {
      method: c.GET,
      headers: { "Content-Type": l.HTML },
      ...e,
    });
    if (!n.ok) throw new Error(`Failed to load ${t}: ${n.statusText}`);
    return n;
  }
  async loadHTMLDocument(t) {
    return u(await this.load(t));
  }
  async firstToMatch(t, e) {
    for (const i of t)
      try {
        const t = await this.load(i);
        if (t && e(t)) return t;
      } catch (n) {}
    return "";
  }
  async clearCache() {
    const t = await this.getCache();
    if (t) for (const e of await t.keys()) await t.delete(e);
  }
}
class w {
  constructor() {
    (e(this, "navigationCallback"),
      e(this, "scrollPositions"),
      (this.navigationCallback = async () => {}),
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
    return "navigation" in window && void 0 !== window.navigation;
  }
  _isLocalUrl(t) {
    return t.origin === location.origin;
  }
  _shouldIntercept(t) {
    return this._isLocalUrl(t) && !!this.navigationCallback;
  }
  _interceptLinks(t) {
    t.querySelectorAll(
      `a:not([${o}]):not([${a}]):not([target]):not([href^="${location.origin}"]):not([download])`,
    ).forEach((t) => {
      t instanceof HTMLAnchorElement &&
        (this._shouldIntercept(new URL(t.href))
          ? (t.setAttribute(o, "true"),
            t.addEventListener("click", (e) =>
              this._handleLinkClick.bind(this)(e, t),
            ))
          : t.setAttribute(a, "true"));
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
    this._shouldIntercept(t) &&
      (e.preventDefault(),
      this.isNavigationAvailable()
        ? document.startViewTransition(() => this._handleNavigation(t))
        : this._handleNavigation(t));
  }
  _restoreScrollPosition(t) {
    window.scrollTo(0, 0);
  }
}
class A {
  constructor(t) {
    (e(this, "loadedUrls", []), (this.htmlLoader = t));
  }
  startPrefetch(t) {
    this._addObserverToLinks(t, async (t) => {
      await this._prefetchRequest(t.href);
    });
  }
  _addObserverToLinks(t, e) {
    const n = this._getIntersectionObserver(e);
    t.querySelectorAll(
      `a[${r}]:not([${r}="none"]):not([${s}]):not([target]):not([href^="${location.origin}"]):not([download]), link[${r}]:not([${r}="none"]):not([${s}]):not([href^="${location.origin}"])`,
    ).forEach((t) => {
      this._isLocalLink(new URL(t.href)) &&
        (this._isAlreadyPrefetched(t)
          ? t.setAttribute(s, "true")
          : n.observe(t));
    });
  }
  _getIntersectionObserver(t) {
    return new IntersectionObserver((e) => {
      e.forEach((e) => {
        if (e.isIntersecting) {
          const n = e.target;
          if ((n.setAttribute(s, "true"), this._isAlreadyPrefetched(n))) return;
          (t(n), this.loadedUrls.push(n.href));
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
class v {
  constructor() {
    (e(this, "currentPath"),
      e(this, "cumulativePaths"),
      e(this, "allLinks"),
      (this.currentPath = this.normalizePath(window.location.pathname)),
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
      .filter((t) => "" !== t)
      .reduce((t, e) => {
        const n = t.length > 0 ? t[t.length - 1] : "";
        return (t.push(`${n}/${e}`), t);
      }, []);
  }
  getMatchingLinks() {
    return this.allLinks
      ? Array.from(this.allLinks).filter((t) => {
          const e = new URL(t.href, window.location.origin);
          if (e.origin !== window.location.origin) return !1;
          const n = this.normalizePath(e.pathname),
            i = this.ensureIndexPath(n),
            o = this.ensureIndexPath(this.currentPath);
          return this.cumulativePaths.includes(n) || i === o;
        })
      : [];
  }
  clearPreviousMatches() {
    var t;
    null == (t = this.allLinks) ||
      t.forEach((t) => t.classList.remove("pl-path-match"));
  }
  highlightMatchingLinks(t) {
    ((this.currentPath = this.normalizePath(window.location.pathname)),
      (this.cumulativePaths = this.getCumulativePaths()),
      (this.allLinks = t.querySelectorAll("a")),
      this.clearPreviousMatches());
    this.getMatchingLinks().forEach((t) => {
      t.classList.add("pl-path-match");
    });
  }
}
class E {
  constructor() {
    e(this, "startAnimationTimeout", null);
  }
  startLoadingAnimation() {
    document.body.classList.contains(d.IsLoading) ||
      document.body.classList.contains(d.BeforeLoading) ||
      document.body.classList.contains(d.IsIndeterminate) ||
      (this.startAnimationTimeout &&
        (clearTimeout(this.startAnimationTimeout),
        (this.startAnimationTimeout = null)),
      document.body.classList.add(d.BeforeLoading),
      (this.startAnimationTimeout = setTimeout(() => {
        (m("loading-started"), this.triggerLoadingAnimation());
      }, 200)));
  }
  triggerLoadingAnimation() {
    (document.body.classList.add(d.IsLoading),
      document.body.classList.remove(d.BeforeLoading),
      (this.startAnimationTimeout = setTimeout(() => {
        document.body.classList.add(d.IsIndeterminate);
      }, 2e3)));
  }
  stopLoadingAnimation() {
    (this.startAnimationTimeout &&
      (clearTimeout(this.startAnimationTimeout),
      (this.startAnimationTimeout = null)),
      (document.body.classList.contains(d.IsLoading) ||
        document.body.classList.contains(d.IsIndeterminate)) &&
        (document.body.classList.add(d.AfterLoading),
        setTimeout(() => {
          document.body.classList.remove(d.AfterLoading);
        }, 500)),
      document.body.classList.remove(d.IsLoading),
      document.body.classList.remove(d.BeforeLoading),
      document.body.classList.remove(d.IsIndeterminate),
      m("loading-finished"));
  }
}
const _ = new p(),
  b = new (class {
    constructor() {
      (e(this, "currentLayouts", []), e(this, "loadedLayouts", []));
    }
    resetLayouts() {
      ((this.currentLayouts = []), (this.loadedLayouts = []));
    }
    render(t, e, n) {
      const i = this._formatTag(e);
      if (!n) throw new Error("layout is required");
      (this.currentLayouts.push(i),
        this.isAlreadyRendered(i) ||
          (this.loadedLayouts.push(i),
          this._copyElementAttributes(n.body, t.body),
          this._replaceContent(n.body, t.body)));
    }
    markAsRendered(t) {
      this.currentLayouts.push(this._formatTag(t));
    }
    replaceSlotContents(t) {
      document.querySelectorAll("slot").forEach((e) => {
        const n = e.getAttribute("name") || "default",
          i = t.find((t) => t.slot === n);
        i && e.innerHTML !== i.content.innerHTML && h(i.content, e);
      });
    }
    isAlreadyRendered(t) {
      return this.loadedLayouts.includes(t);
    }
    getSlotsContents(t) {
      const e = [];
      return (
        t.querySelectorAll(`slot, [slot], [${n}]`).forEach((t) => {
          const i = t.getAttribute("slot") || t.getAttribute(n) || "default";
          e.push({ slot: i, content: t });
        }),
        e
      );
    }
    _copyElementAttributes(t, e) {
      Array.from(t.attributes).forEach((t) => {
        e.setAttribute(t.name, t.value);
      });
    }
    mergeHeads(t, e) {
      const n = t.head,
        i = e.head;
      n.innerHTML &&
        (!n.innerHTML || i.innerHTML ? this._mergeElements(n, i) : h(n, i));
    }
    _mergeElements(t, e) {
      const n = e.innerHTML;
      Array.from(t.children).forEach((t) => {
        if (this._elementIsPapelScript(t)) return;
        const i = t.outerHTML;
        n.includes(i) || e.appendChild(t);
      });
    }
    consolidateLayouts() {
      const t = new Set(this.currentLayouts),
        e = new Set(this.loadedLayouts);
      (this.currentLayouts
        .filter((t) => !e.has(t))
        .forEach((t) => {
          const e = document.querySelector(`link[href$="${t}"]`);
          null == e || e.remove();
        }),
        (this.loadedLayouts = Array.from(t)),
        (this.currentLayouts = []));
    }
    _replaceContent(t, e) {
      const n = e.querySelectorAll(`[${i}]`),
        o = new Map();
      (n.forEach((t, e) => {
        const n = t.getAttribute(i) ?? `preserve-${e}`;
        o.set(n, t);
      }),
        h(t, e),
        o.forEach((t, n) => {
          const o = e.querySelector(`[${i}="${n}"]`);
          o ? o.replaceWith(t) : e.insertBefore(t, e.firstChild);
        }));
    }
    _elementIsPapelScript(t) {
      var e;
      return (
        "SCRIPT" === t.tagName &&
        !!(null == (e = t.getAttribute("src")) ? void 0 : e.includes("papel"))
      );
    }
    _formatTag(t) {
      return t.endsWith(".html") ? t : `${t.replace(/\/$/, "")}/index.html`;
    }
  })(),
  T = new w(),
  P = new A(_),
  k = new v(),
  S = new E();
async function I(t) {
  try {
    (S.startLoadingAnimation(), b.resetLayouts());
    const e = await C(t.toString()),
      n = b.getSlotsContents(e),
      i = R(e),
      o = i.shift(),
      a = [];
    (o && a.push(C(O(o))),
      i.forEach((t) => {
        a.push(C(O(t)));
      }));
    const r = await Promise.all(a);
    await (function (t) {
      if (T.isNavigationAvailable())
        return void document.startViewTransition(t);
      t();
    })(async () => {
      if (o) {
        const t = r.shift();
        (b.render(document, o, t),
          b.mergeHeads(t, document),
          m(L.LAYOUT_RENDERED, { layoutUrl: o }));
      }
      (i.forEach((t, e) => {
        const n = r[e],
          i = b.getSlotsContents(n);
        (b.markAsRendered(t),
          b.replaceSlotContents(i),
          b.mergeHeads(n, document),
          m(L.LAYOUT_RENDERED, { layoutUrl: t }));
      }),
        b.replaceSlotContents(n),
        b.consolidateLayouts(),
        $(document),
        m(L.PAGE_LOADED));
    });
  } catch (e) {
    ((window.location.href = f), m(L.PAGE_LOAD_ERROR, { error: e }));
  } finally {
    S.stopLoadingAnimation();
  }
}
async function C(t) {
  return u(await _.load(t));
}
function R(t, e = !0) {
  const n = t.querySelectorAll(y.LAYOUT_LINKS),
    i = Array.from(n)
      .map((t) => t.getAttribute("href") ?? "")
      .filter((t) => t.length > 0);
  return (i.length && e && n.forEach((t) => t.remove()), i);
}
function O(t) {
  return t.endsWith(".html") ? t : `${t.replace(/\/$/, "")}/index.html`;
}
function $(t) {
  (T.startInterception(t),
    T.onNavigate(I),
    P.startPrefetch(t),
    k.highlightMatchingLinks(t));
}
let M, D, N, H, U;
function q() {
  return (M || (M = new p()), M);
}
function x() {
  return (D || (D = new w()), D);
}
function G() {
  return (U || (U = new E()), U);
}
const B = {
  interceptLinks(t) {
    (x().startInterception(t), x().onNavigate(I));
  },
  prefetchLinks(t) {
    (N || (N = new A(q())), N).startPrefetch(t);
  },
  highlightMatchingLinks(t) {
    (H || (H = new v()), H).highlightMatchingLinks(t);
  },
  navigate(t) {
    x().navigate(t);
  },
  startLoading() {
    G().startLoadingAnimation();
  },
  stopLoading() {
    G().stopLoadingAnimation();
  },
  clearCache() {
    q().clearCache();
  },
};
(window.addEventListener(
  "load",
  () => {
    !(async function () {
      try {
        S.startLoadingAnimation();
        const t = b.getSlotsContents(document),
          e = R(document),
          n = e.shift(),
          i = [];
        (n && i.push(C(O(n))),
          e.forEach((t) => {
            i.push(C(O(t)));
          }));
        const o = await Promise.all(i);
        if (n) {
          const t = o.shift();
          (b.render(document, n, t),
            b.mergeHeads(t, document),
            m(L.LAYOUT_RENDERED, { layoutUrl: n }));
        }
        (e.forEach((t, e) => {
          const n = o[e],
            i = b.getSlotsContents(n);
          (b.markAsRendered(t),
            b.replaceSlotContents(i),
            b.mergeHeads(n, document),
            m(L.LAYOUT_RENDERED, { layoutUrl: t }));
        }),
          b.replaceSlotContents(t),
          b.consolidateLayouts(),
          $(document),
          m(L.PAGE_LOADED));
      } catch (t) {
        m(L.PAGE_LOAD_ERROR, { error: t });
      } finally {
        S.stopLoadingAnimation();
      }
    })();
  },
  { once: !0 },
),
  (window.papel = B));
