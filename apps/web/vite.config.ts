import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { codeInspectorPlugin } from 'code-inspector-plugin';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // 加载根目录和当前目录的环境变量
  const env = loadEnv(mode, path.resolve(__dirname, "../../"), "");
  const serverPort = env.PORT || "300";
  const webPort = parseInt(env.VITE_PORT || "5173");

  return {
    plugins: [
      react(),
      tailwindcss(),
      codeInspectorPlugin({
        bundler: 'vite',
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: '0.0.0.0',
      port: webPort,
      proxy: {
        "/api": {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
