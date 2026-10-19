// TSL ray-marched metal globe shader.
// Ports the Shadertoy-style GLSL globe (common.glsl + image.glsl) to Three.js TSL.

import {
    Fn, float, vec2, vec3, vec4,
    If, Loop, Break, select, mix,
    sin, cos, atan, length, normalize, dot, reflect,
    max, abs, smoothstep, mod, pow, sqrt,
    texture, uv,
} from 'three/tsl';
import type { UniformNode, Node } from 'three/webgpu';
import type { DataTexture } from 'three';

const PI = Math.PI;
const TAU = Math.PI * 2;
const EPS = 0.03;
const MAX_ITER = 96;

const GLOBE_RAD = 50.0;
const GRID_LINES = 26.0;
const GRID_THICK = 0.8;
const LAND_THICK = 2.0;
const BORDER_CHAMFER = 0.15;

const MAT_SILVER = 1.0;
const MAT_GOLD = 2.0;

// ── Smooth procedural noise ─────────────────────────────────────────
// Sin-based smooth noise for gold surface texture (replaces iChannel2 tri-planar).
const triPlanarNoise = /*#__PURE__*/ Fn(
    ([p_immutable, n_immutable]: [Node<'vec3'>, Node<'vec3'>]) => {
        const p = vec3(p_immutable);
        const n = abs(normalize(vec3(n_immutable)));
        const w = n.div(n.x.add(n.y).add(n.z));
        const tx = vec3(
            sin(p.y.mul(17.3).add(p.z.mul(31.7))),
            sin(p.y.mul(43.1).add(p.z.mul(11.3))),
            sin(p.z.mul(23.9).add(p.y.mul(37.1))),
        );
        const ty = vec3(
            sin(p.z.mul(19.7).add(p.x.mul(29.3))),
            sin(p.z.mul(41.3).add(p.x.mul(13.7))),
            sin(p.x.mul(27.1).add(p.z.mul(33.9))),
        );
        const tz = vec3(
            sin(p.x.mul(21.1).add(p.y.mul(37.3))),
            sin(p.x.mul(39.7).add(p.y.mul(17.1))),
            sin(p.y.mul(31.3).add(p.x.mul(23.7))),
        );
        return tx.mul(w.x).add(ty.mul(w.y)).add(tz.mul(w.z));
    },
);

// ── Procedural environment ──────────────────────────────────────────
// Rich studio HDRI-like environment for metallic reflections.
// Coordinate convention: .xzy swizzle applied to reflection vector
// before calling, matching the original cubemap sampling.
const envMap = /*#__PURE__*/ Fn(([dir]: [Node<'vec3'>]) => {
    const d = normalize(vec3(dir));

    // Vertical gradient: dark base with subtle warm-cool shift
    const y01 = d.y.mul(0.5).add(0.5);
    const skyGrad = mix(vec3(0.04, 0.03, 0.02), vec3(0.08, 0.09, 0.12), smoothstep(0.0, 1.0, y01));

    // Subtle horizon band
    const horizStr = pow(max(float(1.0).sub(abs(d.y)), 0.0), 8.0).mul(0.25);
    const horiz = vec3(0.9, 0.85, 0.75).mul(horizStr);

    // Broad studio lights avoid subpixel specular spikes on the thin grid.
    // Key light: warm softbox from upper-right-front
    const keyDir = normalize(vec3(0.5, 0.7, -0.5));
    const keyStr = pow(max(dot(d, keyDir), 0.0), 24.0).mul(3.0);
    const key = vec3(1.0, 0.95, 0.85).mul(keyStr);

    // Secondary key: softer warm from slightly different angle
    const key2Dir = normalize(vec3(0.3, 0.5, -0.8));
    const key2Str = pow(max(dot(d, key2Dir), 0.0), 12.0).mul(1.2);
    const key2 = vec3(1.0, 0.9, 0.7).mul(key2Str);

    // Fill light: cool from left, dimmer
    const fillDir = normalize(vec3(-0.6, 0.3, 0.5));
    const fillStr = pow(max(dot(d, fillDir), 0.0), 8.0).mul(0.4);
    const fill = vec3(0.6, 0.7, 1.0).mul(fillStr);

    // Rim light: bright from behind-above for edge highlights
    const rimDir = normalize(vec3(0.0, 0.4, 0.9));
    const rimStr = pow(max(dot(d, rimDir), 0.0), 16.0).mul(1.8);
    const rim = vec3(0.9, 0.92, 1.0).mul(rimStr);

    // Warm ground bounce — subtle
    const gndStr = pow(max(d.y.negate(), 0.0), 3.0).mul(0.12);
    const gnd = vec3(0.35, 0.22, 0.12).mul(gndStr);

    return skyGrad.add(horiz).add(key).add(key2).add(fill).add(rim).add(gnd);
});

