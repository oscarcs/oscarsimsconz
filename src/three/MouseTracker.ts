import type { Mesh } from 'three/webgpu';

const MAX_TILT = 0.26; // ~15 degrees
const LERP_SPEED = 0.08;
const IDLE_TILT = 0.04;
const IDLE_BOB = 0.015;

// Gyro: degrees of device tilt mapped to full card tilt range
const GYRO_RANGE = 25;

export class MouseTracker {
    private container: HTMLElement;
    private mesh: Mesh;
    private normalizedMouse = { x: 0, y: 0 };
    private targetRotation = { x: 0, y: 0 };
    private currentRotation = { x: 0, y: 0 };
    private hovering = false;

    // Gyro state
    private gyroActive = false;
    private gyroPermissionDenied = false;
    private gyroBaseline: { beta: number; gamma: number } | null = null;
    private boundOrientation: ((e: DeviceOrientationEvent) => void) | null = null;
    private gyroProbeTimer: ReturnType<typeof setTimeout> | null = null;
    private gyroEventReceived = false;

    // Pointer events
    private boundMouseMove: (e: MouseEvent) => void;
    private boundMouseLeave: () => void;
    private boundMouseEnter: (e: MouseEvent) => void;
    private boundTouchStart: (e: TouchEvent) => void;
    private boundTouchMove: (e: TouchEvent) => void;
    private boundTouchEnd: () => void;
    private boundClick: () => void;

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
        this.boundTouchStart = this.onTouchStart.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchEnd = this.onTouchEnd.bind(this);
        this.boundClick = this.onClickForGyro.bind(this);

        container.addEventListener('mousemove', this.boundMouseMove);
        container.addEventListener('mouseleave', this.boundMouseLeave);
        container.addEventListener('mouseenter', this.boundMouseEnter);
        container.addEventListener('touchstart', this.boundTouchStart, { passive: true });
        container.addEventListener('touchmove', this.boundTouchMove, { passive: true });
        container.addEventListener('touchend', this.boundTouchEnd);
        container.addEventListener('click', this.boundClick);

        // Try listening immediately — works on Android and desktop.
        // On iOS without permission, events simply won't fire; the probe
        // timeout will clean up the dead listener.
        this.startGyroListening();
    }

    // --- Gyroscope ---

    // Must be called synchronously from a click/touchend handler —
    // iOS requires requestPermission() in the direct call stack of a
    // user gesture (click), not touchstart, not after an await.
    private onClickForGyro() {
        if (this.gyroActive || this.gyroPermissionDenied) return;
        if (typeof DeviceOrientationEvent === 'undefined') return;

        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            // Call synchronously in the gesture stack — then handle the promise
            (DeviceOrientationEvent as any).requestPermission()
                .then((result: string) => {
                    if (result === 'granted') {
                        this.restartGyroListening();
                    } else {
                        this.gyroPermissionDenied = true;
                    }
                })
                .catch(() => {
                    this.gyroPermissionDenied = true;
                });
        } else {
            // No permission API (Firefox iOS, Android, desktop) —
            // restart listener in case the initial probe timed out
            if (!this.gyroActive) {
                this.restartGyroListening();
            }
        }
    }

    private startGyroListening() {
        if (typeof DeviceOrientationEvent === 'undefined') return;
        this.stopGyroListening();

        this.gyroEventReceived = false;
        this.boundOrientation = this.onDeviceOrientation.bind(this);
        window.addEventListener('deviceorientation', this.boundOrientation);

        // Give it 1.5s to receive an event; if nothing arrives, remove
        // the listener so we don't hold a dead reference
        this.gyroProbeTimer = setTimeout(() => {
            this.gyroProbeTimer = null;
            if (!this.gyroEventReceived) {
                this.stopGyroListening();
            }
        }, 1500);
    }

    private restartGyroListening() {
        this.gyroBaseline = null; // re-capture baseline on next event
        this.startGyroListening();
    }

    private stopGyroListening() {
        if (this.boundOrientation) {
            window.removeEventListener('deviceorientation', this.boundOrientation);
            this.boundOrientation = null;
        }
        if (this.gyroProbeTimer) {
            clearTimeout(this.gyroProbeTimer);
            this.gyroProbeTimer = null;
        }
    }

    private onDeviceOrientation(e: DeviceOrientationEvent) {
        if (e.beta == null || e.gamma == null) return;

        this.gyroEventReceived = true;

        // First reading: capture as baseline (how the user is holding the phone)
        if (!this.gyroBaseline) {
            this.gyroBaseline = { beta: e.beta, gamma: e.gamma };
        }

        this.gyroActive = true;
        this.hovering = true;

        // Delta from baseline, clamped to range
        const deltaBeta = Math.max(-GYRO_RANGE, Math.min(GYRO_RANGE, e.beta - this.gyroBaseline.beta));
        const deltaGamma = Math.max(-GYRO_RANGE, Math.min(GYRO_RANGE, e.gamma - this.gyroBaseline.gamma));

        // Normalize to -1..1
        this.normalizedMouse.x = deltaGamma / GYRO_RANGE;
        this.normalizedMouse.y = deltaBeta / GYRO_RANGE;

        this.targetRotation.x = -this.normalizedMouse.y * MAX_TILT;
        this.targetRotation.y = this.normalizedMouse.x * MAX_TILT;
    }

    // --- Pointer input ---

    private updateFromClient(clientX: number, clientY: number) {
        if (this.gyroActive) return; // gyro takes priority
        const rect = this.container.getBoundingClientRect();
        this.normalizedMouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.normalizedMouse.y = ((clientY - rect.top) / rect.height) * 2 - 1;
        this.targetRotation.x = -this.normalizedMouse.y * MAX_TILT;
        this.targetRotation.y = this.normalizedMouse.x * MAX_TILT;
    }

    private onMouseMove(e: MouseEvent) {
        this.updateFromClient(e.clientX, e.clientY);
    }

    private onMouseEnter(e: MouseEvent) {
        this.hovering = true;
        this.updateFromClient(e.clientX, e.clientY);
    }

    private onMouseLeave() {
        if (this.gyroActive) return;
        this.hovering = false;
        this.targetRotation.x = 0;
        this.targetRotation.y = 0;
        this.normalizedMouse.x = 0;
        this.normalizedMouse.y = 0;
    }

    private onTouchStart(e: TouchEvent) {
        if (this.gyroActive) return;
        this.hovering = true;
        const touch = e.touches[0];
        this.updateFromClient(touch.clientX, touch.clientY);
    }

    private onTouchMove(e: TouchEvent) {
        if (this.gyroActive) return;
        const touch = e.touches[0];
        this.updateFromClient(touch.clientX, touch.clientY);
    }

    private onTouchEnd() {
        if (this.gyroActive) return;
        this.hovering = false;
        this.targetRotation.x = 0;
        this.targetRotation.y = 0;
        this.normalizedMouse.x = 0;
        this.normalizedMouse.y = 0;
    }

    // --- Frame update ---

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
        this.container.removeEventListener('touchstart', this.boundTouchStart);
        this.container.removeEventListener('touchmove', this.boundTouchMove);
        this.container.removeEventListener('touchend', this.boundTouchEnd);
        this.container.removeEventListener('click', this.boundClick);
        this.stopGyroListening();
    }
}
