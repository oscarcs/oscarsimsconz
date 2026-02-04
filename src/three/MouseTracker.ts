import type { Mesh } from 'three/webgpu';

const MAX_TILT = 0.26; // ~15 degrees
const LERP_SPEED = 0.08;
const IDLE_TILT = 0.04;
const IDLE_BOB = 0.015;

export class MouseTracker {
    private container: HTMLElement;
    private mesh: Mesh;
    private normalizedMouse = { x: 0, y: 0 };
    private targetRotation = { x: 0, y: 0 };
    private currentRotation = { x: 0, y: 0 };
    private hovering = false;
    private boundMouseMove: (e: MouseEvent) => void;
    private boundMouseLeave: () => void;
    private boundMouseEnter: (e: MouseEvent) => void;

    // Exposed for shader uniforms
    mouseX = 0;
    mouseY = 0;
    isHovering = false;

    constructor(container: HTMLElement, mesh: Mesh) {
        this.container = container;
        this.mesh = mesh;

        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseLeave = this.onMouseLeave.bind(this);
        this.boundMouseEnter = this.onMouseEnter.bind(this);

        container.addEventListener('mousemove', this.boundMouseMove);
        container.addEventListener('mouseleave', this.boundMouseLeave);
        container.addEventListener('mouseenter', this.boundMouseEnter);
    }

    private onMouseMove(e: MouseEvent) {
        const rect = this.container.getBoundingClientRect();
        this.normalizedMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.normalizedMouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        this.targetRotation.x = -this.normalizedMouse.y * MAX_TILT;
        this.targetRotation.y = this.normalizedMouse.x * MAX_TILT;
    }

    private onMouseEnter(e: MouseEvent) {
        this.hovering = true;
        this.onMouseMove(e);
    }

    private onMouseLeave() {
        this.hovering = false;
        this.targetRotation.x = 0;
        this.targetRotation.y = 0;
        this.normalizedMouse.x = 0;
        this.normalizedMouse.y = 0;
    }

    update(time: number) {
        if (!this.hovering) {
            // Idle breathing animation
            this.targetRotation.x = Math.sin(time * 0.5) * IDLE_TILT;
            this.targetRotation.y = Math.cos(time * 0.7) * IDLE_TILT;
            this.mesh.position.y = Math.sin(time * 0.4) * IDLE_BOB;
        } else {
            this.mesh.position.y = 0;
        }

        // Smooth lerp toward target
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * LERP_SPEED;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * LERP_SPEED;

        this.mesh.rotation.x = this.currentRotation.x;
        this.mesh.rotation.y = this.currentRotation.y;

        // Expose for shaders
        this.mouseX = this.normalizedMouse.x;
        this.mouseY = this.normalizedMouse.y;
        this.isHovering = this.hovering;
    }

    dispose() {
        this.container.removeEventListener('mousemove', this.boundMouseMove);
        this.container.removeEventListener('mouseleave', this.boundMouseLeave);
        this.container.removeEventListener('mouseenter', this.boundMouseEnter);
    }
}
