import * as THREE from 'three';

import { ViewPos } from '../../type';
import vertexShader from "../../shaders/memory_vtx.glsl";
import fragmentShader from "../../shaders/memory_frag.glsl"
import { stateManager } from '..';

export default class MemoryPiece {
  private position: THREE.Vector3 = new THREE.Vector3();

  private videoNum: number;
  private imageNum: number;

  private line: THREE.Mesh | null = null;
  private image: THREE.Mesh | null = null;

  private imageTexture: THREE.Texture;
  isActivated: boolean = false;

  private material: THREE.Material | null = null;
  private activeMaterial: THREE.ShaderMaterial | null = null;

  mesh: THREE.Group = new THREE.Group();

  constructor(position: THREE.Vector3) {
    this.position = position; // 시작 위치

    this.videoNum = Math.floor(Math.random() * 7) + 1;
    this.imageNum = Math.floor(Math.random() * 2) + 1;

    const textureLoader = new THREE.TextureLoader();
    this.imageTexture = textureLoader.load(`/memories/${this.videoNum}-${this.imageNum}.png`);

    this.mesh.add(this.createLine(), this.createImage());
  }

  // 실 같은 튜브 생성
  createLine(): THREE.Mesh {
    const points = [
      new THREE.Vector3(this.position.x, this.position.y + 5, this.position.z),
      new THREE.Vector3(this.position.x, this.position.y - 5, this.position.z),
    ];
    const curve = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(curve, 20, 0.1, 12, false); // 얇은 튜브
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.line = new THREE.Mesh(geometry, material);

    return this.line
  }

  // 16:9 이미지 생성
  createImage(): THREE.Mesh {
    const width = 12;
    const height = width * (9 / 16);
    const geometry = new THREE.PlaneGeometry(width, height, 100, 100);

    this.material = new THREE.MeshBasicMaterial({
      map: this.imageTexture,
      side: THREE.DoubleSide
    });

    const center = new THREE.Vector3();
    geometry.boundingBox?.getCenter(center);

    this.activeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: this.imageTexture },
        uTime: { value: 0.0 },
        uDev: { value: stateManager.getDev() },
        uSeed: { value: Math.floor(Math.random() * 3) + 1 }, // 1-3
        uSensor1: { value: 0 },
        uSensor2: { value: 0 },
        uCenter: { value: center },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // 화면 크기
      },
    });

    this.image = new THREE.Mesh(geometry, this.material);
    this.image.position.set(this.position.x, this.position.y - 10, this.position.z);

    const randomAngle = Math.random() * Math.PI * 2;
    this.image.rotation.set(0, randomAngle, 0);

    return this.image
  }

  showVideo() {
    if (stateManager.isLastMemory()) this.videoNum = 0;
    const video = document.createElement('video');
    video.src = `/memories/${this.videoNum}.mp4`; // 비디오 파일 경로
    video.load();
    video.play();
    video.loop = true; // 반복 재생 설정

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    if (this.activeMaterial) {
      this.activeMaterial.uniforms.uTexture.value = videoTexture;
    }
  }

  getViewPos = (): ViewPos | null => {
    if (!this.image) return null;

    this.showVideo();
    const lookAt = new THREE.Vector3();
    this.image.getWorldPosition(lookAt);

    const normal = new THREE.Vector3(0, 0, 1); // base normal of image plane
    normal.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.image.rotation.y); // apply img rotation

    const test = normal.multiplyScalar(6);
    const position = lookAt.clone().add(test);

    position.y -= 1.5;
    lookAt.y -= 1.5;

    return { position, lookAt };
  }

  activate = () => {
    this.isActivated = true;
    if (this.image && this.activeMaterial) this.image.material = this.activeMaterial;
  };

  deactivate = () => {
    this.isActivated = false;
    if (this.image && this.material) this.image.material = this.material;
    if (this.activeMaterial) {
      this.activeMaterial.uniforms.uTexture.value = this.imageTexture;
    }
  }

  updateUniformVar = (label: string, value: number) => {
    if (this.activeMaterial) this.activeMaterial.uniforms[label].value = value;

  }

  dispose = () => {
    this.imageTexture.dispose();
    this.material?.dispose();
    this.activeMaterial?.dispose();
  }
}