import * as THREE from "three";
import { lerpEase } from "../../utils";
import { ViewPos } from "../../type";
import { memoryManager } from "..";


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
  private zoomDuration: number = 3;

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

  update = () => {
    if (this.mode === "zoomIn") this.zoomIn();
    else if (this.mode === "zoomOut") this.zoomOut();
    else this.rotate();
  }

  getLookAt() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const cameraPosition = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPosition);

    return cameraPosition.clone().add(direction);
  }

  zoomOut = () => {
    if (this.isZoom) return; // while zooming no more call
    this.isZoom = true;

    const initialPos = this.camera.position.clone();
    const initialLookAt = this.getLookAt();
    const targetPos = new THREE.Vector3(this.rotateRadius * Math.sin(this.rotateAngle), initialPos.y, this.rotateRadius * Math.cos(this.rotateAngle));
    let loopId: number;
    let progress = 0;

    // start zoom loop
    const zoomSpeed = 1 / (60 * this.zoomDuration); // 60fps 기준
    const zoomLoop = () => {
      if (progress < 1) {
        progress += zoomSpeed;
        this.camera.position.copy(lerpEase(initialPos, targetPos, progress));
        this.camera.lookAt(lerpEase(initialLookAt, new THREE.Vector3(0, 0, 0), progress));

        loopId = requestAnimationFrame(zoomLoop);
      } else {
        this.isZoom = false;
        this.zoomViewPos = null;
        this.mode = "rotate";
        cancelAnimationFrame(loopId);
        memoryManager.updateZoom(false); // alert zoom out
      }
    }
    zoomLoop();
  }

  zoomIn = () => {
    if (this.isZoom) return; // while zooming no more call
    if (!memoryManager.isMemories()) return; // when there is no memories yet

    this.isZoom = true;
    if (!this.zoomViewPos) {
      this.zoomViewPos = memoryManager.getActivateMemory();
      memoryManager.updateZoom(true); // alert zoom state
    }

    const initialPos = this.camera.position.clone();
    const initialLookAt = this.getLookAt();
    let loopId: number;
    let progress = 0;

    // start zoom loop
    const zoomSpeed = 1 / (60 * this.zoomDuration);
    const zoomLoop = () => {
      // console.log("zoomLoop", viewPos);
      if (progress < 1 && this.zoomViewPos) {
        progress += zoomSpeed;
        this.camera.position.copy(lerpEase(initialPos, this.zoomViewPos.position, progress));
        this.camera.lookAt(lerpEase(initialLookAt, this.zoomViewPos.lookAt, progress));

        loopId = requestAnimationFrame(zoomLoop);
      } else {
        this.isZoom = false;
        cancelAnimationFrame(loopId);
      }
    }
    zoomLoop();
  }

  rotate() {
    this.rotateAngle += 0.001;
    this.camera.position.x = this.rotateRadius * Math.sin(this.rotateAngle);
    this.camera.position.z = this.rotateRadius * Math.cos(this.rotateAngle);

    this.camera.lookAt(0, 0, 0);
  }

  resize(aspect: number) { // call when onWindowResize
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }



}
