import * as THREE from "three";

import MemoryPiece from "./MemoryPiece";
import { getRandom, getRandomVertex } from "../../utils";
import { ViewPos } from "../../type";



export default class MemoryManager {
  static instance: MemoryManager | null = null;
  private memories: MemoryPiece[] = [];
  private activeMemory: MemoryPiece | null = null;


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

    // get points from brain mesh
    const target = getRandomVertex(mesh);

    // generate new memory at target point
    const newMemory = new MemoryPiece(target);
    this.add(newMemory.mesh);
    this.memories.push(newMemory);
  }


  update = (_clock: THREE.Clock): void => {
    if (!this.activeMemory && this.memories.length > 0) {
      const idx = getRandom(0, this.memories.length, true);
      this.activeMemory = this.memories[idx]

      this.activeMemory.activate();

      setTimeout(() => {
        if (this.activeMemory) {
          this.activeMemory.deactivate();
          this.activeMemory = null;
        }
      }, 2000)
    }
  }

  getRandomMemory = (): ViewPos | null => {
    const idx = getRandom(0, this.memories.length, true);
    return this.memories[idx].getViewPos();
  }
}
