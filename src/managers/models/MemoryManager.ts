import * as THREE from "three";

import MemoryPiece from "./MemoryPiece";
import { getRandom, getRandomVertex } from "../../utils";
import { ViewPos } from "../../type";



export default class MemoryManager {
  static instance: MemoryManager | null = null;
  private memories: MemoryPiece[] = [];
  private activeMemory: MemoryPiece | null = null;
  private zoom: boolean = false;
  private activeTimer: boolean = true;


  private add: ((object: THREE.Object3D) => void) | null = null;
  private remove: ((object: THREE.Object3D) => void) | null = null;

  constructor(add: (object: THREE.Object3D) => void, remove: (object: THREE.Object3D) => void) {
    if (MemoryManager.instance) return MemoryManager.instance;

    this.add = add;
    this.remove = remove;

    MemoryManager.instance = this;
  }

  createMemory(mesh: THREE.Mesh): void {
    if (!this.add || !this.remove) return;
    if (this.memories.length > 20) return;

    // get points from brain mesh
    const target = getRandomVertex(mesh);

    // generate new memory at target point
    const newMemory = new MemoryPiece(target);
    this.add(newMemory.mesh);
    this.memories.push(newMemory);
  }


  update = (clock: THREE.Clock, sensor: number): void => {
    // change activate memory by 3 sec only when not zoomed
    if (this.activeTimer && !this.zoom) {
      this.updateMemories();
    } else if (this.zoom && this.activeMemory) {
      this.activeMemory.updateUniformVar("uTime", clock.elapsedTime * 1000);
      this.activeMemory.updateUniformVar("uSensor1", sensor);

    }
  }

  updateZoom = (zoom: boolean) => {
    this.zoom = zoom;
  }

  updateMemories = () => { // update random activate memory
    if (!this.isMemories() || this.zoom) return;

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

    const idx = getRandom(0, this.memories.length, true);
    return this.memories[idx].getViewPos();
  }
  getActivateMemory = (): ViewPos | null => {
    if (!this.activeMemory) return this.getRandomMemory();
    return this.activeMemory?.getViewPos();
  }
}
