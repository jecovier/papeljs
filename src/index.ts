import { loadPage } from "@/libs/handler";
import { api } from "@/libs/api";

window.addEventListener(
  "load",
  () => {
    loadPage();
  },
  { once: true }
);

// @ts-ignore
window.papel = api;
