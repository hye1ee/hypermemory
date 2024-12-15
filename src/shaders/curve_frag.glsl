varying vec2 vUv;
varying float vProgress;

uniform float time;
uniform float uSensor1;
uniform bool uMemory;
uniform int uColor1;

void main() {
    vec2 uv = vUv;

    vec3 color = vec3(0.92, 0.34, 0.96);

    // if (uColor1 == 1){
    //     color = vec3(0.15, 0.74, 0.98);
    // }else if (uColor1 == 2){
    //     color = vec3(0.0, 0.63, 0.34);
    // }
    color = vec3(0.15, 0.74, 0.98);

    vec4 color1 = vec4(1., 0., 0., 1.);
    vec4 color2 = vec4(1., 1., 1., 0.);

    vec3 finalColor = mix(color, color * .25, vProgress);


    if(uMemory) gl_FragColor = vec4(finalColor, 0);
    else gl_FragColor = vec4(finalColor, 0.8 + vProgress);

    // if(uMemory) gl_FragColor = vec4(finalColor, 0.2);
    // else gl_FragColor = vec4(finalColor, 0.2 + vProgress);
}
