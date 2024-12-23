import { HtmlLoader } from "@/libs/html-loader";
import { LayoutManager } from "@/libs/layout-manager";
import { NavigationInterceptor } from "@/libs/navigation-interceptor";
import { NavigationPrefetch } from "@/libs/navigation-prefetch";
import { PathLinkMatcher } from "./path-link-matcher";
import { LoadIndicator } from "./load-indicator";
import { ComponentManager } from "./component-manager";

const htmlLoader = new HtmlLoader();
const layoutManager = new LayoutManager();
const navigationInterceptor = new NavigationInterceptor();
const navigationPrefetch = new NavigationPrefetch(htmlLoader);
const matcher = new PathLinkMatcher();
const loadIndicator = new LoadIndicator();
const componentManager = new ComponentManager();

export async function loadPage(): Promise<void> {
  loadIndicator.startLoadingAnimation();
  const slotContents = layoutManager.getSlotsContents(document);
  const layoutUrl = getLayoutUrl(document);
  const isPartialHTML = !!layoutUrl;

  if (isPartialHTML) {
    const layout = await htmlLoader.load(layoutUrl);
    layoutManager.render(document, layoutUrl, layout);
  }

  layoutManager.replaceSlotContents(slotContents);

  if (isPartialHTML) {
    await loadPage();
  }

  enhanceRenderedContent(document);
  loadIndicator.stopLoadingAnimation();
}

async function loadFetchedPage(url: URL): Promise<void> {
  loadIndicator.startLoadingAnimation();
  const partials = await htmlLoader.load(url.toString());
  const partialDocument = layoutManager.parseStringToDocument(partials);
  const slotContents = layoutManager.getSlotsContents(partialDocument);
  const layoutUrl = getLayoutUrl(partialDocument);
  const isPartialHTML = !!layoutUrl;

  if (isPartialHTML) {
    const layout = await htmlLoader.load(layoutUrl);
    layoutManager.render(document, layoutUrl, layout);
  }

  layoutManager.replaceSlotContents(slotContents);

  if (isPartialHTML) {
    await loadPage();
  }

  enhanceRenderedContent(document);
  loadIndicator.stopLoadingAnimation();
}

export function interceptLinks(document: Document | Element): void {
  navigationInterceptor.startInterception(document);
  navigationInterceptor.onNavigate(loadFetchedPage);
}

export function prefetchLinks(document: Document | Element): void {
  navigationPrefetch.startPrefetch(document);
}

export function highlightMatchingLinks(document: Document | Element): void {
  matcher.highlightMatchingLinks(document);
}

export function navigate(url: string): void {
  navigationInterceptor.navigate(url);
}

export function startLoading(): void {
  loadIndicator.startLoadingAnimation();
}

export function stopLoading(): void {
  loadIndicator.stopLoadingAnimation();
}

function getLayoutUrl(target: Document): string {
  const layoutElement = target.querySelector(`link[rel="layout"]`);

  const layoutUrl = layoutElement?.getAttribute("href") || "";

  if (layoutUrl) {
    layoutElement?.remove();
  }

  return layoutUrl;
}

function enhanceRenderedContent(target: Document | Element): void {
  navigationInterceptor.startInterception(target);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(target);
  matcher.highlightMatchingLinks(target);
  componentManager.autoloadComponents();
}
