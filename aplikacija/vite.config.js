import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:6000",
        changeOrigin: true,
        secure: false,
      },
      "/LogEmployeeEvent": {
        target: "https://dquo7ztzfd.execute-api.eu-north-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/LogEmployeeEvent/, "/LogEmployeeEvent"),
      },
    },
  },
});
