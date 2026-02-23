import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/cbgipl-website/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        projects: resolve(__dirname, 'projects.html'),
        services: resolve(__dirname, 'services.html'),
        roadmap: resolve(__dirname, 'roadmap.html'),
        leadership: resolve(__dirname, 'leadership.html'),
        partners: resolve(__dirname, 'partners.html'),
        contact: resolve(__dirname, 'contact.html'),
      }
    }
  }
})
