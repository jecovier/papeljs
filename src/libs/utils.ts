export function replaceContent(source: Element, target: Element): void {
  target.replaceChildren(
    ...Array.from(source.children).map((child) => child.cloneNode(true))
  );
}

export function parseStringToDocument(html: string): Document {
  if (!html) {
    return document.implementation.createHTMLDocument();
  }

  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export function slugifyUrl(tag: string): string {
  let formattedTag = tag
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "");
  if (!formattedTag.endsWith(".html")) {
    formattedTag += "/index.html";
  }
  formattedTag = formattedTag.replace(/\//g, "-");
  return formattedTag;
}

export function dispatchCustomEvent(event: string, detail?: Object): void {
  document.dispatchEvent(new CustomEvent(event, detail));
}
