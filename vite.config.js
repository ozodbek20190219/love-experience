import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8787' } },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Three.js alohida fayl: faqat 3D sahifalar ochilganda yuklanadi (bosh sahifa yengil).
        manualChunks: id => (/node_modules[\\/](three|@react-three)[\\/]/.test(id) ? 'three' : undefined),
      },
    },
  },
});
