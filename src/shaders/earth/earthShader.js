export const earthVertex = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {

    vUv = uv;

    vNormal = normalize(
        normalMatrix * normal
    );

    vec4 worldPosition =
        modelMatrix * vec4(position, 1.0);

    vWorldPosition =
        worldPosition.xyz;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
}
`;

export const earthFragment = `

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uTopographyTexture;

uniform vec3 uSunDirection;

uniform float uTime;
uniform float uProgress;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;


/* ---------------------------------------------
   Soft atmospheric edge
--------------------------------------------- */

float atmosphere(
    vec3 normal,
    vec3 viewDirection
) {

    float fresnel =
        1.0 -
        max(
            dot(normal, viewDirection),
            0.0
        );

    return pow(
        fresnel,
        3.5
    );
}


/* ---------------------------------------------
   Main
--------------------------------------------- */

void main() {

    vec3 normal =
        normalize(vNormal);

    vec3 viewDirection =
        normalize(
            cameraPosition -
            vWorldPosition
        );


    /* -----------------------------------------
       DAY TEXTURE
    ----------------------------------------- */

    vec3 day =
        texture2D(
            uDayTexture,
            vUv
        ).rgb;


    /* -----------------------------------------
       NIGHT LIGHTS
    ----------------------------------------- */

    vec3 night =
        texture2D(
            uNightTexture,
            vUv
        ).rgb;


    /*
     * Extract brightness from night texture.
     */
    float nightBrightness =
        max(
            max(
                night.r,
                night.g
            ),
            night.b
        );


    /*
     * Sun lighting.
     */
    float sun =
        dot(
            normal,
            normalize(uSunDirection)
        );


    /*
     * Smooth day/night boundary.
     */
    float dayFactor =
        smoothstep(
            -0.12,
            0.28,
            sun
        );


    /*
     * Night side.
     */
    float nightFactor =
        1.0 -
        dayFactor;


    /*
     * Day Earth.
     */
    vec3 dayColor =
        day *
        (
            0.38 +
            dayFactor * 0.85
        );


    /*
     * Night Earth.
     */
    vec3 nightColor =
        night *
        nightFactor *
        1.8;


    /*
     * Warm city lights.
     */
    vec3 cityLights =
        vec3(
            1.0,
            0.48,
            0.12
        ) *
        nightBrightness *
        nightFactor *
        1.5;


    /*
     * Topography subtle detail.
     */
    float terrain =
        texture2D(
            uTopographyTexture,
            vUv
        ).r;

    dayColor +=
        terrain *
        0.045;


    /*
     * Combine Earth.
     */
    vec3 color =
        dayColor +
        nightColor * 0.15 +
        cityLights;


    /* -----------------------------------------
       ATMOSPHERE
    ----------------------------------------- */

    float rim =
        atmosphere(
            normal,
            viewDirection
        );


    vec3 atmosphereColor =
        vec3(
            0.05,
            0.34,
            0.85
        );


    color +=
        atmosphereColor *
        rim *
        0.65;


    /* -----------------------------------------
       CINEMATIC SCROLL FADE
    ----------------------------------------- */

    float earthVisibility =
        1.0 -
        smoothstep(
            0.15,
            0.58,
            uProgress
        );


    color *=
        0.82 +
        earthVisibility * 0.18;


    gl_FragColor =
        vec4(
            color,
            1.0
        );
}
`;