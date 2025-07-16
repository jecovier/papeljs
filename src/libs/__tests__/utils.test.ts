import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  replaceContent,
  parseStringToDocument,
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

      expect(target.children).toHaveLength(2);
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

      expect(target.children).toHaveLength(0);
    });

    it("should clone nodes instead of moving them", () => {
      const source = document.createElement("div");
      const child = document.createElement("p");
      child.textContent = "Test content";
      source.appendChild(child);

      const target = document.createElement("div");

      replaceContent(source, target);

      // Source should still have the child
      expect(source.children).toHaveLength(1);
      expect(target.children).toHaveLength(1);
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
      const doc = parseStringToDocument(null as unknown as string);

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
