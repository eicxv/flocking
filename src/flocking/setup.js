import * as THREE from "three";
import Boid from "./boid";
import Flock from "./flock";

export function initFlock(numberBoids, scene) {
  let geometry = new THREE.ConeBufferGeometry(0.1, 0.2, 6);
  geometry.lookAt(new THREE.Vector3(0, 1, 0));
  let material = new THREE.MeshBasicMaterial();
  let boids = [...new Array(numberBoids)].map(() => new Boid());
  let flock = new Flock(boids, geometry, material, scene);
  scene.add(flock.getGeometry());
  return flock;
}

export function addBoundary(scene) {
  let boundary = new THREE.BoxBufferGeometry(20, 20, 20);
  let material = new THREE.MeshBasicMaterial({
    opacity: 0.01,
    transparent: true,
  });
  material.side = THREE.DoubleSide;
  let box = new THREE.Mesh(boundary, material);
  box.layers.enable(1);
  scene.add(box);
}
