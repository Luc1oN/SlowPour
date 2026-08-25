import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const entry = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      // One real HTML file per top-level route. GitHub Pages then serves
      // /events and /about with a genuine 200 and their own preview tags,
      // instead of a 404 that JavaScript has to rescue. Deeper routes
      // (/app/whiskey/123) still fall back to public/404.html.
      input: {
        main: entry('./index.html'),
        events: entry('./events/index.html'),
        about: entry('./about/index.html'),
        app: entry('./app/index.html'),
      },
    },
  },
})
