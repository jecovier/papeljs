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

      const text = await response.text();

      this.config = this._extractConfigFromHtml(text);

      return this._removeSelfScript(text);
    } catch (error) {
      console.error("Error loading HTML: ", error);
      return "";
    }
  }

  private _removeSelfScript(text: string): string {
    return text.replace(
      /<script[^>]*src=["'][^"']*papel[^"']*["'][^>]*><\/script>/gi,
      ""
    );
  }

  private _extractConfigFromHtml(text: string): { [key: string]: string } {
    const documentContent = new DOMParser().parseFromString(text, "text/html");
    const papelJsScript = documentContent.querySelector("script[pl-layout]");
    const configFromAttributes = Array.from(papelJsScript?.attributes || []);
    return configFromAttributes.reduce<Record<string, string>>((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
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
