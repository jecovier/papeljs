import { FetchMethod } from "@/libs/constants";

export enum HtmlLoaderContentType {
  "HTML" = "text/html",
  "JSON" = "application/json",
  "TEXT" = "text/plain",
}

export default class HtmlLoader {
  async load(
    url: string,
    method: FetchMethod = FetchMethod.GET,
    data?: Record<string, unknown> | null,
    options?: RequestInit
  ): Promise<string> {
    if (!url) {
      console.error("URL is required to load HTML");
      return "";
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": HtmlLoaderContentType.HTML,
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.statusText}`);
      }

      const text = await response.text();

      return this._removeQuarkScripts(text);
    } catch (error) {
      console.error("Error loading HTML: ", error);
      return "";
    }
  }

  private _removeQuarkScripts(text: string): string {
    return text.replace(
      /<script[^>]*src=["'][^"']*dist\/[^"']*["'][^>]*><\/script>/gi,
      ""
    );
  }

  public async firstToMatch(
    urls: string[],
    match: (html: string) => boolean
  ): Promise<string> {
    for (const url of urls) {
      const html = await this.load(url);

      if (html && match(html)) {
        return html;
      }
    }

    console.error("None of the urls could be loaded");
    return "";
  }
}
