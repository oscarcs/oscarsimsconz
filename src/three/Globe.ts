// Metal globe scene — ray-marched globe with gold land and silver grid.
// Self-contained WebGPU scene with auto-rotation and spatial supersampling.

import {
    WebGPURenderer,
    OrthographicCamera,
    Scene,
    PlaneGeometry,
    Mesh,
    MeshBasicNodeMaterial,
} from 'three/webgpu';
import { uniform, texture, uv, vec2, vec4, float, max } from 'three/tsl';
import { RenderTarget, HalfFloatType, NoBlending, type DataTexture } from 'three';
import { generateEarthSDF } from './shaders/globe/sdf';
import { createGlobeShader } from './shaders/globe/shader';

export class Globe {
    // Start with the Atlantic/Africa-Europe side facing camera instead of the central Pacific.
    private static readonly INITIAL_ROT_Z = Math.PI;
    // A 2 × 2 ray grid per output pixel, resolved with linear filtering.
    private static readonly SAMPLE_SCALE = 2;

    private renderer!: WebGPURenderer;
    private camera!: OrthographicCamera;
    private scene!: Scene;
    private mesh!: Mesh;
    private resizeObserver!: ResizeObserver;
    private rafId = 0;
    private container: HTMLElement;
    private disposed = false;
    private sdfTexture?: DataTexture;
    private motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    private lastTime = 0;
    private angle = Globe.INITIAL_ROT_Z;
    private visible = true;
    private intersectionObserver?: IntersectionObserver;

    // Shader uniforms (shared between both materials)
    private rotX = uniform(0);
    private rotZ = uniform(0);
    private aspect = uniform(1);

    private target!: RenderTarget;
    private material!: MeshBasicNodeMaterial;
    private displayScene!: Scene;
    private displayMesh!: Mesh;
    private displayMaterial!: MeshBasicNodeMaterial;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async init() {
        this.renderer = new WebGPURenderer({ antialias: false, alpha: true });
        await this.renderer.init();

        if (this.disposed) { this.renderer.dispose(); return; }
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.updateSize();
        this.container.appendChild(this.renderer.domElement);

        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new Scene();

        // Four independent ray samples for each output pixel. Linear filtering
        // averages the matching 2 × 2 texels when the target is displayed.
        const w = this.renderer.domElement.width * Globe.SAMPLE_SCALE;
        const h = this.renderer.domElement.height * Globe.SAMPLE_SCALE;
        this.target = new RenderTarget(w, h, { type: HalfFloatType, depthBuffer: false });
        this.sdfTexture = generateEarthSDF(512, 256);

        this.material = new MeshBasicNodeMaterial();
        this.material.transparent = true;
        this.material.blending = NoBlending;
        this.material.colorNode = createGlobeShader(this.sdfTexture, this.rotX, this.rotZ, this.aspect);
        this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
        this.scene.add(this.mesh);

        const displayUv = vec2(uv().x, float(1.0).sub(uv().y));
        const sample = texture(this.target.texture, displayUv);
        this.displayMaterial = new MeshBasicNodeMaterial();
        this.displayMaterial.transparent = true;
        // Misses store zero colour and coverage. Unpremultiply after averaging
        // so transparent edge samples aren't darkened again by alpha blending.
        this.displayMaterial.colorNode = vec4(sample.rgb.div(max(sample.a, 0.0001)), sample.a);
        this.displayScene = new Scene();
        this.displayMesh = new Mesh(new PlaneGeometry(2, 2), this.displayMaterial);
        this.displayScene.add(this.displayMesh);

        // Responsive sizing
        this.resizeObserver = new ResizeObserver(() => this.updateSize());
        this.resizeObserver.observe(this.container);

        this.motionQuery.addEventListener('change', this.restart);
        document.addEventListener('visibilitychange', this.restart);
        this.intersectionObserver = new IntersectionObserver(([entry]) => {
            this.visible = entry.isIntersecting;
            this.restart();
        });
        this.intersectionObserver.observe(this.container);
        this.restart();
    }

    private updateSize() {
        const w = Math.max(1, this.container.clientWidth);
        const h = Math.max(1, this.container.clientHeight);
        this.renderer.setSize(w, h);
        this.aspect.value = w / h;
        if (this.target) {
            this.target.setSize(
                this.renderer.domElement.width * Globe.SAMPLE_SCALE,
                this.renderer.domElement.height * Globe.SAMPLE_SCALE,
            );
            this.restart();
        }
    }

    private restart = () => {
        cancelAnimationFrame(this.rafId);
        this.lastTime = 0;
        if (!this.disposed && this.mesh && !document.hidden && this.visible) {
            this.rafId = requestAnimationFrame(this.animate);
        }
    };

    private animate = (now: number) => {
        if (this.disposed || document.hidden || !this.visible) return;
        const delta = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.05) : 0;
        this.lastTime = now;
        if (!this.motionQuery.matches) this.angle += delta * 0.10;
        this.rotZ.value = this.angle;
        // Spatial samples are stable between frames: no random jitter or
        // same-pixel history blending that can shimmer or trail under rotation.
        this.renderer.setRenderTarget(this.target);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.displayScene, this.camera);
        if (!this.motionQuery.matches) {
            this.rafId = requestAnimationFrame(this.animate);
        }
    };

    dispose() {
        this.disposed = true;
        cancelAnimationFrame(this.rafId);
        this.motionQuery.removeEventListener('change', this.restart);
        document.removeEventListener('visibilitychange', this.restart);
        this.resizeObserver?.disconnect();
        this.intersectionObserver?.disconnect();
        this.material?.dispose();
        this.displayMaterial?.dispose();
        this.mesh?.geometry.dispose();
        this.displayMesh?.geometry.dispose();
        this.sdfTexture?.dispose();
        this.target?.dispose();
        this.renderer?.dispose();
        this.renderer?.domElement.remove();
    }
}
