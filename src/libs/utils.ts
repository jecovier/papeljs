export function replaceContent(source: Element, target: Element): void {
  target.replaceChildren(
    ...Array.from(source.children).map((child) => child.cloneNode(true)),
  );
}

export function parseStringToDocument(html: string): Document {
  if (!html) {
    return document.implementation.createHTMLDocument();
  }

  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export function dispatchCustomEvent(event: string, detail?: object): void {
  document.dispatchEvent(new CustomEvent(event, detail));
}
