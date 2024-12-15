import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { curveManager, memoryManager, sceneManager, stateManager } from "..";


import lightVertexShader from "../../shaders/light_vts.glsl";
import lightFragmentShader from "../../shaders/light_frag.glsl"

import pointsVertexShader from "../../shaders/points_vtx.glsl";
import pointsFragmentShader from "../../shaders/points_frag.glsl"
import { SerialData } from "../../type";
import gsap from "gsap";


export default class BrainManager {
  static instance: BrainManager | null = null;
  private brain: THREE.Group | null = null;
  private brainOthers: THREE.Group | null = null;
  private lightMaterial: THREE.ShaderMaterial | null = null;

  private brainPoints: THREE.Vector3[] = [];
  private brainParticles: THREE.Points | null = null;
  private pointsMaterial: THREE.ShaderMaterial | null = null;

  private otherMaterial: THREE.Material | null = null;


  constructor() {
    if (BrainManager.instance) return BrainManager.instance;

    BrainManager.instance = this;
  }

  init() {
    // GLTF Model Loade

    this.lightMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 1.5 },
        p: { value: 2.0 },
        glowColor: { value: new THREE.Color(0xffeff0) },
        viewVector: { value: new THREE.Vector3(0, 0, 0) },
        uTime: { value: 0.0 },
        uOpacity: { value: 0.0 },
        uMemory: { value: false },
      },
      side: THREE.DoubleSide,
      vertexShader: lightVertexShader,
      fragmentShader: lightFragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.otherMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });

    const loader = new GLTFLoader();
    loader.load(
      "/brain_cerebral.glb", // Replace with the actual path to your GLTF file
      (gltf) => {
        this.brain = gltf.scene;

        // Wireframe Material
        this.brain.traverse((child) => {
          if (child instanceof THREE.Mesh) {

            if (this.lightMaterial) child.material = this.lightMaterial;
          }
        });
        this.brain.visible = false;
        sceneManager.add(this.brain);
        this.createParticles();

        // if (this.brain)
        //   this.brain.traverse((child) => {
        //     if (child instanceof THREE.Mesh) {
        //       curveManager.createCurve(child);
        //     }
        //   });
        // setInterval(() => {
        //   if (this.brain)
        //     this.brain.traverse((child) => {
        //       if (child instanceof THREE.Mesh) {
        //         curveManager.createCurve(child);
        //       }
        //     });
        // }, 8000); // Generate every 500ms
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the model:", error);
      }
    );

    loader.load(
      "/brain_etc.glb", // Replace with the actual path to your GLTF file
      (gltf) => {
        this.brainOthers = gltf.scene;

        // Wireframe Material
        this.brainOthers.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (this.otherMaterial) child.material = this.otherMaterial;
          }
        });
        this.brainOthers.visible = false;
        sceneManager.add(this.brainOthers);
      });
  }

  getBrainChild = (): THREE.Mesh | null => {
    if (this.brain) {
      const idx = Math.floor(Math.random() * this.brain.children.length);
      return this.brain.children[idx] as THREE.Mesh;
    }
    return null;
  }

  update = (clock: THREE.Clock, sensor: SerialData): void => {
    // change activate memory by 3 sec only when not zoomed
    if (this.lightMaterial) {
      this.lightMaterial.uniforms.uTime.value = clock.getElapsedTime();
      this.lightMaterial.uniforms.uMemory.value = stateManager.getState() === "memory";
    }
    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uTime.value = clock.getElapsedTime();
      this.pointsMaterial.uniforms.uDamp.value = stateManager.getState() === "stop";
    }
  }

  traverse = (callback: (mesh: THREE.Mesh) => void) => {
    if (this.brain) this.brain.traverse((mesh) => { if (mesh instanceof THREE.Mesh) callback(mesh) });
  }

  getRandPosition(): THREE.Vector3 {
    const radius = Math.random() * 900; // radius < 300

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    return new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), // x
      radius * Math.sin(phi) * Math.sin(theta), // y
      radius * Math.cos(phi)); // z
  }

  createParticles() {
    if (!this.brain) return;

    // extract brain vertices
    this.brainPoints = [];
    this.brain.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const vertices = child.geometry.attributes.position.array;

        for (let i = 0; i < vertices.length; i += 3) {
          const vertex = new THREE.Vector3(
            vertices[i],
            vertices[i + 1],
            vertices[i + 2]
          );
          // get world position;
          vertex.applyMatrix4(child.matrixWorld);
          this.brainPoints.push(vertex);
        }
      }
    });

    // make particles at random position
    const geometry = new THREE.BufferGeometry();
    const randPosition = new Float32Array(this.brainPoints.length * 3);

    for (let i = 0; i < randPosition.length; i++) {
      const newPos = this.getRandPosition();
      randPosition[i * 3] = newPos.x; // x
      randPosition[i * 3 + 1] = newPos.y; // y
      randPosition[i * 3 + 2] = newPos.z; // z
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(randPosition, 3));

    const indices = new Float32Array(geometry.attributes.position.count);
    for (let i = 0; i < indices.length; i++) {
      indices[i] = i; // 각 정점의 인덱스
    }
    geometry.setAttribute(
      'index',
      new THREE.BufferAttribute(indices, 1)
    );

    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uDamp: { value: false },
        uSize: { value: 0.0 },
      },
      side: THREE.DoubleSide,
      vertexShader: pointsVertexShader,
      fragmentShader: pointsFragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.brainParticles = new THREE.Points(geometry, this.pointsMaterial);
    sceneManager.add(this.brainParticles);
  }

  particleAnimationStop() {
    if (this.pointsMaterial)
      gsap.to(this.pointsMaterial.uniforms.uSize, {
        duration: 4,
        ease: "power2.out",
        value: 1,
      });
  }

  particleAnimationBrain() {
    if (this.brainParticles && this.brainPoints.length > 0) {
      const positions = this.brainParticles.geometry.attributes.position.array;

      if (this.pointsMaterial) {
        gsap.to(this.pointsMaterial.uniforms.uSize, {
          duration: 4,
          ease: "power2.out",
          value: 0,
        });
      }

      this.brainPoints.forEach((point, index) => {
        gsap.to(positions, {
          duration: 10, // 2초 동안 애니메이션
          [index * 3]: point.x, // x 위치 애니메이션
          [index * 3 + 1]: point.y, // y 위치 애니메이션
          [index * 3 + 2]: point.z, // z 위치 애니메이션
          ease: "back.inout",
          onUpdate: () => {
            if (this.brainParticles)
              this.brainParticles.geometry.attributes.position.needsUpdate = true;
          },
          onComplete: () => {
            if (this.brain) {
              this.brain.visible = true;
            }
            if (this.brainOthers) this.brainOthers.visible = true;
            if (this.otherMaterial) {
              gsap.to(this.otherMaterial, {
                duration: 5,
                opacity: 0.1,
              });
            }
            if (this.lightMaterial) {
              gsap.to(this.lightMaterial.uniforms.uOpacity, {
                duration: 5,
                value: 0.5,
              });
            }
          }
        });
      });
    }
  }

  particleAnimationEnd() {
    if (this.brainParticles && this.brainPoints.length > 0) {
      const positions = this.brainParticles.geometry.attributes.position.array;

      this.brainPoints.forEach((point, index) => {
        const newPos = this.getRandPosition();

        gsap.to(positions, {
          duration: 10, // 2초 동안 애니메이션
          [index * 3]: newPos.x, // x 위치 애니메이션
          [index * 3 + 1]: newPos.y, // y 위치 애니메이션
          [index * 3 + 2]: newPos.z, // z 위치 애니메이션
          ease: "back.inout",
          onUpdate: () => {
            if (this.brainParticles)
              this.brainParticles.geometry.attributes.position.needsUpdate = true;
          },
          onComplete: () => {
            if (this.lightMaterial) {
              gsap.to(this.lightMaterial.uniforms.uOpacity, {
                duration: 5,
                value: 0,
              });
            }
            if (this.otherMaterial) {
              gsap.to(this.otherMaterial, {
                duration: 5,
                opacity: 0,
              });
            }
            setTimeout(() => {
              if (this.brain) this.brain.visible = false;
              if (this.brainOthers) this.brainOthers.visible = false;
            }, 5000);
          }
        });
      });
    }
  }
}

