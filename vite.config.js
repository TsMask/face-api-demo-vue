import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  // 访问基础路径
  base: "/face-api-demo-vue",
  // 本地开发服务配置
  server: {
    port: 5173, // 端口
    host: false, // 暴露到网络地址
    open: false, // 完成后自动跳转浏览器打开
  },
  resolve: {
    // 配置路径别名
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [vue()],
});