// ── Rotation ────────────────────────────────────────────────────────
// Applies v * Rotate(angles) matching the GLSL convention (v on left).
const applyRotation = /*#__PURE__*/ Fn(
    ([v_immutable, angles_immutable]: [Node<'vec3'>, Node<'vec3'>]) => {
        const p = vec3(v_immutable);
        const a = vec3(angles_immutable);
        const cx = cos(a.x);
        const sx = sin(a.x);
        const cy = cos(a.y);
        const sy = sin(a.y);
        const cz = cos(a.z);
        const sz = sin(a.z);

        // Around X
        const yx = p.y.mul(cx).add(p.z.mul(sx));
        const zx = p.y.mul(sx).negate().add(p.z.mul(cx));

        // Around Y
        const xy = p.x.mul(cy).sub(zx.mul(sy));
        const zy = p.x.mul(sy).add(zx.mul(cy));

        // Around Z
        const xz = xy.mul(cz).add(yx.mul(sz));
        const yz = xy.mul(sz).negate().add(yx.mul(cz));

        return vec3(xz, yz, zy);
    },
);

// ── SDF primitives ──────────────────────────────────────────────────
// Each returns vec2(distance, material).
const sdSphere = /*#__PURE__*/ Fn(
    ([p, r, mat]: [Node<'vec3'>, Node<'float'>, Node<'float'>]) => {
        return vec2(length(vec3(p)).sub(r), mat);
    },
);

const sdCylinder = /*#__PURE__*/ Fn(
    ([p, r, mat]: [Node<'vec3'>, Node<'float'>, Node<'float'>]) => {
        return vec2(length(vec2(vec3(p).x, vec3(p).y)).sub(r), mat);
    },
);

// ── SDF operators ───────────────────────────────────────────────────
const opU = /*#__PURE__*/ Fn(
    ([a, b]: [Node<'vec2'>, Node<'vec2'>]) => {
        return select(vec2(a).x.lessThan(vec2(b).x), a, b);
    },
);

const opS = /*#__PURE__*/ Fn(
    ([a, b]: [Node<'vec2'>, Node<'vec2'>]) => {
        const negAx = vec2(a).x.negate();
        return select(
            negAx.greaterThan(vec2(b).x),
            vec2(negAx, vec2(a).y),
            b,
        );
    },
);

const opN = /*#__PURE__*/ Fn(([a]: [Node<'vec2'>]) => {
    return vec2(vec2(a).x.negate(), vec2(a).y);
});

const opSChamfer = /*#__PURE__*/ Fn(
    ([s, a, b]: [Node<'float'>, Node<'vec2'>, Node<'vec2'>]) => {
        const ax = vec2(a).x;
        const bx = vec2(b).x;
        const d = max(
            max(ax.negate(), bx),
            ax.sub(bx).sub(s).negate().div(Math.SQRT2),
        );
        return vec2(d, vec2(a).y);
    },
);

// ── Domain operations ───────────────────────────────────────────────
const revolve = /*#__PURE__*/ Fn(([p]: [Node<'vec3'>]) => {
    const v = vec3(p);
    return vec3(length(vec2(v.x, v.y)), 0.0, v.z);
});

