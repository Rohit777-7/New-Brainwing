export const atmosphereVertex = `

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

    vNormal =
        normalize(
            normalMatrix *
            normal
        );

    vPosition =
        position;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(
            position,
            1.0
        );
}
`;

export const atmosphereFragment = `

uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

    vec3 viewDirection =
        normalize(
            cameraPosition -
            vPosition
        );

    float fresnel =
        1.0 -
        max(
            dot(
                vNormal,
                viewDirection
            ),
            0.0
        );

    fresnel =
        pow(
            fresnel,
            2.8
        );

    float pulse =
        0.9 +
        sin(
            uTime * 0.35
        ) *
        0.05;

    vec3 color =
        vec3(
            0.035,
            0.25,
            0.75
        );

    gl_FragColor =
        vec4(
            color,
            fresnel *
            0.42 *
            pulse
        );
}
`;