export const LAYOUT_ATTR_NAME = "p-layout";
export const SLOT_ATTR_NAME = "p-slot";

export const BOOST_ATTR_NAME = "p-boost";
export const INTERCEPTED_ATTR_NAME = "p-intercepted";

export const PREFETCHED_ATTR_NAME = "p-prefetched";
export const PREFETCH_ATTR_NAME = "p-prefetch";

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