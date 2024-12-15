varying vec3 vPosition;
varying vec2 vUv;
varying float vProgress;

uniform float time;
uniform float uSensor1;
uniform float uSeed;

uniform bool uMemory;
uniform int uColor1;

void main() {
    vec3 color = vec3(1.0, 0.86, 0.14);

    if (uColor1 == 1){
        color = vec3(1.0, 0.24, 0.46);
    } else if (uColor1 == 2){
        color = vec3(0.0, 0.63, 0.34);
    }

    vec4 color1 = vec4(color, 1.);
    vec4 color2 = vec4(color, 0.);

    // circular particle
    vec2 uv = gl_PointCoord.xy * 2.0 - 1.0; // normalize to [-1, 1]
    float dist = length(uv);
    if (dist > 1.0) { // dist from the center
        discard;
    }

    vec4 finalColor = mix(color2, color1, vProgress);

    if(uMemory) gl_FragColor = finalColor * 0.2;
    else gl_FragColor = finalColor;
}
