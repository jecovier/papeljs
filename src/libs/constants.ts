export const SLOT_ATTR_NAME = "data-slot";
export const PRESERVE_ATTR_NAME = "data-preserve";

export const INTERCEPTED_ATTR_NAME = "data-intercepted";
export const NOT_INTERCEPTED_ATTR_NAME = "data-nointercepted";

export const PREFETCH_ATTR_NAME = "data-prefetch";
export const PREFETCHED_ATTR_NAME = "data-prefetched";

export const LoadingStartedEventName = "loading-started";
export const LoadingFinishedEventName = "loading-finished";

export enum FetchMethod {
  "GET" = "GET",
  "POST" = "POST",
  "PUT" = "PUT",
  "PATCH" = "PATCH",
  "DELETE" = "DELETE",
}

export enum EventTrigger {
  "LOAD" = "load",
  "CLICK" = "click",
  "SUBMIT" = "submit",
  "CHANGE" = "change",
  "FOCUS" = "focus",
  "BLUR" = "blur",
  "KEYDOWN" = "keydown",
  "KEYUP" = "keyup",
  "KEYPRESS" = "keypress",
  "MOUSEDOWN" = "mousedown",
  "MOUSEUP" = "mouseup",
  "MOUSEMOVE" = "mousemove",
  "MOUSEOUT" = "mouseout",
  "MOUSEOVER" = "mouseover",
  "MOUSEENTER" = "mouseenter",
  "MOUSELEAVE" = "mouseleave",
  "DRAG" = "drag",
  "DROP" = "drop",
  "DRAGSTART" = "dragstart",
  "DRAGEND" = "dragend",
  "DRAGOVER" = "dragover",
  "DRAGENTER" = "dragenter",
  "DRAGLEAVE" = "dragleave",
  "DRAGEXIT" = "dragexit",
  "DRAGOUT" = "dragout",
  "INPUT" = "input",
}

export enum HtmlLoaderContentType {
  "HTML" = "text/html",
  "JSON" = "application/json",
  "TEXT" = "text/plain",
}

export enum LoadState {
  IsLoading = "is-loading",
  IsIndeterminate = "is-indeterminate",
  BeforeLoading = "before-loading",
  AfterLoading = "after-loading",
}
