import build from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    if (mode === 'client') {
        return {
            server: { host: '127.0.0.1', port: 5174, strictPort: true, cors: { origin: /^http:\/\/(localhost|127\.0\.0\.1):5173$/ } },
            build: {
                target: 'esnext',
                manifest: true,
                assetsDir: 'static',
                rolldownOptions: {
                    input: './src/client.tsx',
                    output: {
                        entryFileNames: 'static/client-[hash].js',
                        manualChunks(id) {
                            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                                return 'vendor';
                            }
                            if (id.includes('node_modules/three/')) {
                                return 'three';
                            }
                        }
                    },
                },
            },
            resolve: {
                alias: {
                    "@": path.resolve(import.meta.dirname, "./src"),
                },
            },
        }
    }
    else {
        return {
            plugins: [
                build(),
                devServer({
                    adapter,
                    entry: 'src/index.tsx'
                }),
            ],
            server: {
                host: '127.0.0.1',
                port: 5173,
                strictPort: true,
            },
            ssr: {
                external: ['react', 'react-dom', 'three', 'qrcode'],
            },
            resolve: {
                alias: {
                    "@": path.resolve(import.meta.dirname, "./src"),
                },
            },
        }
    }
});