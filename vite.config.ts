import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '100.102.98.124', // Autorise l'accès depuis Docker
    port: 5173,
  }
});
