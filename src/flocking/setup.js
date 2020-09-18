import * as THREE from "three";
import Boid from "./boid";
import Flock from "./flock";
import BoidBufferGeometry from "./boidGeometry";

export function initFlock(numberBoids, scene) {
  let geometry = new BoidBufferGeometry();
  geometry.scale(0.1, 0.1, 0.1);
  let material = new THREE.MeshBasicMaterial();
  let boids = [...new Array(numberBoids)].map(() => new Boid());
  let flock = new Flock(boids, geometry, material, scene);
  scene.add(flock.getGeometry());
  return flock;
}

export function addBoundary(scene) {
  let boundary = new THREE.BoxBufferGeometry(40, 40, 40);
  let material = new THREE.MeshBasicMaterial({
    opacity: 0.01,
    transparent: true,
  });
  material.side = THREE.DoubleSide;
  let box = new THREE.Mesh(boundary, material);
  box.layers.enable(1);
  scene.add(box);
}
