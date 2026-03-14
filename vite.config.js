import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  base: '/',
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  }
})
