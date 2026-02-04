// Foil shader — ported from Balatro's foil.fs (LOVE2D GLSL).
// Blue-shifted interference shimmer with angular and scan-line components.
//
// Original uniforms: foil.x = time, foil.y = mouse x position
// We map: timeUniform -> foil.x, mouseUniform -> foil.y

import {
    vec2, vec4, float, uv, sin, cos, dot, min, max, length,
    texture, Fn,
} from 'three/tsl';
import type { ShaderNodeObject, UniformNode, Node } from 'three/tsl';
import type { Texture } from 'three/webgpu';

const ASPECT = 2.5 / 3.5; // card width/height for UV correction

export function createFoilShader(
    cardTexture: Texture,
    timeUniform: ShaderNodeObject<UniformNode<number>>,
    mouseUniform: ShaderNodeObject<UniformNode<number>>,
): ShaderNodeObject<Node> {
    return Fn(() => {
        const texUv = uv();
        const tex = texture(cardTexture, texUv).toVar();
        const t = float(timeUniform); // foil.r / foil.x
        const mouse = float(mouseUniform); // foil.g / foil.y

        // Center UV and correct for card aspect ratio
        const adjusted_uv = vec2(
            texUv.x.sub(0.5).mul(ASPECT),
            texUv.y.sub(0.5),
        );

        // Uniform blend strength — original was color-dependent which made
        // text/QR appear as a separate layer above the shader effect.
        const delta = float(0.5);

        // fac1: circular interference rings
        const len90 = length(adjusted_uv.mul(90.0));
        const len113 = length(adjusted_uv.mul(113.1121));
        const fac = max(
            min(
                float(2.0)
                    .mul(
                        sin(
                            len90
                                .add(t.mul(2.0))
                                .add(
                                    float(3.0).mul(
                                        float(1.0).add(
                                            float(0.8).mul(
                                                cos(len113.sub(t.mul(3.121))),
                                            ),
                                        ),
                                    ),
                                ),
                        ),
                    )
                    .sub(1.0)
                    .sub(max(float(5.0).sub(len90), 0.0)),
                1.0,
            ),
            0.0,
        );

        // fac2: angular shimmer via rotating dot product
        const rotater = vec2(cos(t.mul(0.1221)), sin(t.mul(0.3512)));
        const angle = dot(rotater, adjusted_uv).div(
            length(rotater).mul(length(adjusted_uv)),
        );
        const fac2 = max(
            min(
                float(5.0)
                    .mul(
                        cos(
                            mouse.mul(0.3).add(
                                angle.mul(3.14).mul(
                                    float(2.2).add(
                                        float(0.9).mul(
                                            sin(t.mul(1.65).add(mouse.mul(0.2))),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    )
                    .sub(4.0)
                    .sub(max(float(2.0).sub(length(adjusted_uv.mul(20.0))), 0.0)),
                1.0,
            ),
            0.0,
        );

        // fac3: horizontal scan line
        const fac3 = float(0.3).mul(
            max(
                min(
                    float(2.0)
                        .mul(
                            sin(
                                t.mul(5.0)
                                    .add(texUv.x.mul(3.0))
                                    .add(
                                        float(3.0).mul(
                                            float(1.0).add(
                                                float(0.5).mul(cos(t.mul(7.0))),
                                            ),
                                        ),
                                    ),
                            ),
                        )
                        .sub(1.0),
                    1.0,
                ),
                -1.0,
            ),
        );

        // fac4: vertical scan line
        const fac4 = float(0.3).mul(
            max(
                min(
                    float(2.0)
                        .mul(
                            sin(
                                t.mul(6.66)
                                    .add(texUv.y.mul(3.8))
                                    .add(
                                        float(3.0).mul(
                                            float(1.0).add(
                                                float(0.5).mul(cos(t.mul(3.414))),
                                            ),
                                        ),
                                    ),
                            ),
                        )
                        .sub(1.0),
                    1.0,
                ),
                -1.0,
            ),
        );

        // Combine all factors
        const maxfac = max(
            max(fac, max(fac2, max(fac3, max(fac4, 0.0)))).add(
                float(2.2).mul(fac.add(fac2).add(fac3).add(fac4)),
            ),
            0.0,
        );

        // Apply foil coloring: subtle blue boost, gentle red/green shift
        // Scaled down from original (0.3/0.3/1.9) to preserve QR scannability
        const strength = float(0.4);
        const scaledDelta = delta.mul(strength);
        const newR = tex.r.sub(scaledDelta).add(scaledDelta.mul(maxfac).mul(0.3));
        const newG = tex.g.sub(scaledDelta).add(scaledDelta.mul(maxfac).mul(0.3));
        const newB = tex.b.add(scaledDelta.mul(maxfac).mul(1.5));

        return vec4(newR, newG, newB, tex.a);
    })();
}
