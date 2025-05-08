import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@blocks': path.resolve(__dirname, './src/blocks'),
      '@editor': path.resolve(__dirname, './src/editor'),
      '@core': path.resolve(__dirname, './src/core'),
      '@email-builder': path.resolve(__dirname, './src/email-builder'),
      '@configuration': path.resolve(__dirname, './src/configuration')
    }
  }
});
