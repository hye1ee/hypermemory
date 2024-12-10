import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { curveManager, sceneManager } from "..";


export default class BrainManager {
  static instance: BrainManager | null = null;
  private brain: THREE.Group | null = null;

  constructor() {
    if (BrainManager.instance) return BrainManager.instance;

    BrainManager.instance = this;
  }

  init() {
    // GLTF Model Loader
    const loader = new GLTFLoader();
    loader.load(
      "/brain.glb", // Replace with the actual path to your GLTF file
      (gltf) => {
        this.brain = gltf.scene;

        // Wireframe Material
        this.brain.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.2,
              wireframe: true,
            });
            child.visible = false;
          }
        });

        sceneManager.add(this.brain);
        if (this.brain)
          this.brain.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              curveManager.createCurve(child);
            }
          });
        // setInterval(() => {
        //   if (this.brain)
        //     this.brain.traverse((child) => {
        //       if (child instanceof THREE.Mesh) {
        //         curveManager.createCurve(child);
        //       }
        //     });
        // }, 3000); // Generate every 500ms
        // setInterval(() => {
        //   brain.traverse((child) => {
        //     if (child instanceof THREE.Mesh) {
        //       memoryManager.createMemory(child);
        //     }
        //   });
        // }, 10000); // Generate every 500ms
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the model:", error);
      }
    );

  }

}

