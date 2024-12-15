import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats.js";

import "./style.css";
import { brainManager, cameraManager, curveManager, memoryManager, musicManager, sceneManager, serialManager, stateManager } from "./managers";
import { showGrid, testSensor } from "./utils";


let
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls,
  stats: Stats,
  clock: THREE.Clock;

document.addEventListener("click", () => {
  musicManager.heart();
});

showGrid();
if (stateManager.getDev()) testSensor();
else init();

function init() {
  // Clock
  clock = new THREE.Clock();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 디바이스 픽셀 비율 설정
  document.body.appendChild(renderer.domElement);

  // controls = new OrbitControls(cameraManager.getCamera(), renderer.domElement);
  // controls.enableDamping = true; // Smooth controls
  // controls.dampingFactor = 0.25;

  // Stats.js
  // stats = new Stats();
  // stats.showPanel(0); // 0: FPS, 1: ms/frame, 2: memory usage
  // document.body.appendChild(stats.dom);


  serialManager.init();
  brainManager.init();

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
  // stats.begin();

  // Update 
  const serialData = serialManager.getData();
  const state = stateManager.getState();
  const transition = stateManager.getTransition();
  const zoom = stateManager.getZoom();

  if (state === "heart") {
    if (transition) { // memory => heart
      musicManager.pausemusic();
      stateManager.init();

      cameraManager.zoomOutAnimation();
      setTimeout(() => {
        setTimeout(() => {
          stateManager.updateReady();
          musicManager.heart();
        }, 10000);
        cameraManager.cameraAnimationHeart();
      }, cameraManager.zoomDuration * 1000);

      brainManager.particleAnimationEnd();
      stateManager.updateTransition(false);
    } else if (serialData[1] < 0.05 && serialData[2] < 0.05 && stateManager.getReady() && !cameraManager.isZoom) {
      stateManager.startIntroTimer();
    }

    brainManager.update(clock, serialData);
    cameraManager.update(clock, serialData);


  } else if (state === "stop") {
    if (transition) {
      musicManager.stop();

      brainManager.particleAnimationStop();
      stateManager.updateTransition(false);
    }

    brainManager.update(clock, serialData);
    cameraManager.update(clock, serialData);
  } else if (state === "brain") {
    if (transition) { // stop => brian
      musicManager.brain();

      setTimeout(() => {
        memoryManager.init();
        curveManager.init();
      }, 3000);
      cameraManager.cameraAnimationBrain();
      brainManager.particleAnimationBrain();
      stateManager.updateTransition(false);
    } else if (zoom) { // memory => brain
      musicManager.pausemusic(musicManager.brainBackground);
      cameraManager.zoomOutAnimation();
      stateManager.updateZoom(false);
    } else if (serialData[1] < 0.05 && serialData[2] < 0.05 && !cameraManager.isZoom) {
      stateManager.startZoomTimer();
    }

    cameraManager.update(clock, serialData);
    curveManager.update(clock, serialData);
    memoryManager.update(clock, serialData);
    brainManager.update(clock, serialData);
  } else if (state === "memory") {
    if (zoom) { // brain => memory
      musicManager.pausemusic(musicManager.background);
      cameraManager.zoomInAnimation();
      stateManager.updateZoom(false);
    }
    // no camera update during the memory view
    curveManager.update(clock, serialData);
    memoryManager.update(clock, serialData);
    brainManager.update(clock, serialData);
  }
  // controls.update();

  renderer.render(sceneManager.getScene(), cameraManager.getCamera());

  // stats.end();
  requestAnimationFrame(animate);
}
