import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the custom domain ivanseed.co.uk, so assets live at the root.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
