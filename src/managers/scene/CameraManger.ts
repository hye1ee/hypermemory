import * as THREE from "three";
import { lerpEase } from "../../utils";
import { SerialData, State, ViewPos } from "../../type";
import { memoryManager, musicManager, stateManager } from "..";
import gsap from "gsap";



export default class CameraManager {
  static instance: CameraManager | null = null;
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  private rotateAngle: number = 0;
  private rotateRadius: number = 35;
  private lookY: number = -5;

  private zoomViewPos: ViewPos | null = null;
  zoomDuration: number = 6;
  isZoom: boolean = false;

  constructor() {
    if (CameraManager.instance) return CameraManager.instance;

    CameraManager.instance = this;
    this.init();
  }
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  init() {
    const button = document.createElement("button");
    button.style.zIndex = "999";
    button.style.position = "absolute";
    button.style.top = "0px";
    button.style.right = "200px";
    button.innerText = "Change Mode"

    document.body.appendChild(button);

    button.onclick = () => {
      // this.changeMode();
      const state = stateManager.getState();
      if (state === "memory") {
        stateManager.updateState("brain");
        stateManager.updateZoom(true);
      }
      else if (state === "brain") {
        stateManager.updateState("memory");
        stateManager.updateZoom(true);
      }
    };

    this.camera.position.set(0, 0, 300);
    this.camera.lookAt(0, -50, 0);
  }

  update = (clock: THREE.Clock, sensor: SerialData) => {
    if (!this.isZoom) this.rotate(sensor);
  }

  getLookAt() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const cameraPosition = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPosition);

    return cameraPosition.clone().add(direction);
  }

  zoomOutAnimation = (): void => {
    this.isZoom = true;

    const targetPos = new THREE.Vector3(this.rotateRadius * Math.sin(this.rotateAngle), 0, this.rotateRadius * Math.cos(this.rotateAngle));
    const targetLookAt = new THREE.Vector3(0, -40, 0);

    const initialLookAt = this.getLookAt();
    const distance = this.camera.position.clone().distanceTo(targetPos);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: this.zoomDuration,
      ease: "power1.inOut",
      onUpdate: () => {
        const currDistance = this.camera.position.clone().distanceTo(targetPos);
        const progress = 1 - (currDistance / distance);
        this.camera.lookAt(
          lerpEase(initialLookAt, targetLookAt, progress)
        );
      },
      onComplete: () => {
        this.isZoom = false;
        this.zoomViewPos = null;
      }
    });
  }

  zoomInAnimation = () => {
    if (!memoryManager.isMemories()) return; // when there is no memories yet
    if (!this.zoomViewPos) {
      this.zoomViewPos = memoryManager.getActivateMemory();
      if (!this.zoomViewPos) return;
    }

    this.isZoom = true;
    // Start zoom in
    const initialLookAt = this.getLookAt();
    const distance = this.camera.position.clone().distanceTo(this.zoomViewPos.position);

    gsap.to(this.camera.position, {
      x: this.zoomViewPos.position.x,
      y: this.zoomViewPos.position.y,
      z: this.zoomViewPos.position.z,
      duration: this.zoomDuration,
      ease: "power1.inOut",
      onUpdate: () => {
        if (this.zoomViewPos) {
          const currDistance = this.camera.position.clone().distanceTo(this.zoomViewPos.position);
          const progress = 1 - (currDistance / distance);
          this.camera.lookAt(
            lerpEase(initialLookAt, this.zoomViewPos.lookAt, progress)
          );
        }
      },
      onComplete: () => { this.isZoom = false; }
    });
  }


  rotate(sensor: SerialData) {
    const state = stateManager.getState();
    const transition = stateManager.getTransition();

    this.rotateRadius = Math.max(Math.min(this.rotateRadius + 5 * (sensor[1] - 0.5), 450), 250);

    if (state === "heart") {
      this.rotateAngle += 0.0001;
      this.camera.position.x = this.rotateRadius * Math.sin(this.rotateAngle);
      this.camera.position.z = this.rotateRadius * Math.cos(this.rotateAngle);

      this.camera.lookAt(0, this.lookY, 0);
    } else if (state === "brain") {
      this.rotateAngle += (0.001 + 0.01 * (1 - sensor[2]));
      this.camera.position.x = this.rotateRadius * Math.sin(this.rotateAngle);
      this.camera.position.z = this.rotateRadius * Math.cos(this.rotateAngle);

      this.camera.lookAt(0, this.lookY, 0);
    }

    // this.rotateAngle += sensor[1];
  }

  cameraAnimationBrain() {
    gsap.to(this, {
      duration: 10,        // 2초 동안
      rotateRadius: 350,          // 목표 값은 20
      lookY: -40,
      ease: "power1.inOut", // 부드러운 애니메이션을 위한 easing 함수
    });
  }


  cameraAnimationHeart() {
    gsap.to(this, {
      duration: 10,        // 2초 동안
      rotateRadius: 35,          // 목표 값은 20
      lookY: -5,
      ease: "power1.inOut", // 부드러운 애니메이션을 위한 easing 함수
    });
  }



  resize(aspect: number) { // call when onWindowResize
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }



}
