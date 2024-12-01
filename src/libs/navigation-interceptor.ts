import { BOOST_ATTR_NAME, INTERCEPTED_ATTR_NAME } from "@/libs/constants";

export default class NavigationInterceptor {
  private navigationCallback: (url: URL, event: Event) => Promise<void>;

  constructor() {
    this.navigationCallback = async () => {};
  }

  public onNavigate(callback: (url: URL, event: Event) => Promise<void>): void {
    this.navigationCallback = callback;
  }

  public startInterception(target: Document | Element): void {
    this._interceptLinks(target);
  }

  private _isNavigationAvailable(): boolean {
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
      .querySelectorAll(`a[${BOOST_ATTR_NAME}]:not([${INTERCEPTED_ATTR_NAME}])`)
      .forEach((link: Element) => {
        if (!(link instanceof HTMLAnchorElement)) {
          return;
        }

        link.setAttribute(INTERCEPTED_ATTR_NAME, "true");

        link.addEventListener("click", (e: MouseEvent) =>
          this._handleLinkClick.bind(this)(e, link)
        );
      });
  }

  private async _handleLinkClick(
    event: MouseEvent,
    link: HTMLAnchorElement
  ): Promise<void> {
    event.preventDefault();
    const url = new URL(link.href);

    if (!this._shouldIntercept(url)) {
      return;
    }

    event.preventDefault();
    this._fallbackBrowserNavigation(url);

    if (this._isNavigationAvailable()) {
      document.startViewTransition(() => this._handleNavigation(url, event));
      return;
    }

    this._handleNavigation(url, event);
  }

  private _fallbackBrowserNavigation(url: URL): void {
    window.history.pushState({}, "", url);
  }

  private async _handleNavigation(url: URL, event: Event): Promise<void> {
    await this.navigationCallback(url, event);
  }
}
