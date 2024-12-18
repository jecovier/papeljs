export class PathLinkMatcher {
  private currentPath: string;
  private cumulativePaths: string[];
  private allLinks: NodeListOf<HTMLAnchorElement>;

  constructor() {
    this.currentPath = this.normalizePath(window.location.pathname);
    this.cumulativePaths = this.getCumulativePaths();
    this.allLinks = document.querySelectorAll("a");
  }

  // Normaliza el path removiendo el / final
  private normalizePath(path: string): string {
    return path.endsWith("/") ? path.slice(0, -1) : path;
  }

  // Añade index.html si el path no termina en un archivo con extensión
  private ensureIndexPath(path: string): string {
    return /\.[a-zA-Z0-9]+$/.test(path) ? path : `${path}/index.html`;
  }

  // Divide el path actual en tramos y crea acumulativos
  private getCumulativePaths(): string[] {
    const pathSegments = this.currentPath
      .split("/")
      .filter((segment) => segment !== "");
    return pathSegments.reduce((acc: string[], segment: string) => {
      const lastPath = acc.length > 0 ? acc[acc.length - 1] : "";
      acc.push(`${lastPath}/${segment}`);
      return acc;
    }, []);
  }

  // Filtrar enlaces que coinciden con el path actual o acumulativos
  private getMatchingLinks(): HTMLAnchorElement[] {
    if (!this.allLinks) return [];

    return Array.from(this.allLinks).filter((link) => {
      const linkPath = this.normalizePath(
        new URL(link.href, window.location.origin).pathname
      );

      const normalizedLinkPath = this.ensureIndexPath(linkPath);
      const normalizedCurrentPath = this.ensureIndexPath(this.currentPath);
      return (
        this.cumulativePaths.includes(linkPath) ||
        normalizedLinkPath === normalizedCurrentPath
      );
    });
  }

  // Quitar clase pl-path-match de todos los enlaces
  private clearPreviousMatches(): void {
    this.allLinks?.forEach((link) => link.classList.remove("pl-path-match"));
  }

  // Agregar clase a los enlaces coincidentes
  public highlightMatchingLinks(target: Document | Element): void {
    this.currentPath = this.normalizePath(window.location.pathname);
    this.cumulativePaths = this.getCumulativePaths();
    this.allLinks = target.querySelectorAll("a");

    this.clearPreviousMatches();
    const matchingLinks = this.getMatchingLinks();
    matchingLinks.forEach((link) => {
      link.classList.add("pl-path-match");
    });
  }
}
