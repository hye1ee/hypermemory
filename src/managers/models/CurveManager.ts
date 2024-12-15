import * as THREE from "three";
import { Curve } from "./Curve"; // Curve 클래스가 별도 파일로 존재한다고 가정
import { getRandom } from "../../utils";
import { SerialData } from "../../type";
import { brainManager, stateManager } from "..";



export default class CurveManager {
  static instance: CurveManager | null = null;
  private curves: Curve[] = [];
  private MIN_CURVE_LENGTH: number = 4;
  private MAX_CURVE_LENGTH: number = 8;

  private add: ((object: THREE.Object3D) => void) | null = null;
  private remove: ((object: THREE.Object3D) => void) | null = null;

  private isEnded: boolean = false;
  private uColor1: number = 1;
  private uColor2: number = 1;

  constructor(add: (object: THREE.Object3D) => void, remove: (object: THREE.Object3D) => void) {
    if (CurveManager.instance) return CurveManager.instance;

    this.add = add;
    this.remove = remove;

    CurveManager.instance = this;
  }

  init() {
    this.uColor1 = Math.floor(Math.random() * 3) + 1;
    this.uColor2 = Math.floor(Math.random() * 2) + 1;

    this.isEnded = false;
    this.createMemoryWithRandomDelay();
  }

  createMemoryWithRandomDelay() {
    if (this.isEnded) return; // end loop
    const randomDelay = Math.floor(Math.random() * 2); // 3 ~ 6초 사이

    const parent = brainManager.getBrainChild();
    if (parent) this.createCurve(parent);

    setTimeout(() => {
      this.createMemoryWithRandomDelay();
    }, randomDelay * 1000);
  }

  createMeshCurve(mesh: THREE.Mesh): void {

    if (!this.add || !this.remove) return;

    if (this.curves.length > 15) {
      const firstItem = this.curves[0];
      this.remove(firstItem.mesh);
      this.remove(firstItem.particles);

      this.curves.shift();
    }

    // get points from brain mesh
    const vertices = mesh.geometry.attributes.position.array as Float32Array;
    const indices = mesh.geometry.index?.array; // 정점의 인덱스 (Face 연결 정보)
    if (!indices) return;

    const getNeighbors = (indices: THREE.TypedArray) => {
      const neighbors: {
        [index: number]: number[];
      } = {};
      for (let i = 0; i < indices.length; i += 3) {
        const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
        if (!neighbors[a]) neighbors[a] = [];
        if (!neighbors[b]) neighbors[b] = [];
        if (!neighbors[c]) neighbors[c] = [];
        neighbors[a].push(b, c);
        neighbors[b].push(a, c);
        neighbors[c].push(a, b);
      }
      return neighbors;
    }

    const points: THREE.Vector3[] = [];
    const neighbors = getNeighbors(indices);
    const startIdx = Math.floor(Math.random() * vertices.length / 3) * 3;
    const length = getRandom(this.MIN_CURVE_LENGTH, this.MAX_CURVE_LENGTH, false)

    let index = startIdx;
    for (let i = 0; i < length; i++) {
      const adjacent = neighbors[index];
      if (!adjacent || adjacent.length === 0) {
        console.log("hi")
        break;
      }

      index = adjacent[Math.floor(Math.random() * adjacent.length)];
      points.push(
        new THREE.Vector3(
          vertices[index * 3],
          vertices[index * 3 + 1],
          vertices[index * 3 + 2]
        ).applyMatrix4(mesh.matrixWorld)
      );
    }
    if (points.length === 0) return;

    // generate new curve based on the points
    const newCurve = new Curve(points);
    this.add(newCurve.mesh);
    this.curves.push(newCurve);
  }

  createCurve(mesh: THREE.Mesh): void {

    if (!this.add || !this.remove) return;

    // get points from brain mesh
    const vertices = mesh.geometry.attributes.position.array as Float32Array;
    const vertexCount = vertices.length / 3;

    const points: THREE.Vector3[] = [];
    const num = getRandom(this.MIN_CURVE_LENGTH, this.MAX_CURVE_LENGTH, false)

    for (let i = 0; i < num; i++) {
      const index = Math.floor(Math.random() * vertexCount) * 3;
      points.push(
        new THREE.Vector3(
          vertices[index],
          vertices[index + 1],
          vertices[index + 2]
        ).applyMatrix4(mesh.matrixWorld)
      );
    }

    // generate new curve based on the points
    const newCurve = new Curve(points);
    this.add(newCurve.mesh);
    this.add(newCurve.particles);

    this.curves.push(newCurve);
  }

  // 모든 곡선 업데이트
  update(clock: THREE.Clock, sensor: SerialData): void {
    const delta = clock.getDelta() * 1000;
    const time = clock.getElapsedTime() * 1000;

    this.curves.forEach((curve, index) => {
      // curve.updateColor(time);
      curve.updateUniformVar("uTime", time);
      curve.updateUniformVar("uSensor1", sensor[1]);
      curve.updateUniformVar("uColor1", this.uColor1);
      curve.updateUniformVar("uColor2", this.uColor2);
      curve.updateUniformVar("uMemory", stateManager.getState() === "memory");

      if (curve.status === "grow") {
        curve.grow(delta);
      } else if (curve.status === "live") {
        curve.live(delta);
      } else if (curve.status === "shrink") {
        curve.shrink(delta);
      } else { //dead
        if (this.remove) {
          this.remove(curve.mesh);
          this.remove(curve.particles);
        }
        this.curves.splice(index, 1);
      }
    });
  }

  end = () => {
    this.isEnded = true;
    this.curves.forEach((curve) => {
      if (this.remove) {
        this.remove(curve.mesh);
        this.remove(curve.particles);
      }
    })
    this.curves = [];
  }
}

