
varying float vIntensity;

attribute float index;

uniform float uTime;
uniform bool uDamp;

uniform float uSensor1;
uniform float uSeed;
uniform float uDuration;
uniform float uLength;
uniform float uNeighbor;
uniform float uSize;


void main() {
    // send to frag shader
    vIntensity = sin(uTime + index);

    float dampIdx = index;
    if(uDamp) dampIdx = 0.;

    float movement = sin(uTime * (uDamp ? 1.7 : 3.5) + dampIdx) * (uDamp ? max(index * uSize / 5000., 1.) : 1.) / (2. - uSize);
    float damp = movement * exp(-.5 * uTime);

    vec3 newPosition = position +  normalize(position) * movement * (1. + uSize);

    // default code
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = 2. + movement * (1. + uSize * 2.); // 점의 크기 설정

}

