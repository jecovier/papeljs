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

    // Primera fase: Fetch de todos los layouts
    const layoutPromises: Promise<Document>[] = [];

    if (baseLayoutUrl) {
      layoutPromises.push(fetchDocument(normalizeLayoutUrl(baseLayoutUrl)));
    }

    layoutUrls.forEach((layoutUrl) => {
      layoutPromises.push(fetchDocument(normalizeLayoutUrl(layoutUrl)));
    });

    const fetchedLayouts = await Promise.all(layoutPromises);

    // Segunda fase: Renderizado de todos los layouts
    if (baseLayoutUrl) {
      const baseLayout = fetchedLayouts.shift()!;
      layoutManager.render(document, baseLayoutUrl, baseLayout);
      layoutManager.mergeHeads(baseLayout, document);
      dispatchCustomEvent(CONFIG.EVENTS.LAYOUT_RENDERED, {
        layoutUrl: baseLayoutUrl,
      });
    }

    // Renderizar layouts parciales
    layoutUrls.forEach((layoutUrl, index) => {
      const layout = fetchedLayouts[index];
      const slotContents = layoutManager.getSlotsContents(layout);

      layoutManager.markAsRendered(layoutUrl);
      layoutManager.replaceSlotContents(slotContents);
      layoutManager.mergeHeads(layout, document);
      dispatchCustomEvent(CONFIG.EVENTS.LAYOUT_RENDERED, { layoutUrl });
    });

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

    // Primera fase: Fetch de todos los layouts
    const layoutPromises: Promise<Document>[] = [];

    if (baseLayoutUrl) {
      layoutPromises.push(fetchDocument(normalizeLayoutUrl(baseLayoutUrl)));
    }

    layoutUrls.forEach((layoutUrl) => {
      layoutPromises.push(fetchDocument(normalizeLayoutUrl(layoutUrl)));
    });

    const fetchedLayouts = await Promise.all(layoutPromises);

    await startViewTransition(async () => {
      // Segunda fase: Renderizado de todos los layouts
      if (baseLayoutUrl) {
        const baseLayout = fetchedLayouts.shift()!;
        layoutManager.render(document, baseLayoutUrl, baseLayout);
        layoutManager.mergeHeads(baseLayout, document);
        dispatchCustomEvent(CONFIG.EVENTS.LAYOUT_RENDERED, {
          layoutUrl: baseLayoutUrl,
        });
      }

      // Renderizar layouts parciales
      layoutUrls.forEach((layoutUrl, index) => {
        const layout = fetchedLayouts[index];
        const slotContents = layoutManager.getSlotsContents(layout);

        layoutManager.markAsRendered(layoutUrl);
        layoutManager.replaceSlotContents(slotContents);
        layoutManager.mergeHeads(layout, document);
        dispatchCustomEvent(CONFIG.EVENTS.LAYOUT_RENDERED, { layoutUrl });
      });

      layoutManager.replaceSlotContents(slotContents);
      layoutManager.consolidateLayouts();
      enhanceRenderedContent(document);
      dispatchCustomEvent(CONFIG.EVENTS.PAGE_LOADED);
    });
  } catch (error) {
    console.error("Error loading page:", error);
    redirectToErrorPage();
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

function normalizeLayoutUrl(layoutUrl: string): string {
  return layoutUrl.endsWith(".html")
    ? layoutUrl
    : `${layoutUrl.replace(/\/$/, "")}/index.html`;
}

function enhanceRenderedContent(target: Document | Element): void {
  navigationInterceptor.startInterception(target);
  navigationInterceptor.onNavigate(loadFetchedPage);
  navigationPrefetch.startPrefetch(target);
  matcher.highlightMatchingLinks(target);
}

function redirectToErrorPage(): void {
  window.location.href = CONFIG.ERROR_PAGE_URL;
}
