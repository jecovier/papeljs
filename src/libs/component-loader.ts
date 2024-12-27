import { bindSignalToElement, createComputed, createSignal } from "./signals";
import { getVariableReferences, parseTemplate } from "./template-system";

export class ComponentLoader {
  componentName: string;
  textContent: string;
  textScript?: string;

  constructor(componentName: string, textContent: string, textScript?: string) {
    if (!componentName || !textContent) {
      throw new Error("componentName and textContent are required.");
    }
    this.componentName = componentName;
    this.textContent = textContent;
    this.textScript = textScript;
  }

  createWebComponent(): void {
    const textScript = this.textScript;
    const textContent = parseTemplate(this.textContent, {});
    // Define the class for the custom element
    const componentClass = class extends HTMLElement {
      shadowRoot: ShadowRoot | null;
      constructor() {
        super();

        const template = document.createElement("template");
        template.innerHTML = textContent;

        this.shadowRoot = this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content);

        if (textScript) {
          // Execute the script content with access to shadowRoot
          const scriptFunction = new Function(
            "template",
            "signal",
            "computed",
            textScript
          );
          const signal = createSignal;
          const computed = createComputed;
          scriptFunction.apply(this, [this.shadowRoot, signal, computed]);
          this._addSignalEventListeners(textScript);
        }
      }

      private _addSignalEventListeners(textScript: string): void {
        console.log("Adding signal event listeners");
        const variables = getVariableReferences(textScript);

        variables.forEach((variable) => {
          if (!this.shadowRoot) return;

          const elements = this.shadowRoot.querySelectorAll<HTMLElement>(
            `[data-ref=${variable}]`
          );

          elements.forEach((element) => {
            // @ts-ignore
            bindSignalToElement(this[variable], element);
          });
        });
      }
    };

    // Register the custom element
    console.log(`Registering component ${this.componentName}`, customElements);
    if (!window.customElements.get(this.componentName)) {
      window.customElements.define(this.componentName, componentClass);
    }
  }
}
