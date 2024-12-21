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

export function getVariableReferences(text: string): string[] {
  const variablePattern = /\b(\w+)\s*=\s*.*?signal\(/g;
  const variables = [];
  let match;

  while ((match = variablePattern.exec(text)) !== null) {
    variables.push(match[1]);
  }

  return variables;
}

export function getEventListenersFromTemplate(text: string): string[] {
  const eventPattern = /on(\w+)\s*=\s*.*?;/g;
  const events = [];
  let match;

  while ((match = eventPattern.exec(text)) !== null) {
    events.push(match[1]);
  }

  return events;
}
