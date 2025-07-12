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
    COMPRESSION_STATS: "compression-stats",
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

  // Configuración de compresión
  COMPRESSION: {
    ENABLED: true,
    MIN_SIZE_TO_COMPRESS: 1024, // Solo comprimir documentos mayores a 1KB
    COMPRESSION_LEVEL: 6, // Nivel de compresión (1-9, 9 = máxima compresión)
    ENABLE_STATS: true, // Habilitar estadísticas de compresión
  },
} as const;

// Tipos para la configuración
export type ConfigKey = keyof typeof CONFIG;
export type EventName = (typeof CONFIG.EVENTS)[keyof typeof CONFIG.EVENTS];
