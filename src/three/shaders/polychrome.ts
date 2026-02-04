// Polychrome shader — ported from Balatro's polychrome.fs (LOVE2D GLSL).
// Iridescent oil-slick rainbow via HSL hue rotation driven by animated noise field.
//
// Original uniforms: polychrome.x = time/scroll, polychrome.y = mouse
// We map: timeUniform -> polychrome.x (and `time`), mouseUniform -> polychrome.y

import {
    vec4, float, uv, cos, min, max,
    texture, Fn, If,
} from 'three/tsl';
import type { ShaderNodeObject, UniformNode, Node } from 'three/tsl';
import type { Texture } from 'three/webgpu';
import { HSLFn, RGBFn, animatedField } from './common';

export function createPolychromeShader(
    cardTexture: Texture,
    timeUniform: ShaderNodeObject<UniformNode<number>>,
    mouseUniform: ShaderNodeObject<UniformNode<number>>,
): ShaderNodeObject<Node> {
    return Fn(() => {
        const texUv = uv();
        const tex = texture(cardTexture, texUv).toVar();
        const t = float(timeUniform);
        const mouse = float(mouseUniform);

        // Color analysis
        const low = min(tex.r, min(tex.g, tex.b));
        const high = max(tex.r, max(tex.g, tex.b));
        const delta = high.sub(low);

        // Desaturation factor for low-contrast areas
        const saturation_fac = float(1.0).sub(
            max(float(0.0), float(0.05).mul(float(1.1).sub(delta))),
        );

        // Convert to HSL with saturation pre-adjustment
        const hsl = HSLFn(
            vec4(
                tex.r.mul(saturation_fac),
                tex.g.mul(saturation_fac),
                tex.b,
                tex.a,
            ),
        ).toVar();

        // Animated field (scale=50, time offset by mouse)
        const fieldTime = mouse.mul(2.221).add(t);
        const field = animatedField(texUv, fieldTime, float(50.0));

        // Cosine wave driven by time and field
        const res = float(0.5).add(
            float(0.5).mul(
                cos(t.mul(2.612).add(field.sub(0.5).mul(3.14))),
            ),
        );

        // Rotate hue + boost saturation
        hsl.x.assign(hsl.x.add(res).add(mouse.mul(0.04)));
        hsl.y.assign(min(float(0.6), hsl.y.add(0.5)));

        // Convert back to RGB
        const result = vec4(RGBFn(hsl).rgb, tex.a).toVar();

        // Alpha handling: reduce alpha for semi-transparent pixels
        If(result.a.lessThan(0.7), () => {
            result.a.assign(result.a.div(3.0));
        });

        return result;
    })();
}
