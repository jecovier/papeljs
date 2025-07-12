import { CONFIG } from "./config";
import { dispatchCustomEvent } from "./utils";

export interface CompressionStats {
  totalCompressed: number;
  totalUncompressed: number;
  compressionRatio: number;
  spaceSaved: number;
  compressionCount: number;
  decompressionCount: number;
  averageCompressionTime: number;
  averageDecompressionTime: number;
}

export interface CompressedData {
  compressed: Uint8Array;
  originalSize: number;
  compressedSize: number;
  compressionTime: number;
  timestamp: number;
}

export class LayoutCompression {
  private stats: CompressionStats = {
    totalCompressed: 0,
    totalUncompressed: 0,
    compressionRatio: 0,
    spaceSaved: 0,
    compressionCount: 0,
    decompressionCount: 0,
    averageCompressionTime: 0,
    averageDecompressionTime: 0,
  };

  /**
   * Comprime un documento HTML
   */
  async compressDocument(
    document: Document
  ): Promise<CompressedData | Document> {
    if (!CONFIG.COMPRESSION.ENABLED) {
      return document;
    }

    const htmlString = document.documentElement.outerHTML;
    const originalSize = new TextEncoder().encode(htmlString).length;

    // Solo comprimir si el tamaño es mayor al mínimo configurado
    if (originalSize < CONFIG.COMPRESSION.MIN_SIZE_TO_COMPRESS) {
      return document;
    }

    const startTime = performance.now();

    try {
      // Usar la Web Compression API si está disponible
      if (typeof CompressionStream !== "undefined") {
        return await this.compressWithWebAPI(
          htmlString,
          originalSize,
          startTime
        );
      } else {
        // Fallback a compresión simple con LZ-string
        return await this.compressWithFallback(
          htmlString,
          originalSize,
          startTime
        );
      }
    } catch (error) {
      console.warn("Compression failed, returning original document:", error);
      return document;
    }
  }

  /**
   * Comprime usando la Web Compression API (más eficiente)
   */
  private async compressWithWebAPI(
    htmlString: string,
    originalSize: number,
    startTime: number
  ): Promise<CompressedData> {
    const encoder = new TextEncoder();
    const data = encoder.encode(htmlString);

    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    const reader = cs.readable.getReader();

    writer.write(data);
    writer.close();

    const chunks: Uint8Array[] = [];
    let result;

    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }

