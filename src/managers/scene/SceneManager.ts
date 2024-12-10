import * as THREE from "three";


export default class SceneManager {
  static instance: SceneManager | null = null;
  private scene: THREE.Scene = new THREE.Scene();

  constructor() {
    if (SceneManager.instance) return SceneManager.instance;
    SceneManager.instance = this;
    this.init();
  }
  getScene(): THREE.Scene {
    return this.scene;
  }

  init() {
    console.log("Scene initialize...");
    this.scene.background = new THREE.Color(0x000000); // Black background

    // light setting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 10); // 부드러운 조명 추가
    this.scene.add(ambientLight);
  }

  add = (object: THREE.Object3D) => { // bind needed
    if (this.scene)
      this.scene.add(object);
  }
  remove = (object: THREE.Object3D) => { // bind needed
    if (!this.scene) return;

    this.scene.remove(object);

    if (object.parent && object.parent !== this.scene) {
      object.parent.remove(object);
    }

    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Geometry 정리
        if (child.geometry) child.geometry.dispose();

        // Material 정리
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if (material.map) material.map.dispose(); // Texture 정리
            if (material.dispose) material.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose(); // Texture 정리
          if (child.material.dispose) child.material.dispose();
        }
      }
    });
    return;
  }
}
