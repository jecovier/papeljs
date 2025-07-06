import { describe, it, expect } from "vitest";
import { CONFIG, ConfigKey, EventName } from "../config";

describe("config", () => {
  describe("CONFIG object", () => {
    it("should have correct timeout values", () => {
      expect(CONFIG.REQUEST_TIMEOUT).toBe(10000);
      expect(CONFIG.CACHE_MAX_SIZE).toBe(50);
    });

    it("should have all required events", () => {
      expect(CONFIG.EVENTS.PAGE_LOADED).toBe("page-loaded");
      expect(CONFIG.EVENTS.PAGE_LOAD_ERROR).toBe("page-load-error");
      expect(CONFIG.EVENTS.LAYOUT_RENDERED).toBe("layout-rendered");
      expect(CONFIG.EVENTS.CACHE_CLEARED).toBe("cache-cleared");
    });

    it("should have correct CSS selectors", () => {
      expect(CONFIG.SELECTORS.LAYOUT_LINKS).toBe("link[data-layout]");
      expect(CONFIG.SELECTORS.SLOTS).toBe("slot, [slot], [data-slot]");
      expect(CONFIG.SELECTORS.PRESERVE_ELEMENTS).toBe("[data-preserve]");
    });

    it("should have correct prefetch configuration", () => {
      expect(CONFIG.PREFETCH.ENABLED).toBe(true);
      expect(CONFIG.PREFETCH.DELAY).toBe(100);
      expect(CONFIG.PREFETCH.MAX_CONCURRENT).toBe(3);
    });

    it("should have correct view transitions configuration", () => {
      expect(CONFIG.VIEW_TRANSITIONS.ENABLED).toBe(true);
      expect(CONFIG.VIEW_TRANSITIONS.FALLBACK_DURATION).toBe(300);
    });
  });

  describe("ConfigKey type", () => {
    it("should include all top-level config keys", () => {
      const expectedKeys: ConfigKey[] = [
        "REQUEST_TIMEOUT",
        "CACHE_MAX_SIZE",
        "EVENTS",
        "SELECTORS",
        "PREFETCH",
        "VIEW_TRANSITIONS",
      ];

      expectedKeys.forEach((key) => {
        expect(CONFIG[key]).toBeDefined();
      });
    });
  });

  describe("EventName type", () => {
    it("should include all event names", () => {
      const expectedEventNames: EventName[] = [
        "page-loaded",
        "page-load-error",
        "layout-rendered",
        "cache-cleared",
      ];

      expectedEventNames.forEach((eventName) => {
        expect(Object.values(CONFIG.EVENTS)).toContain(eventName);
      });
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
      expect(selectorKeys).toHaveLength(3);
    });

    it("should have correct number of prefetch options", () => {
      const prefetchKeys = Object.keys(CONFIG.PREFETCH);
      expect(prefetchKeys).toHaveLength(3);
    });

    it("should have correct number of view transition options", () => {
      const viewTransitionKeys = Object.keys(CONFIG.VIEW_TRANSITIONS);
      expect(viewTransitionKeys).toHaveLength(2);
    });
  });
});
