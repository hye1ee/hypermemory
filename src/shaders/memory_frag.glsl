varying vec2 vUv;
varying vec3 vPosition;

uniform vec2 uResolution;

uniform bool uDev;
uniform float uTime;
uniform float uSensor1;
uniform float uSensor2;
uniform int uSeed;

uniform sampler2D uTexture;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

float random(float x){
    return fract(sin(x)*43758.5453);
}

float random(vec2 st){
    return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float rchar(vec2 outer,in vec2 inner){
    float grid = 5.;
    vec2 margin = vec2(.2,.05);
    float seed = 2.;
    vec2 borders = step(margin,inner)*step(margin,1.-inner);
    return step(.5,random(outer*seed+floor(inner*grid))) * borders.x * borders.y;
}

vec3 matrix(vec2 st){
    float rows = 2.0 + (uSensor2 - .5) * 5.;
    vec2 ipos = floor(st*rows);

    ipos += vec2(.0,floor(uTime / 100. * random(ipos.x)));

    vec2 fpos = fract(st*rows);
    vec2 center = (.5-fpos);

    float pct = random(ipos);
    float glow = (1.-dot(center,center)*3.)*2.0;

    // vec3 color = vec3(0.643,0.851,0.690) * ( rchar(ipos,fpos) * pct );
    // color +=  vec3(0.027,0.180,0.063) * pct * glow;
    vec3 mat = vec3(rchar(ipos,fpos) * pct * glow);
    if(mat.x == 0.) return mat;

    float rand = random(uTime + uSensor1 + uSensor2 + st.x);
    if(rand > 0.9) {
        mat -= vec3(.8, 0., 0.);
    }else if(rand > 0.8) {
        mat -= vec3(0., .8, 0.);
    }else if(rand > 0.7) {
        mat -= vec3(0., 0., .8);
    }
    return mat;
}

void func1(float val1, float val2) {

    vec2 uv = vUv;
    vec4 baseState = texture2D(uTexture, uv);

    float glitch = val1 * 3.;
    if(val1 > 0.5) glitch = (1. - val1) * 3.;

    float segment = floor(uv.y * (val2 + 1.) * 20.0); 
    float randomValue = fract(sin(segment * 12345.6789 + glitch) * 43758.5453); 
    vec2 offset = vec2(randomValue * 0.03, 0.0) * glitch;

    vec4 redGlitch = texture2D(uTexture, uv + offset);
    vec4 greenGlitch = texture2D(uTexture, uv - offset);
    vec4 blueGlitch = texture2D(uTexture, uv);

    if (mod(segment, 3.0) == 0.0) {
        gl_FragColor = vec4(redGlitch.r, greenGlitch.g, baseState.b, 1.0);
    } else if (mod(segment, 3.0) == 1.0) {
        gl_FragColor = vec4(baseState.r, greenGlitch.g, blueGlitch.b, 1.0);
    } else {
        gl_FragColor = vec4(redGlitch.r, baseState.g, blueGlitch.b, 1.0);
    }
}

void func2(float val1, float val2) {
    vec2 uv = vUv;
    float intensity = val2 * 1.;
    float wave1 = sin(uv.x * 5.0 + uTime * 0.005 + val1 * 5.0) * intensity;
    float wave2 = sin(uv.y * 6.0 + uTime * 0.008 + val1 * 4.0) * intensity;
    float wave3 = cos(uv.x * 4.0 + uTime * 0.005 + val2 * 3.0) * intensity;
    float wave4 = cos(uv.y * 4.0 + uTime * 0.007 + val2 * 3.5) * intensity;

    uv.y += (wave1 + wave2);
    uv.x += (wave3 + wave4);
    
    gl_FragColor = texture2D(uTexture, uv);
}

void func3(float val1, float val2) {
    vec2 uv = vUv;
    vec3 position = vec3(5. * gl_FragCoord.xy / uResolution.xy, uTime * 0.0005 + val1);
    vec4 texColor = texture2D(uTexture, uv);

    vec3 color = texColor.rgb;
    // float noise = cnoise(position);

    // if (val2 < 0.3){
    //     color.r -= ((val2 - .5) * noise) / 2.;
    // } else if (val2 < 0.6) {
    //     color.g -= ((val2 - .5) * noise) / 2.;
    // } else {
    //     color.b -= ((val2 - .5) * noise) / 2.;
    // }

    // texColor = vec4(color + (val2 - .5) * noise, 1.);

    position.y *= uResolution.y / uResolution.x;
    vec3 letter = matrix(position.xy) / (3. + uSensor2 * 2.);

    if(uSensor2 > .5){
        color += letter;
    }else color -= letter;

    gl_FragColor = vec4(color, 1.);
}


void main() {
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
