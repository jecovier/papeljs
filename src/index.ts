import {
  highlightMatchingLinks,
  interceptLinks,
  loadPage,
  prefetchLinks,
} from "@/libs/handler";

window.addEventListener(
  "load",
  () => {
    loadPage();
  },
  { once: true }
);

// @ts-ignore
window.papel = {
  interceptLinks,
  prefetchLinks,
  highlightMatchingLinks,
};
