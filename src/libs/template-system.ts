export function parseTemplate(
  template: string,
  data: Record<string, unknown>
): string {
  template = template.replace(
    /(\w+)="\{(\w+)(.*)\}"/g,
    (_match, attr, variable, rest) => {
      return `${attr}="this.getRootNode().host.${variable}${rest}"`;
    }
  );

  template = template.replace(/{(\w+)}/g, (_match, variable) => {
    const value = data[variable] || "";
    return `<span data-ref="${variable}">${value}</span>`;
  });

  return template;
}
