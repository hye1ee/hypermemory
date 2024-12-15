uniform vec3 glowColor;
varying float intensity;
varying vec2 vUv;
uniform vec3 vNormal;

uniform float uTime;
uniform float uOpacity;
uniform bool uMemory;

void main(){
  vec2 uv = vUv;

  // vec3 glow = glowColor * intensity;
  vec3 glow = vec3(1.) * intensity;
  
  // vec3 color = vec3(step(0.1, uv.y) - step(0.2, uv.y)) - vec3(texture2D(lightningTexture, uv));
  // vec3 color = vec3(1. - step(0.1, uv.y)) - vec3(texture2D(lightningTexture, uv));
  // vec3 color = vec3(texture2D(lightningTexture, uv)) ;

	float alpha = clamp((cos(uTime / 2.) + 1.) / 2. , 0., 1.);

  vec4 color = vec4( glow * 0.5 - 0.3, alpha * uOpacity) * 0.6;

  if(uMemory) gl_FragColor =  color * 0.3;
  else gl_FragColor = color;
}