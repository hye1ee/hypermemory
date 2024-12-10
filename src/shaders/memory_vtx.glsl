
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPattern;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCenter;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;

// square blur
// void main() {
//     // send uv coord to frag shader
//     vUv = uv;
//     // default code
//     vec3 newPosition = position;
//     newPosition.y += sin(uTime / 1000. + 2. * newPosition.x);
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

// }


void main() {
    vUv = uv;

    // 조각 크기 (픽셀 단위 크기 조정)
    float pieceSize = 0.1; // 조각의 크기 (0.1은 UV 공간에서의 크기)

    // UV 좌표를 기준으로 조각의 중심 계산
    vec2 pieceCenter = floor(vUv / pieceSize) * pieceSize + pieceSize / 2.0;

    // 조각 중심에서의 방향 벡터
    vec2 offset = vUv - pieceCenter;

    // 시간 기반으로 조각 이동
    vec3 newPosition = position;
    newPosition.xy += normalize(offset) * sin(uTime / 1000. + length(offset) * 5.0) * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}