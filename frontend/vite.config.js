import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import { componentTagger } from "lovable-tagger";
import { Buffer } from 'buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:55001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('【代理调试】原始路径:', path);
          const rewritten = path.replace(/^\/api/, '');
          console.log('【代理调试】重写后路径:', rewritten);
          return rewritten;
        },
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('【代理调试】代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('【代理调试】发送请求到目标:', req.method, req.url);
            console.log('【代理调试】请求头:', proxyReq.getHeaders());
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              console.log('【代理调试】请求体:', bodyData);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('【代理调试】收到目标响应:', proxyRes.statusCode, req.url);
            console.log('【代理调试】响应头:', proxyRes.headers);
            let body = '';
            proxyRes.on('data', (chunk) => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              console.log('【代理调试】响应体:', body);
              if (body && body.trim() !== '' && proxyRes.statusCode !== 304) {
                try {
                  JSON.parse(body);
                } catch (e) {
                  console.error('【代理调试】无效的JSON响应:', e);
                  console.error('【代理调试】无法修复响应体，因为proxyRes.end不是函数');
                }
              }
            });
          });
        }
      }
    }
  },
  plugins: [
    react({
      include: "**/*.{js,jsx,ts,tsx}",
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
}));
