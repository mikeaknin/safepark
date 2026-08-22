import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  // @ts-ignore
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