    const compressedData = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      compressedData.set(chunk, offset);
      offset += chunk.length;
    }

    const compressionTime = performance.now() - startTime;
    const compressedSize = compressedData.length;

    this.updateStats(originalSize, compressedSize, compressionTime, 0);

    return {
      compressed: compressedData,
      originalSize,
      compressedSize,
      compressionTime,
      timestamp: Date.now(),
    };
  }

  /**
   * Comprime usando fallback simple (para navegadores sin Web Compression API)
   */
  private async compressWithFallback(
    htmlString: string,
    originalSize: number,
    startTime: number
  ): Promise<CompressedData> {
    // Implementación simple de compresión RLE (Run-Length Encoding)
    const compressed = this.simpleRLECompress(htmlString);
    const compressedSize = compressed.length;
    const compressionTime = performance.now() - startTime;

    this.updateStats(originalSize, compressedSize, compressionTime, 0);

    return {
      compressed: new TextEncoder().encode(compressed),
      originalSize,
      compressedSize,
      compressionTime,
      timestamp: Date.now(),
    };
  }

  /**
   * Compresión RLE simple como fallback
   */
  private simpleRLECompress(str: string): string {
    if (str.length === 0) return str;

    let result = "";
    let count = 1;
    let current = str[0];

    for (let i = 1; i < str.length; i++) {
      if (str[i] === current && count < 255) {
        count++;
      } else {
        if (count > 3) {
          result += `\x00${String.fromCharCode(count)}${current}`;
        } else {
          result += current.repeat(count);
        }
        current = str[i];
        count = 1;
      }
    }

    if (count > 3) {
      result += `\x00${String.fromCharCode(count)}${current}`;
    } else {
      result += current.repeat(count);
    }

    return result;
  }

  /**
   * Descomprime un documento
   */
  async decompressDocument(data: CompressedData | Document): Promise<Document> {
    if (this.isCompressedData(data)) {
      const startTime = performance.now();

      try {
        let htmlString: string;

        if (typeof DecompressionStream !== "undefined") {
          htmlString = await this.decompressWithWebAPI(data.compressed);
        } else {
          htmlString = this.decompressWithFallback(data.compressed);
        }

        const decompressionTime = performance.now() - startTime;
        this.updateStats(0, 0, 0, decompressionTime);

        const parser = new DOMParser();
        return parser.parseFromString(htmlString, "text/html");
      } catch (error) {
        console.error("Decompression failed:", error);
        throw error;
      }
    }

    return data as Document;
  }

  /**
   * Descomprime usando Web Compression API
   */
  private async decompressWithWebAPI(compressed: Uint8Array): Promise<string> {
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    writer.write(compressed);
    writer.close();

    const chunks: Uint8Array[] = [];
    let result;

    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }

    const decompressedData = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      decompressedData.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder().decode(decompressedData);
  }

  /**
   * Descomprime usando fallback
   */
  private decompressWithFallback(compressed: Uint8Array): string {
    const str = new TextDecoder().decode(compressed);
    let result = "";
    let i = 0;

    while (i < str.length) {
      if (str[i] === "\x00" && i + 2 < str.length) {
        const count = str.charCodeAt(i + 1);
        const char = str[i + 2];
        result += char.repeat(count);
        i += 3;
      } else {
        result += str[i];
        i++;
      }
    }

    return result;
  }

  /**
   * Verifica si los datos están comprimidos
   */
  private isCompressedData(
    data: CompressedData | Document
  ): data is CompressedData {
    return "compressed" in data && "originalSize" in data;
  }

  /**
   * Actualiza las estadísticas de compresión
   */
  private updateStats(
    originalSize: number,
    compressedSize: number,
    compressionTime: number,
    decompressionTime: number
  ): void {
    if (!CONFIG.COMPRESSION.ENABLE_STATS) return;

    if (originalSize > 0) {
      this.stats.totalCompressed += compressedSize;
      this.stats.totalUncompressed += originalSize;
      this.stats.compressionCount++;
      this.stats.spaceSaved += originalSize - compressedSize;

      // Actualizar tiempo promedio de compresión
      const totalCompressionTime =
        this.stats.averageCompressionTime * (this.stats.compressionCount - 1) +
        compressionTime;
      this.stats.averageCompressionTime =
        totalCompressionTime / this.stats.compressionCount;
    }

    if (decompressionTime > 0) {
      this.stats.decompressionCount++;
      const totalDecompressionTime =
        this.stats.averageDecompressionTime *
          (this.stats.decompressionCount - 1) +
        decompressionTime;
      this.stats.averageDecompressionTime =
        totalDecompressionTime / this.stats.decompressionCount;
    }

    if (this.stats.totalUncompressed > 0) {
      this.stats.compressionRatio =
        this.stats.totalCompressed / this.stats.totalUncompressed;
    }

    // Disparar evento con estadísticas actualizadas
    dispatchCustomEvent(CONFIG.EVENTS.COMPRESSION_STATS, {
      stats: this.getStats(),
    });
  }

  /**
   * Obtiene las estadísticas de compresión
   */
  getStats(): CompressionStats {
    return { ...this.stats };
  }

  /**
   * Resetea las estadísticas
   */
  resetStats(): void {
    this.stats = {
      totalCompressed: 0,
      totalUncompressed: 0,
      compressionRatio: 0,
      spaceSaved: 0,
      compressionCount: 0,
      decompressionCount: 0,
      averageCompressionTime: 0,
      averageDecompressionTime: 0,
    };
  }

  /**
   * Verifica si la compresión está disponible
   */
  isCompressionAvailable(): boolean {
    return (
      CONFIG.COMPRESSION.ENABLED &&
      (typeof CompressionStream !== "undefined" ||
        typeof TextEncoder !== "undefined")
    );
  }

  /**
   * Obtiene información sobre el tamaño de los datos
   */
  getSizeInfo(data: CompressedData | Document): {
    size: number;
    originalSize?: number;
    compressionRatio?: number;
    spaceSaved?: number;
  } {
    if (this.isCompressedData(data)) {
      return {
        size: data.compressedSize,
        originalSize: data.originalSize,
        compressionRatio: data.compressedSize / data.originalSize,
        spaceSaved: data.originalSize - data.compressedSize,
      };
    } else {
      const htmlString = data.documentElement.outerHTML;
      const size = new TextEncoder().encode(htmlString).length;
      return { size };
    }
  }
}
