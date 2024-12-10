varying vec3 vPosition;
varying vec2 vUv;
varying float vProgress;

uniform float time;
uniform float uSensor1;

void main() {
    vec2 uv = vUv;

    vec3 color = vec3(0.1, 0.3, 0.6);

    vec4 color1 = vec4(1., 0., 0., 1.);
    vec4 color2 = vec4(1., 1., 1., 0.);

    vec3 finalColor = mix(color, color * .25, vProgress);

    gl_FragColor = vec4(finalColor, 1.);
}
