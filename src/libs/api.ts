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
} from "./handler";
import {
  logCompressionStats,
  exportCompressionStats,
} from "./compression-utils";

// Factory functions for dependency injection and testing
export function createHtmlLoader(): HtmlLoader {
  return new HtmlLoader();
}

export function createNavigationInterceptor(): NavigationInterceptor {
  return new NavigationInterceptor();
}

export function createNavigationPrefetch(
  loader: HtmlLoader
): NavigationPrefetch {
  return new NavigationPrefetch(loader);
}

export function createPathLinkMatcher(): PathLinkMatcher {
  return new PathLinkMatcher();
}

export function createLoadIndicator(): LoadIndicator {
  return new LoadIndicator();
}

// Create instances lazily to allow for proper mocking in tests
let htmlLoader: HtmlLoader;
let navigationInterceptor: NavigationInterceptor;
let navigationPrefetch: NavigationPrefetch;
let matcher: PathLinkMatcher;
let loadIndicator: LoadIndicator;

function getHtmlLoader(): HtmlLoader {
  if (!htmlLoader) {
    htmlLoader = createHtmlLoader();
  }
  return htmlLoader;
}

function getNavigationInterceptor(): NavigationInterceptor {
  if (!navigationInterceptor) {
    navigationInterceptor = createNavigationInterceptor();
  }
  return navigationInterceptor;
}

function getNavigationPrefetch(): NavigationPrefetch {
  if (!navigationPrefetch) {
    navigationPrefetch = createNavigationPrefetch(getHtmlLoader());
  }
  return navigationPrefetch;
}

function getMatcher(): PathLinkMatcher {
  if (!matcher) {
    matcher = createPathLinkMatcher();
  }
  return matcher;
}

function getLoadIndicator(): LoadIndicator {
  if (!loadIndicator) {
    loadIndicator = createLoadIndicator();
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
};
