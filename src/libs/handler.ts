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
  console.log("layout", layoutUrl);
  const slotContents = layoutManager.getSlotsContents(document);
  const layout = await getHtmlLayout(layoutUrl);

  if (!isFullHTML(document)) {
    layoutManager.render(document, layoutUrl, layout);
    layoutManager.replaceSlotContents(slotContents);

    const partialDocument = layoutManager.parseStringToDocument(layout);
    const nestedLayoutUrl = getLayoutUrl(partialDocument);
    console.log("nested layout", nestedLayoutUrl);
    if (nestedLayoutUrl) {
      await loadPage();
    }
  }

  loadIndicator.stopLoadingAnimation();
  navigationInterceptor.startInterception(document);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(document);
  matcher.highlightMatchingLinks(document);
}

async function loadFetchedPage(url: URL): Promise<void> {
  loadIndicator.startLoadingAnimation();
  const partials = await htmlLoader.load(url.toString());
  const partialDocument = layoutManager.parseStringToDocument(partials);
  const partialLayoutUrl = getLayoutUrl(partialDocument) || url.pathname;
  const slotContents = layoutManager.getSlotsContents(partialDocument);
  const layout = await getHtmlLayout(partialLayoutUrl);

  if (
    isFullHTML(partialDocument) ||
    !layoutManager.isCurrentLayout(partialLayoutUrl)
  ) {
    layoutManager.render(document, partialLayoutUrl, layout);
  }

  if (!isFullHTML(partialDocument)) {
    layoutManager.replaceSlotContents(slotContents);
    const nestedLayoutUrl = getLayoutUrl(document);
    if (nestedLayoutUrl) {
      await loadPage();
    }
  }

  loadIndicator.stopLoadingAnimation();
  navigationInterceptor.startInterception(document);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(document);
  matcher.highlightMatchingLinks(document);
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

async function getHtmlLayout(url: string): Promise<string> {
  return url && !layoutManager.isCurrentLayout(url)
    ? !layoutManager.has(url)
      ? await htmlLoader.load(url)
      : ""
    : "";
}

function isFullHTML(target: Document): boolean {
  return target.head.children.length > 1 && !!target.body;
}