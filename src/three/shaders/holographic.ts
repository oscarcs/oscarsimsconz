// Holographic shader — rainbow HSL hue rotation with honeycomb pattern.
// Inspired by Balatro's holo.fs.

import {
    vec2, vec4, float, uv, sin, cos, abs, max, length, fract,
    texture, Fn, If,
} from 'three/tsl';
import type { ShaderNodeObject, UniformNode, Node } from 'three/tsl';
import type { Texture } from 'three/webgpu';
import { HSLFn, RGBFn, animatedField } from './common';

export function createHolographicShader(
    cardTexture: Texture,
    tilt: ShaderNodeObject<UniformNode<number>>,
    roll: ShaderNodeObject<UniformNode<number>>,
): ShaderNodeObject<Node> {
    return Fn(() => {
        const texUv = uv();
        const tex = texture(cardTexture, texUv).toVar();
        const t = float(tilt);
        const r = float(roll);

        const hsl = HSLFn(tex).toVar();

        // Animated noise field
        const field = animatedField(texUv, r.mul(7.221).add(t), float(250.0));

        // Cosine wave driven by tilt and field
        const wave = float(0.5).add(
            float(0.5).mul(cos(t.mul(2.612).add(field.sub(0.5).mul(3.14)))),
        );

        // Honeycomb pattern — two candidate hex grids, pick nearest center
        const hexScale = float(5.0);
        const px = texUv.x.mul(hexScale);
        const py = texUv.y.mul(hexScale).mul(3.5 / 2.5);
        const sqrt3 = float(1.732);

        // Grid A
        const ax = fract(px).sub(0.5);
        const ay = fract(py.div(sqrt3)).mul(sqrt3).sub(sqrt3.mul(0.5));
        const da = ax.mul(ax).add(ay.mul(ay));

        // Grid B (offset by half cell in both axes)
        const bx = fract(px.add(0.5)).sub(0.5);
        const by = fract(py.add(sqrt3.mul(0.5)).div(sqrt3)).mul(sqrt3).sub(sqrt3.mul(0.5));
        const db = bx.mul(bx).add(by.mul(by));

        // Pick closest hex center
        const hcX = float(0).toVar();
        const hcY = float(0).toVar();
        If(da.lessThan(db), () => {
            hcX.assign(ax);
            hcY.assign(ay);
        }).Else(() => {
            hcX.assign(bx);
            hcY.assign(by);
        });

        const hexAx = abs(hcX);
        const hexAy = abs(hcY);
        const hexDist = max(hexAx.mul(0.866).add(hexAy.mul(0.5)), hexAy);
        const edge = max(float(1.0).sub(abs(hexDist.sub(0.4)).mul(7.0)), 0.0);
        const grid = edge.mul(edge);

        // Rotate hue, boost saturation for visible rainbow
        hsl.x.assign(hsl.x.add(wave).add(grid));
        hsl.y.assign(max(hsl.y, float(0.35)).mul(1.2));
        hsl.z.assign(hsl.z.mul(0.7).add(0.3));

        // Blend original with holo-shifted color
        const blendStrength = float(0.15);
        const holoRgb = RGBFn(hsl).mul(vec4(0.9, 0.8, 1.2, tex.a));
        const result = tex.mul(float(1.0).sub(blendStrength)).add(holoRgb.mul(blendStrength)).toVar();

        If(result.a.lessThan(0.7), () => {
            result.a.assign(result.a.div(3.0));
        });

        return result;
    })();
}
