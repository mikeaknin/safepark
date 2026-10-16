import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleCrimesApi } from './src/api/crimesHandler';
import { handleParkingApi } from './src/api/parkingHandler';

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/crimes')) {
          await handleCrimesApi(req, res);
          return;
        }
        if (req.url?.startsWith('/api/parking')) {
          await handleParkingApi(req, res);
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
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
