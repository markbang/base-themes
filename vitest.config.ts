import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'https://base-themes.test/',
      },
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
