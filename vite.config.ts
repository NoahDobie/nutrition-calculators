import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Keeps `import ... from '@nutrition/core'` working now that core lives in src/core.
      '@nutrition/core': fileURLToPath(new URL('./src/core/index.ts', import.meta.url)),
    },
  },
});
