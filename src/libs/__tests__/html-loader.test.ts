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
  let mockFetch: any;

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
      const result = await htmlLoader.load("");

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "URL is required to load HTML"
      );
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Network error");
      mockFetch.mockRejectedValue(error);

      const result = await htmlLoader.load("/test-page");

      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith("Error loading HTML: ", error);
    });

    it("should handle non-ok responses", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Not Found",
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await htmlLoader.load("/test-page");

      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "Error loading HTML: ",
        expect.any(Error)
      );
    });

    it("should use custom HTTP method", async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue("Response content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await htmlLoader.load("/test-page", FetchMethod.POST);

      expect(mockFetch).toHaveBeenCalledWith("/test-page", {
        method: FetchMethod.POST,
        headers: {
          "Content-Type": HtmlLoaderContentType.HTML,
        },
      });
    });

    it("should include request body when data is provided", async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue("Response content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const data = { key: "value", number: 42 };
      await htmlLoader.load("/test-page", FetchMethod.POST, data);

      expect(mockFetch).toHaveBeenCalledWith("/test-page", {
        method: FetchMethod.POST,
        headers: {
          "Content-Type": HtmlLoaderContentType.HTML,
        },
        body: JSON.stringify(data),
      });
    });

    it("should merge custom options", async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue("Response content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const options = {
        headers: { "X-Custom-Header": "value" },
        mode: "cors" as RequestMode,
      };
      await htmlLoader.load("/test-page", FetchMethod.GET, null, options);

      expect(mockFetch).toHaveBeenCalledWith("/test-page", {
        method: FetchMethod.GET,
        headers: {
          "Content-Type": HtmlLoaderContentType.HTML,
          "X-Custom-Header": "value",
        },
        mode: "cors",
      });
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

      const result = await htmlLoader.loadHTMLDocument("/test-page");

      expect(parseStringToDocument).toHaveBeenCalledWith(mockHtml);
      expect(result).toBe(mockDocument);
    });

    it("should pass parameters to load method", async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue("<html></html>"),
      };
      mockFetch.mockResolvedValue(mockResponse);
      vi.mocked(parseStringToDocument).mockReturnValue(
        document.implementation.createHTMLDocument()
      );

      const data = { test: "data" };
      const options = { mode: "cors" as RequestMode };

      await htmlLoader.loadHTMLDocument(
        "/test-page",
        FetchMethod.POST,
        data,
        options
      );

      expect(mockFetch).toHaveBeenCalledWith("/test-page", {
        method: FetchMethod.POST,
        headers: {
          "Content-Type": HtmlLoaderContentType.HTML,
        },
        body: JSON.stringify(data),
        mode: "cors",
      });
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

      const result = await htmlLoader.firstToMatch(urls, match);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe("");
      expect(console.error).toHaveBeenCalledWith(
        "None of the urls could be loaded"
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
