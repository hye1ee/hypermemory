import * as THREE from "three";
import { getRandom } from "../../utils";
import fragmentShader from '../../shaders/curve_frag.glsl';
import vertexShader from '../../shaders/curve_vtx.glsl';
import particlesVertexShader from "../../shaders/particles_vtx.glsl"
import particlesFragmentShader from "../../shaders/particles_frag.glsl"

export class Curve {
  status: "grow" | "live" | "shrink" | "dead";
  mesh: THREE.Mesh;
  particles: THREE.Object3D;

  private length: number;

  private life: number;
  private draw: number;
  private material: THREE.ShaderMaterial | null = null;
  private particlesMaterial: THREE.ShaderMaterial | null = null;

  constructor(points: THREE.Vector3[]) {
    this.status = "grow"

    const data = this.init(points);
    this.mesh = data.mesh;
    this.particles = data.particles;

    this.length = this.mesh.geometry.index?.count ?? Infinity;
    this.life = getRandom(3, 10, false) * 1000; //milli seconds
    this.draw = 0;
  }

  init(points: THREE.Vector3[]): { mesh: THREE.Mesh, particles: THREE.Points } {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 128, 0.3, 10, true);

    // Vertex Colors
    const vertexColors = new Float32Array(
      tubeGeometry.attributes.position.count * 3
    );
    tubeGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(vertexColors, 3)
    );
    // tubeGeometry.setDrawRange(0, tubeGeometry.attributes.position.count * 3);

    // const material = new THREE.MeshStandardMaterial({
    //   vertexColors: true,
    // });

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0.0 },
        uSensor1: { value: 0.0 },
        uSeed: { value: Math.random() },
        uMemory: { value: false },
        uColor1: { value: 1 },
        uColor2: { value: 1 },
      },
    });
    const mesh = new THREE.Mesh(tubeGeometry, this.material);


    const particlesGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(500));
    this.particlesMaterial = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0.0 },
        uSensor1: { value: 0.0 },
        uSeed: { value: Math.random() },
        uDuration: { value: 100 },
        uLength: { value: 500 },
        uNeighbor: { value: 10 },
        uMemory: { value: false },
        uColor1: { value: 1 },
        uColor2: { value: 1 },
      },
    });
    // add index attributes
    const indices = new Float32Array(particlesGeometry.attributes.position.count);
    for (let i = 0; i < 500; i++) {
      indices[i] = i; // 각 정점의 인덱스
    }
    particlesGeometry.setAttribute(
      'index',
      new THREE.BufferAttribute(indices, 1)
    );
    const particles = new THREE.Points(particlesGeometry, this.particlesMaterial);

    return { mesh, particles };
  }

  updateUniformVar = (label: string, value: number | boolean | THREE.Vector3) => {
    if (this.material) this.material.uniforms[label].value = value;
    if (this.particlesMaterial) this.particlesMaterial.uniforms[label].value = value;
  }
  updateColor(time: number): void {
    if (!this.mesh) return;

    const colors = this.mesh.geometry.attributes.color.array;
    const positionCount = this.mesh.geometry.attributes.position.count;

    for (let i = 0; i < positionCount; i++) {
      // Create a gradient that shifts over time
      const t = (i / positionCount + time * 0.2) % 1;
      const color = new THREE.Color();
      color.setHSL(t, 1.0, 0.5); // HSL 색상 조정

      // Apply color to the vertex
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Mark colors as needing update
    this.mesh.geometry.attributes.color.needsUpdate = true;
  }

  live(delta: number): void {
    this.life -= delta;
    if (this.life < 0) this.status = "shrink";
  }

  grow(delta: number): void {
    if (!this.mesh) return;

    this.draw = Math.min(this.draw += delta, this.length);
    this.mesh.geometry.setDrawRange(0, this.draw);

    if (this.draw === this.length) this.status = "live";
  }

  // 점진적으로 줄어들며 사라지기
  shrink(delta: number): void {
    if (!this.mesh) return;

    this.draw = Math.max(this.draw -= delta, 0);
    this.mesh.geometry.setDrawRange(0, this.draw);

    if (this.draw === 0) this.status = "dead";
  }
}
