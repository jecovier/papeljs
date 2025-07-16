import { HtmlLoader } from "@/libs/html-loader";
import { NavigationInterceptor } from "@/libs/navigation-interceptor";
import { NavigationPrefetch } from "@/libs/navigation-prefetch";
import { PathLinkMatcher } from "./path-link-matcher";
import { LoadIndicator } from "./load-indicator";
import {
  loadFetchedPage,
  getCacheStats,
  getCompressionStats,
  isCompressionAvailable,
  optimizeCache,
  clearLayoutCache,
  debugCache,
  isUrlCached,
} from "./handler";
import {
  logCompressionStats,
  exportCompressionStats,
} from "./compression-utils";

// Create instances lazily to allow for proper mocking in tests
let htmlLoader: HtmlLoader;
let navigationInterceptor: NavigationInterceptor;
let navigationPrefetch: NavigationPrefetch;
let matcher: PathLinkMatcher;
let loadIndicator: LoadIndicator;

function getHtmlLoader(): HtmlLoader {
  if (!htmlLoader) {
    htmlLoader = new HtmlLoader();
  }
  return htmlLoader;
}

function getNavigationInterceptor(): NavigationInterceptor {
  if (!navigationInterceptor) {
    navigationInterceptor = new NavigationInterceptor();
  }
  return navigationInterceptor;
}

function getNavigationPrefetch(): NavigationPrefetch {
  if (!navigationPrefetch) {
    navigationPrefetch = new NavigationPrefetch(getHtmlLoader());
  }
  return navigationPrefetch;
}

function getMatcher(): PathLinkMatcher {
  if (!matcher) {
    matcher = new PathLinkMatcher();
  }
  return matcher;
}

function getLoadIndicator(): LoadIndicator {
  if (!loadIndicator) {
    loadIndicator = new LoadIndicator();
  }
  return loadIndicator;
}

export const api = {
  interceptLinks(document: Document | Element): void {
    getNavigationInterceptor().startInterception(document);
    getNavigationInterceptor().onNavigate(loadFetchedPage);
  },

  prefetchLinks(document: Document | Element): void {
    getNavigationPrefetch().startPrefetch(document);
  },

  highlightMatchingLinks(document: Document | Element): void {
    getMatcher().highlightMatchingLinks(document);
  },

  navigate(url: string): void {
    getNavigationInterceptor().navigate(url);
  },

  startLoading(): void {
    getLoadIndicator().startLoadingAnimation();
  },

  stopLoading(): void {
    getLoadIndicator().stopLoadingAnimation();
  },

  // Nuevas funciones de compresión
  getCacheStats,
  getCompressionStats,
  isCompressionAvailable,
  optimizeCache,
  clearLayoutCache,
  logCompressionStats,
  exportCompressionStats,

  // Funciones de debugging del cache
  debugCache,
  isUrlCached,
};
