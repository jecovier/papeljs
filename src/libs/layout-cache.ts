import { CONFIG } from "./config";
import {
  LayoutCompression,
  CompressedData,
  CompressionStats,
} from "./layout-compression";

interface CacheEntry {
  document: Document | CompressedData;
  timestamp: number;
  accessCount: number;
  isCompressed: boolean;
}

export class LayoutCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private compression: LayoutCompression;

  constructor(maxSize: number = CONFIG.CACHE_MAX_SIZE) {
    this.maxSize = maxSize;
    this.compression = new LayoutCompression();
  }

  /**
   * Obtiene un documento del cache
   */
  async get(url: string): Promise<Document | null> {
    const entry = this.cache.get(url);

    if (!entry) {
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.timestamp = Date.now();

    // Mover al final (LRU)
    this.cache.delete(url);
    this.cache.set(url, entry);

    // Descomprimir si es necesario
    if (entry.isCompressed) {
      try {
        const decompressed = await this.compression.decompressDocument(
          entry.document as CompressedData,
        );
        return decompressed.cloneNode(true) as Document;
      } catch (error) {
        console.error(`Error decompressing cached document for ${url}:`, error);
        // Si falla la descompresión, eliminar la entrada del cache
        this.cache.delete(url);
        return null;
      }
    }

    return (entry.document as Document).cloneNode(true) as Document;
  }

  /**
   * Almacena un documento en el cache
   */
  async set(url: string, document: Document): Promise<void> {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Comprimir el documento si está habilitado
    let compressedDocument: Document | CompressedData;
    let isCompressed = false;

    try {
      compressedDocument = await this.compression.compressDocument(document);
      isCompressed = "compressed" in compressedDocument;
    } catch (error) {
      console.warn(
        `Compression failed for ${url}, storing uncompressed:`,
        error,
      );
      compressedDocument = document;
      isCompressed = false;
    }

    const entry: CacheEntry = {
      document: compressedDocument,
      timestamp: Date.now(),
      accessCount: 1,
      isCompressed,
    };

    this.cache.set(url, entry);
  }

  /**
   * Verifica si una URL está en el cache
   */
  has(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Elimina una entrada específica del cache
   */
  delete(url: string): boolean {
    return this.cache.delete(url);
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
    oldestEntry: string | null;
    mostAccessed: string | null;
    compressionStats: CompressionStats;
    memoryUsage: {
      total: number;
      compressed: number;
      uncompressed: number;
      spaceSaved: number;
    };
  } {
    const keys = Array.from(this.cache.keys());
    const entries = Array.from(this.cache.values());

    const oldestEntry =
      entries.length > 0
        ? keys[
            entries.reduce(
              (min, entry, index) =>
                entry.timestamp < entries[min].timestamp ? index : min,
              0,
            )
          ]
        : null;

    const mostAccessed =
      entries.length > 0
        ? keys[
            entries.reduce(
              (max, entry, index) =>
                entry.accessCount > entries[max].accessCount ? index : max,
              0,
            )
          ]
        : null;

    // Calcular uso de memoria
    let totalSize = 0;
    let compressedSize = 0;
    let uncompressedSize = 0;

    for (const entry of entries) {
      const sizeInfo = this.compression.getSizeInfo(entry.document);
      totalSize += sizeInfo.size;

      if (entry.isCompressed && sizeInfo.originalSize) {
        compressedSize += sizeInfo.size;
        uncompressedSize += sizeInfo.originalSize;
      } else {
        uncompressedSize += sizeInfo.size;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Implementar tracking de hit rate
      keys,
      oldestEntry,
      mostAccessed,
      compressionStats: this.compression.getStats(),
      memoryUsage: {
        total: totalSize,
        compressed: compressedSize,
        uncompressed: uncompressedSize,
        spaceSaved: uncompressedSize - compressedSize,
      },
    };
  }

  /**
   * Elimina las entradas menos usadas recientemente
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    // Encontrar la entrada más antigua
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Precalienta el cache con URLs específicas
   */
  async prewarm(
    urls: string[],
    loader: (url: string) => Promise<Document>,
  ): Promise<void> {
    const promises = urls.map(async (url) => {
      if (!this.has(url)) {
        try {
          const document = await loader(url);
          await this.set(url, document);
        } catch (error) {
          console.warn(`Failed to prewarm cache for ${url}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  /**
   * Limpia entradas antiguas basadas en tiempo
   */
  cleanup(maxAge: number = 5 * 60 * 1000): void {
    // 5 minutos por defecto
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtiene las estadísticas de compresión
   */
  getCompressionStats() {
    return this.compression.getStats();
  }

  /**
   * Verifica si la compresión está disponible
   */
  isCompressionAvailable(): boolean {
    return this.compression.isCompressionAvailable();
  }

  /**
   * Optimiza el cache comprimiendo entradas no comprimidas
   */
  async optimize(): Promise<void> {
    const entries = Array.from(this.cache.entries());

    for (const [url, entry] of entries) {
      if (!entry.isCompressed && entry.document instanceof Document) {
        try {
          const compressed = await this.compression.compressDocument(
            entry.document,
          );
          if ("compressed" in compressed) {
            entry.document = compressed;
            entry.isCompressed = true;
          }
        } catch (error) {
          console.warn(`Failed to compress cached document for ${url}:`, error);
        }
      }
    }
  }
}
