import Boid from "./boid";
import * as THREE from "three";

export default class Flock {
  constructor(boids, geometry, material, scene) {
    this.boids = boids;
    this.scene = scene;
    this.nullVector = new THREE.Vector3(0, 0, 0);
    this.upVector = new THREE.Vector3(0, 0, 1);
    this.flockGeometry = new THREE.InstancedMesh(
      geometry,
      material,
      boids.length
    );
    this.dummyMatrix = new THREE.Matrix4();
  }

  getGeometry() {
    return this.flockGeometry;
  }

  update(dt) {
    this.boids.forEach((boid) => {
      boid.steer(this.scene, this.boids, dt);
    });

    this.boids.forEach((boid, i) => {
      boid.move(dt);
      this.dummyMatrix.lookAt(this.nullVector, boid.velocity, this.upVector);
      this.dummyMatrix.setPosition(boid.position);
      this.flockGeometry.setMatrixAt(i, this.dummyMatrix);
      this.flockGeometry.instanceMatrix.needsUpdate = true;
    });
  }
}
