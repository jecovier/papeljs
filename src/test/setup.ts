// Test setup file for Vitest with jsdom
import { beforeAll, afterEach, afterAll, vi } from "vitest";

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
  },
  writable: true,
});

// Mock history API
Object.defineProperty(window, "history", {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
  writable: true,
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});
