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
          // console.log('[Proxy Debug] Original path:', path);
          const rewritten = path.replace(/^\/api/, '');
          // console.log('[Proxy Debug] Rewritten path:', rewritten);
          return rewritten;
        },
        configure: (proxy) => {
          proxy.on('error', (err) => {
            // console.log('[Proxy Debug] Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            // console.log('[Proxy Debug] Sending request to target:', req.method, req.url);
            // console.log('[Proxy Debug] Complete target URL:', proxyReq.path);
            // console.log('[Proxy Debug] Request headers:', proxyReq.getHeaders());
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              // console.log('[Proxy Debug] Request body:', bodyData);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            // console.log('[Proxy Debug] Received target response:', proxyRes.statusCode, req.url);
            // console.log('[Proxy Debug] Response headers:', proxyRes.headers);
            let body = '';
            proxyRes.on('data', (chunk) => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              // console.log('[Proxy Debug] Response body:', body);
              if (body && body.trim() !== '' && proxyRes.statusCode !== 304) {
                try {
                  JSON.parse(body);
                } catch (e) {
                  console.error('[Proxy Debug] Invalid JSON response:', e);
                  console.error('[Proxy Debug] Cannot fix response body because proxyRes.end is not a function');
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
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
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
