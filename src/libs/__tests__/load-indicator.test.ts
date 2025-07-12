import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LoadIndicator } from "../load-indicator";
import {
  LoadingStartedEventName,
  LoadingFinishedEventName,
  LoadState,
} from "../constants";
import { dispatchCustomEvent } from "../utils";

// Mock the utils module
vi.mock("../utils", () => ({
  dispatchCustomEvent: vi.fn(),
}));

describe("LoadIndicator", () => {
  let loadIndicator: LoadIndicator;
  let mockDispatchCustomEvent: typeof dispatchCustomEvent;

  beforeEach(() => {
    loadIndicator = new LoadIndicator();
    mockDispatchCustomEvent = vi.mocked(dispatchCustomEvent);

    // Mock setTimeout and clearTimeout
    vi.useFakeTimers();

    // Clear document body classes
    document.body.className = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("startLoadingAnimation", () => {
    it("should add BeforeLoading class and start timeout", () => {
      loadIndicator.startLoadingAnimation();

      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        true,
      );
      expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
    });

    it("should not start if already loading", () => {
      document.body.classList.add(LoadState.IsLoading);

      loadIndicator.startLoadingAnimation();

      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        false,
      );
      expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
    });

    it("should not start if in BeforeLoading state", () => {
      document.body.classList.add(LoadState.BeforeLoading);

      loadIndicator.startLoadingAnimation();

      expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
    });

    it("should not start if in IsIndeterminate state", () => {
      document.body.classList.add(LoadState.IsIndeterminate);

      loadIndicator.startLoadingAnimation();

      expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
    });

    it("should clear existing timeout before starting new one", () => {
      loadIndicator.startLoadingAnimation();

      // Start another animation immediately
      loadIndicator.startLoadingAnimation();

      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        true,
      );
    });

    it("should trigger loading animation after timeout", () => {
      loadIndicator.startLoadingAnimation();

      // Advance timer to trigger the first timeout
      vi.advanceTimersByTime(200);

      expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
        LoadingStartedEventName,
      );
      expect(document.body.classList.contains(LoadState.IsLoading)).toBe(true);
      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        false,
      );
    });

    it("should add IsIndeterminate class after 2 seconds", () => {
      loadIndicator.startLoadingAnimation();

      // Advance timer to trigger the first timeout
      vi.advanceTimersByTime(200);

      // Advance timer to trigger the second timeout (2 seconds)
      vi.advanceTimersByTime(2000);

      expect(document.body.classList.contains(LoadState.IsIndeterminate)).toBe(
        true,
      );
    });
  });

  describe("stopLoadingAnimation", () => {
    it("should clear timeout and remove all loading classes", () => {
      loadIndicator.startLoadingAnimation();
      loadIndicator.stopLoadingAnimation();

      expect(document.body.classList.contains(LoadState.IsLoading)).toBe(false);
      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        false,
      );
      expect(document.body.classList.contains(LoadState.IsIndeterminate)).toBe(
        false,
      );
      expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
        LoadingFinishedEventName,
      );
    });

    it("should add AfterLoading class when stopping from IsLoading state", () => {
      document.body.classList.add(LoadState.IsLoading);

      loadIndicator.stopLoadingAnimation();

      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        true,
      );
    });

    it("should add AfterLoading class when stopping from IsIndeterminate state", () => {
      document.body.classList.add(LoadState.IsIndeterminate);

      loadIndicator.stopLoadingAnimation();

      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        true,
      );
    });

    it("should remove AfterLoading class after 500ms", () => {
      document.body.classList.add(LoadState.IsLoading);

      loadIndicator.stopLoadingAnimation();

      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        true,
      );

      // Advance timer to trigger the timeout
      vi.advanceTimersByTime(500);

      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        false,
      );
    });

    it("should not add AfterLoading class when stopping from BeforeLoading state", () => {
      document.body.classList.add(LoadState.BeforeLoading);

      loadIndicator.stopLoadingAnimation();

      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        false,
      );
    });

    it("should dispatch LoadingFinishedEventName", () => {
      loadIndicator.stopLoadingAnimation();

      expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
        LoadingFinishedEventName,
      );
    });

    it("should clear timeout when stopping", () => {
      loadIndicator.startLoadingAnimation();
      loadIndicator.stopLoadingAnimation();

      // Advance timer - should not trigger any events
      vi.advanceTimersByTime(200);

      expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(1); // Only LoadingFinishedEventName
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete loading cycle", () => {
      // Start loading
      loadIndicator.startLoadingAnimation();
      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        true,
      );

      // Advance to loading state
      vi.advanceTimersByTime(200);
      expect(document.body.classList.contains(LoadState.IsLoading)).toBe(true);
      expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
        LoadingStartedEventName,
      );

      // Advance to indeterminate state
      vi.advanceTimersByTime(2000);
      expect(document.body.classList.contains(LoadState.IsIndeterminate)).toBe(
        true,
      );

      // Stop loading
      loadIndicator.stopLoadingAnimation();
      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        true,
      );
      expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
        LoadingFinishedEventName,
      );

      // AfterLoading should be removed
      vi.advanceTimersByTime(500);
      expect(document.body.classList.contains(LoadState.AfterLoading)).toBe(
        false,
      );
    });

    it("should handle rapid start/stop cycles", () => {
      loadIndicator.startLoadingAnimation();
      loadIndicator.stopLoadingAnimation();
      loadIndicator.startLoadingAnimation();
      loadIndicator.stopLoadingAnimation();

      expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(2); // Two LoadingFinishedEventName calls
    });

    it("should handle stopping before timeout completes", () => {
      loadIndicator.startLoadingAnimation();

      // Stop before the 200ms timeout
      vi.advanceTimersByTime(100);
      loadIndicator.stopLoadingAnimation();

      // Advance timer - should not trigger LoadingStartedEventName
      vi.advanceTimersByTime(100);

      expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(1); // Only LoadingFinishedEventName
      expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
        LoadingFinishedEventName,
      );
    });
  });

  describe("class state management", () => {
    it("should properly manage multiple class states", () => {
      // Add some existing classes
      document.body.classList.add("existing-class");

      loadIndicator.startLoadingAnimation();
      expect(document.body.classList.contains("existing-class")).toBe(true);
      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        true,
      );

      loadIndicator.stopLoadingAnimation();
      expect(document.body.classList.contains("existing-class")).toBe(true);
      expect(document.body.classList.contains(LoadState.BeforeLoading)).toBe(
        false,
      );
    });
  });
});
