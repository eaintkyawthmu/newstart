// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["lucide-react"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "sanity-vendor": ["@sanity/client"],
          "portable-text": ["@portabletext/react", "@portabletext/types"],
          // Feature chunks
          "admin-features": [
            "src/features/admin/index.ts",
            "src/features/admin/UserDetail.tsx",
            "src/features/admin/UserList.tsx"
          ],
          "course-features": [
            "src/features/courses/index.ts",
            "src/features/courses/CourseDetail.tsx",
            "src/features/courses/LessonDetail.tsx"
          ]
        }
      }
    },
    // Optimize bundle size
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1e3
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query"
    ]
  },
  // Enable compression
  server: {
    compress: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIGJhc2U6ICcvJyxcbiAgYnVpbGQ6IHtcbiAgICAvLyBFbmFibGUgY29kZSBzcGxpdHRpbmdcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gVmVuZG9yIGNodW5rc1xuICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICdyb3V0ZXItdmVuZG9yJzogWydyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgJ3F1ZXJ5LXZlbmRvcic6IFsnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgICAgICAgJ3N1cGFiYXNlLXZlbmRvcic6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgJ3Nhbml0eS12ZW5kb3InOiBbJ0BzYW5pdHkvY2xpZW50J10sXG4gICAgICAgICAgJ3BvcnRhYmxlLXRleHQnOiBbJ0Bwb3J0YWJsZXRleHQvcmVhY3QnLCAnQHBvcnRhYmxldGV4dC90eXBlcyddLFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIEZlYXR1cmUgY2h1bmtzXG4gICAgICAgICAgJ2FkbWluLWZlYXR1cmVzJzogW1xuICAgICAgICAgICAgJ3NyYy9mZWF0dXJlcy9hZG1pbi9pbmRleC50cycsXG4gICAgICAgICAgICAnc3JjL2ZlYXR1cmVzL2FkbWluL1VzZXJEZXRhaWwudHN4JyxcbiAgICAgICAgICAgICdzcmMvZmVhdHVyZXMvYWRtaW4vVXNlckxpc3QudHN4J1xuICAgICAgICAgIF0sXG4gICAgICAgICAgJ2NvdXJzZS1mZWF0dXJlcyc6IFtcbiAgICAgICAgICAgICdzcmMvZmVhdHVyZXMvY291cnNlcy9pbmRleC50cycsXG4gICAgICAgICAgICAnc3JjL2ZlYXR1cmVzL2NvdXJzZXMvQ291cnNlRGV0YWlsLnRzeCcsXG4gICAgICAgICAgICAnc3JjL2ZlYXR1cmVzL2NvdXJzZXMvTGVzc29uRGV0YWlsLnRzeCdcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIE9wdGltaXplIGJ1bmRsZSBzaXplXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIEdlbmVyYXRlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmdcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgLy8gU2V0IGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgIGluY2x1ZGU6IFtcbiAgICAgICdyZWFjdCcsXG4gICAgICAncmVhY3QtZG9tJyxcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcbiAgICAgICdAdGFuc3RhY2svcmVhY3QtcXVlcnknXG4gICAgXVxuICB9LFxuICAvLyBFbmFibGUgY29tcHJlc3Npb25cbiAgc2VydmVyOiB7XG4gICAgY29tcHJlc3M6IHRydWVcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQTtBQUFBLElBRUwsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUNyQyxpQkFBaUIsQ0FBQyxrQkFBa0I7QUFBQSxVQUNwQyxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxVQUN4QyxhQUFhLENBQUMsY0FBYztBQUFBLFVBQzVCLG1CQUFtQixDQUFDLHVCQUF1QjtBQUFBLFVBQzNDLGlCQUFpQixDQUFDLGdCQUFnQjtBQUFBLFVBQ2xDLGlCQUFpQixDQUFDLHVCQUF1QixxQkFBcUI7QUFBQTtBQUFBLFVBRzlELGtCQUFrQjtBQUFBLFlBQ2hCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFdBQVc7QUFBQTtBQUFBLElBRVgsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsSUFDeEIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixVQUFVO0FBQUEsRUFDWjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
