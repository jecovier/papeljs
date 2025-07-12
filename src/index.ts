import { loadPage } from "@/libs/handler";
import { api } from "@/libs/api";
import {
  initCompressionStatsPanel,
  listenToCompressionEvents,
} from "@/libs/compression-utils";

window.addEventListener(
  "load",
  () => {
    loadPage();

    // Inicializar utilidades de compresión
    initCompressionStatsPanel();
    listenToCompressionEvents();
  },
  { once: true },
);

// @ts-expect-error - Papel es una variable global
window.papel = api;
