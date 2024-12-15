import * as THREE from "three";

import MemoryPiece from "./MemoryPiece";
import { getRandom, getRandomVertex } from "../../utils";
import { SerialData, ViewPos } from "../../type";
import { brainManager, stateManager } from "..";



export default class MemoryManager {
  static instance: MemoryManager | null = null;
  private memories: MemoryPiece[] = [];
  private activeMemory: MemoryPiece | null = null;
  private activeTimer: boolean = true;


  private isEnded: boolean = false;

  private add: ((object: THREE.Object3D) => void) | null = null;
  private remove: ((object: THREE.Object3D) => void) | null = null;

  constructor(add: (object: THREE.Object3D) => void, remove: (object: THREE.Object3D) => void) {
    if (MemoryManager.instance) return MemoryManager.instance;

    this.add = add;
    this.remove = remove;

    MemoryManager.instance = this;
  }

  init() {
    this.isEnded = false;
    this.createMemoryWithRandomDelay();
  }

  createMemoryWithRandomDelay() {
    if (this.isEnded) return; // no more loop
    const randomDelay = Math.floor(Math.random() * 4) + 1; // 3 ~ 6초 사이

    const parent = brainManager.getBrainChild();
    if (parent) this.createMemory(parent);

    setTimeout(() => {
      this.createMemoryWithRandomDelay();
    }, randomDelay * 1000);
  }

  createMemory(mesh: THREE.Mesh): void {
    if (!this.add || !this.remove) return;

    if (this.memories.length > 20) {
      const firstItem = this.memories[0];

      if (firstItem.isActivated) return;
      this.remove(firstItem.mesh);
      firstItem.dispose();
      this.memories.shift();
    }

    // get points from brain mesh
    const target = getRandomVertex(mesh);

    // generate new memory at target point
    const newMemory = new MemoryPiece(target);
    this.add(newMemory.mesh);
    this.memories.push(newMemory);
  }


  update = (clock: THREE.Clock, sensor: SerialData): void => {
    // change activate memory by 3 sec only when not zoomed
    const state = stateManager.getState();

    if (state === "brain" && this.activeTimer) {
      this.updateMemories();
    } else if (state === "memory" && this.activeMemory) {
      this.activeMemory.updateUniformVar("uTime", clock.elapsedTime * 1000);
      this.activeMemory.updateUniformVar("uSensor1", sensor[1]);
      this.activeMemory.updateUniformVar("uSensor2", sensor[2]);
    }
  }

  updateMemories = () => { // update random activate memory
    if (!this.isMemories() || stateManager.getZoom()) return;

    if (this.activeMemory) this.activeMemory.deactivate();
    const idx = getRandom(0, this.memories.length - 1, true);
    this.activeMemory = this.memories[idx];
    this.activeMemory.activate();
    this.startTimer();
  }

  startTimer() {
    this.activeTimer = false;
    setTimeout(() => this.activeTimer = true, 3000);
  }

  isMemories = (): boolean => {
    return this.memories.length > 0;
  }

  getRandomMemory = (): ViewPos | null => {
    if (this.memories.length == 0) return null;

    const idx = getRandom(0, this.memories.length - 1, true);
    return this.memories[idx].getViewPos();
  }
  getActivateMemory = (): ViewPos | null => {
    if (!this.activeMemory) return this.getRandomMemory();
    return this.activeMemory?.getViewPos();
  }

  end = () => {
    this.isEnded = true;
    this.memories.forEach((memory) => {
      if (this.remove) {
        this.remove(memory.mesh);
        memory.dispose();
      }
    })
    this.memories = [];
  }
}
