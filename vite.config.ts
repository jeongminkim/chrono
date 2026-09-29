import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/chrono/",
  plugins: [react()],
  // 개발 중 API와 미디어는 `npm start`(:3000)가 제공한다.
  server: { proxy: { "/chrono/api": "http://localhost:3000" } },
});
