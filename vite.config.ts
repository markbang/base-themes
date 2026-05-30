import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

function manualChunks(id: string) {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('/@base-ui/react/')) return 'vendor-base-ui'
  if (id.includes('/lucide-react/')) return 'vendor-icons'
  if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'vendor-react'
  return 'vendor'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
