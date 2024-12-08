import CurveManager from "./models/CurveManager";
import MemoryManager from "./models/MemoryManager";
import CameraManager from "./scene/CameraManger";
import SceneManager from "./scene/SceneManager";

export const sceneManager = new SceneManager();
export const curveManager = new CurveManager(sceneManager.add, sceneManager.remove);
export const memoryManager = new MemoryManager(sceneManager.add, sceneManager.remove);
export const cameraManager = new CameraManager();
