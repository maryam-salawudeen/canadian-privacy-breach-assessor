import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import type { Plugin } from "vite";

// Production builds get a strict Content-Security-Policy: no external requests
// (no fonts, CDNs or analytics). Dev is left alone because React Fast Refresh
// injects an inline script.
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; " +
  "connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";

function contentSecurityPolicy(): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" }
    ]
  };
}

export default defineConfig({
  plugins: [
    react(),
    contentSecurityPolicy(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "Canadian Privacy Breach Assessor",
        short_name: "Breach Assessor",
        description:
          "Assess a privacy breach under PIPEDA, Quebec Law 25 and Alberta PIPA, draft notices and keep the breach record log. Runs offline; data stays on this device.",
        start_url: "/#assess",
        scope: "/",
        display: "standalone",
        background_color: "#0D1117",
        theme_color: "#151B23",
        categories: ["business", "productivity", "utilities"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html"
      }
    })
  ],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"]
  }
});
