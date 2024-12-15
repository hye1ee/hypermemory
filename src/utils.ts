import * as THREE from "three"
import { cameraManager, serialManager } from "./managers";
import gsap from "gsap";

export const getRandom = (min: number, max: number, int: boolean) => {
  const val = Math.random() * (max - min + (int ? 1 : 0)) + min;
  return int ? Math.floor(val) : val;
}

export const lerpEase = (start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 => {
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
  const easeQuad = (t: number) => t * t * t
  const easePower = (t: number) => gsap.parseEase("power1.inOut")(t);

  // start + (end - start) * ease;
  return end.clone().add(start.clone().multiplyScalar(-1)).multiplyScalar(easePower(t)).add(start.clone());
}

export const getRandomVertex = (mesh: THREE.Mesh): THREE.Vector3 => {
  const positionAttribute = mesh.geometry.attributes.position;
  const vertexCount = positionAttribute.count;

  const randomIndex = Math.floor(Math.random() * vertexCount);

  const vertex = new THREE.Vector3(
    positionAttribute.getX(randomIndex),
    positionAttribute.getY(randomIndex),
    positionAttribute.getZ(randomIndex)).applyMatrix4(mesh.matrixWorld);
  return vertex;
}

export const testSensor = () => {
  const button = document.createElement("button");
  document.body.appendChild(button);
  button.style.zIndex = "999";
  button.style.position = "absolute"
  button.style.right = "0px";
  button.innerText = "Click this button"

  button.onclick = () => {
    // cameraManager.changeMode();
    serialManager.connect();
  };

  const sensorView = document.createElement("div");
  sensorView.style.width = "100%";
  sensorView.style.backgroundColor = "lightblue";
  sensorView.style.height = "630px";
  sensorView.style.position = "absolute";
  sensorView.style.top = "30px"

  sensorView.style.display = "flex";
  sensorView.style.alignItems = "center";
  sensorView.style.justifyContent = "center";
  sensorView.style.gap = "100px";
  sensorView.style.zIndex = "999";
  sensorView.style.fontSize = "100px"

  const sensor1 = document.createElement("div");
  sensor1.innerText = "0";

  const sensor2 = document.createElement("div");
  sensor2.innerText = "0";
  sensorView.append(sensor1, sensor2);
  document.body.appendChild(sensorView);

  testLoop(sensor1, sensor2)();
}

const testLoop = (sensor1: HTMLDivElement, sensor2: HTMLDivElement) => () => {

  const serialData = serialManager.getData();
  sensor1.innerText = serialData[1].toString();
  sensor2.innerText = serialData[2].toString();

  // console.log(serialData);
  // sensor1.innerText = (Math.min(serialData[1] * 100, 50)).toFixed(2);
  // sensor2.innerText = (Math.min(serialData[2] * 100, 15)).toFixed(2);
  // 5 미만 시작

  requestAnimationFrame(testLoop(sensor1, sensor2));
}


export const showGrid = () => {
  const gridTop = document.createElement("div");
  gridTop.style.width = "100%";
  gridTop.style.position = "absolute";
  gridTop.style.top = "30px";
  gridTop.style.borderBottom = "2px solid blue";
  gridTop.style.zIndex = "999999";


  const gridBottom = document.createElement("div");
  gridBottom.style.width = "100%";
  gridBottom.style.position = "absolute";
  gridBottom.style.bottom = "330px";
  gridBottom.style.borderBottom = "2px solid blue";
  gridBottom.style.zIndex = "999999";

  document.body.append(gridTop, gridBottom);
}