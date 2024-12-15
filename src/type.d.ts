import * as THREE from "three";

export interface ViewPos {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export interface SerialPort {
  readable: ReadableStream<any>;
  writable: WritableStream<any>;
  open: (options: { baudRate: number }) => Promise<void>;
}

export type SerialData = { [key: number]: number };

export type State = "heart" | "stop" | "brain" | "memory";