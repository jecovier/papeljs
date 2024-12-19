import {
  highlightMatchingLinks,
  interceptLinks,
  loadPage,
  navigate,
  prefetchLinks,
  startLoading,
  stopLoading,
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
  navigate,
  startLoading,
  stopLoading,
};