const angRep = /*#__PURE__*/ Fn(
    ([p, a]: [Node<'vec3'>, Node<'float'>]) => {
        const v = vec3(p);
        const angle = atan(v.y, v.x);
        const radius = length(vec2(v.x, v.y));
        const halfA = float(a).div(2.0);
        const modAngle = mod(angle.add(halfA), a).sub(halfA);
        return vec3(
            radius.mul(cos(modAngle)),
            radius.mul(sin(modAngle)),
            v.z,
        );
    },
);

// ── Globe SDF components ────────────────────────────────────────────
export function createGlobeShader(
    sdfTexture: DataTexture,
    rotX: UniformNode<'float', number>,
    rotZ: UniformNode<'float', number>,
    aspect: UniformNode<'float', number>,
): Node<'vec4'> {
    // Globe map: samples the earth SDF texture and converts to 3D distance
    const sdGlobeMap = Fn(
        ([p, mat]: [Node<'vec3'>, Node<'float'>]) => {
            const v = vec3(p);
            const texc = vec2(
                atan(v.y, v.x).div(TAU).add(0.5),
                float(1.0).sub(atan(length(vec2(v.x, v.y)), v.z).div(PI)).add(1.0),
            );
            const sdf = texture(sdfTexture, texc).x;
            return vec2(sdf.mul(length(v)), mat);
        },
    );

    // Land shell: SDF of the globe's landmass
    const sdGlobeShell = Fn(([p]: [Node<'vec3'>]) => {
        const dland = sdGlobeMap(p, MAT_GOLD).toVar();
        dland.assign(
            opSChamfer(
                BORDER_CHAMFER,
                opN(sdSphere(p, GLOBE_RAD, MAT_GOLD)),
                dland,
            ),
        );
        dland.assign(opS(sdSphere(p, GLOBE_RAD - LAND_THICK, MAT_GOLD), dland));
        return dland;
    });

    // Latitude/longitude grid
    const sdGrid = Fn(([p]: [Node<'vec3'>]) => {
        const gridrad = float(GLOBE_RAD - LAND_THICK - GRID_THICK);

        // Longitude lines: revolve around angular-repeated Z columns
        const plon = revolve(angRep(vec3(p), TAU / GRID_LINES).zxy);
        // Latitude lines: angular-repeat the revolved XZ profile
        const plat = angRep(revolve(vec3(p)).xzy, TAU / GRID_LINES);

        const dgrid = sdSphere(
            vec3(plon).sub(vec3(gridrad, 0.0, 0.0)),
            GRID_THICK,
            MAT_SILVER,
        ).toVar();

        dgrid.assign(
            opS(
                sdCylinder(p, sin(PI / GRID_LINES).mul(gridrad), MAT_SILVER),
                dgrid,
            ),
        );

        dgrid.assign(
            opU(
                sdSphere(
                    vec3(plat).sub(vec3(gridrad, 0.0, 0.0)),
                    GRID_THICK,
                    MAT_SILVER,
                ),
                dgrid,
            ),
        );

        return dgrid;
    });

    // Full scene map (no background sphere — transparent outside)
    const mapScene = Fn(([p]: [Node<'vec3'>]) => {
        const d = sdGrid(p).toVar();
        d.assign(opU(d, sdGlobeShell(p)));
        return d;
    });

    // Symmetric tetrahedral normal: four samples without forward-difference bias
    const calcNormal = Fn(([p, e_in]: [Node<'vec3'>, Node<'float'>]) => {
        const e = float(e_in);
        const k1 = vec3(1, -1, -1);
        const k2 = vec3(-1, -1, 1);
        const k3 = vec3(-1, 1, -1);
        const k4 = vec3(1, 1, 1);
        return normalize(
            k1.mul(mapScene(vec3(p).add(k1.mul(e))).x)
                .add(k2.mul(mapScene(vec3(p).add(k2.mul(e))).x))
                .add(k3.mul(mapScene(vec3(p).add(k3.mul(e))).x))
                .add(k4.mul(mapScene(vec3(p).add(k4.mul(e))).x)),
        );
    });

    // ── Main shader ─────────────────────────────────────────────────
    return Fn(() => {
        const texUv = uv();
        const asp = float(aspect);

        // Each fragment is one of the four spatial samples per output pixel.
        const screenUv = vec2(
            texUv.x.sub(0.5).mul(asp),
            texUv.y.sub(0.5),
        );

        // Camera angles from uniforms
        const rX = float(rotX);
        const rZ = float(rotZ);
        const camAngles = vec3(rX, 0.0, rZ);

        // Camera
        const orig = applyRotation(vec3(0.0, -130.0, 0.0), camAngles);
        const rawDir = normalize(vec3(screenUv.x, 0.9, screenUv.y));
        const dir = applyRotation(rawDir, camAngles);

        // Intersect a conservative bounding sphere first. Misses skip the SDF,
        // and rays through the open grid stop at the far side of the globe.
        const b = dot(orig, dir);
        const discriminant = b.mul(b).sub(dot(orig, orig).sub((GLOBE_RAD + 1) ** 2));
        const span = sqrt(max(discriminant, 0.0));
        const totalDist = max(b.negate().sub(span), 0.0).toVar();
        const maxDist = b.negate().add(span);
        const mPos = orig.add(dir.mul(totalDist)).toVar();
        const hitMat = float(-1.0).toVar();

        If(discriminant.greaterThanEqual(0.0), () => {
            Loop(MAX_ITER, () => {
                If(totalDist.greaterThan(maxDist), () => { Break(); });
                const dm = mapScene(mPos).toVar();
                If(dm.x.lessThan(EPS), () => {
                    hitMat.assign(dm.y);
                    Break();
                });
                const step = dm.x.mul(0.75);
                mPos.addAssign(dir.mul(step));
                totalDist.addAssign(step);
            });
        });

        const col = vec3(0.0, 0.0, 0.0).toVar();
        const alpha = float(0.0).toVar();

        // ── Grid (silver metal) ─────────────────────────────────────
        If(hitMat.greaterThan(0.5).and(hitMat.lessThan(1.5)), () => {
            // Larger normal epsilon smooths shading noise on thin grid bars
            const nrm = calcNormal(mPos, 0.15);
            const refl = reflect(dir, nrm);
            const env = envMap(refl.xzy).toVar();
            env.assign(pow(env, 1.12));
            const silver = vec3(0.95, 0.95, 0.95).mul(env);

            // Shadow from land shell
            const shadowDist = sdGlobeShell(mPos).x;
            const shadow = smoothstep(0.0, 3.0, shadowDist).toVar();
            shadow.assign(
                mix(
                    1.0,
                    shadow,
                    max(0.0, dot(normalize(mPos), nrm)),
                ),
            );
            shadow.assign(shadow.mul(0.5).add(0.5));

            col.assign(silver.mul(shadow));
            alpha.assign(1.0);
        });

        // ── Land (gold metal) ───────────────────────────────────────
        If(hitMat.greaterThan(1.5), () => {
            const nrm = calcNormal(mPos, 0.12).toVar();
            const bump = triPlanarNoise(mPos.mul(0.02), nrm);
            nrm.assign(normalize(nrm.add(bump.mul(0.025))));

            const refl = reflect(dir, nrm);
            const env = envMap(refl.xzy).toVar();
            env.assign(pow(env, 1.12));
            const gold = vec3(0.32, 0.10, 0.04).mul(env).mul(9.0);

            // Shadow from grid
            const shadowDist = sdGrid(mPos).x;
            const shadow = smoothstep(0.0, 3.0, shadowDist).toVar();
            shadow.assign(
                mix(
                    1.0,
                    shadow,
                    max(0.0, dot(normalize(mPos), nrm).negate()),
                ),
            );
            shadow.assign(shadow.mul(0.5).add(0.5));

            col.assign(gold.mul(shadow));
            alpha.assign(1.0);
        });

        return vec4(col, alpha);
    })();
}
