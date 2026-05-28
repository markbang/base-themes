import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const external = (id: string) =>
  id === 'react' ||
  id === 'react-dom' ||
  id === 'react/jsx-runtime' ||
  id === 'clsx' ||
  id === 'lucide-react' ||
  id.startsWith('@base-ui/react')

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'BaseThemes',
      formats: ['es'],
      fileName: () => 'base-themes.js',
    },
    rollupOptions: {
      external,
    },
  },
})
