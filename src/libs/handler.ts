import { LAYOUT_ATTR_NAME } from "@/libs/constants";
import { HtmlLoader } from "@/libs/html-loader";
import { LayoutManager } from "@/libs/layout-manager";
import { NavigationInterceptor } from "@/libs/navigation-interceptor";
import { NavigationPrefetch } from "@/libs/navigation-prefetch";
import { PathLinkMatcher } from "./path-link-matcher";
import { LoadIndicator } from "./load-indicator";

const htmlLoader = new HtmlLoader();
const layoutManager = new LayoutManager();
const navigationInterceptor = new NavigationInterceptor();
const navigationPrefetch = new NavigationPrefetch(htmlLoader);
const matcher = new PathLinkMatcher();
const loadIndicator = new LoadIndicator();

export async function loadPage(): Promise<void> {
  loadIndicator.startLoadingAnimation();
  const layoutUrl = getLayoutUrl(document) || location.pathname;
  const slotContents = layoutManager.getSlotsContents(document);
  const layout = await htmlLoader.load(layoutUrl);

  layoutManager.render(document, layoutUrl, layout);
  layoutManager.replaceSlotContents(slotContents);

  if (!isFullHTML(document)) {
    const partialDocument = layoutManager.parseStringToDocument(layout);
    recursiveLoadPage(partialDocument);
  }

  enhanceRenderedContent(document);
  loadIndicator.stopLoadingAnimation();
}

async function loadFetchedPage(url: URL): Promise<void> {
  loadIndicator.startLoadingAnimation();
  const partials = await htmlLoader.load(url.toString());
  const partialDocument = layoutManager.parseStringToDocument(partials);
  const partialLayoutUrl = getLayoutUrl(partialDocument) || url.pathname;
  const slotContents = layoutManager.getSlotsContents(partialDocument);
  const layout = await htmlLoader.load(partialLayoutUrl);

  if (shouldRenderLayout(partialDocument, partialLayoutUrl)) {
    layoutManager.render(document, partialLayoutUrl, layout);
  }

  layoutManager.replaceSlotContents(slotContents);

  if (!isFullHTML(partialDocument)) {
    recursiveLoadPage(document);
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
  return (
    target
      .querySelector(`[${LAYOUT_ATTR_NAME}]`)
      ?.getAttribute(LAYOUT_ATTR_NAME) ?? ""
  );
}

function isFullHTML(target: Document): boolean {
  return target.head.children.length > 1 && !!target.body;
}

function shouldRenderLayout(target: Document, layoutURL: string): boolean {
  return isFullHTML(target) || !layoutManager.isCurrentLayout(layoutURL);
}

async function recursiveLoadPage(target: Document): Promise<void> {
  const nestedLayoutUrl = getLayoutUrl(target);

  if (nestedLayoutUrl) {
    await loadPage();
  }
}

function enhanceRenderedContent(target: Document | Element): void {
  navigationInterceptor.startInterception(target);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(target);
  matcher.highlightMatchingLinks(target);
}
