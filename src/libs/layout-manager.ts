import { SLOT_ATTR_NAME, PRESERVE_ATTR_NAME } from "./constants";
import { parseStringToDocument, replaceContent } from "./utils";

export class LayoutManager {
  private currentLayouts: string[] = [];
  private loadedLayouts: string[] = [];

  public resetLayouts(): void {
    this.currentLayouts = [];
  }

  public render(target: Document, tag: string, layout?: string): void {
    const formatedTag = tag;

    if (!layout) {
      throw new Error("layout is required");
    }

    this.currentLayouts.push(formatedTag);
    if (this.isAlreadyRendered(formatedTag)) {
      return;
    }

    const layoutDocument = parseStringToDocument(layout);

    this.loadedLayouts.push(formatedTag);
    this._mergeHeads(layoutDocument, target);
    this._copyElementAttributes(layoutDocument.body, target.body);
    this._replaceContent(layoutDocument.body, target.body);
  }

  public replaceSlotContents(
    replacements: { slot: string; content: Element }[]
  ): void {
    const availableSlots = document.querySelectorAll("slot");
    availableSlots.forEach((slotElement) => {
      const slotName = slotElement.getAttribute("name") || "default";
      const replacement = replacements.find((r) => r.slot === slotName);

      if (!replacement) {
        return;
      }

      if (slotElement.innerHTML === replacement.content.innerHTML) {
        return;
      }

      replaceContent(replacement.content, slotElement);
    });
  }

  public isAlreadyRendered(tag: string): boolean {
    return this.loadedLayouts.includes(tag);
  }

  public getSlotsContents(
    target: Document | DocumentFragment | Element
  ): { slot: string; content: Element }[] {
    const slotContents: { slot: string; content: Element }[] = [];
    const availableSlots = target.querySelectorAll(
      `slot, [slot], [${SLOT_ATTR_NAME}]`
    );

    availableSlots.forEach((slotElement) => {
      const slotName =
        slotElement.getAttribute("slot") ||
        slotElement.getAttribute(SLOT_ATTR_NAME) ||
        "default";

      slotContents.push({ slot: slotName, content: slotElement });
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
      replaceContent(sourceHead, targetHead);
      return;
    }

    const targetHeadHtml = targetHead.innerHTML;

    Array.from(sourceHead.children).forEach((element) => {
      if (this._elementIsPapelScript(element)) {
        return;
      }

      const elementHtml = element.outerHTML;

      if (!targetHeadHtml.includes(elementHtml)) {
        targetHead.appendChild(element);
      }
    });
  }

  public consolidateLayouts(): void {
    const currentLayouts = new Set(this.currentLayouts);
    const loadedLayouts = new Set(this.loadedLayouts);

    const layoutsToUnload = this.currentLayouts.filter(
      (layout) => !loadedLayouts.has(layout)
    );

    layoutsToUnload.forEach((layout) => {
      const layoutElement = document.querySelector(`link[href$="${layout}"]`);
      layoutElement?.remove();
    });

    this.loadedLayouts = Array.from(currentLayouts);
    this.currentLayouts = [];
  }

  private _replaceContent(source: Element, target: Element): void {
    const preserveElements = target.querySelectorAll(`[${PRESERVE_ATTR_NAME}]`);
    const preserveMap = new Map<string, Element>();

    preserveElements.forEach((el, index) => {
      const name = el.getAttribute(PRESERVE_ATTR_NAME) ?? `preserve-${index}`;
      preserveMap.set(name, el);
    });

    replaceContent(source, target);

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

  private _elementIsPapelScript(element: Element): boolean {
    return (
      element.tagName === "SCRIPT" &&
      !!element.getAttribute("src")?.includes("papel")
    );
  }
}
