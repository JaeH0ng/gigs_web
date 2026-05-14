import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildVersion = Date.now().toString()
const basePath = '/gigs_web/'

function buildVersionPlugin() {
  return {
    name: 'build-version-plugin',
    transformIndexHtml(html) {
      return html
        .replace(/__APP_VERSION__/g, buildVersion)
        .replace(/__BASE_PATH__/g, basePath)
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(
          {
            version: buildVersion,
          },
          null,
          2,
        ),
      })
    },
  }
}

export default defineConfig({
  base: basePath,
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith('.css'))) {
            return 'assets/index.css'
          }

          return 'assets/[name][extname]'
        },
      },
    },
  },
  plugins: [react(), buildVersionPlugin()],
})
