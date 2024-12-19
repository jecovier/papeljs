import { SLOT_ATTR_NAME } from "./constants";

export class LayoutManager {
  private layoutsCache: { [key: string]: string } = {};
  private currentLayout: string | null = null;

  public render(
    target: Document | Element,
    tag: string,
    layout?: string
  ): void {
    if (tag === this.currentLayout) {
      return;
    }

    const selectedLayout = this._getLayoutFromCache(tag, layout);

    this.currentLayout = tag;
    this._renderLayoutContetnIntoTarget(target, selectedLayout);
  }

  public has(tag: string): boolean {
    return tag in this.layoutsCache;
  }

  public isCurrentLayout(layout: string): boolean {
    return this.currentLayout === layout;
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

  private _getLayoutFromCache(tag: string, layout?: string): string {
    if (!(tag in this.layoutsCache)) {
      this._addLayoutToCache(tag, layout);
    }

    return this.layoutsCache[tag];
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

  private _addLayoutToCache(tag: string, layout?: string): void {
    if (!layout) {
      throw new Error("layout is required");
    }
    this.layoutsCache[tag] = layout;
  }

  private _renderLayoutContetnIntoTarget(
    target: Document | Element,
    content: string
  ): void {
    if (target instanceof Document) {
      const contentDocument = this.parseStringToDocument(content);
      target.head.innerHTML = contentDocument.head.innerHTML;
      target.body.innerHTML = contentDocument.body.innerHTML;

      this._copyAttributes(contentDocument, target);
    } else {
      target.outerHTML = content;
    }
  }

  private _copyAttributes(source: Document, target: Document): void {
    Array.from(source.body.attributes).forEach((attr) => {
      target.body.setAttribute(attr.name, attr.value);
    });
  }

  public parseStringToDocument(html: string): Document {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  }
}
