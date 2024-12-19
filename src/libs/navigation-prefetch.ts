import {
  FetchMethod,
  PREFETCH_ATTR_NAME,
  PREFETCHED_ATTR_NAME,
} from "@/libs/constants";
import { HtmlLoader } from "@/libs/html-loader";

export class NavigationPrefetch {
  private loadedUrls: string[] = [];
  constructor(private htmlLoader: HtmlLoader) {}

  public startPrefetch(target: Document | Element): void {
    this._addObserverToLinks(target, async (link: HTMLAnchorElement) => {
      const prefetch = link.getAttribute(PREFETCH_ATTR_NAME);

      if (prefetch !== "all") {
        this._prefetchRequest(link.href);
        return;
      }

      if (prefetch === "all") {
        const data = await this._prefetchRequest(link.href);
        const parser = new DOMParser();
        const newDocument = parser.parseFromString(data, "text/html");
        this.imagePrefetch(newDocument);
        this.templateImagePrefetch(newDocument);
      }
    });
  }

  public imagePrefetch(target: Document | DocumentFragment | Element): void {
    const images = target.querySelectorAll(
      `img[${PREFETCH_ATTR_NAME}]`
    ) as NodeListOf<HTMLImageElement>;

    images.forEach((image) => {
      this._prefetchRequest(image.src);
      this.loadedUrls.push(image.src);
    });
  }

  public templateImagePrefetch(
    target: Document | DocumentFragment | Element
  ): void {
    const templates = target.querySelectorAll(
      "template"
    ) as NodeListOf<HTMLTemplateElement>;

    templates.forEach((template) => {
      this.imagePrefetch(template.content);
    });
  }

  private _addObserverToLinks(
    target: Document | Element,
    callback: (link: HTMLAnchorElement) => void
  ): void {
    const observer = this._getIntersectionObserver(callback);
    const links = target.querySelectorAll(
      `a[${PREFETCH_ATTR_NAME}]:not([${PREFETCH_ATTR_NAME}="none"]):not([${PREFETCHED_ATTR_NAME}])`
    ) as NodeListOf<HTMLAnchorElement>;

    links.forEach((link) => {
      if (!this._isLocalLink(link)) {
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
    callback: (link: HTMLAnchorElement) => void
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

  private _isAlreadyPrefetched(link: HTMLAnchorElement): boolean {
    return this.loadedUrls.includes(link.href);
  }

  private _isLocalLink(link: HTMLAnchorElement): boolean {
    return link.hostname === window.location.hostname;
  }

  private async _prefetchRequest(url: string): Promise<string> {
    return this.htmlLoader.load(url, FetchMethod.GET, undefined, {
      priority: "low",
    });
  }
}
