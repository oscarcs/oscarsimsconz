// Holographic shader — ported from Balatro's holo.fs (LOVE2D GLSL).
// Rainbow HSL hue rotation driven by animated noise field + cross-hatch grid.
//
// Original uniforms: holo.x = time/scroll, holo.y = mouse
// We map: timeUniform -> holo.x (and `time`), mouseUniform -> holo.y

import {
    vec4, float, uv, sin, cos, abs, max,
    texture, Fn, If,
} from 'three/tsl';
import type { ShaderNodeObject, UniformNode, Node } from 'three/tsl';
import type { Texture } from 'three/webgpu';
import { HSLFn, RGBFn, animatedField } from './common';

export function createHolographicShader(
    cardTexture: Texture,
    timeUniform: ShaderNodeObject<UniformNode<number>>,
    mouseUniform: ShaderNodeObject<UniformNode<number>>,
): ShaderNodeObject<Node> {
    return Fn(() => {
        const texUv = uv();
        const tex = texture(cardTexture, texUv).toVar();
        const t = float(timeUniform);
        const mouse = float(mouseUniform);

        // Convert original to HSL directly — no blue pre-blend, which
        // was desaturating gold elements and making hue rotation invisible.
        const hsl = HSLFn(tex).toVar();

        // Animated field (scale=250, time offset by mouse)
        const fieldTime = mouse.mul(7.221).add(t);
        const field = animatedField(texUv, fieldTime, float(250.0));

        // Cosine wave driven by time and field
        const res = float(0.5).add(
            float(0.5).mul(
                cos(t.mul(2.612).add(field.sub(0.5).mul(3.14))),
            ),
        );

        // Cross-hatch grid pattern
        const gridsize = float(0.79);
        const gx = texUv.x.mul(gridsize).mul(20.0);
        const gy = texUv.y.mul(gridsize).mul(45.0);
        const line1 = max(float(7.0).mul(abs(cos(gx))).sub(6.0), 0.0);
        const line2 = max(float(7.0).mul(cos(gy.add(gx))).sub(6.0), 0.0);
        const line3 = max(float(7.0).mul(cos(gy.sub(gx))).sub(6.0), 0.0);
        const fac = float(0.5).mul(max(line1, max(line2, line3)));

        // Rotate hue by field + grid, ensure enough saturation for
        // the rainbow shift to be visible on all card elements
        hsl.x.assign(hsl.x.add(res).add(fac));
        hsl.y.assign(max(hsl.y, float(0.35)).mul(1.3));
        hsl.z.assign(hsl.z.mul(0.6).add(0.4));

        // Uniform blend strength
        const delta = float(0.22);

        // Blend between original and holo-shifted color
        const holoRgb = RGBFn(hsl).mul(vec4(0.9, 0.8, 1.2, tex.a));
        const result = tex.mul(float(1.0).sub(delta)).add(holoRgb.mul(delta)).toVar();

        // Alpha handling: reduce alpha for semi-transparent pixels
        If(result.a.lessThan(0.7), () => {
            result.a.assign(result.a.div(3.0));
        });

        return result;
    })();
}
