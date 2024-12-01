import { SLOT_ATTR_NAME } from "./constants";

class LayoutManager {
  private layouts: { [key: string]: string } = {};
  private currentLayout: string | null = null;

  public render(
    target: Document | Element,
    tag: string,
    layout?: string
  ): void {
    if (tag === this.currentLayout) {
      return;
    }

    const selectedLayout = this._getLayout(tag, layout);

    this.currentLayout = selectedLayout;
    this._setTargetContent(target, selectedLayout);
  }

  public has(tag: string): boolean {
    return tag in this.layouts;
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

  private _getLayout(tag: string, layout?: string): string {
    if (!(tag in this.layouts)) {
      this._addLayout(tag, layout);
    }

    return this.layouts[tag];
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

  private _addLayout(tag: string, layout?: string): void {
    if (!layout) {
      throw new Error("layout is required");
    }
    this.layouts[tag] = layout;
  }

  private _setTargetContent(target: Document | Element, content: string): void {
    if (target instanceof Document) {
      const contentDocument = this.parseStringToDocument(content);
      target.head.innerHTML = contentDocument.head.innerHTML;
      target.body = contentDocument.body;
    } else {
      target.outerHTML = content;
    }
  }

  public parseStringToDocument(html: string): Document {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  }
}

export default LayoutManager;
