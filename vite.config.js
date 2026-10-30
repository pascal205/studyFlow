import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Injecte la liste des fichiers buildés (JS/CSS hachés) dans le service worker
 * afin que l'application fonctionne hors ligne dès la première visite.
 */
function serviceWorkerAssets() {
  return {
    name: 'studyflow-service-worker-assets',
    apply: 'build',
    closeBundle() {
      const outDir = resolve('dist')
      const swPath = resolve(outDir, 'sw.js')
      if (!existsSync(swPath)) return

      const assetsDir = resolve(outDir, 'assets')
      const assets = existsSync(assetsDir)
        ? readdirSync(assetsDir)
            .filter((file) => /\.(js|css|woff2?|png|svg)$/i.test(file))
            .map((file) => `  './assets/${file}',`)
        : []

      const source = readFileSync(swPath, 'utf8')
      writeFileSync(swPath, source.replace('/* __PRECACHE_ASSETS__ */', assets.join('\n')))
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serviceWorkerAssets()],
  server: {
    port: 5173,
    open: true,
  },
})
