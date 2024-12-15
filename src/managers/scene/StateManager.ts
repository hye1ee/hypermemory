import { cameraManager, curveManager, memoryManager, serialManager } from "..";
import { State } from "../../type";


export default class StateManager {
  private static instance: StateManager;

  private state: State = "heart";
  private transition: boolean = false;
  private zoom: boolean = false;

  private dev: boolean = false; // show sensor detection mode
  private local: boolean = true; // show
  private ready: boolean = false;

  private introTimeout: NodeJS.Timeout | null = null;
  private zoomTimeout: NodeJS.Timeout | null = null;

  private memoryCount: number = 0;

  private constructor() {

    const button = document.createElement("button");
    button.style.zIndex = "999";
    button.style.position = "absolute";
    button.style.top = "0px";
    button.style.right = "500px";
    button.innerText = "Not Ready"

    document.body.appendChild(button);

    button.onclick = () => {
      this.ready = true;
      button.innerText = "Ready!";
    };
  }

  init() {
    curveManager.end();
    memoryManager.end();

    this.introTimeout = null
    this.memoryCount = 0;
    this.zoomTimeout = null;
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  getDev = (): boolean => {
    return this.dev
  }
  getReady = (): boolean => {
    return this.ready
  }
  getLocal = (): boolean => {
    return this.local
  }

  getState = (): State => {
    return this.state
  }

  getTransition = (): boolean => {
    return this.transition
  }

  getZoom = (): boolean => {
    return this.zoom
  }


  updateState = (state: State) => {
    if (this.state === "brain" && state === "memory") this.startMemoryTimer();
    this.state = state;
  }

  startIntroTimer = () => {
    if (this.introTimeout) return;

    setTimeout(() => {
      const serialData = serialManager.getData();
      if (serialData[1] < 0.1 && serialData[2] < 0.1 && this.getReady()) {
        this.updateState("stop");
        this.updateTransition(true);
      } else this.introTimeout = null;
    }, 1800);
  }

  startZoomTimer = () => {
    if (this.zoomTimeout) return;

    setTimeout(() => {
      const serialData = serialManager.getData();
      if (serialData[1] < 0.05 && serialData[2] < 0.05 && !cameraManager.isZoom) {
        this.memoryCount += 1;
        this.updateState("memory");
        this.updateZoom(true);
      } else this.zoomTimeout = null;
    }, 1800);
  }

  startMemoryTimer = () => {
    const delay = 15 + Math.random() * 8;
    setTimeout(() => {
      if (this.isLastMemory()) {
        this.updateState("heart");
        this.updateTransition(true);
        this.ready = false;
      } else {
        this.updateState("brain");
        this.updateZoom(true);
      }
    }, delay * 1000);
  }

  isLastMemory = (): boolean => {
    return this.memoryCount > 0;
  }

  updateTransition = (transition: boolean) => {
    this.transition = transition;
  }

  updateZoom = (zoom: boolean) => {
    this.zoom = zoom;
  }

  updateReady = () => {
    this.ready = true;
  }
}
