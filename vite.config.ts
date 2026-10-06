import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'
import { getAppConfig } from './src/config/initiative'

export default defineConfig(({ mode, command, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const config = getAppConfig(
    process.env.VITE_INITIATIVE ?? env.VITE_INITIATIVE,
    command === 'serve' && !isPreview,
  )
  return {
    base: config.basePath,
    plugins: [react(), {
      name: 'include-only-selected-dataset',
      closeBundle() {
        const distDataDir = resolve(__dirname, 'dist', 'data')
        if (!fs.existsSync(distDataDir)) return
        for (const file of fs.readdirSync(distDataDir)) {
          if (file.startsWith('product_export_') && file.endsWith('.json') && file !== config.datasetFile) {
            fs.rmSync(resolve(distDataDir, file))
          }
        }
      },
    }],
    define: {
      'import.meta.env.VITE_INITIATIVE': JSON.stringify(config.initiativeName),
    },
    build: { outDir: 'dist', sourcemap: false },
  }
})
