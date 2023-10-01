import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react-swc'
import type { ProxyOptions } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_PORT, VITE_BASE_API_URL, VITE_MOCK_API_URL } =
    env as ImportMetaEnv

  const port = parseInt(VITE_PORT, 10) || 5173
  const proxy: Record<string, string | ProxyOptions> = {
    '/base-api': {
      target: VITE_BASE_API_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/base-api/, '')
    },
    '/mock-api': {
      target: VITE_MOCK_API_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/mock-api/, '')
    }
  }

  return {
    base: './',
    plugins: [
      react(),
      AutoImport({
        dts: true,
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.md$/ // .md
        ],
        imports: [
          'react',
          'react-router-dom',
          'ahooks',
          {
            from: '@tanstack/react-query',
            imports: ['useQueryClient', 'useQuery', 'useMutation']
          },
          {
            from: '@/constants',
            imports: ['GlobalEnvConfig', 'BasePageModel']
          }
        ],
        dirs: [
          'src/api',
          'src/components',
          'src/config',
          'src/hooks',
          'src/layouts',
          'src/providers',
          'src/store',
          'src/utils'
        ]
      }),
      Icons({
        autoInstall: true,
        compiler: 'jsx',
        jsx: 'react'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    server: {
      host: true,
      port,
      strictPort: true,
      open: false,
      proxy
    },
    preview: {
      host: true,
      port,
      strictPort: true,
      open: false,
      proxy
    }
  }
})
