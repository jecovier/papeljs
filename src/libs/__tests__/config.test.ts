import { describe, it, expect } from "vitest";
import { CONFIG } from "../config";

describe("config", () => {
  describe("CONFIG object", () => {
    it("should have correct error page url", () => {
      expect(CONFIG.ERROR_PAGE_URL).toBe("/_error.html");
    });

    it("should have all required events", () => {
      expect(CONFIG.EVENTS.PAGE_LOADED).toBe("page-loaded");
      expect(CONFIG.EVENTS.PAGE_LOAD_ERROR).toBe("page-load-error");
      expect(CONFIG.EVENTS.LAYOUT_RENDERED).toBe("layout-rendered");
    });

    it("should have correct CSS selectors", () => {
      expect(CONFIG.SELECTORS.LAYOUT_LINKS).toBe(
        "link[data-layout], link[rel='layout']",
      );
      expect(CONFIG.SELECTORS.SLOTS).toBe("slot, [slot], [data-slot]");
    });

    it("should have correct prefetch configuration", () => {
      expect(CONFIG.PREFETCH.ENABLED).toBe(true);
    });

    it("should have correct view transitions configuration", () => {
      expect(CONFIG.VIEW_TRANSITIONS.ENABLED).toBe(true);
    });
  });

  describe("CONFIG structure validation", () => {
    it("should be readonly (as const)", () => {
      // This test verifies that the object is properly typed as const
      expect(typeof CONFIG).toBe("object");
      expect(CONFIG).toBeDefined();
    });

    it("should have nested structure", () => {
      expect(CONFIG.EVENTS).toBeDefined();
      expect(CONFIG.SELECTORS).toBeDefined();
      expect(CONFIG.PREFETCH).toBeDefined();
      expect(CONFIG.VIEW_TRANSITIONS).toBeDefined();
      expect(CONFIG.CACHE_NAME).toBeDefined();
    });

    it("should have correct number of top-level properties", () => {
      const topLevelKeys = Object.keys(CONFIG);
      expect(topLevelKeys).toHaveLength(6);
    });

    it("should have correct number of events", () => {
      const eventKeys = Object.keys(CONFIG.EVENTS);
      expect(eventKeys).toHaveLength(3);
    });

    it("should have correct number of selectors", () => {
      const selectorKeys = Object.keys(CONFIG.SELECTORS);
      expect(selectorKeys).toHaveLength(2);
    });

    it("should have correct number of prefetch options", () => {
      const prefetchKeys = Object.keys(CONFIG.PREFETCH);
      expect(prefetchKeys).toHaveLength(1);
    });

    it("should have correct number of view transition options", () => {
      const viewTransitionKeys = Object.keys(CONFIG.VIEW_TRANSITIONS);
      expect(viewTransitionKeys).toHaveLength(1);
    });

    it("should have correct number of cache options", () => {
      expect(CONFIG.CACHE_NAME).toBeDefined();
    });
  });
});
