
varying vec3 vPosition;
varying vec2 vUv;
varying float vProgress;

uniform float uTime;
uniform float uSensor1;
uniform float uSeed;


void main() {
    // send to frag shader
    vUv = uv;
    vProgress = sin((vUv.x / 2. + uSeed) * 10. + uTime / 800.);

    // default code
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

