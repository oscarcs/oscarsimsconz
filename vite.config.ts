import build from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
import basicSsl from '@vitejs/plugin-basic-ssl';
import preserveDirectives from 'rollup-preserve-directives';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    if (mode === 'client') {
        return {
            plugins: [preserveDirectives()],
            optimizeDeps: {
                esbuildOptions: {
                    target: 'esnext',
                },
            },
            build: {
                target: 'esnext',
                manifest: true,
                assetsDir: 'static',
                rollupOptions: {
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
                    "@": path.resolve(__dirname, "./src"),
                },
            },
        }
    }
    else {
        return {
            plugins: [
                preserveDirectives(),
                basicSsl(),
                build({ external: ['three', 'three/webgpu', 'three/tsl', 'qrcode'] }),
                devServer({
                    adapter,
                    entry: 'src/index.tsx'
                }),
            ],
            server: {
                host: true,
            },
            ssr: {
                external: ['react', 'react-dom', 'three', 'qrcode'],
            },
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "./src"),
                },
            },
        }
    }
});