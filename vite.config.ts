import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'sanity-vendor': ['@sanity/client'],
          'portable-text': ['@portabletext/react', '@portabletext/types'],
          
          // Feature chunks
          'admin-features': [
            'src/features/admin/index.ts',
            'src/features/admin/UserDetail.tsx',
            'src/features/admin/UserList.tsx'
          ],
          'course-features': [
            'src/features/courses/index.ts',
            'src/features/courses/CourseDetail.tsx',
            'src/features/courses/LessonDetail.tsx'
          ]
        }
      }
    },
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ]
  },
  // Enable compression
  server: {
    compress: true
  },
});
