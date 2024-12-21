import { ComponentLoader } from "./component-loader";
import { HtmlLoader } from "./html-loader";

export class ComponentManager {
  private components: { [key: string]: string } = {};
  private htmlLoader: HtmlLoader = new HtmlLoader();

  public constructor() {}

  public autoloadComponents(): void {
    const components = document.querySelectorAll("link[rel='component']");

    components.forEach(async (component) => {
      const componentUrl = component.getAttribute("href") || "";
      const componentName = this._extractFileName(componentUrl);
      const componentContent = await this.htmlLoader.load(componentUrl);

      this.registerComponent(componentName, componentUrl, componentContent);
    });
  }

  private _extractFileName(url: string): string {
    const name = url.split("/").pop()?.split(".").shift()?.toLowerCase() || "";
    if (name.split("-").length < 2) {
      return `${name}-component`;
    }
    return name;
  }

  public registerComponent(name: string, url: string, content: string): void {
    console.log(`Registering component ${name}`);
    if (this.components[name]) {
      console.log(`Component ${name} is already registered.`);
      return;
    }

    this.components[name] = url;

    const [template, script] = this._extractTemplateAndScript(content);
    const component = new ComponentLoader(name, template, script);
    component.createWebComponent();
  }

  private _extractTemplateAndScript(content: string): [string, string] {
    const template =
      content.match(/<template>([\s\S]*)<\/template>/)?.[1] || "";
    const script = content.match(/<script>([\s\S]*)<\/script>/)?.[1] || "";

    return [template, script];
  }

  public getComponent(name: string): string {
    return this.components[name];
  }
}
