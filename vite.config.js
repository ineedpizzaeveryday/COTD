import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: path.resolve(__dirname, 'node_modules/process/browser.js'), // ✅ pełna ścieżka
      crypto: 'crypto-browserify',
    },
  },
  define: {
    global: 'window',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'stream-browserify', 'crypto-browserify'],
  },
})
