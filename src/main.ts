import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "stats.js";

import "./style.css";
import { cameraManager, curveManager, memoryManager, sceneManager } from "./managers";


let
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls,
  stats,
  brain: THREE.Object3D,
  clock: THREE.Clock;

init();

function init() {
  const button = document.createElement("button");
  document.body.appendChild(button);
  button.style.zIndex = "999";
  button.style.position = "absolute"
  button.style.right = "0px";
  button.innerText = "Click this button"



  button.onclick = () => {
    cameraManager.changeMode();
    const viewPos = memoryManager.getRandomMemory();
    if (viewPos) cameraManager.update(viewPos)
  };


  // Clock
  clock = new THREE.Clock();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 디바이스 픽셀 비율 설정
  document.body.appendChild(renderer.domElement);

  // OrbitControls
  controls = new OrbitControls(cameraManager.getCamera(), renderer.domElement);
  controls.enableDamping = true; // Smooth controls
  controls.dampingFactor = 0.25;

  // Stats.js
  stats = new Stats();
  stats.showPanel(0); // 0: FPS, 1: ms/frame, 2: memory usage
  document.body.appendChild(stats.dom);

  // // HDR Lighting
  // const hdrLoader = new THREE.TextureLoader();
  // hdrLoader.load(
  //   "https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/hdri/syferfontein_0d_clear_1k.jpg", // Sample HDR from pmndrs
  //   (texture) => {
  //     const envMap = new THREE.PMREMGenerator(renderer).fromEquirectangular(
  //       texture
  //     ).texture;
  //     scene.environment = envMap;
  //     texture.dispose();
  //   }
  // );

  // GLTF Model Loader
  const loader = new GLTFLoader();
  loader.load(
    "/brain.glb", // Replace with the actual path to your GLTF file
    (gltf) => {
      brain = gltf.scene;

      // Wireframe Material
      brain.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshBasicMaterial({
            wireframe: true,
          });
          child.visible = false;
        }
      });

      sceneManager.add(brain);
      setInterval(() => {
        brain.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            curveManager.createCurve(child);
            memoryManager.createMemory(child);
          }
        });
      }, 3000); // Generate every 500ms
    },
    undefined,
    (error) => {
      console.error("An error occurred while loading the model:", error);
    }
  );

  // Resize Handling
  window.addEventListener("resize", onWindowResize);

  // Start Animation Loop
  animate();
}

function onWindowResize() {
  cameraManager.resize(window.innerWidth / window.innerHeight)
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  // sensorlog();

  cameraManager.update();

  // Update 
  curveManager.update(clock);
  memoryManager.update(clock);
  controls.update();

  renderer.render(sceneManager.getScene(), cameraManager.getCamera())
}
