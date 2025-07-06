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
  EventTrigger,
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
    it("should have all HTTP methods", () => {
      expect(FetchMethod.GET).toBe("GET");
      expect(FetchMethod.POST).toBe("POST");
      expect(FetchMethod.PUT).toBe("PUT");
      expect(FetchMethod.PATCH).toBe("PATCH");
      expect(FetchMethod.DELETE).toBe("DELETE");
    });

    it("should have correct number of methods", () => {
      const methods = Object.values(FetchMethod);
      expect(methods).toHaveLength(5);
    });
  });

  describe("EventTrigger enum", () => {
    it("should have common DOM events", () => {
      expect(EventTrigger.LOAD).toBe("load");
      expect(EventTrigger.CLICK).toBe("click");
      expect(EventTrigger.SUBMIT).toBe("submit");
      expect(EventTrigger.CHANGE).toBe("change");
      expect(EventTrigger.FOCUS).toBe("focus");
      expect(EventTrigger.BLUR).toBe("blur");
    });

    it("should have keyboard events", () => {
      expect(EventTrigger.KEYDOWN).toBe("keydown");
      expect(EventTrigger.KEYUP).toBe("keyup");
      expect(EventTrigger.KEYPRESS).toBe("keypress");
    });

    it("should have mouse events", () => {
      expect(EventTrigger.MOUSEDOWN).toBe("mousedown");
      expect(EventTrigger.MOUSEUP).toBe("mouseup");
      expect(EventTrigger.MOUSEMOVE).toBe("mousemove");
      expect(EventTrigger.MOUSEOUT).toBe("mouseout");
      expect(EventTrigger.MOUSEOVER).toBe("mouseover");
      expect(EventTrigger.MOUSEENTER).toBe("mouseenter");
      expect(EventTrigger.MOUSELEAVE).toBe("mouseleave");
    });

    it("should have drag and drop events", () => {
      expect(EventTrigger.DRAG).toBe("drag");
      expect(EventTrigger.DROP).toBe("drop");
      expect(EventTrigger.DRAGSTART).toBe("dragstart");
      expect(EventTrigger.DRAGEND).toBe("dragend");
      expect(EventTrigger.DRAGOVER).toBe("dragover");
      expect(EventTrigger.DRAGENTER).toBe("dragenter");
      expect(EventTrigger.DRAGLEAVE).toBe("dragleave");
      expect(EventTrigger.DRAGEXIT).toBe("dragexit");
    });

    it("should have input event", () => {
      expect(EventTrigger.INPUT).toBe("input");
    });

    it("should have correct number of event triggers", () => {
      const triggers = Object.values(EventTrigger);
      expect(triggers).toHaveLength(25);
    });
  });

  describe("HtmlLoaderContentType enum", () => {
    it("should have correct content types", () => {
      expect(HtmlLoaderContentType.HTML).toBe("text/html");
      expect(HtmlLoaderContentType.JSON).toBe("application/json");
      expect(HtmlLoaderContentType.TEXT).toBe("text/plain");
    });

    it("should have correct number of content types", () => {
      const contentTypes = Object.values(HtmlLoaderContentType);
      expect(contentTypes).toHaveLength(3);
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
