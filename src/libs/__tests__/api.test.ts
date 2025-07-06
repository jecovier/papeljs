import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies
vi.mock("../html-loader");
vi.mock("../navigation-interceptor");
vi.mock("../navigation-prefetch");
vi.mock("../path-link-matcher");
vi.mock("../load-indicator");
vi.mock("../handler");

describe("api", () => {
  let mockHtmlLoader: any;
  let mockNavigationInterceptor: any;
  let mockNavigationPrefetch: any;
  let mockMatcher: any;
  let mockLoadIndicator: any;
  let api: any;

  beforeEach(async () => {
    // Reset all mocks and module cache
    vi.clearAllMocks();
    vi.resetModules();

    // Create mock instances
    mockHtmlLoader = {
      // Add any methods that might be called
    };

    mockNavigationInterceptor = {
      startInterception: vi.fn(),
      onNavigate: vi.fn(),
      navigate: vi.fn(),
    };

    mockNavigationPrefetch = {
      startPrefetch: vi.fn(),
    };

    mockMatcher = {
      highlightMatchingLinks: vi.fn(),
    };

    mockLoadIndicator = {
      startLoadingAnimation: vi.fn(),
      stopLoadingAnimation: vi.fn(),
    };

    // Import the mocked classes
    const { HtmlLoader } = await import("../html-loader");
    const { NavigationInterceptor } = await import("../navigation-interceptor");
    const { NavigationPrefetch } = await import("../navigation-prefetch");
    const { PathLinkMatcher } = await import("../path-link-matcher");
    const { LoadIndicator } = await import("../load-indicator");

    // Mock the class constructors
    vi.mocked(HtmlLoader).mockImplementation(() => mockHtmlLoader);
    vi.mocked(NavigationInterceptor).mockImplementation(
      () => mockNavigationInterceptor
    );
    vi.mocked(NavigationPrefetch).mockImplementation(
      () => mockNavigationPrefetch
    );
    vi.mocked(PathLinkMatcher).mockImplementation(() => mockMatcher);
    vi.mocked(LoadIndicator).mockImplementation(() => mockLoadIndicator);

    // Import api after mocking
    const apiModule = await import("../api");
    api = apiModule.api;
  });

  describe("interceptLinks", () => {
    it("should start interception and set navigation handler", () => {
      const testElement = document.createElement("div");

      api.interceptLinks(testElement);

      expect(mockNavigationInterceptor.startInterception).toHaveBeenCalledWith(
        testElement
      );
      expect(mockNavigationInterceptor.onNavigate).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should work with Document object", () => {
      const doc = document;

      api.interceptLinks(doc);

      expect(mockNavigationInterceptor.startInterception).toHaveBeenCalledWith(
        doc
      );
    });
  });

  describe("prefetchLinks", () => {
    it("should start prefetch on document", () => {
      const testElement = document.createElement("div");

      api.prefetchLinks(testElement);

      expect(mockNavigationPrefetch.startPrefetch).toHaveBeenCalledWith(
        testElement
      );
    });

    it("should work with Document object", () => {
      const doc = document;

      api.prefetchLinks(doc);

      expect(mockNavigationPrefetch.startPrefetch).toHaveBeenCalledWith(doc);
    });
  });

  describe("highlightMatchingLinks", () => {
    it("should highlight matching links on document", () => {
      const testElement = document.createElement("div");

      api.highlightMatchingLinks(testElement);

      expect(mockMatcher.highlightMatchingLinks).toHaveBeenCalledWith(
        testElement
      );
    });

    it("should work with Document object", () => {
      const doc = document;

      api.highlightMatchingLinks(doc);

      expect(mockMatcher.highlightMatchingLinks).toHaveBeenCalledWith(doc);
    });
  });

  describe("navigate", () => {
    it("should navigate to specified URL", () => {
      const url = "/test-page";

      api.navigate(url);

      expect(mockNavigationInterceptor.navigate).toHaveBeenCalledWith(url);
    });

    it("should handle different URL formats", () => {
      const urls = [
        "/about",
        "https://example.com/page",
        "/blog/post-1",
        "#section",
      ];

      urls.forEach((url) => {
        api.navigate(url);
        expect(mockNavigationInterceptor.navigate).toHaveBeenCalledWith(url);
      });
    });
  });

  describe("startLoading", () => {
    it("should start loading animation", () => {
      api.startLoading();

      expect(mockLoadIndicator.startLoadingAnimation).toHaveBeenCalled();
    });
  });

  describe("stopLoading", () => {
    it("should stop loading animation", () => {
      api.stopLoading();

      expect(mockLoadIndicator.stopLoadingAnimation).toHaveBeenCalled();
    });
  });

  describe("API integration", () => {
    it("should allow chaining of operations", () => {
      const testElement = document.createElement("div");

      // Should not throw when calling multiple methods
      expect(() => {
        api.interceptLinks(testElement);
        api.prefetchLinks(testElement);
        api.highlightMatchingLinks(testElement);
        api.startLoading();
        api.stopLoading();
        api.navigate("/test");
      }).not.toThrow();
    });

    it("should handle multiple calls to same method", () => {
      const testElement = document.createElement("div");

      api.interceptLinks(testElement);
      api.interceptLinks(testElement);

      expect(mockNavigationInterceptor.startInterception).toHaveBeenCalledTimes(
        2
      );
    });
  });
});
