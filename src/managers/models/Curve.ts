import * as THREE from "three";
import { getRandom } from "../../utils";
import fragmentShader from '../../shaders/fragment.glsl';
import vertexShader from '../..//shaders/vertex.glsl';

export class Curve {
  status: "grow" | "live" | "shrink" | "dead";
  mesh: THREE.Mesh;
  private length: number;

  private life: number;
  private draw: number;

  constructor(points: THREE.Vector3[]) {
    this.status = "grow"
    this.mesh = this.init(points);
    this.length = this.mesh.geometry.drawRange.count;

    this.life = getRandom(3, 10, false) * 1000; //milli seconds
    this.draw = 0;
    this.mesh.geometry.setDrawRange(0, this.draw);
  }

  init(points: THREE.Vector3[]) {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 1, 8, false);

    // Vertex Colors
    const vertexColors = new Float32Array(
      tubeGeometry.attributes.position.count * 3
    );
    tubeGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(vertexColors, 3)
    );
    tubeGeometry.setDrawRange(0, tubeGeometry.attributes.position.count);

    // const material = new THREE.MeshStandardMaterial({
    //   vertexColors: true,
    // });

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
    });
    return new THREE.Mesh(tubeGeometry, material);
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
