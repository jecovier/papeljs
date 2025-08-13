import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import fs from "fs";

function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".html")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(path.resolve(__dirname, "src")).reduce(
  (entries, file) => {
    const name = path
      .relative(path.resolve(__dirname, "src"), file)
      .replace(/\\/g, "/")
      .replace(/\.html$/, "");
    entries[name] = file;
    return entries;
  },
  {},
);

export default defineConfig({
  root: "src",
  base: "/papeljs",
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "../pages",
    emptyOutDir: true,
    minify: "terser",
    rollupOptions: {
      input: htmlFiles,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      module: true,
      output: {
        comments: false,
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@@", replacement: path.resolve(__dirname) },
    ],
  },
});
