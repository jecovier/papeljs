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
}

export enum HtmlLoaderContentType {
  "HTML" = "text/html",
}

export enum LoadState {
  IsLoading = "is-loading",
  IsIndeterminate = "is-indeterminate",
  BeforeLoading = "before-loading",
  AfterLoading = "after-loading",
}
