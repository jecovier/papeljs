// Configuración centralizada para el sistema de layouts
export const CONFIG = {
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 segundos
  CACHE_MAX_SIZE: 50, // Máximo número de layouts en cache

  // Eventos personalizados
  EVENTS: {
    PAGE_LOADED: "page-loaded",
    PAGE_LOAD_ERROR: "page-load-error",
    LAYOUT_RENDERED: "layout-rendered",
    CACHE_CLEARED: "cache-cleared",
  },

  // Selectores CSS
  SELECTORS: {
    LAYOUT_LINKS: "link[data-layout], link[rel='layout']",
    SLOTS: "slot, [slot], [data-slot]",
    PRESERVE_ELEMENTS: "[data-preserve]",
  },

  // Configuración de prefetch
  PREFETCH: {
    ENABLED: true,
    DELAY: 100, // ms antes de iniciar prefetch
    MAX_CONCURRENT: 3, // máximo de requests concurrentes
  },

  // Configuración de view transitions
  VIEW_TRANSITIONS: {
    ENABLED: true,
    FALLBACK_DURATION: 300, // ms para fallback si no hay view transitions
  },
} as const;

// Tipos para la configuración
export type ConfigKey = keyof typeof CONFIG;
export type EventName = (typeof CONFIG.EVENTS)[keyof typeof CONFIG.EVENTS];
