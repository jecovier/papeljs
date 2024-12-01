export const LAYOUT_ATTR_NAME = "qrk-layout";
export const TARGET_ATTR_NAME = "qrk-target";
export const POSITION_ATTR_NAME = "qrk-position";
export const PARAMS_ATTR_NAME = "qrk-params";
export const OPTIONS_ATTR_NAME = "qrk-options";

export const BOOST_ATTR_NAME = "qrk-boost";
export const INTERCEPTED_ATTR_NAME = "qrk-intercepted";

export const PREFETCHED_ATTR_NAME = "qrk-prefetched";
export const PREFETCH_ATTR_NAME = "qrk-prefetch";

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
