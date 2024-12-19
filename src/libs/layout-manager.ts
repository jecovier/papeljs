import { SLOT_ATTR_NAME } from "./constants";

export class LayoutManager {
  private currentLayout: string | null = null;

  public render(
    target: Document | Element,
    tag: string,
    layout?: string
  ): void {
    if (!layout) {
      throw new Error("layout is required");
    }

    const formatedTag = this._slugifyUrl(tag);
    if (formatedTag === this.currentLayout) {
      return;
    }

    this.currentLayout = formatedTag;
    this._renderLayoutContetnIntoTarget(target, layout);
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

  private _renderLayoutContetnIntoTarget(
    target: Document | Element,
    content: string
  ): void {
    if (target instanceof Document) {
      const contentDocument = this.parseStringToDocument(content);
      target.body.innerHTML = contentDocument.body.innerHTML;
      this._mergeHeads(contentDocument, target);
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

  public parseStringToDocument(html: string): Document {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  }
}
