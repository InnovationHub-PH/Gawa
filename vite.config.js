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
      },
      output: {
        // Ensure proper asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Ensure all dependencies are bundled
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './js')
    }
  },
  // Ensure proper base path for deployment
  base: './'
})