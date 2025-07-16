import { HtmlLoader } from "@/libs/html-loader";
import { LayoutManager } from "@/libs/layout-manager";
import { NavigationInterceptor } from "@/libs/navigation-interceptor";
import { NavigationPrefetch } from "@/libs/navigation-prefetch";
import { PathLinkMatcher } from "./path-link-matcher";
import { LoadIndicator } from "./load-indicator";
import { CONFIG } from "./config";
import { dispatchCustomEvent, parseStringToDocument } from "./utils";

const htmlLoader = new HtmlLoader();
const layoutManager = new LayoutManager();
const navigationInterceptor = new NavigationInterceptor();
const navigationPrefetch = new NavigationPrefetch(htmlLoader);
const matcher = new PathLinkMatcher();
const loadIndicator = new LoadIndicator();

export async function loadPage(): Promise<void> {
  try {
    loadIndicator.startLoadingAnimation();

    const slotContents = layoutManager.getSlotsContents(document);
    const layoutUrls = getLayoutUrls(document);
    const baseLayoutUrl = layoutUrls.shift();

    if (baseLayoutUrl) {
      await renderBaseLayout(baseLayoutUrl);
    }

    // Procesar layouts en paralelo si es posible
    await Promise.all(
      layoutUrls.map((layoutUrl) => renderPartialLayout(layoutUrl)),
    );

    layoutManager.replaceSlotContents(slotContents);
    layoutManager.consolidateLayouts();
    enhanceRenderedContent(document);
    dispatchCustomEvent(CONFIG.EVENTS.PAGE_LOADED);
  } catch (error) {
    console.error("Error loading page:", error);
    dispatchCustomEvent(CONFIG.EVENTS.PAGE_LOAD_ERROR, { error });
  } finally {
    loadIndicator.stopLoadingAnimation();
  }
}

export async function loadFetchedPage(url: URL): Promise<void> {
  try {
    loadIndicator.startLoadingAnimation();
    layoutManager.resetLayouts();

    const partialDocument = await fetchDocument(url.toString());
    const slotContents = layoutManager.getSlotsContents(partialDocument);
    const layoutUrls = getLayoutUrls(partialDocument);
    const baseLayoutUrl = layoutUrls.shift();

    if (baseLayoutUrl) {
      await renderBaseLayout(baseLayoutUrl);
    }

    // Procesar layouts en paralelo
    await Promise.all(
      layoutUrls.map((layoutUrl) => renderPartialLayout(layoutUrl)),
    );

    await startViewTransition(async () => {
      layoutManager.replaceSlotContents(slotContents);
      layoutManager.consolidateLayouts();
      enhanceRenderedContent(document);
      dispatchCustomEvent(CONFIG.EVENTS.PAGE_LOADED);
    });
  } catch (error) {
    console.error("Error loading fetched page:", error);
    dispatchCustomEvent(CONFIG.EVENTS.PAGE_LOAD_ERROR, { error });
  } finally {
    loadIndicator.stopLoadingAnimation();
  }
}

async function fetchDocument(url: string): Promise<Document> {
  const partials = await htmlLoader.load(url);
  const document = parseStringToDocument(partials);

  return document;
}

function getLayoutUrls(
  target: Document,
  removeLayoutTag: boolean = true,
): string[] {
  const layoutElements = target.querySelectorAll(CONFIG.SELECTORS.LAYOUT_LINKS);

  const layoutUrls = Array.from(layoutElements)
    .map((element) => element.getAttribute("href") ?? "")
    .filter((url) => url.length > 0);

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

/**
 * Normaliza una URL de layout para el cache (igual que LayoutManager._formatTag)
 */
function normalizeLayoutUrl(layoutUrl: string): string {
  return layoutUrl.endsWith(".html")
    ? layoutUrl
    : `${layoutUrl.replace(/\/$/, "")}/index.html`;
}

async function renderBaseLayout(layoutUrl: string): Promise<void> {
  if (layoutManager.isAlreadyRendered(layoutUrl)) {
    layoutManager.markAsRendered(layoutUrl);
    return;
  }

  try {
    // Usar fetchDocument para aprovechar el cache
    const layout = await fetchDocument(normalizeLayoutUrl(layoutUrl));

    layoutManager.render(document, layoutUrl, layout);
    layoutManager.mergeHeads(layout, document);
    dispatchCustomEvent(CONFIG.EVENTS.LAYOUT_RENDERED, { layoutUrl });
  } catch (error) {
    console.error(`Error rendering base layout ${layoutUrl}:`, error);
    throw error;
  }
}

async function renderPartialLayout(layoutUrl: string): Promise<void> {
  if (layoutManager.isAlreadyRendered(layoutUrl)) {
    layoutManager.markAsRendered(layoutUrl);
    return;
  }

  try {
    const layout = await fetchDocument(normalizeLayoutUrl(layoutUrl));
    const slotContents = layoutManager.getSlotsContents(layout);

    layoutManager.markAsRendered(layoutUrl);
    layoutManager.replaceSlotContents(slotContents);
    layoutManager.mergeHeads(layout, document);
    dispatchCustomEvent(CONFIG.EVENTS.LAYOUT_RENDERED, { layoutUrl });
  } catch (error) {
    console.error(`Error rendering partial layout ${layoutUrl}:`, error);
    throw error;
  }
}

function enhanceRenderedContent(target: Document | Element): void {
  navigationInterceptor.startInterception(target);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(target);
  matcher.highlightMatchingLinks(target);
}
