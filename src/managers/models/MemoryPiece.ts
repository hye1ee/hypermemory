import * as THREE from 'three';
import { ViewPos } from '../../type';

export default class MemoryPiece {
  private position: THREE.Vector3 = new THREE.Vector3();
  private url: string = "/images/image.png";
  private line: THREE.Mesh | null = null;
  private image: THREE.Mesh | null = null;

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

    const geometry = new THREE.TubeGeometry(curve, 20, 1, 8, false); // 얇은 튜브
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
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    this.image = new THREE.Mesh(geometry, material);
    this.image.position.set(this.position.x, this.position.y - 15, this.position.z); // 튜브 아래에 위치

    const randomAngle = Math.random() * Math.PI * 2;
    this.image.rotation.set(0, randomAngle, 0);

    return this.image
  }

  getViewPos = (): ViewPos | null => {
    if (!this.image) return null;

    const lookAt = new THREE.Vector3();
    this.image.getWorldPosition(lookAt);

    const normal = new THREE.Vector3(0, 0, 1); // PlaneGeometry의 기본 법선 벡터 (local)
    normal.applyQuaternion(this.image.quaternion); // Mesh의 rotation 적용

    const position = lookAt.clone().add(normal.multiplyScalar(1.3));
    console.log("origin", position, lookAt)
    return { position, lookAt };
  }

  activate = () => {
    if (!this.line) return;

    const lineMaterial = this.line.material as THREE.MeshBasicMaterial; // Material 타입 캐스팅
    lineMaterial.color.set(0xff0000);
  };

  deactivate = () => {
    if (!this.line) return;

    const lineMaterial = this.line.material as THREE.MeshBasicMaterial; // Material 타입 캐스팅
    lineMaterial.color.set(0xffffff);
  }
}