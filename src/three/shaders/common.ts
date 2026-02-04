// Shared TSL helpers ported from Balatro's LOVE2D shaders.
// HSL/RGB conversion, animated noise field.

import {
    Fn, float, vec2, vec4, mod, min, max, sin, cos, length, If,
} from 'three/tsl';
import type { ShaderNodeObject, Node } from 'three/tsl';

// HSL single-channel helper: converts one hue segment to RGB value
export const hueFn = /*#__PURE__*/ Fn(
    ([s_immutable, t_immutable, h_immutable]: ShaderNodeObject<Node>[]) => {
        const s = float(s_immutable);
        const t = float(t_immutable);
        const h = float(h_immutable);
        const hs = mod(h, 1.0).mul(6.0);

        const result = float(s).toVar();

        If(hs.lessThan(1.0), () => {
            result.assign(t.sub(s).mul(hs).add(s));
        }).ElseIf(hs.lessThan(3.0), () => {
            result.assign(t);
        }).ElseIf(hs.lessThan(4.0), () => {
            result.assign(t.sub(s).mul(float(4.0).sub(hs)).add(s));
        });

        return result;
    },
);

// HSL vec4(h,s,l,a) -> RGB vec4(r,g,b,a)
export const RGBFn = /*#__PURE__*/ Fn(([c_immutable]: ShaderNodeObject<Node>[]) => {
    const c = vec4(c_immutable);
    const result = vec4(c.z, c.z, c.z, c.a).toVar();

    If(c.y.greaterThan(0.0001), () => {
        const t = float(0).toVar();
        const s = float(0).toVar();

        If(c.z.lessThan(0.5), () => {
            t.assign(c.y.mul(c.z).add(c.z));
        }).Else(() => {
            t.assign(c.y.mul(c.z).negate().add(c.y.add(c.z)));
        });
        s.assign(c.z.mul(2.0).sub(t));

        result.assign(
            vec4(
                hueFn(s, t, c.x.add(1.0 / 3.0)),
                hueFn(s, t, c.x),
                hueFn(s, t, c.x.sub(1.0 / 3.0)),
                c.w,
            ),
        );
    });

    return result;
});

// RGB vec4(r,g,b,a) -> HSL vec4(h,s,l,a)
export const HSLFn = /*#__PURE__*/ Fn(([c_immutable]: ShaderNodeObject<Node>[]) => {
    const c = vec4(c_immutable);
    const low = min(c.r, min(c.g, c.b));
    const high = max(c.r, max(c.g, c.b));
    const delta = high.sub(low);
    const sum = high.add(low);

    const hsl = vec4(0.0, 0.0, sum.mul(0.5), c.a).toVar();

    If(delta.greaterThan(0.0), () => {
        If(hsl.z.lessThan(0.5), () => {
            hsl.y.assign(delta.div(sum));
        }).Else(() => {
            hsl.y.assign(delta.div(float(2.0).sub(sum)));
        });

        If(high.equal(c.r), () => {
            hsl.x.assign(c.g.sub(c.b).div(delta));
        }).ElseIf(high.equal(c.g), () => {
            hsl.x.assign(c.b.sub(c.r).div(delta).add(2.0));
        }).Else(() => {
            hsl.x.assign(c.r.sub(c.g).div(delta).add(4.0));
        });

        hsl.x.assign(mod(hsl.x.div(6.0), 1.0));
    });

    return hsl;
});

// Animated noise field shared by holo and polychrome shaders.
// uvNode: 0-1 UV, tNode: time value, scaleNode: spatial scale factor
export const animatedField = /*#__PURE__*/ Fn(
    ([uvNode, tNode, scaleNode]: ShaderNodeObject<Node>[]) => {
        const uv_scaled = vec2(uvNode).sub(0.5).mul(scaleNode);

        const field_part1 = uv_scaled.add(
            vec2(
                sin(float(tNode).negate().div(143.634)),
                cos(float(tNode).negate().div(99.4324)),
            ).mul(50.0),
        );
        const field_part2 = uv_scaled.add(
            vec2(
                cos(float(tNode).div(53.1532)),
                cos(float(tNode).div(61.4532)),
            ).mul(50.0),
        );
        const field_part3 = uv_scaled.add(
            vec2(
                sin(float(tNode).negate().div(87.53218)),
                sin(float(tNode).negate().div(49.0)),
            ).mul(50.0),
        );

        const field = float(1.0)
            .add(
                cos(length(field_part1).div(19.483))
                    .add(
                        sin(length(field_part2).div(33.155)).mul(
                            cos(field_part2.y.div(15.73)),
                        ),
                    )
                    .add(
                        cos(length(field_part3).div(27.193)).mul(
                            sin(field_part3.x.div(21.92)),
                        ),
                    ),
            )
            .div(2.0);

        return field;
    },
);
