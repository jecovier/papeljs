import { HtmlLoader } from "@/libs/html-loader";
import { NavigationInterceptor } from "@/libs/navigation-interceptor";
import { NavigationPrefetch } from "@/libs/navigation-prefetch";
import { PathLinkMatcher } from "./path-link-matcher";
import { LoadIndicator } from "./load-indicator";
import { loadFetchedPage } from "./handler";

const htmlLoader = new HtmlLoader();
const navigationInterceptor = new NavigationInterceptor();
const navigationPrefetch = new NavigationPrefetch(htmlLoader);
const matcher = new PathLinkMatcher();
const loadIndicator = new LoadIndicator();

export const api = {
  interceptLinks(document: Document | Element): void {
    navigationInterceptor.startInterception(document);
    navigationInterceptor.onNavigate(loadFetchedPage);
  },

  prefetchLinks(document: Document | Element): void {
    navigationPrefetch.startPrefetch(document);
  },

  highlightMatchingLinks(document: Document | Element): void {
    matcher.highlightMatchingLinks(document);
  },

  navigate(url: string): void {
    navigationInterceptor.navigate(url);
  },

  startLoading(): void {
    loadIndicator.startLoadingAnimation();
  },

  stopLoading(): void {
    loadIndicator.stopLoadingAnimation();
  },
};
