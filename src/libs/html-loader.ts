import { FetchMethod, HtmlLoaderContentType } from "@/libs/constants";

export class HtmlLoader {
  config: { [key: string]: string } = {};

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

      return await response.text();
    } catch (error) {
      console.error("Error loading HTML: ", error);
      return "";
    }
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
