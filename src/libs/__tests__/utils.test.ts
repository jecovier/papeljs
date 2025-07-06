import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  replaceContent,
  parseStringToDocument,
  slugifyUrl,
  dispatchCustomEvent,
} from "../utils";

describe("utils", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("replaceContent", () => {
    it("should replace target content with source content", () => {
      const source = document.createElement("div");
      source.innerHTML = "<p>Source content</p><span>More content</span>";

      const target = document.createElement("div");
      target.innerHTML = "<p>Old content</p>";

      replaceContent(source, target);

      expect(target.children.length).toBe(2);
      expect(target.children[0].tagName).toBe("P");
      expect(target.children[0].textContent).toBe("Source content");
      expect(target.children[1].tagName).toBe("SPAN");
      expect(target.children[1].textContent).toBe("More content");
    });

    it("should handle empty source", () => {
      const source = document.createElement("div");
      const target = document.createElement("div");
      target.innerHTML = "<p>Old content</p>";

      replaceContent(source, target);

      expect(target.children.length).toBe(0);
    });

    it("should clone nodes instead of moving them", () => {
      const source = document.createElement("div");
      const child = document.createElement("p");
      child.textContent = "Test content";
      source.appendChild(child);

      const target = document.createElement("div");

      replaceContent(source, target);

      // Source should still have the child
      expect(source.children.length).toBe(1);
      expect(target.children.length).toBe(1);
      expect(target.children[0].textContent).toBe("Test content");
    });
  });

  describe("parseStringToDocument", () => {
    it("should parse valid HTML string", () => {
      const html = "<html><body><h1>Test</h1><p>Content</p></body></html>";
      const doc = parseStringToDocument(html);

      expect(doc).toBeInstanceOf(Document);
      expect(doc.querySelector("h1")?.textContent).toBe("Test");
      expect(doc.querySelector("p")?.textContent).toBe("Content");
    });

    it("should handle empty string", () => {
      const doc = parseStringToDocument("");

      expect(doc).toBeInstanceOf(Document);
      expect(doc.documentElement.tagName).toBe("HTML");
    });

    it("should handle null/undefined input", () => {
      const doc = parseStringToDocument(null as any);

      expect(doc).toBeInstanceOf(Document);
      expect(doc.documentElement.tagName).toBe("HTML");
    });

    it("should handle malformed HTML", () => {
      const html = "<html><body><h1>Test<p>Unclosed tag</body></html>";
      const doc = parseStringToDocument(html);

      expect(doc).toBeInstanceOf(Document);
      // Should still parse and create a document
      expect(doc.documentElement.tagName).toBe("HTML");
    });
  });

  describe("slugifyUrl", () => {
    it("should convert URL to slug format", () => {
      expect(slugifyUrl("/about")).toBe("about-index.html");
      expect(slugifyUrl("/blog/post-1")).toBe("blog-post-1-index.html");
      expect(slugifyUrl("/products/category/item")).toBe(
        "products-category-item-index.html"
      );
    });

    it("should handle URLs with .html extension", () => {
      expect(slugifyUrl("/page.html")).toBe("page.html");
      expect(slugifyUrl("/blog/post.html")).toBe("blog-post.html");
    });

    it("should remove leading and trailing slashes", () => {
      expect(slugifyUrl("///about///")).toBe("about-index.html");
      expect(slugifyUrl("/about/")).toBe("about-index.html");
    });

    it("should handle empty string", () => {
      expect(slugifyUrl("")).toBe("-index.html");
    });

    it("should handle single slash", () => {
      expect(slugifyUrl("/")).toBe("-index.html");
    });

    it("should convert to lowercase", () => {
      expect(slugifyUrl("/About/Page")).toBe("about-page-index.html");
    });

    it("should trim whitespace", () => {
      expect(slugifyUrl("  /about  ")).toBe("about-index.html");
    });
  });

  describe("dispatchCustomEvent", () => {
    it("should dispatch custom event without detail", () => {
      const eventSpy = vi.fn();
      document.addEventListener("test-event", eventSpy);

      dispatchCustomEvent("test-event");

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    });

    it("should dispatch custom event with detail", () => {
      const eventSpy = vi.fn();
      const detail = { data: "test", count: 42 };
      document.addEventListener("test-event", eventSpy);

      dispatchCustomEvent("test-event", { detail });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0];
      expect(event.detail).toEqual(detail);
    });

    it("should dispatch event to document", () => {
      const eventSpy = vi.fn();
      document.addEventListener("custom-event", eventSpy);

      dispatchCustomEvent("custom-event");

      expect(eventSpy).toHaveBeenCalledTimes(1);
    });
  });
});
