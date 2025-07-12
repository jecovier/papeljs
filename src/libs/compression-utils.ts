import {
  getCacheStats,
  getCompressionStats,
  isCompressionAvailable,
} from "./handler";
import { CONFIG } from "./config";

/**
 * Formatea bytes a una representación legible
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Formatea tiempo en milisegundos a una representación legible
 */
export function formatTime(ms: number): string {
  if (ms < 1) return "< 1ms";
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Calcula el porcentaje de ahorro de espacio
 */
export function calculateSpaceSavings(
  original: number,
  compressed: number
): number {
  if (original === 0) return 0;
  return ((original - compressed) / original) * 100;
}

/**
 * Muestra las estadísticas de compresión en la consola
 */
export function logCompressionStats(): void {
  if (!CONFIG.COMPRESSION.ENABLE_STATS) {
    console.log("Compression stats are disabled in configuration");
    return;
  }

  const cacheStats = getCacheStats();
  const compressionStats = getCompressionStats();
  const compressionAvailable = isCompressionAvailable();

  console.group("📊 PapelJS Compression Statistics");

  console.log(
    "🔧 Compression Status:",
    compressionAvailable ? "✅ Available" : "❌ Not Available"
  );

  if (compressionAvailable) {
    console.group("📈 Memory Usage");
    console.log("Total Cache Size:", formatBytes(cacheStats.memoryUsage.total));
    console.log(
      "Compressed Size:",
      formatBytes(cacheStats.memoryUsage.compressed)
    );
    console.log(
      "Uncompressed Size:",
      formatBytes(cacheStats.memoryUsage.uncompressed)
    );
    console.log("Space Saved:", formatBytes(cacheStats.memoryUsage.spaceSaved));
    console.log(
      "Savings Percentage:",
      `${calculateSpaceSavings(
        cacheStats.memoryUsage.uncompressed,
        cacheStats.memoryUsage.compressed
      ).toFixed(1)}%`
    );
    console.groupEnd();

    console.group("⚡ Performance Metrics");
    console.log("Compression Count:", compressionStats.compressionCount);
    console.log("Decompression Count:", compressionStats.decompressionCount);
    console.log(
      "Average Compression Time:",
      formatTime(compressionStats.averageCompressionTime)
    );
    console.log(
      "Average Decompression Time:",
      formatTime(compressionStats.averageDecompressionTime)
    );
    console.log(
      "Overall Compression Ratio:",
      `${(compressionStats.compressionRatio * 100).toFixed(1)}%`
    );
    console.groupEnd();

    console.group("🎯 Cache Information");
    console.log("Cache Entries:", cacheStats.size);
    console.log("Max Cache Size:", cacheStats.maxSize);
    console.log("Most Accessed:", cacheStats.mostAccessed || "None");
    console.log("Oldest Entry:", cacheStats.oldestEntry || "None");
    console.groupEnd();
  } else {
    console.log("⚠️ Compression is not available in this browser");
    console.log(
      "💡 Consider using a modern browser with Web Compression API support"
    );
  }

  console.groupEnd();
}

/**
 * Crea un elemento HTML para mostrar las estadísticas
 */
export function createCompressionStatsElement(): HTMLElement {
  const container = document.createElement("div");
  container.className = "papeljs-compression-stats";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  const updateStats = () => {
    if (!CONFIG.COMPRESSION.ENABLE_STATS) {
      container.innerHTML = "<div>Compression stats disabled</div>";
      return;
    }

    const cacheStats = getCacheStats();
    const compressionStats = getCompressionStats();
    const compressionAvailable = isCompressionAvailable();

    if (!compressionAvailable) {
      container.innerHTML = `
        <div style="color: #ff6b6b;">⚠️ Compression not available</div>
        <div style="font-size: 10px; margin-top: 5px;">Use modern browser</div>
      `;
      return;
    }

    const savingsPercent = calculateSpaceSavings(
      cacheStats.memoryUsage.uncompressed,
      cacheStats.memoryUsage.compressed
    );

    container.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; color: #4ecdc4;">📊 Compression Stats</div>
      
      <div style="margin-bottom: 8px;">
        <div style="color: #95a5a6;">Memory Usage:</div>
        <div>Total: ${formatBytes(cacheStats.memoryUsage.total)}</div>
        <div>Saved: ${formatBytes(
          cacheStats.memoryUsage.spaceSaved
        )} (${savingsPercent.toFixed(1)}%)</div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="color: #95a5a6;">Performance:</div>
        <div>Compressed: ${compressionStats.compressionCount}</div>
        <div>Decompressed: ${compressionStats.decompressionCount}</div>
        <div>Avg Time: ${formatTime(
          compressionStats.averageCompressionTime
        )}</div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="color: #95a5a6;">Cache:</div>
        <div>Entries: ${cacheStats.size}/${cacheStats.maxSize}</div>
        <div>Ratio: ${(compressionStats.compressionRatio * 100).toFixed(
          1
        )}%</div>
      </div>
      
      <div style="font-size: 10px; color: #7f8c8d; text-align: center; margin-top: 10px;">
        PapelJS Compression
      </div>
    `;
  };

  // Actualizar estadísticas cada 2 segundos
  updateStats();
  setInterval(updateStats, 2000);

  return container;
}

/**
 * Inicializa el panel de estadísticas de compresión
 */
export function initCompressionStatsPanel(): void {
  if (!CONFIG.COMPRESSION.ENABLE_STATS) return;

  // Solo mostrar cuando se solicite explícitamente
  const shouldShow = window.location.search.includes("debug=compression");

  if (shouldShow) {
    const statsPanel = createCompressionStatsElement();
    document.body.appendChild(statsPanel);
  }
}

/**
 * Escucha eventos de estadísticas de compresión
 */
export function listenToCompressionEvents(): void {
  if (!CONFIG.COMPRESSION.ENABLE_STATS) return;

  document.addEventListener(CONFIG.EVENTS.COMPRESSION_STATS, (event: any) => {
    const { stats } = event.detail;

    // Log automático cuando se alcanzan hitos
    if (stats.compressionCount % 10 === 0 && stats.compressionCount > 0) {
      console.log(`🎉 Compressed ${stats.compressionCount} documents!`);
      console.log(`💾 Total space saved: ${formatBytes(stats.spaceSaved)}`);
    }
  });
}

/**
 * Exporta las estadísticas como JSON
 */
export function exportCompressionStats(): string {
  const cacheStats = getCacheStats();
  const compressionStats = getCompressionStats();

  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      cache: cacheStats,
      compression: compressionStats,
      browser: {
        userAgent: navigator.userAgent,
        compressionAvailable: isCompressionAvailable(),
      },
    },
    null,
    2
  );
}
