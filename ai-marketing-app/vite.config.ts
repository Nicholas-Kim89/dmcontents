import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/backend/**']
    },
    proxy: {
      '/auth': 'http://localhost:8000',
      '/projects': 'http://localhost:8000',
      '/teams': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/assets': 'http://localhost:8000',
      '/generate': 'http://localhost:8000',
      '/prompt': 'http://localhost:8000',
      '/campaign': 'http://localhost:8000',
      '/storage': 'http://localhost:8000',
    }
  }
})
