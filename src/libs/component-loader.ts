import {
  bindSignalToElement,
  createComputed,
  createState,
  Signal,
} from "./signals";
import { parseTemplate } from "./template-system";

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
      [key: string]: unknown;
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
            "$state",
            "$computed",
            textScript
          );
          const $state = createState;
          const $computed = createComputed;
          scriptFunction.apply(this._createProxy(), [
            this.shadowRoot,
            $state,
            $computed,
          ]);
          this._addSignalEventListeners();
        }
      }

      private _createProxy() {
        return new Proxy(this, {
          get(target, prop) {
            if (!(prop in target)) {
              return undefined;
            }

            // @ts-ignore
            const property = target[prop];
            if (property instanceof Signal) {
              return property.value;
            }

            // @ts-ignore
            return target[prop];
          },
          set(target, prop, value) {
            // @ts-ignore
            const property = target[prop];
            if (property instanceof Signal) {
              property.value = value;
              return true;
            }

            // @ts-ignore
            target[prop] = value;
            return true;
          },
        });
      }

      private _addSignalEventListeners(): void {
        console.log("Adding signal event listeners");
        const variables = this._getSignalReferences();

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

      private _getSignalReferences(): string[] {
        return Object.getOwnPropertyNames(this)
          .filter((property) => property !== "shadowRoot")
          .filter((property) => typeof this[property] !== "function");
      }
    };

    // Register the custom element
    console.log(`Registering component ${this.componentName}`, customElements);
    if (!window.customElements.get(this.componentName)) {
      window.customElements.define(this.componentName, componentClass);
    }
  }
}
