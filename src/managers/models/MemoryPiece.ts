import * as THREE from 'three';
import { ViewPos } from '../../type';
import { sceneManager } from '..';
import vertexShader from "../../shaders/memory_vtx.glsl";
import fragmentShader from "../../shaders/memory_frag.glsl"



export default class MemoryPiece {
  private position: THREE.Vector3 = new THREE.Vector3();
  private url: string = "/images/image.png";
  private line: THREE.Mesh | null = null;
  private image: THREE.Mesh | null = null;
  private material: THREE.Material | null = null;
  private activeMaterial: THREE.ShaderMaterial | null = null;

  mesh: THREE.Group = new THREE.Group();

  constructor(position: THREE.Vector3, url = "/images/image.png") {
    this.position = position; // 시작 위치
    this.url = url; // 이미지 경로

    this.mesh.add(this.createLine(), this.createImage());
  }

  // 실 같은 튜브 생성
  createLine(): THREE.Mesh {
    const points = [
      this.position.clone(),
      new THREE.Vector3(this.position.x, this.position.y - 10, this.position.z),
    ];
    const curve = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(curve, 20, 0.5, 8, false); // 얇은 튜브
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.line = new THREE.Mesh(geometry, material);

    return this.line
  }

  // 16:9 이미지 생성
  createImage(): THREE.Mesh {

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.url);

    const width = 15;
    const height = width * (9 / 16);
    const geometry = new THREE.PlaneGeometry(width, height, 100, 100);

    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const center = new THREE.Vector3();
    geometry.boundingBox?.getCenter(center);

    this.activeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0.0 },
        uSensor1: { value: 0 },
        uCenter: { value: center },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // 화면 크기
      },
    });

    this.image = new THREE.Mesh(geometry, this.material);
    this.image.position.set(this.position.x, this.position.y - 15, this.position.z);

    const randomAngle = Math.random() * Math.PI * 2;
    this.image.rotation.set(0, randomAngle, 0);

    return this.image
  }

  getViewPos = (): ViewPos | null => {
    if (!this.image) return null;

    const lookAt = new THREE.Vector3();
    this.image.getWorldPosition(lookAt);

    const normal = new THREE.Vector3(0, 0, 1); // base normal of image plane
    normal.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.image.rotation.y); // apply img rotation

    const test = normal.multiplyScalar(8)
    const position = lookAt.clone().add(test);

    return { position, lookAt };
  }

  activate = () => {
    if (!this.line) return;

    const lineMaterial = this.line.material as THREE.MeshBasicMaterial; // Material 타입 캐스팅
    lineMaterial.color.set(0xff0000);
    if (this.image && this.activeMaterial) this.image.material = this.activeMaterial;
  };

  deactivate = () => {
    if (!this.line) return;

    const lineMaterial = this.line.material as THREE.MeshBasicMaterial; // Material 타입 캐스팅
    lineMaterial.color.set(0xffffff);
    if (this.image && this.material) this.image.material = this.material;
  }

  updateUniformVar = (label: string, value: number) => {
    if (this.activeMaterial) this.activeMaterial.uniforms[label].value = value;

  }
}