import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats.js";

import "./style.css";
import { brainManager, cameraManager, curveManager, memoryManager, sceneManager } from "./managers";


let
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls,
  stats,
  clock: THREE.Clock,
  sensor: number;

// document.addEventListener("click", () => {
//   const music = document.getElementById("music") as HTMLAudioElement;
//   if (music) music.play();
// });


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
  };

  // test slider
  const sliderInput = document.createElement("input");
  sliderInput.type = "range";
  sliderInput.min = "0";
  sliderInput.max = "1";
  sliderInput.step = "0.01";
  sliderInput.value = "0"; // 초기값 설정
  sliderInput.style.zIndex = "999";
  sliderInput.style.position = "absolute";
  sliderInput.style.right = "0px";
  sliderInput.style.top = "50px"; // 버튼 아래 위치
  document.body.appendChild(sliderInput);

  // 슬라이더 값 변경 이벤트 핸들러
  sliderInput.oninput = () => {
    sensor = parseFloat(sliderInput.value); // 전역 변수 slider에 값 저장
  };


  // Clock
  clock = new THREE.Clock();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 디바이스 픽셀 비율 설정
  document.body.appendChild(renderer.domElement);

  OrbitControls
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
  requestAnimationFrame(animate);
  // sensorlog();

  // cameraManager.update();

  // Update 
  curveManager.update(clock, sensor);
  memoryManager.update(clock, sensor);
  controls.update();

  renderer.render(sceneManager.getScene(), cameraManager.getCamera())
}
