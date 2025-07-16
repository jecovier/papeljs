import { describe, it, expect } from "vitest";
import {
  SLOT_ATTR_NAME,
  PRESERVE_ATTR_NAME,
  INTERCEPTED_ATTR_NAME,
  NOT_INTERCEPTED_ATTR_NAME,
  PREFETCH_ATTR_NAME,
  PREFETCHED_ATTR_NAME,
  LoadingStartedEventName,
  LoadingFinishedEventName,
  FetchMethod,
  HtmlLoaderContentType,
  LoadState,
} from "../constants";

describe("constants", () => {
  describe("attribute names", () => {
    it("should export correct slot attribute name", () => {
      expect(SLOT_ATTR_NAME).toBe("data-slot");
    });

    it("should export correct preserve attribute name", () => {
      expect(PRESERVE_ATTR_NAME).toBe("data-preserve");
    });

    it("should export correct intercepted attribute name", () => {
      expect(INTERCEPTED_ATTR_NAME).toBe("data-intercepted");
    });

    it("should export correct not intercepted attribute name", () => {
      expect(NOT_INTERCEPTED_ATTR_NAME).toBe("data-nointercepted");
    });

    it("should export correct prefetch attribute name", () => {
      expect(PREFETCH_ATTR_NAME).toBe("data-prefetch");
    });

    it("should export correct prefetched attribute name", () => {
      expect(PREFETCHED_ATTR_NAME).toBe("data-prefetched");
    });
  });

  describe("loading event names", () => {
    it("should export correct loading started event name", () => {
      expect(LoadingStartedEventName).toBe("loading-started");
    });

    it("should export correct loading finished event name", () => {
      expect(LoadingFinishedEventName).toBe("loading-finished");
    });
  });

  describe("FetchMethod enum", () => {
    it("should have HTTP methods", () => {
      expect(FetchMethod.GET).toBe("GET");
      expect(FetchMethod.POST).toBe("POST");
    });

    it("should have correct number of methods", () => {
      const methods = Object.values(FetchMethod);
      expect(methods).toHaveLength(2);
    });
  });

  describe("HtmlLoaderContentType enum", () => {
    it("should have correct content types", () => {
      expect(HtmlLoaderContentType.HTML).toBe("text/html");
    });

    it("should have correct number of content types", () => {
      const contentTypes = Object.values(HtmlLoaderContentType);
      expect(contentTypes).toHaveLength(1);
    });
  });

  describe("LoadState enum", () => {
    it("should have correct load states", () => {
      expect(LoadState.IsLoading).toBe("is-loading");
      expect(LoadState.IsIndeterminate).toBe("is-indeterminate");
      expect(LoadState.BeforeLoading).toBe("before-loading");
      expect(LoadState.AfterLoading).toBe("after-loading");
    });

    it("should have correct number of load states", () => {
      const loadStates = Object.values(LoadState);
      expect(loadStates).toHaveLength(4);
    });
  });
});
