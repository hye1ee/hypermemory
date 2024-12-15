
varying vec3 vPosition;
varying vec2 vUv;
varying float vProgress;
attribute float index;

uniform float uTime;
uniform float uSensor1;
uniform float uSeed;
uniform float uDuration;
uniform float uLength;
uniform float uNeighbor;


void main() {
    // send to frag shader
    vUv = uv;
    float activeIndex = mod(floor(uTime / uDuration), float(uLength + 1.));
    float dist = abs(index - activeIndex);

    if (dist <= uNeighbor) {
        vProgress = 1. - (dist / uNeighbor);
    } else {
        vProgress = 0.;
    }

    // default code
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 8.; // 점의 크기 설정
}

