import * as THREE from "three"

export const getRandom = (min: number, max: number, int: boolean) => {
  const val = Math.random() * (max - min + (int ? 1 : 0)) + min;
  return int ? Math.floor(val) : val;
}

export const lerpEase = (start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 => {
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
  // start + (end - start) * ease;
  return end.clone().add(start.clone().multiplyScalar(-1)).multiplyScalar(ease(t)).add(start.clone());
}

export const getRandomVertex = (mesh: THREE.Mesh): THREE.Vector3 => {
  const positionAttribute = mesh.geometry.attributes.position;
  const vertexCount = positionAttribute.count;

  const randomIndex = Math.floor(Math.random() * vertexCount);

  const x = positionAttribute.getX(randomIndex);
  const y = positionAttribute.getY(randomIndex);
  const z = positionAttribute.getZ(randomIndex);

  return new THREE.Vector3(x, y, z);
}
