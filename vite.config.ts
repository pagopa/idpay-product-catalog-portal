import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

const basePath = process.env.VITE_BASE_PATH ?? ''

const initiativeKeyFromBasePath = basePath
  .split('/')
  .filter(Boolean)
  .pop()
  ?.split('-')
  .pop()

const initiative = process.env.VITE_INITIATIVE ?? initiativeKeyFromBasePath

const publicDir = resolve(__dirname, 'public')

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  publicDir,
  plugins: [
    react(),
    {
      name: 'include-only-selected-dataset',
      closeBundle() {
        if (!initiative) return

        const distDataDir = resolve(__dirname, 'dist', 'data')

        if (!fs.existsSync(distDataDir)) return

        const files = fs.readdirSync(distDataDir)

        for (const file of files) {
          if (!file.includes(initiative)) {
            fs.rmSync(resolve(distDataDir, file))
          }
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
