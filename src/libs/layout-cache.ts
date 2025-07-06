import { CONFIG } from "./config";

interface CacheEntry {
  document: Document;
  timestamp: number;
  accessCount: number;
}

export class LayoutCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = CONFIG.CACHE_MAX_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Obtiene un documento del cache
   */
  get(url: string): Document | null {
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

    return entry.document.cloneNode(true) as Document;
  }

  /**
   * Almacena un documento en el cache
   */
  set(url: string, document: Document): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      document: document.cloneNode(true) as Document,
      timestamp: Date.now(),
      accessCount: 1,
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
  } {
    const keys = Array.from(this.cache.keys());
    const entries = Array.from(this.cache.values());

    const oldestEntry =
      entries.length > 0
        ? keys[
            entries.reduce(
              (min, entry, index) =>
                entry.timestamp < entries[min].timestamp ? index : min,
              0
            )
          ]
        : null;

    const mostAccessed =
      entries.length > 0
        ? keys[
            entries.reduce(
              (max, entry, index) =>
                entry.accessCount > entries[max].accessCount ? index : max,
              0
            )
          ]
        : null;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Implementar tracking de hit rate
      keys,
      oldestEntry,
      mostAccessed,
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
    loader: (url: string) => Promise<Document>
  ): Promise<void> {
    const promises = urls.map(async (url) => {
      if (!this.has(url)) {
        try {
          const document = await loader(url);
          this.set(url, document);
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
}
