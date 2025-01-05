import { HtmlLoader } from "@/libs/html-loader";
import { LayoutManager } from "@/libs/layout-manager";
import { NavigationInterceptor } from "@/libs/navigation-interceptor";
import { NavigationPrefetch } from "@/libs/navigation-prefetch";
import { PathLinkMatcher } from "./path-link-matcher";
import { LoadIndicator } from "./load-indicator";
import { dispatchCustomEvent, parseStringToDocument } from "./utils";

const htmlLoader = new HtmlLoader();
const layoutManager = new LayoutManager();
const navigationInterceptor = new NavigationInterceptor();
const navigationPrefetch = new NavigationPrefetch(htmlLoader);
const matcher = new PathLinkMatcher();
const loadIndicator = new LoadIndicator();

export async function loadPage(): Promise<void> {
  loadIndicator.startLoadingAnimation();
  const slotContents = layoutManager.getSlotsContents(document);
  const layoutUrl = getLayoutUrl(document);
  const isPartialHTML = !!layoutUrl;

  if (isPartialHTML) {
    await renderLayout(layoutUrl);
  }

  layoutManager.replaceSlotContents(slotContents);

  if (isPartialHTML) {
    await loadPage();
  }

  loadIndicator.stopLoadingAnimation();
  enhanceRenderedContent(document);

  if (!isPartialHTML) {
    dispatchCustomEvent("page-loaded");
  }
}

export async function loadFetchedPage(url: URL): Promise<void> {
  loadIndicator.startLoadingAnimation();
  layoutManager.resetLayouts();
  const partialDocument = await fetchDocument(url);
  const slotContents = layoutManager.getSlotsContents(partialDocument);
  const layoutUrl = getLayoutUrl(partialDocument);
  const isPartialHTML = !!layoutUrl;

  if (isPartialHTML) {
    layoutManager.mergeHeads(partialDocument, document);
    await renderLayout(layoutUrl);
  }

  startViewTransition(() => layoutManager.replaceSlotContents(slotContents));

  if (isPartialHTML) {
    await loadPage();
  }

  layoutManager.consolidateLayouts();
  loadIndicator.stopLoadingAnimation();
  enhanceRenderedContent(document);

  if (!isPartialHTML) {
    dispatchCustomEvent("page-loaded");
  }
}

async function fetchDocument(url: URL): Promise<Document> {
  const partials = await htmlLoader.load(url.toString());
  return parseStringToDocument(partials);
}

function getLayoutUrl(
  target: Document,
  removeLayoutTag: Boolean = true
): string {
  const layoutElement = target.querySelector(`link[rel="layout"]`);

  const layoutUrl = layoutElement?.getAttribute("href") || "";

  if (layoutUrl && removeLayoutTag) {
    layoutElement?.remove();
  }

  return layoutUrl;
}

function startViewTransition(callback: () => void): void {
  if (navigationInterceptor.isNavigationAvailable()) {
    document.startViewTransition(callback);
    return;
  }

  callback();
}

async function renderLayout(layoutUrl: string) {
  if (layoutManager.isAlreadyRendered(layoutUrl)) {
    layoutManager.markAsRendered(layoutUrl);
    return;
  }

  const layout = await htmlLoader.loadHTMLDocument(layoutUrl);

  layoutManager.render(document, layoutUrl, layout);
  layoutManager.mergeHeads(layout, document);
  dispatchCustomEvent("layout-rendered", { layoutUrl });
}

function enhanceRenderedContent(target: Document | Element): void {
  navigationInterceptor.startInterception(target);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(target);
  matcher.highlightMatchingLinks(target);
}
