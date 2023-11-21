/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
