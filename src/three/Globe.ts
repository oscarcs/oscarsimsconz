// Metal globe scene — ray-marched globe with gold land and silver grid.
// Self-contained WebGPU scene with auto-rotation and temporal AA.

import {
    WebGPURenderer,
    OrthographicCamera,
    Scene,
    PlaneGeometry,
    Mesh,
    MeshBasicNodeMaterial,
} from 'three/webgpu';
import { uniform, texture, uv, vec2, float } from 'three/tsl';
import { Vector2, RenderTarget, HalfFloatType } from 'three';
import { generateEarthSDF } from './shaders/globe/sdf';
import { createGlobeShader } from './shaders/globe/shader';

export class Globe {
    // Start with the Atlantic/Africa-Europe side facing camera instead of the central Pacific.
    private static readonly INITIAL_ROT_Z = Math.PI;

    private renderer!: WebGPURenderer;
    private camera!: OrthographicCamera;
    private scene!: Scene;
    private mesh!: Mesh;
    private resizeObserver!: ResizeObserver;
    private rafId = 0;
    private container: HTMLElement;
    private disposed = false;

    // Shader uniforms (shared between both materials)
    private rotX = uniform(0);
    private rotZ = uniform(0);
    private aspect = uniform(1);
    private jitter = uniform(new Vector2(0, 0));

    // TAA ping-pong
    private rtA!: RenderTarget;
    private rtB!: RenderTarget;
    private useA = true;

    // Two globe materials with fixed texture bindings (no dynamic swap)
    private materialA!: MeshBasicNodeMaterial;
    private materialB!: MeshBasicNodeMaterial;

    // Display pass
    private displayScene!: Scene;
    private displayMesh!: Mesh;
    private displayMatA!: MeshBasicNodeMaterial;
    private displayMatB!: MeshBasicNodeMaterial;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async init() {
        this.renderer = new WebGPURenderer({ antialias: true, alpha: true });
        await this.renderer.init();

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.updateSize();
        this.container.appendChild(this.renderer.domElement);

        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new Scene();

        // Render targets for TAA ping-pong
        const dpr = window.devicePixelRatio;
        const w = this.container.clientWidth * dpr;
        const h = this.container.clientHeight * dpr;
        this.rtA = new RenderTarget(w, h, { type: HalfFloatType });
        this.rtB = new RenderTarget(w, h, { type: HalfFloatType });

        const sdfTexture = generateEarthSDF(512, 256);

        // RT textures are Y-flipped in WebGPU — flip V when sampling prev frame
        const rtUvA = vec2(uv().x, float(1.0).sub(uv().y));
        const rtUvB = vec2(uv().x, float(1.0).sub(uv().y));

        // Material A: reads prev from rtB, renders to rtA
        this.materialA = new MeshBasicNodeMaterial();
        this.materialA.transparent = true;
        this.materialA.colorNode = createGlobeShader(
            sdfTexture, this.rotX, this.rotZ, this.aspect,
            this.jitter, texture(this.rtB.texture, rtUvA),
        );

        // Material B: reads prev from rtA, renders to rtB
        this.materialB = new MeshBasicNodeMaterial();
        this.materialB.transparent = true;
        this.materialB.colorNode = createGlobeShader(
            sdfTexture, this.rotX, this.rotZ, this.aspect,
            this.jitter, texture(this.rtA.texture, rtUvB),
        );

        // Globe mesh (material swapped each frame)
        this.mesh = new Mesh(new PlaneGeometry(2, 2), this.materialA);
        this.scene.add(this.mesh);

        // Display materials (fixed bindings to each RT, Y-flipped)
        const dispUvA = vec2(uv().x, float(1.0).sub(uv().y));
        const dispUvB = vec2(uv().x, float(1.0).sub(uv().y));

        this.displayMatA = new MeshBasicNodeMaterial();
        this.displayMatA.transparent = true;
        this.displayMatA.colorNode = texture(this.rtA.texture, dispUvA);

        this.displayMatB = new MeshBasicNodeMaterial();
        this.displayMatB.transparent = true;
        this.displayMatB.colorNode = texture(this.rtB.texture, dispUvB);

        this.displayScene = new Scene();
        this.displayMesh = new Mesh(new PlaneGeometry(2, 2), this.displayMatA);
        this.displayScene.add(this.displayMesh);

        // Responsive sizing
        this.resizeObserver = new ResizeObserver(() => this.updateSize());
        this.resizeObserver.observe(this.container);

        this.animate();
    }

    private updateSize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.renderer.setSize(w, h);
        this.aspect.value = w / h;
        if (this.rtA) {
            const dpr = window.devicePixelRatio;
            this.rtA.setSize(w * dpr, h * dpr);
            this.rtB.setSize(w * dpr, h * dpr);
        }
    }

    private animate = () => {
        if (this.disposed) return;
        this.rafId = requestAnimationFrame(this.animate);

        const now = performance.now() / 1000;
        this.rotZ.value = Globe.INITIAL_ROT_Z + (now * 0.15);
        this.rotX.value = 0.0;

        // Sub-pixel jitter for TAA
        const dpr = window.devicePixelRatio;
        const pw = this.container.clientWidth * dpr;
        const ph = this.container.clientHeight * dpr;
        (this.jitter.value as Vector2).set(
            (Math.random() - 0.5) / pw,
            (Math.random() - 0.5) / ph,
        );

        // Ping-pong: each material has fixed texture bindings
        if (this.useA) {
            this.mesh.material = this.materialA;
            this.renderer.setRenderTarget(this.rtA);
            this.renderer.render(this.scene, this.camera);
            this.displayMesh.material = this.displayMatA;
        } else {
            this.mesh.material = this.materialB;
            this.renderer.setRenderTarget(this.rtB);
            this.renderer.render(this.scene, this.camera);
            this.displayMesh.material = this.displayMatB;
        }

        this.renderer.setRenderTarget(null);
        this.renderer.render(this.displayScene, this.camera);
        this.useA = !this.useA;
    };

    dispose() {
        this.disposed = true;
        cancelAnimationFrame(this.rafId);
        this.resizeObserver.disconnect();
        this.materialA.dispose();
        this.materialB.dispose();
        this.displayMatA.dispose();
        this.displayMatB.dispose();
        this.rtA.dispose();
        this.rtB.dispose();
        this.renderer.dispose();
    }
}
