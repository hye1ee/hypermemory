import * as THREE from "three";
import { Curve } from "./Curve"; // Curve 클래스가 별도 파일로 존재한다고 가정
import { getRandom } from "../../utils";



export default class CurveManager {
  static instance: CurveManager | null = null;
  private curves: Curve[] = [];
  private MIN_CURVE_LENGTH: number = 10;
  private MAX_CURVE_LENGTH: number = 20;

  private add: ((object: THREE.Object3D) => void) | null = null;
  private remove: ((object: THREE.Object3D) => void) | null = null;

  constructor(add: (object: THREE.Object3D) => void, remove: (object: THREE.Object3D) => void) {
    if (CurveManager.instance) return CurveManager.instance;

    this.add = add;
    this.remove = remove;

    CurveManager.instance = this;
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
    this.curves.push(newCurve);
  }

  // 모든 곡선 업데이트
  update(clock: THREE.Clock): void {
    const delta = clock.getDelta() * 1000;
    const time = clock.getElapsedTime();

    this.curves.forEach((curve, index) => {
      curve.updateColor(time);
      if (curve.status === "grow") {
        curve.grow(delta);
      } else if (curve.status === "live") {
        curve.live(delta);
      } else if (curve.status === "shrink") {
        curve.shrink(delta);
      } else { //dead
        if (this.remove) this.remove(curve.mesh);
        this.curves.splice(index, 1);
      }
    });
  }
}

