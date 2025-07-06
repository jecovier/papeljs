import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PathLinkMatcher } from "../path-link-matcher";

describe("PathLinkMatcher", () => {
  let pathLinkMatcher: PathLinkMatcher;
  let originalLocation: Location;

  beforeEach(() => {
    // Store original location
    originalLocation = window.location;

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/test/path",
        origin: "http://localhost:3000",
        href: "http://localhost:3000/test/path",
      },
      writable: true,
    });

    // Clear document body
    document.body.innerHTML = "";
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  describe("constructor", () => {
    it("should initialize with current path", () => {
      pathLinkMatcher = new PathLinkMatcher();

      // The constructor should not throw
      expect(pathLinkMatcher).toBeInstanceOf(PathLinkMatcher);
    });

    it("should handle path with trailing slash", () => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/test/path/",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      pathLinkMatcher = new PathLinkMatcher();
      expect(pathLinkMatcher).toBeInstanceOf(PathLinkMatcher);
    });

    it("should handle root path", () => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      pathLinkMatcher = new PathLinkMatcher();
      expect(pathLinkMatcher).toBeInstanceOf(PathLinkMatcher);
    });
  });

  describe("highlightMatchingLinks", () => {
    beforeEach(() => {
      pathLinkMatcher = new PathLinkMatcher();
    });

    it("should highlight links matching current path", () => {
      // Set up test DOM
      document.body.innerHTML = `
        <a href="/test/path">Current Path</a>
        <a href="/other/path">Other Path</a>
        <a href="/test/path/index.html">Current Path with index</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(false);
      expect(links[2].classList.contains("pl-path-match")).toBe(true);
    });

    it("should highlight links matching cumulative paths", () => {
      // Set up test DOM
      document.body.innerHTML = `
        <a href="/test">Parent Path</a>
        <a href="/test/path">Current Path</a>
        <a href="/other">Other Path</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(true);
      expect(links[2].classList.contains("pl-path-match")).toBe(false);
    });

    it("should clear previous matches before highlighting", () => {
      // Set up test DOM with pre-existing classes
      document.body.innerHTML = `
        <a href="/test/path" class="pl-path-match existing-class">Current Path</a>
        <a href="/other/path" class="existing-class">Other Path</a>
      `;

      // Change location to not match the first link
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/different/path",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(false);
      expect(links[0].classList.contains("existing-class")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(false);
    });

    it("should work with Element target", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <a href="/test/path">Current Path</a>
        <a href="/other/path">Other Path</a>
      `;
      document.body.appendChild(container);

      pathLinkMatcher.highlightMatchingLinks(container);

      const links = container.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(false);
    });

    it("should handle links with full URLs", () => {
      document.body.innerHTML = `
        <a href="http://localhost:3000/test/path">Full URL</a>
        <a href="https://example.com/test/path">External URL</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(false);
    });

    it("should handle links with query parameters", () => {
      document.body.innerHTML = `
        <a href="/test/path?param=value">With Query</a>
        <a href="/test/path#section">With Hash</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(true);
    });

    it("should handle empty target", () => {
      const emptyElement = document.createElement("div");

      // Should not throw
      expect(() => {
        pathLinkMatcher.highlightMatchingLinks(emptyElement);
      }).not.toThrow();
    });

    it("should handle target with no links", () => {
      document.body.innerHTML = "<div><p>No links here</p></div>";

      // Should not throw
      expect(() => {
        pathLinkMatcher.highlightMatchingLinks(document);
      }).not.toThrow();
    });
  });

  describe("path normalization", () => {
    beforeEach(() => {
      pathLinkMatcher = new PathLinkMatcher();
    });

    it("should handle paths with trailing slash", () => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/test/path/",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      document.body.innerHTML = '<a href="/test/path">Link</a>';

      pathLinkMatcher.highlightMatchingLinks(document);

      const link = document.querySelector("a");
      expect(link?.classList.contains("pl-path-match")).toBe(true);
    });

    it("should handle paths without trailing slash", () => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/test/path",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      document.body.innerHTML = '<a href="/test/path/">Link</a>';

      pathLinkMatcher.highlightMatchingLinks(document);

      const link = document.querySelector("a");
      expect(link?.classList.contains("pl-path-match")).toBe(true);
    });
  });

  describe("cumulative paths", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/section/subsection/page",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      pathLinkMatcher = new PathLinkMatcher();
    });

    it("should match parent paths", () => {
      document.body.innerHTML = `
        <a href="/section">Section</a>
        <a href="/section/subsection">Subsection</a>
        <a href="/section/subsection/page">Page</a>
        <a href="/other">Other</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(true);
      expect(links[2].classList.contains("pl-path-match")).toBe(true);
      expect(links[3].classList.contains("pl-path-match")).toBe(false);
    });
  });

  describe("index.html handling", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/test/path",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      pathLinkMatcher = new PathLinkMatcher();
    });

    it("should match paths with index.html", () => {
      document.body.innerHTML = `
        <a href="/test/path/index.html">With index</a>
        <a href="/test/path">Without index</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(true);
    });

    it("should not match paths with other extensions", () => {
      document.body.innerHTML = `
        <a href="/test/path.html">With .html</a>
        <a href="/test/path.css">With .css</a>
        <a href="/test/path.js">With .js</a>
      `;

      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(false);
      expect(links[1].classList.contains("pl-path-match")).toBe(false);
      expect(links[2].classList.contains("pl-path-match")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle root path", () => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      document.body.innerHTML = `
        <a href="/">Root</a>
        <a href="/index.html">Root with index</a>
        <a href="/other">Other</a>
      `;

      pathLinkMatcher = new PathLinkMatcher();
      pathLinkMatcher.highlightMatchingLinks(document);

      const links = document.querySelectorAll("a");
      expect(links[0].classList.contains("pl-path-match")).toBe(true);
      expect(links[1].classList.contains("pl-path-match")).toBe(true);
      expect(links[2].classList.contains("pl-path-match")).toBe(false);
    });

    it("should handle empty path", () => {
      Object.defineProperty(window, "location", {
        value: {
          pathname: "",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      document.body.innerHTML = '<a href="/">Link</a>';

      pathLinkMatcher = new PathLinkMatcher();
      pathLinkMatcher.highlightMatchingLinks(document);

      const link = document.querySelector("a");
      expect(link?.classList.contains("pl-path-match")).toBe(true);
    });
  });
});
