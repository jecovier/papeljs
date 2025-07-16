import { loadPage } from "@/libs/handler";
import { api } from "@/libs/api";

window.addEventListener(
  "load",
  () => {
    loadPage();
  },
  { once: true },
);

// @ts-expect-error - Papel es una variable global
window.papel = api;
