import { SLOT_ATTR_NAME, PRESERVE_ATTR_NAME } from "./constants";

export class LayoutManager {
  private currentLayout: string | null = null;

  public render(target: Document, tag: string, layout?: string): void {
    const formatedTag = this._slugifyUrl(tag);
    if (formatedTag === this.currentLayout) {
      return;
    }

    if (!layout) {
      throw new Error("layout is required");
    }

    const layoutDocument = this.parseStringToDocument(layout);

    this.currentLayout = formatedTag;
    this._mergeHeads(layoutDocument, target);
    this._copyElementAttributes(layoutDocument.body, target.body);
    this._replaceContent(layoutDocument.body, target.body);
  }

  public isCurrentLayout(tag: string): boolean {
    return this.currentLayout === this._slugifyUrl(tag);
  }

  public replaceSlotContents(
    replacements: { slot: string; content: string }[]
  ): void {
    const availableSlots = document.querySelectorAll("slot");
    availableSlots.forEach((slotElement) => {
      const slotName = slotElement.getAttribute("name") || "default";
      const replacement = replacements.find((r) => r.slot === slotName);

      if (!replacement) {
        return;
      }

      slotElement.innerHTML = replacement.content;
    });
  }

  public getSlotsContents(
    target: Document | DocumentFragment | Element
  ): { slot: string; content: string }[] {
    const slotContents: { slot: string; content: string }[] = [];
    const availableSlots = target.querySelectorAll(
      `slot, [slot], [${SLOT_ATTR_NAME}]`
    );

    availableSlots.forEach((slotElement) => {
      const slotName =
        slotElement.getAttribute("slot") ||
        slotElement.getAttribute(SLOT_ATTR_NAME) ||
        "default";

      slotContents.push({ slot: slotName, content: slotElement.innerHTML });
    });
    return slotContents;
  }

  private _copyElementAttributes(source: Element, target: Element): void {
    Array.from(source.attributes).forEach((attr) => {
      target.setAttribute(attr.name, attr.value);
    });
  }

  private _mergeHeads(source: Document, target: Document): void {
    const sourceHead = source.head;
    const targetHead = target.head;

    if (!sourceHead.innerHTML) {
      return;
    }

    if (sourceHead.innerHTML && !targetHead.innerHTML) {
      // @ts-ignore
      target.head.innerHTML = source.head.innerHTML;
      return;
    }

    const targetHeadHtml = targetHead.innerHTML;

    Array.from(sourceHead.children).forEach((element) => {
      const elementHtml = element.outerHTML;

      if (!targetHeadHtml.includes(elementHtml)) {
        targetHead.appendChild(element);
      }
    });
  }

  private _slugifyUrl(tag: string): string {
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

  private _replaceContent(source: Element, target: Element): void {
    const preserveElements = target.querySelectorAll(`[${PRESERVE_ATTR_NAME}]`);
    const preserveMap = new Map<string, Element>();

    preserveElements.forEach((el, index) => {
      const name = el.getAttribute(PRESERVE_ATTR_NAME) ?? `preserve-${index}`;
      preserveMap.set(name, el);
    });

    target.innerHTML = source.innerHTML;

    preserveMap.forEach((el, name) => {
      const placeholderElement = target.querySelector(
        `[${PRESERVE_ATTR_NAME}="${name}"]`
      );
      if (placeholderElement) {
        placeholderElement.replaceWith(el);
      } else {
        target.insertBefore(el, target.firstChild);
      }
    });
  }

  public parseStringToDocument(html: string): Document {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  }
}
