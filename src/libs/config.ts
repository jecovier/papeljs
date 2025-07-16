// Configuración centralizada para el sistema de layouts
export const CONFIG = {
  // Cache
  CACHE_MAX_SIZE: 50, // Máximo número de layouts en cache

  // Eventos personalizados
  EVENTS: {
    PAGE_LOADED: "page-loaded",
    PAGE_LOAD_ERROR: "page-load-error",
    LAYOUT_RENDERED: "layout-rendered",
    COMPRESSION_STATS: "compression-stats",
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

  // Configuración de compresión
  COMPRESSION: {
    ENABLED: true,
    MIN_SIZE_TO_COMPRESS: 1024, // Solo comprimir documentos mayores a 1KB
    ENABLE_STATS: true, // Habilitar estadísticas de compresión
  },
} as const;
