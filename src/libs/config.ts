// Configuración centralizada para el sistema de layouts
export const CONFIG = {
  ERROR_PAGE_URL: "/_error.html",
  CACHE_NAME: "papel-fetch",

  // Eventos personalizados
  EVENTS: {
    PAGE_LOADED: "page-loaded",
    PAGE_LOAD_ERROR: "page-load-error",
    LAYOUT_RENDERED: "layout-rendered",
  },

  // Selectores CSS
  SELECTORS: {
    LAYOUT_LINKS: "link[data-layout], link[rel='layout']",
    SLOTS: "slot, [slot], [data-slot]",
  },

  // Configuración de prefetch
  PREFETCH: {
    ENABLED: true,
  },

  // Configuración de view transitions
  VIEW_TRANSITIONS: {
    ENABLED: true,
  },
} as const;
