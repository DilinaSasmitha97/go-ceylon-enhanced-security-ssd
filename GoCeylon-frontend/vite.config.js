import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'; // Import path module

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
    hmr: {
      host: '192.168.8.112',
    },
    watch: {
      usePolling: true,
    },
  },
});
