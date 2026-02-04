// Polyfill WebGPU constants for browsers that lack WebGPU support.
// Three.js's webgpu bundle references these at module scope, crashing
// before the renderer can fall back to WebGL. These values match the
// WebGPU spec so the module evaluates cleanly; actual backend selection
// happens in WebGPURenderer.init().

const g = globalThis as Record<string, unknown>;

if (typeof GPUShaderStage === 'undefined') {
    g.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
}
if (typeof GPUBufferUsage === 'undefined') {
    g.GPUBufferUsage = {
        MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8,
        INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128,
        INDIRECT: 256, QUERY_RESOLVE: 512,
    };
}
if (typeof GPUTextureUsage === 'undefined') {
    g.GPUTextureUsage = {
        COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4,
        STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16,
    };
}
if (typeof GPUColorWrite === 'undefined') {
    g.GPUColorWrite = { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };
}
if (typeof GPUMapMode === 'undefined') {
    g.GPUMapMode = { READ: 1, WRITE: 2 };
}
