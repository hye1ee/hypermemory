varying vec2 vUv;
varying vec3 vPosition;

uniform vec2 uResolution;
uniform vec3 uCenter;

uniform bool uDev;
uniform float uTime;
uniform float uSensor1;
uniform float uSensor2;
uniform int uSeed;

uniform sampler2D uTexture;

void func1(float val1, float val2) {
    vec3 newPosition = position;

    newPosition.y += sin(uTime * val2 / 500. + 2. * newPosition.x) / ((val2 - .5) * 5.);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

void func2(float val1, float val2) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}


void func3(float val1, float val2) {
    vec3 newPosition = position;

    vec3 direction = position - uCenter;
    newPosition += (length(direction) * (val1 - 0.5) * direction);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}



void main() {
    vUv = uv;
    vPosition = position;

    float val1 = uSensor1;
    float val2 = uSensor2;

    if(uDev){
        // give random value between 0-1
        val1 = (sin(uTime / 500.) + 1.) / 2.;
        val2 = (cos(uTime / 500.) + 1.) / 2.;
    }

    if (uSeed == 1) {
        func1(val1, val2);  // uSeed가 1일 때 func1 실행
    } else if (uSeed == 2) {
        func2(val1, val2);  // uSeed가 2일 때 func2 실행
    } else {
        func3(val1, val2);  // uSeed가 3일 때 func3 실행
    }
}