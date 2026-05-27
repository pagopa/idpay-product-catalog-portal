import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mockedBasePath =
  process.env.VITE_BASE_PATH ||
  process.env.BASE_PATH ||
  '/elenco-informatico-elettrodomestici/'

export default defineConfig({
  base: mockedBasePath,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    'process.env': {}
  }
})
