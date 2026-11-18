import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: path.resolve(import.meta.dirname, 'web'),
  plugins: [react()],
  resolve: {
    alias: { '@/lib': path.resolve(import.meta.dirname, 'lib') },
  },
  server: {
    // Visualizations import solutions/*/vis.ts, which live outside the web root.
    fs: { allow: [import.meta.dirname] },
    // Solution runs are handled by our own watcher; don't reload the app when they change.
    watch: { ignored: ['**/progress.json', '**/progress.json.tmp', '**/.local/**'] },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'web/index.html'),
        vis: path.resolve(import.meta.dirname, 'web/vis.html'),
      },
    },
  },
})
