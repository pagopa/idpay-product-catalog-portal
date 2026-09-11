import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_INITIATIVE': JSON.stringify('bonusdecoder'),
  },
  test: {
    pool: 'threads',
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        'src/config/**/adapter.ts',
        'src/utils/constants.ts'
      ],
      thresholds: {
        lines: 90,
        functions: 90,
      branches: 89,
        statements: 90
      }
    }
  }
});
