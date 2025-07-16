import { PREFETCH_ATTR_NAME, PREFETCHED_ATTR_NAME } from "@/libs/constants";
import { HtmlLoader } from "@/libs/html-loader";

type LinkType = HTMLAnchorElement | HTMLLinkElement;

export class NavigationPrefetch {
  private loadedUrls: string[] = [];

  constructor(private htmlLoader: HtmlLoader) {}

  public startPrefetch(target: Document | Element): void {
    this._addObserverToLinks(target, async (link: LinkType) => {
      await this._prefetchRequest(link.href);
    });
  }

  private _addObserverToLinks(
    target: Document | Element,
    callback: (link: LinkType) => void,
  ): void {
    const observer = this._getIntersectionObserver(callback);
    const links = target.querySelectorAll(
      `a[${PREFETCH_ATTR_NAME}]:not([${PREFETCH_ATTR_NAME}="none"]):not([${PREFETCHED_ATTR_NAME}]):not([target]):not([href^="${location.origin}"]):not([download]), link[${PREFETCH_ATTR_NAME}]:not([${PREFETCH_ATTR_NAME}="none"]):not([${PREFETCHED_ATTR_NAME}]):not([href^="${location.origin}"])`,
    ) as NodeListOf<HTMLAnchorElement>;

    links.forEach((link) => {
      if (!this._isLocalLink(new URL(link.href))) {
        return;
      }

      if (this._isAlreadyPrefetched(link)) {
        link.setAttribute(PREFETCHED_ATTR_NAME, "true");
        return;
      }

      observer.observe(link);
    });
  }

  private _getIntersectionObserver(
    callback: (link: LinkType) => void,
  ): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          link.setAttribute(PREFETCHED_ATTR_NAME, "true");

          if (this._isAlreadyPrefetched(link)) {
            return;
          }

          callback(link);
          this.loadedUrls.push(link.href);
        }
      });
    });
  }

  private _isAlreadyPrefetched(link: LinkType): boolean {
    return this.loadedUrls.includes(link.href);
  }

  private _isLocalLink(link: URL): boolean {
    return link.hostname === window.location.hostname;
  }

  private async _prefetchRequest(url: string): Promise<string> {
    return this.htmlLoader.load(url);
  }
}
