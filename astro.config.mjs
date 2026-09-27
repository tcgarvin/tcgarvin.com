import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.tcgarvin.com",
  // Keep the page HTML byte-for-byte predictable; the site ships its own frozen CSS.
  compressHTML: false,
});
