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
                build(),
                devServer({
                    adapter,
                    entry: 'src/index.tsx'
                }),
            ],
            // Replace WebGPU constants at build time so Three.js can
            // evaluate at module scope in Cloudflare Workers.
            define: {
                'GPUShaderStage.VERTEX': '1',
                'GPUShaderStage.FRAGMENT': '2',
                'GPUShaderStage.COMPUTE': '4',
                'GPUBufferUsage.MAP_READ': '1',
                'GPUBufferUsage.MAP_WRITE': '2',
                'GPUBufferUsage.COPY_SRC': '4',
                'GPUBufferUsage.COPY_DST': '8',
                'GPUBufferUsage.INDEX': '16',
                'GPUBufferUsage.VERTEX': '32',
                'GPUBufferUsage.UNIFORM': '64',
                'GPUBufferUsage.STORAGE': '128',
                'GPUBufferUsage.INDIRECT': '256',
                'GPUBufferUsage.QUERY_RESOLVE': '512',
                'GPUTextureUsage.COPY_SRC': '1',
                'GPUTextureUsage.COPY_DST': '2',
                'GPUTextureUsage.TEXTURE_BINDING': '4',
                'GPUTextureUsage.STORAGE_BINDING': '8',
                'GPUTextureUsage.RENDER_ATTACHMENT': '16',
                'GPUColorWrite.RED': '1',
                'GPUColorWrite.GREEN': '2',
                'GPUColorWrite.BLUE': '4',
                'GPUColorWrite.ALPHA': '8',
                'GPUColorWrite.ALL': '15',
                'GPUMapMode.READ': '1',
                'GPUMapMode.WRITE': '2',
            },
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