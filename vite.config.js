import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor':     ['lucide-react', 'framer-motion'],
                    'supabase':      ['@supabase/supabase-js'],
                },
            },
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    }
})
