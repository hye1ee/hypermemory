varying vec3 vPosition;
varying vec2 vUv;
varying float vProgress;

uniform float time;
uniform float uSensor1;

void main() {
    vec2 uv = vUv;

    vec4 color = vec4(1., 0.3, 0.6, 1.);

    vec4 color1 = vec4(1., 0., 0., 1.);
    vec4 color2 = vec4(1., 0.3, 0.6, 0.);

    vec4 finalColor = mix(color2, color, vProgress);

    gl_FragColor = vec4(finalColor);
}
