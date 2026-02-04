// Polychrome shader — iridescent oil-slick rainbow via HSL hue rotation.
// Inspired by Balatro's polychrome.fs.

import {
    vec4, float, uv, cos, min, max,
    texture, Fn, If,
} from 'three/tsl';
import type { ShaderNodeObject, UniformNode, Node } from 'three/tsl';
import type { Texture } from 'three/webgpu';
import { HSLFn, RGBFn, animatedField } from './common';

export function createPolychromeShader(
    cardTexture: Texture,
    tilt: ShaderNodeObject<UniformNode<number>>,
    roll: ShaderNodeObject<UniformNode<number>>,
): ShaderNodeObject<Node> {
    return Fn(() => {
        const texUv = uv();
        const tex = texture(cardTexture, texUv).toVar();
        const t = float(tilt);
        const r = float(roll);

        // Desaturation factor for low-contrast areas
        const low = min(tex.r, min(tex.g, tex.b));
        const high = max(tex.r, max(tex.g, tex.b));
        const delta = high.sub(low);
        const desatFac = float(1.0).sub(
            max(float(0.0), float(0.05).mul(float(1.1).sub(delta))),
        );

        const hsl = HSLFn(
            vec4(tex.r.mul(desatFac), tex.g.mul(desatFac), tex.b, tex.a),
        ).toVar();

        // Animated noise field
        const field = animatedField(texUv, r.mul(2.221).add(t), float(50.0));

        // Cosine wave driven by time and field
        const wave = float(0.5).add(
            float(0.5).mul(cos(t.mul(2.612).add(field.sub(0.5).mul(3.14)))),
        );

        // Rotate hue, boost saturation
        hsl.x.assign(hsl.x.add(wave).add(r.mul(0.04)));
        hsl.y.assign(min(float(0.6), hsl.y.add(0.5)));

        const result = vec4(RGBFn(hsl).rgb, tex.a).toVar();

        If(result.a.lessThan(0.7), () => {
            result.a.assign(result.a.div(3.0));
        });

        return result;
    })();
}
