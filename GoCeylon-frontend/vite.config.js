import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'; // Import path module

// Security headers for the pages Vite serves (VULN-08): the app must not be
// framed by other sites (clickjacking) and responses must not be MIME-sniffed.
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Increase limit to 5MB (adjust as needed)
      },
      manifest: {
        name: 'My React Vite PWA',
        short_name: 'ReactPWA',
        description: 'My React Vite Progressive Web App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Add this line
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    protocol: "ws",
    headers: securityHeaders,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    headers: securityHeaders,
  },
});
