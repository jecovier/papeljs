import { FetchMethod, HtmlLoaderContentType } from "@/libs/constants";
import { parseStringToDocument } from "./utils";
import { CONFIG } from "@/libs/config";

export class HtmlLoader {
  config: { [key: string]: string } = {};

  async load(url: string): Promise<string> {
    if (!url) {
      console.error("URL is required to load HTML");
      return "";
    }

    const cache = await this.getCache();

    if (cache) {
      const cached = await cache.match(url);

      if (cached) {
        return await cached.text();
      }
    }

    try {
      const response = await this.fetchHtml(url);

      if (cache) {
        await cache.put(url, response.clone());
      }

      return await response.text();
    } catch (error) {
      console.error("Error loading HTML: ", error, url);
      return "";
    }
  }

  private async getCache() {
    try {
      const cache = await caches.open(CONFIG.CACHE_NAME);
      return cache;
    } catch (error) {
      console.error("Error opening cache: ", error);
      return null;
    }
  }

  private async fetchHtml(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    const response = await fetch(url, {
      method: FetchMethod.GET,
      headers: {
        "Content-Type": HtmlLoaderContentType.HTML,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`);
    }

    return response;
  }

  public async loadHTMLDocument(url: string): Promise<Document> {
    const html = await this.load(url);
    return parseStringToDocument(html);
  }

  public async firstToMatch(
    urls: string[],
    match: (html: string) => boolean,
  ): Promise<string> {
    for (const url of urls) {
      const html = await this.load(url);

      if (html && match(html)) {
        return html;
      }
    }

    console.error("None of the urls could be loaded", urls);
    return "";
  }

  public async clearCache(): Promise<void> {
    const cache = await this.getCache();

    if (cache) {
      await cache.delete(CONFIG.CACHE_NAME);
      console.log("Cache cleared");
    }
  }
}
