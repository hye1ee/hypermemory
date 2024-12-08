import * as THREE from "three";
import { lerpEase } from "../../utils";
import { ViewPos } from "../../type";


export default class CameraManager {
  static instance: CameraManager | null = null;
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  private rotateAngle: number = 0;
  private rotateRadius: number = 240;
  private isZoom: boolean = false;
  private zoomViewPos: ViewPos | null = null;
  private mode: "rotate" | "zoomIn" | "zoomOut" = "rotate";
  private zoomDuration: number = 1;

  constructor() {
    if (CameraManager.instance) return CameraManager.instance;

    CameraManager.instance = this;
    this.init();
  }
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  init() {
    this.camera.position.set(0, -2, 250);

  }

  changeMode = () => {
    if (this.mode === "rotate") this.mode = "zoomIn";
    else this.mode = "zoomOut";
  }

  update = (viewPos?: ViewPos) => {
    if (viewPos && this.mode === "zoomIn") this.zoomIn(viewPos);
    else if (this.mode === "zoomOut") this.zoomOut();
    else this.rotate();
  }

  zoomOut = () => {
    if (this.isZoom) return; // while zooming no more call
    this.isZoom = true;

    const initialPos = this.camera.position.clone();
    const targetPos = new THREE.Vector3(this.rotateRadius * Math.sin(this.rotateAngle), initialPos.y, this.rotateRadius * Math.cos(this.rotateAngle));
    let loopId: number;
    let progress = 0;

    // start zoom loop
    const zoomSpeed = 1 / (60 * this.zoomDuration); // 60fps 기준
    const zoomLoop = () => {
      if (progress < 1) {
        progress += zoomSpeed;
        this.camera.position.copy(lerpEase(initialPos, targetPos, progress));
        this.camera.lookAt(0, 0, 0);

        loopId = requestAnimationFrame(zoomLoop);
      } else {
        this.isZoom = false;
        this.mode = "rotate";
        cancelAnimationFrame(loopId);
      }
    }
    zoomLoop();
  }

  zoomIn = (viewPos: ViewPos) => {
    if (this.isZoom) return; // while zooming no more call
    this.isZoom = true;
    this.zoomViewPos = viewPos;

    const initialPos = this.camera.position.clone();
    let loopId: number;
    let progress = 0;

    // start zoom loop
    const zoomSpeed = 1 / (60 * this.zoomDuration); // 60fps 기준
    const zoomLoop = () => {
      // console.log("zoomLoop", viewPos);
      if (progress < 1) {
        progress += zoomSpeed;
        this.camera.position.copy(lerpEase(initialPos, viewPos.position, progress));
        this.camera.lookAt(viewPos.lookAt);

        loopId = requestAnimationFrame(zoomLoop);
      } else {
        this.isZoom = false;
        cancelAnimationFrame(loopId);
      }
    }
    zoomLoop();
  }

  rotate() {
    // 카메라의 x, z 좌표를 업데이트하여 원을 그리도록 설정
    this.rotateAngle += 0.001; // 각도 증가 속도
    this.camera.position.x = this.rotateRadius * Math.sin(this.rotateAngle);
    this.camera.position.z = this.rotateRadius * Math.cos(this.rotateAngle);

    // 카메라가 항상 중심을 바라보도록 설정
    this.camera.lookAt(0, 0, 0);
  }

  resize(aspect: number) { // call when onWindowResize
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }



}
