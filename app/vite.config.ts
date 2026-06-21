import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /<repo>/, so assets need that base.
// Elsewhere (local dev, Vercel/Netlify) the base stays '/'.
const base = process.env.GITHUB_PAGES === 'true' ? '/cosmonodes/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
