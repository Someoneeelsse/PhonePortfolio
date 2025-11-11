import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "stats.html",
      template: "treemap", // options: sunburst, network, treemap
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  assetsInclude: ["**/*.glsl"],
  server: {
    proxy: {
      "/api/metno": {
        target: "https://api.met.no",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/metno/, ""),
        configure: (proxy) => {
          // Use type assertion to access http-proxy-middleware API
          (proxy as any).on("proxyReq", (proxyReq: any) => {
            // Add required User-Agent header for MET Norway API
            proxyReq.setHeader(
              "User-Agent",
              "WeatherApp/1.0 (someoneelssesmainportfolio)"
            );
          });
        },
      },
    },
  },
});
