import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HtmlLoader } from "../html-loader";
import { FetchMethod, HtmlLoaderContentType } from "../constants";
import { parseStringToDocument } from "../utils";

// Mock the utils module
vi.mock("../utils", () => ({
  parseStringToDocument: vi.fn(),
}));

describe("HtmlLoader", () => {
  let htmlLoader: HtmlLoader;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    htmlLoader = new HtmlLoader();

    // Mock fetch globally
    mockFetch = vi.fn();
    window.fetch = mockFetch;

    // Mock console methods
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("load", () => {
    it("should load HTML content successfully", async () => {
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue("<html><body>Test content</body></html>"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await htmlLoader.clearCache();
      const result = await htmlLoader.load("/test-page");

      expect(mockFetch).toHaveBeenCalledWith("/test-page", {
        method: FetchMethod.GET,
        headers: {
          "Content-Type": HtmlLoaderContentType.HTML,
        },
      });
      expect(result).toBe("<html><body>Test content</body></html>");
    });

    it("should handle empty URL", async () => {
      await htmlLoader.clearCache();
      const result = await htmlLoader.load("");

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "URL is required to load HTML",
      );
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Network error");
      mockFetch.mockRejectedValue(error);

      await htmlLoader.clearCache();
      const result = await htmlLoader.load("/test-page");

      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "Error loading HTML: ",
        error,
        "/test-page",
      );
    });

    it("should handle non-ok responses", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Not Found",
      };
      mockFetch.mockResolvedValue(mockResponse);

      await htmlLoader.clearCache();
      const result = await htmlLoader.load("/test-page");

      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "Error loading HTML: ",
        expect.any(Error),
        "/test-page",
      );
    });
  });

  describe("loadHTMLDocument", () => {
    it("should load and parse HTML document", async () => {
      const mockHtml = "<html><body><h1>Test</h1></body></html>";
      const mockDocument = document.implementation.createHTMLDocument();

      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue(mockHtml),
      };
      mockFetch.mockResolvedValue(mockResponse);
      vi.mocked(parseStringToDocument).mockReturnValue(mockDocument);

      await htmlLoader.clearCache();
      const result = await htmlLoader.loadHTMLDocument("/test-page");

      expect(parseStringToDocument).toHaveBeenCalledWith(mockHtml);
      expect(result).toBe(mockDocument);
    });
  });

  describe("firstToMatch", () => {
    it("should return first URL that matches condition", async () => {
      const urls = ["/page1", "/page2", "/page3"];
      const mockResponses = [
        { ok: true, text: vi.fn().mockResolvedValue("content1") },
        { ok: true, text: vi.fn().mockResolvedValue("content2") },
        { ok: true, text: vi.fn().mockResolvedValue("content3") },
      ];

      mockFetch
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const match = (html: string) => html === "content2";

      await htmlLoader.clearCache();
      const result = await htmlLoader.firstToMatch(urls, match);

      expect(mockFetch).toHaveBeenCalledTimes(2); // Only first two URLs
      expect(result).toBe("content2");
    });

    it("should return empty string if no URLs match", async () => {
      const urls = ["/page1", "/page2"];
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue("content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const match = (html: string) => html === "nonexistent";

      await htmlLoader.clearCache();
      const result = await htmlLoader.firstToMatch(urls, match);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "None of the urls could be loaded",
        urls,
      );
    });

    it("should skip URLs that return empty content", async () => {
      const urls = ["/page1", "/page2", "/page3"];
      const mockResponses = [
        { ok: true, text: vi.fn().mockResolvedValue("") }, // Empty content
        { ok: true, text: vi.fn().mockResolvedValue("content2") },
        { ok: true, text: vi.fn().mockResolvedValue("content3") },
      ];

      mockFetch
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const match = (html: string) => html === "content2";

      await htmlLoader.clearCache();
      const result = await htmlLoader.firstToMatch(urls, match);

      expect(mockFetch).toHaveBeenCalledTimes(2); // First two URLs
      expect(result).toBe("content2");
    });

    it("should handle fetch errors in firstToMatch", async () => {
      const urls = ["/page1", "/page2"];
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          text: vi.fn().mockResolvedValue("content"),
        });

      const match = (html: string) => html === "content";

      await htmlLoader.clearCache();
      const result = await htmlLoader.firstToMatch(urls, match);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe("content");
    });
  });

  describe("config property", () => {
    it("should have config property", () => {
      expect(htmlLoader.config).toBeDefined();
      expect(typeof htmlLoader.config).toBe("object");
    });

    it("should allow setting config values", () => {
      htmlLoader.config["customKey"] = "customValue";
      expect(htmlLoader.config["customKey"]).toBe("customValue");
    });
  });
});
