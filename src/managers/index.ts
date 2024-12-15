import BrainManager from "./models/BrainManager";
import CurveManager from "./models/CurveManager";
import MemoryManager from "./models/MemoryManager";
import CameraManager from "./scene/CameraManger";
import MusicManager from "./scene/MusicManager";
import SceneManager from "./scene/SceneManager";
import StateManager from "./scene/StateManager";
import SerialManager from "./sensor/SerialManager";

export const sceneManager = new SceneManager();
export const brainManager = new BrainManager();
export const curveManager = new CurveManager(sceneManager.add, sceneManager.remove);
export const memoryManager = new MemoryManager(sceneManager.add, sceneManager.remove);
export const cameraManager = new CameraManager();
export const serialManager = SerialManager.getInstance();
export const stateManager = StateManager.getInstance();
export const musicManager = MusicManager.getInstance();