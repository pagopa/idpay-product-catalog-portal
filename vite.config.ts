import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/elenco-informatico-elettrodomestici/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    'process.env': {}
  }
})
