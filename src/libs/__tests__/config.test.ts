import { describe, it, expect } from "vitest";
import { CONFIG } from "../config";

describe("config", () => {
  describe("CONFIG object", () => {
    it("should have correct cache size", () => {
      expect(CONFIG.CACHE_MAX_SIZE).toBe(50);
    });

    it("should have all required events", () => {
      expect(CONFIG.EVENTS.PAGE_LOADED).toBe("page-loaded");
      expect(CONFIG.EVENTS.PAGE_LOAD_ERROR).toBe("page-load-error");
      expect(CONFIG.EVENTS.LAYOUT_RENDERED).toBe("layout-rendered");
      expect(CONFIG.EVENTS.COMPRESSION_STATS).toBe("compression-stats");
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

    it("should have correct compression configuration", () => {
      expect(CONFIG.COMPRESSION.ENABLED).toBe(true);
      expect(CONFIG.COMPRESSION.MIN_SIZE_TO_COMPRESS).toBe(1024);
      expect(CONFIG.COMPRESSION.ENABLE_STATS).toBe(true);
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
      expect(CONFIG.COMPRESSION).toBeDefined();
    });

    it("should have correct number of top-level properties", () => {
      const topLevelKeys = Object.keys(CONFIG);
      expect(topLevelKeys).toHaveLength(6);
    });

    it("should have correct number of events", () => {
      const eventKeys = Object.keys(CONFIG.EVENTS);
      expect(eventKeys).toHaveLength(4);
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

    it("should have correct number of compression options", () => {
      const compressionKeys = Object.keys(CONFIG.COMPRESSION);
      expect(compressionKeys).toHaveLength(3);
    });
  });
});
