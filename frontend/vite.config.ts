import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    build: {
      target: 'es2019',
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          passes: 2,
          drop_console: false,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          // Split heavy vendors so the main bundle stays small (faster TTI on mobile)
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/firestore'],
            'vendor-motion': ['framer-motion', 'motion'],
            'vendor-icons': ['lucide-react'],
            'vendor-capacitor': [
              '@capacitor/core',
              '@capacitor/app',
              '@capacitor/haptics',
              '@capacitor/network',
              '@capacitor/browser',
              '@capacitor-community/admob'
            ]
          }
        }
      },
      chunkSizeWarningLimit: 800
    },
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        strategies: 'generateSW',
        includeAssets: ['logo.png', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'TryHard Academy',
          short_name: 'TryHard',
          description: 'Domine a arena matemática na TryHard Academy!',
          theme_color: '#bc13fe',
          background_color: '#050505',
          display: 'standalone',
          orientation: 'any',
          start_url: './',
          icons: [
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          // Garante que o SW sempre peça a versão mais nova do index.html
          // ao servidor antes de servir do cache. Isso impede que o
          // navegador continue usando um HTML antigo que referencia chunks
          // que já não existem no deploy novo.
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              // NetworkFirst para o HTML - prioriza servidor, cai no cache offline.
              // É a peça-chave para evitar "Failed to fetch dynamically imported module"
              // após deploy, porque o HTML sempre será a versão mais recente.
              urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 16,
                  maxAgeSeconds: 60 * 60 * 24
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/i\.ibb\.co\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'external-images',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/cdn\.pixabay\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'pixabay-audio',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/image2url\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'game-audio',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache BGM tracks so the menu music works offline after first load
              urlPattern: /^https:\/\/raw\.githubusercontent\.com\/phaser3-examples\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'bgm-tracks',
                expiration: {
                  maxEntries: 4,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true'
    }
  };
});
