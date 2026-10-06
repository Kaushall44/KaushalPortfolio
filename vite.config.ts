import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { handleShorten } from './api/_shorten.js';

function routeTools(req: { url?: string }, _res: unknown, next: () => void) {
  if (req.url && /^\/tools\/?(?:\?|$)/.test(req.url)) {
    req.url = req.url.replace(/^\/tools\/?(?=\?|$)/, '/tools/index.html');
  }
  next();
}

// Local dev mock for /api/chat - simulates SSE streaming
function apiMockPlugin(): Plugin {
  return {
    name: "api-mock",
    configurePreviewServer(server) {
      server.middlewares.use(routeTools);
    },
    configureServer(server) {
      server.middlewares.use(routeTools);
      server.middlewares.use('/api/shorten', handleShorten);
      server.middlewares.use("/api/chat", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk: string) => (body += chunk));
        req.on("end", () => {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");

          const words =
            "AI chat works in production. Deploy to Vercel with OPENAI_API_KEY to enable real responses.".split(
              " "
            );
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const content = (i === 0 ? "" : " ") + words[i];
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
              i++;
            } else {
              res.write("data: [DONE]\n\n");
              res.end();
              clearInterval(interval);
            }
          }, 50);
        });
      });
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [react(), apiMockPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: { home: 'index.html', tools: 'tools/index.html' },
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const path = id.replace(/\\/g, '/');
          if (path.includes('commonjsHelpers.js')) return 'react-core';
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'react-core';
          if (path.includes('/node_modules/three/')) return 'three';
          if (path.includes('/node_modules/@react-three/')) return 'react-three';
          if (/\/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(path)) return 'motion';
          if (path.includes('/node_modules/gsap/')) return 'gsap';
          if (path.includes('/node_modules/@mediapipe/')) return 'mediapipe';
        },
      },
    },
  },
});
