import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 6573,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@blocks': path.resolve(__dirname, './src/blocks'),
      '@editor': path.resolve(__dirname, './src/editor'),
      '@core': path.resolve(__dirname, './src/core'),
      '@email-builder': path.resolve(__dirname, './src/email-builder'),
      '@sample': path.resolve(__dirname, './sample-templates'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
    }
  }
});
