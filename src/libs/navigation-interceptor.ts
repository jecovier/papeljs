import {
  INTERCEPTED_ATTR_NAME,
  NOT_INTERCEPTED_ATTR_NAME,
} from "@/libs/constants";

type ScrollPosition = {
  x: number;
  y: number;
};

export class NavigationInterceptor {
  private navigationCallback: (url: URL) => Promise<void>;
  private scrollPositions: Map<string, ScrollPosition>;

  constructor() {
    this.navigationCallback = async () => {};
    this.scrollPositions = new Map();

    // Listen to popstate event to handle back/forward navigation
    window.addEventListener("popstate", (event) => {
      const url = new URL(location.href);
      this._handlePopState(url, event);
    });
  }

  public onNavigate(callback: (url: URL) => Promise<void>): void {
    this.navigationCallback = callback;
  }

  public startInterception(target: Document | Element): void {
    this._interceptLinks(target);
  }

  public isNavigationAvailable(): boolean {
    return "navigation" in window && typeof window.navigation !== "undefined";
  }

  private _isLocalUrl(url: URL): boolean {
    return url.origin === location.origin;
  }

  private _shouldIntercept(url: URL): boolean {
    return this._isLocalUrl(url) && !!this.navigationCallback;
  }

  private _interceptLinks(target: Document | Element): void {
    target
      .querySelectorAll(
        `a:not([${INTERCEPTED_ATTR_NAME}]):not([${NOT_INTERCEPTED_ATTR_NAME}]):not([target]):not([href^="${location.origin}"]):not([download])`,
      )
      .forEach((link: Element) => {
        if (!(link instanceof HTMLAnchorElement)) {
          return;
        }

        if (!this._shouldIntercept(new URL(link.href))) {
          link.setAttribute(NOT_INTERCEPTED_ATTR_NAME, "true");
          return;
        }

        link.setAttribute(INTERCEPTED_ATTR_NAME, "true");

        link.addEventListener("click", (e: MouseEvent) =>
          this._handleLinkClick.bind(this)(e, link),
        );
      });
  }

  private async _handleLinkClick(
    event: MouseEvent,
    link: HTMLAnchorElement,
  ): Promise<void> {
    event.preventDefault();
    this.navigate(link.href);
  }

  public navigate(href: string): void {
    const url = new URL(href);

    if (!this._shouldIntercept(url)) {
      return;
    }

    // Save current scroll position before navigating away
    this.scrollPositions.set(location.href, {
      x: window.scrollX,
      y: window.scrollY,
    });

    this._addNavigationToBrowserHistory(url);

    this._handleNavigation(url);
  }

  private _addNavigationToBrowserHistory(url: URL): void {
    window.history.pushState({}, "", url);
  }

  private async _handleNavigation(url: URL): Promise<void> {
    await this.navigationCallback(url);
    this._restoreScrollPosition(url);
  }

  private _handlePopState(url: URL, event: PopStateEvent): void {
    if (!this._shouldIntercept(url)) {
      return;
    }

    event.preventDefault();

    if (this.isNavigationAvailable()) {
      document.startViewTransition(() => this._handleNavigation(url));
      return;
    }

    this._handleNavigation(url);
  }

  private _restoreScrollPosition(_url: URL): void {
    window.scrollTo(0, 0);
    return;
    /**
     * TODO:
     * This is a temporary solution to restore scroll position.
     * It should be improved to restore scroll position based on the URL
     * or with some attributes on the elements.
     */
    /* const position = this.scrollPositions.get(url.href);
    if (position) {
      window.scrollTo(position.x, position.y);
    } else {
      window.scrollTo(0, 0);
    } */
  }
}
