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
  const layoutUrls = getLayoutUrls(document);
  const baseLayoutUrl = layoutUrls.shift();

  if (baseLayoutUrl) {
    await renderBaseLayout(baseLayoutUrl);
  }

  for (const layoutUrl of layoutUrls) {
    await renderPartialLayout(layoutUrl);
  }

  layoutManager.replaceSlotContents(slotContents);
  loadIndicator.stopLoadingAnimation();
  layoutManager.consolidateLayouts();
  enhanceRenderedContent(document);
  dispatchCustomEvent("page-loaded");
}

export async function loadFetchedPage(url: URL): Promise<void> {
  loadIndicator.startLoadingAnimation();
  layoutManager.resetLayouts();
  const partialDocument = await fetchDocument(url.toString());
  const slotContents = layoutManager.getSlotsContents(partialDocument);
  const layoutUrls = getLayoutUrls(partialDocument);
  const baseLayoutUrl = layoutUrls.shift();

  await startViewTransition(async () => {
    if (baseLayoutUrl) {
      await renderBaseLayout(baseLayoutUrl);
    }

    for (const layoutUrl of layoutUrls) {
      await renderPartialLayout(layoutUrl);
    }

    layoutManager.replaceSlotContents(slotContents);
    loadIndicator.stopLoadingAnimation();
    layoutManager.consolidateLayouts();
    enhanceRenderedContent(document);
    dispatchCustomEvent("page-loaded");
  });
}

async function fetchDocument(url: string): Promise<Document> {
  const partials = await htmlLoader.load(url);
  return parseStringToDocument(partials);
}

function getLayoutUrls(
  target: Document,
  removeLayoutTag: Boolean = true
): string[] {
  const layoutElements = target.querySelectorAll(`link[data-layout]`);

  const layoutUrls = Array.from(layoutElements)
    .map((element) => element.getAttribute("href") ?? "")
    .filter((element) => !!element);

  if (layoutUrls.length && removeLayoutTag) {
    layoutElements.forEach((element) => element.remove());
  }

  return layoutUrls;
}

function startViewTransition(callback: () => void): void {
  if (navigationInterceptor.isNavigationAvailable()) {
    document.startViewTransition(callback);
    return;
  }

  callback();
}

async function renderBaseLayout(layoutUrl: string) {
  if (layoutManager.isAlreadyRendered(layoutUrl)) {
    layoutManager.markAsRendered(layoutUrl);
    return;
  }

  const layout = await htmlLoader.loadHTMLDocument(layoutUrl);

  layoutManager.render(document, layoutUrl, layout);
  layoutManager.mergeHeads(layout, document);
  dispatchCustomEvent("layout-rendered", { layoutUrl });
}

async function renderPartialLayout(layoutUrl: string) {
  if (layoutManager.isAlreadyRendered(layoutUrl)) {
    layoutManager.markAsRendered(layoutUrl);
    return;
  }

  const layout = await fetchDocument(layoutUrl);
  const slotContents = layoutManager.getSlotsContents(layout);

  layoutManager.markAsRendered(layoutUrl);
  layoutManager.replaceSlotContents(slotContents);
  layoutManager.mergeHeads(layout, document);
  dispatchCustomEvent("layout-rendered", { layoutUrl });
}

function enhanceRenderedContent(target: Document | Element): void {
  navigationInterceptor.startInterception(target);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(target);
  matcher.highlightMatchingLinks(target);
}
