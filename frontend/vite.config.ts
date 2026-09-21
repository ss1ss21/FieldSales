import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite'a React kütüphanelerini tekilleştirmesini (duplicate engellemeyi) emrediyoruz:
    dedupe: ['react', 'react-dom']
  }
})