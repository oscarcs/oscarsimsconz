// Foil shader — purplish interference shimmer with angular and highlight components.
// Inspired by Balatro's foil.fs.

import {
    vec2, vec4, float, uv, sin, cos, dot, min, max, length,
    texture, Fn,
} from 'three/tsl';
import type { ShaderNodeObject, UniformNode, Node } from 'three/tsl';
import type { Texture } from 'three/webgpu';

const ASPECT = 2.5 / 3.5;

export function createFoilShader(
    cardTexture: Texture,
    tilt: ShaderNodeObject<UniformNode<number>>,
    roll: ShaderNodeObject<UniformNode<number>>,
): ShaderNodeObject<Node> {
    return Fn(() => {
        const texUv = uv();
        const tex = texture(cardTexture, texUv).toVar();
        const t = float(tilt);
        const r = float(roll);

        // Center UV, correct for card aspect ratio
        const centeredUv = vec2(
            texUv.x.sub(0.5).mul(ASPECT),
            texUv.y.sub(0.5),
        );

        const blendStrength = float(0.5);

        // Circular interference rings
        const len90 = length(centeredUv.mul(90.0));
        const len113 = length(centeredUv.mul(113.1121));
        const rings = max(
            min(
                float(2.0)
                    .mul(sin(
                        len90.add(t.mul(2.0)).add(
                            float(3.0).mul(float(1.0).add(float(0.8).mul(cos(len113.sub(t.mul(3.121))))))
                        ),
                    ))
                    .sub(1.0)
                    .sub(max(float(5.0).sub(len90), 0.0)),
                1.0,
            ),
            0.0,
        );

        // Angular shimmer via rotating dot product
        const rotater = vec2(cos(t.mul(0.1221)), sin(t.mul(0.3512)));
        const angle = dot(rotater, centeredUv).div(
            length(rotater).mul(length(centeredUv)),
        );
        const shimmer = max(
            min(
                float(5.0)
                    .mul(cos(
                        r.mul(0.3).add(
                            angle.mul(3.14).mul(float(2.2).add(float(0.9).mul(sin(t.mul(1.65).add(r.mul(0.2))))))
                        ),
                    ))
                    .sub(4.0)
                    .sub(max(float(2.0).sub(length(centeredUv.mul(20.0))), 0.0)),
                1.0,
            ),
            0.0,
        );

        // Low-freq horizontal highlight
        const hHighlight = float(0.3).mul(
            max(
                min(
                    float(2.0)
                        .mul(sin(
                            t.mul(5.0).add(texUv.x.mul(3.0)).add(
                                float(3.0).mul(float(1.0).add(float(0.5).mul(cos(t.mul(7.0)))))
                            ),
                        ))
                        .sub(1.0),
                    1.0,
                ),
                -1.0,
            ),
        );

        // Low-freq vertical highlight
        const vHighlight = float(0.3).mul(
            max(
                min(
                    float(2.0)
                        .mul(sin(
                            t.mul(6.66).add(texUv.y.mul(3.8)).add(
                                float(3.0).mul(float(1.0).add(float(0.5).mul(cos(t.mul(3.414)))))
                            ),
                        ))
                        .sub(1.0),
                    1.0,
                ),
                -1.0,
            ),
        );

        // Combine all factors
        const combined = max(
            max(rings, max(shimmer, max(hHighlight, max(vHighlight, 0.0)))).add(
                float(2.2).mul(rings.add(shimmer).add(hHighlight).add(vHighlight)),
            ),
            0.0,
        );

        // Purple hue: boost red + blue, suppress green
        const strength = float(0.4);
        const scaled = blendStrength.mul(strength);
        const newR = tex.r.sub(scaled).add(scaled.mul(combined).mul(0.7));
        const newG = tex.g.sub(scaled).add(scaled.mul(combined).mul(0.15));
        const newB = tex.b.add(scaled.mul(combined).mul(1.5));

        return vec4(newR, newG, newB, tex.a);
    })();
}
