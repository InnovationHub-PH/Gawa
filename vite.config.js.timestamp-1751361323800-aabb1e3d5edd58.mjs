// vite.config.js
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        about: resolve(__vite_injected_original_dirname, "about.html"),
        search: resolve(__vite_injected_original_dirname, "search.html"),
        resources: resolve(__vite_injected_original_dirname, "resources.html"),
        post: resolve(__vite_injected_original_dirname, "post.html"),
        profile: resolve(__vite_injected_original_dirname, "profile.html")
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./js")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXG4gICAgICAgIGFib3V0OiByZXNvbHZlKF9fZGlybmFtZSwgJ2Fib3V0Lmh0bWwnKSxcbiAgICAgICAgc2VhcmNoOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NlYXJjaC5odG1sJyksXG4gICAgICAgIHJlc291cmNlczogcmVzb2x2ZShfX2Rpcm5hbWUsICdyZXNvdXJjZXMuaHRtbCcpLFxuICAgICAgICBwb3N0OiByZXNvbHZlKF9fZGlybmFtZSwgJ3Bvc3QuaHRtbCcpLFxuICAgICAgICBwcm9maWxlOiByZXNvbHZlKF9fZGlybmFtZSwgJ3Byb2ZpbGUuaHRtbCcpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL2pzJylcbiAgICB9XG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxTQUFTLGVBQWU7QUFEeEIsSUFBTSxtQ0FBbUM7QUFHekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUNyQyxPQUFPLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3RDLFFBQVEsUUFBUSxrQ0FBVyxhQUFhO0FBQUEsUUFDeEMsV0FBVyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLFFBQzlDLE1BQU0sUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDcEMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUM1QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsTUFBTTtBQUFBLElBQ2hDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
