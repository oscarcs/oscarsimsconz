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
        // WebGPU constants polyfill — injected at the very top of the
        // worker bundle so Three.js can evaluate GPUShaderStage etc.
        // at module scope without crashing in Cloudflare Workers.
        const gpuPolyfill = [
            `if(typeof GPUShaderStage==='undefined'){globalThis.GPUShaderStage={VERTEX:1,FRAGMENT:2,COMPUTE:4}}`,
            `if(typeof GPUBufferUsage==='undefined'){globalThis.GPUBufferUsage={MAP_READ:1,MAP_WRITE:2,COPY_SRC:4,COPY_DST:8,INDEX:16,VERTEX:32,UNIFORM:64,STORAGE:128,INDIRECT:256,QUERY_RESOLVE:512}}`,
            `if(typeof GPUTextureUsage==='undefined'){globalThis.GPUTextureUsage={COPY_SRC:1,COPY_DST:2,TEXTURE_BINDING:4,STORAGE_BINDING:8,RENDER_ATTACHMENT:16}}`,
            `if(typeof GPUColorWrite==='undefined'){globalThis.GPUColorWrite={RED:1,GREEN:2,BLUE:4,ALPHA:8,ALL:15}}`,
            `if(typeof GPUMapMode==='undefined'){globalThis.GPUMapMode={READ:1,WRITE:2}}`,
        ].join('');

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
            build: {
                rollupOptions: {
                    output: {
                        intro: gpuPolyfill,
                    },
                },
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