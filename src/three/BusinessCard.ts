import {
    WebGPURenderer,
    PerspectiveCamera,
    Scene,
    PlaneGeometry,
    Mesh,
    MeshBasicNodeMaterial,
} from 'three/webgpu';
import { uniform } from 'three/tsl';
import { createCardTexture } from './CardTexture';
import { MouseTracker } from './MouseTracker';
import { createFoilShader } from './shaders/foil';
import { createHolographicShader } from './shaders/holographic';
import { createPolychromeShader } from './shaders/polychrome';

export type EditionType = 'foil' | 'holographic' | 'polychrome';

export class BusinessCard {
    private renderer!: WebGPURenderer;
    private camera!: PerspectiveCamera;
    private scene!: Scene;
    private mesh!: Mesh;
    private geometry!: PlaneGeometry;
    private materials!: Map<EditionType, MeshBasicNodeMaterial>;
    private mouseTracker!: MouseTracker;
    private resizeObserver!: ResizeObserver;
    private rafId = 0;
    private container: HTMLElement;
    private tiltUniform = uniform(0);
    private mouseXUniform = uniform(0);
    private disposed = false;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async init() {
        this.renderer = new WebGPURenderer({ antialias: true, alpha: true });
        await this.renderer.init();

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.updateSize();
        this.container.appendChild(this.renderer.domElement);

        this.camera = new PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.z = 5;

        this.scene = new Scene();

        // Card geometry — playing card ratio
        this.geometry = new PlaneGeometry(2.5, 3.5);

        // Card texture
        const cardTex = await createCardTexture();

        // Pre-create materials for each edition
        this.materials = new Map();

        const foilMat = new MeshBasicNodeMaterial();
        foilMat.transparent = true;
        foilMat.colorNode = createFoilShader(cardTex, this.tiltUniform, this.mouseXUniform);
        this.materials.set('foil', foilMat);

        const holoMat = new MeshBasicNodeMaterial();
        holoMat.transparent = true;
        holoMat.colorNode = createHolographicShader(cardTex, this.tiltUniform, this.mouseXUniform);
        this.materials.set('holographic', holoMat);

        const polyMat = new MeshBasicNodeMaterial();
        polyMat.transparent = true;
        polyMat.colorNode = createPolychromeShader(cardTex, this.tiltUniform, this.mouseXUniform);
        this.materials.set('polychrome', polyMat);

        // Default to holographic
        this.mesh = new Mesh(this.geometry, this.materials.get('holographic'));
        this.scene.add(this.mesh);

        this.mouseTracker = new MouseTracker(this.container, this.mesh);

        // Responsive sizing
        this.resizeObserver = new ResizeObserver(() => this.updateSize());
        this.resizeObserver.observe(this.container);

        this.animate();
    }

    setEdition(edition: EditionType) {
        const mat = this.materials.get(edition);
        if (mat && this.mesh) {
            this.mesh.material = mat;
        }
    }

    private updateSize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.renderer.setSize(w, h);
        if (this.camera) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
        }
    }

    private animate = () => {
        if (this.disposed) return;
        this.rafId = requestAnimationFrame(this.animate);

        const now = performance.now() / 1000;
        this.mouseTracker.update(now);

        // Drive shader directly from card rotation — shimmer follows tilt
        // like a real holographic card catching light at different angles.
        // Scale up so small tilts produce visible shader variation.
        this.tiltUniform.value = this.mesh.rotation.y * 4;
        this.mouseXUniform.value = this.mesh.rotation.x * 60;

        this.renderer.render(this.scene, this.camera);
    };

    dispose() {
        this.disposed = true;
        cancelAnimationFrame(this.rafId);
        this.resizeObserver.disconnect();
        this.mouseTracker.dispose();
        this.geometry.dispose();
        this.materials.forEach((m) => m.dispose());
        this.renderer.dispose();
    }
}
