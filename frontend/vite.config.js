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
        target: 'http://127.0.0.1:50038',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Request headers:', proxyReq.getHeaders());
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              console.log('Request body:', bodyData);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            console.log('Response headers:', proxyRes.headers);
            let body = '';
            proxyRes.on('data', (chunk) => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              console.log('Response body:', body);
              if (body && body.trim() !== '' && proxyRes.statusCode !== 304) {
                try {
                  JSON.parse(body);
                } catch (e) {
                  console.error('Invalid JSON response:', e);
                  console.error('Cannot fix response body as proxyRes.end is not a function');
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
