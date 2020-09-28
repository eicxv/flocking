import * as THREE from "three";
import SpatialHash from "./spatialHash";

export default class Flock {
  constructor(boids, geometry, material, scene) {
    this.allBoids = boids;
    this.boids = boids.slice(0);
    this.count = boids.length;
    this.scene = scene;

    this.flockGeometry = new THREE.InstancedMesh(
      geometry,
      material,
      boids.length
    );
    this.spatialHash = new SpatialHash(3, new THREE.Vector3(0, 0, 0), 30);
    console.log(this.spatialHash._hash);
    this.boids.forEach((boid) => {
      this.spatialHash.insert(boid);
    });

    this.upVector = new THREE.Vector3(0, 0, 1);
    this.nullVector = new THREE.Vector3(0, 0, 0);
    this.dummyMatrix = new THREE.Matrix4();
  }

  getGeometry() {
    return this.flockGeometry;
  }

  setNumberOfBoids(n) {
    if (n >= 0 && n <= this.count) {
      this.flockGeometry.count = n;
      this.boids = this.allBoids.slice(0, n);
    } else {
      throw new Error(`invalid number of boids ${n}`);
    }
  }

  update(dt) {
    this.boids.forEach((boid) => {
      boid.steer(this.scene, this.spatialHash, dt);
    });

    this.boids.forEach((boid, i) => {
      boid.move(dt);
      this.spatialHash.update(boid);

      this.dummyMatrix.lookAt(this.nullVector, boid.velocity, this.upVector);
      this.dummyMatrix.setPosition(boid.position);
      this.flockGeometry.setMatrixAt(i, this.dummyMatrix);
      this.flockGeometry.instanceMatrix.needsUpdate = true;
    });
  }
}
