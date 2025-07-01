import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        search: resolve(__dirname, 'search.html'),
        resources: resolve(__dirname, 'resources.html'),
        post: resolve(__dirname, 'post.html'),
        profile: resolve(__dirname, 'profile.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './js')
    }
  }
})