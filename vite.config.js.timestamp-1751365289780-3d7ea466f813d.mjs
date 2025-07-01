// vite.config.js
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  define: {
    // Ensure environment variables are available at build time
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || ""),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "")
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        about: resolve(__vite_injected_original_dirname, "about.html"),
        search: resolve(__vite_injected_original_dirname, "search.html"),
        resources: resolve(__vite_injected_original_dirname, "resources.html"),
        post: resolve(__vite_injected_original_dirname, "post.html"),
        profile: resolve(__vite_injected_original_dirname, "profile.html")
      },
      output: {
        // Ensure proper asset naming
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        // Ensure external dependencies are handled correctly
        manualChunks: {
          "pdfjs": ["pdfjs-dist"]
        }
      }
    },
    // Ensure all dependencies are bundled
    commonjsOptions: {
      include: [/node_modules/]
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./js")
    }
  },
  // Ensure proper base path for deployment
  base: "./"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGRlZmluZToge1xuICAgIC8vIEVuc3VyZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYXJlIGF2YWlsYWJsZSBhdCBidWlsZCB0aW1lXG4gICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX1NVUEFCQVNFX1VSTCc6IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfVVJMIHx8ICcnKSxcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVknOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZIHx8ICcnKVxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgICAgICBhYm91dDogcmVzb2x2ZShfX2Rpcm5hbWUsICdhYm91dC5odG1sJyksXG4gICAgICAgIHNlYXJjaDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzZWFyY2guaHRtbCcpLFxuICAgICAgICByZXNvdXJjZXM6IHJlc29sdmUoX19kaXJuYW1lLCAncmVzb3VyY2VzLmh0bWwnKSxcbiAgICAgICAgcG9zdDogcmVzb2x2ZShfX2Rpcm5hbWUsICdwb3N0Lmh0bWwnKSxcbiAgICAgICAgcHJvZmlsZTogcmVzb2x2ZShfX2Rpcm5hbWUsICdwcm9maWxlLmh0bWwnKVxuICAgICAgfSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBFbnN1cmUgcHJvcGVyIGFzc2V0IG5hbWluZ1xuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdJyxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICAvLyBFbnN1cmUgZXh0ZXJuYWwgZGVwZW5kZW5jaWVzIGFyZSBoYW5kbGVkIGNvcnJlY3RseVxuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAncGRmanMnOiBbJ3BkZmpzLWRpc3QnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBFbnN1cmUgYWxsIGRlcGVuZGVuY2llcyBhcmUgYnVuZGxlZFxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXVxuICAgIH0sXG4gICAgLy8gSW5jcmVhc2UgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0XG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vanMnKVxuICAgIH1cbiAgfSxcbiAgLy8gRW5zdXJlIHByb3BlciBiYXNlIHBhdGggZm9yIGRlcGxveW1lbnRcbiAgYmFzZTogJy4vJ1xufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLFNBQVMsZUFBZTtBQUR4QixJQUFNLG1DQUFtQztBQUd6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUE7QUFBQSxJQUVOLHFDQUFxQyxLQUFLLFVBQVUsUUFBUSxJQUFJLHFCQUFxQixFQUFFO0FBQUEsSUFDdkYsMENBQTBDLEtBQUssVUFBVSxRQUFRLElBQUksMEJBQTBCLEVBQUU7QUFBQSxFQUNuRztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUNyQyxPQUFPLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3RDLFFBQVEsUUFBUSxrQ0FBVyxhQUFhO0FBQUEsUUFDeEMsV0FBVyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLFFBQzlDLE1BQU0sUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDcEMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUM1QztBQUFBLE1BQ0EsUUFBUTtBQUFBO0FBQUEsUUFFTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQTtBQUFBLFFBRWhCLGNBQWM7QUFBQSxVQUNaLFNBQVMsQ0FBQyxZQUFZO0FBQUEsUUFDeEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxpQkFBaUI7QUFBQSxNQUNmLFNBQVMsQ0FBQyxjQUFjO0FBQUEsSUFDMUI7QUFBQTtBQUFBLElBRUEsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxNQUFNO0FBQUEsSUFDaEM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLE1BQU07QUFDUixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
