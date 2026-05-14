import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from the local folder (where Cloud Build uploaded .env.production)
  const env = loadEnv(mode, '.', '');
  
  return {
    root: '.',
    define: {
      'process.env.CLOUD_PROJECT_NUMBER': JSON.stringify(env.CLOUD_PROJECT_NUMBER || process.env.CLOUD_PROJECT_NUMBER || ''),
      'process.env.CLIENT_ID': JSON.stringify(env.CLIENT_ID || process.env.CLIENT_ID || ''),
      'process.env.DEFAULT_BOARD_URL': JSON.stringify(env.DEFAULT_BOARD_URL || process.env.DEFAULT_BOARD_URL || '')
    },
    build: {
      outDir: 'dist/public',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        }
      }
    },
    server: {
      port: 3001
    }
  };
});
