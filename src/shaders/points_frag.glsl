varying float vIntensity;

uniform float time;
uniform float uSensor1;

void main() {
    // circular particle
    vec2 uv = gl_PointCoord.xy * 2.0 - 1.0; // normalize to [-1, 1]
    float dist = length(uv);
    if (dist > 1.0) { // dist from the center
        discard;
    }

    gl_FragColor = vec4(1., 1., 1., vIntensity / 2.);
}
