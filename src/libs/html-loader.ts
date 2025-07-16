import { FetchMethod, HtmlLoaderContentType } from "@/libs/constants";
import { parseStringToDocument } from "./utils";
import { CONFIG } from "@/libs/config";

export class HtmlLoader {
  config: { [key: string]: string } = {};

  async load(url: string): Promise<string> {
    if (!url) {
      throw new Error("URL is required to load HTML");
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
      throw new Error(`Failed to load ${url}`);
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
      try {
        const html = await this.load(url);

        if (html && match(html)) {
          return html;
        }
      } catch (error) {
        console.error("Error loading url", url, error);
      }
    }

    console.error("None of the urls could be loaded", urls);
    return "";
  }

  public async clearCache(): Promise<void> {
    const cache = await this.getCache();

    if (cache) {
      for (const key of await cache.keys()) {
        await cache.delete(key);
      }
      console.log("Cache cleared");
    }
  }
}
