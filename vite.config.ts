import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/geoserver": {
        target: "https://geoserver.geoshcatechnologies.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(/^\/geoserver/, ""),
      },
    },
  },
});
