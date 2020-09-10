import * as THREE from "three";

export default class Boid {
  constructor(position, velocity) {
    this.position = position
      ? position
      : new THREE.Vector3(Math.random(), Math.random(), Math.random());
    this.velocity = velocity
      ? velocity
      : new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        );
    this.maxVelocity = 1;
    this.separationWeight = 1;
    this.alignmentWeight = 1;
    this.cohesionWeight = 1;

    this.attentionDistance = 5;
    this.attentionAngle = 0.5 * Math.PI;
    this.cosAttentionAngle = Math.cos(this.attentionAngle);
  }

  steer(scene, boids, dt) {
    let boidsNearby = this._filterAttention(
      boids,
      this.attentionDistance,
      this.cosAttentionAngle
    );
    if (boidsNearby.length !== 0) {
      let steerForce;
      steerForce = this._alignment(boidsNearby);
      this._updateVelocity(steerForce, dt, this.alignmentWeight);
      steerForce = this._cohesion(boidsNearby);
      this._updateVelocity(steerForce, dt, this.cohesionWeight);
      steerForce = this._separation(boidsNearby);
      this._updateVelocity(steerForce, dt, this.separationWeight);
    }

    this._avoidObstacles(scene);
    this.velocity.normalize();
    this.velocity.multiplyScalar(this.maxVelocity);
  }

  move(dt) {
    this.position = this.position.add(this.velocity.clone().multiplyScalar(dt));
  }

  _updateVelocity(force, dt, weight = 1) {
    if (isNaN(force.x)) {
      throw new Error("HELP");
    }
    this.velocity.add(force.multiplyScalar(dt * weight));
  }

  _alignment(boids) {
    let alignmentForce = boids.reduce(
      (direction, boid) => direction.add(boid.velocity),
      new THREE.Vector3()
    );
    alignmentForce.divideScalar(boids.length);
    alignmentForce.sub(this.velocity);
    return alignmentForce;
  }

  _cohesion(boids) {
    let position = boids.reduce(
      (position, boid) => position.add(boid.position),
      new THREE.Vector3()
    );
    position.divideScalar(boids.length);
    let cohesionForce = position.sub(this.position);
    cohesionForce.sub(this.velocity);
    return cohesionForce;
  }

  _separation(boids) {
    let separationForce = new THREE.Vector3();
    boids.forEach((boid) => {
      let dist = boid.position.distanceTo(this.position);
      let dir = this.position.clone().sub(boid.position);
      dir.divideScalar(dist ** 2);
      separationForce.add(dir);
    });
    separationForce.divideScalar(boids.length);
    separationForce.sub(this.velocity);
    return separationForce;
  }

  _avoidObstacles(scene) {
    let raycaster = new THREE.Raycaster(this.position, this.velocity, 0, 3);
    raycaster.layers.set(1);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length === 0) {
      return;
    }
    let distance = intersects[0].distance;

    let directionIt = this._generateDirections();
    for (let direction of directionIt) {
      let raycaster = new THREE.Raycaster(this.position, direction, 0, 3);
      raycaster.layers.set(1);
      let intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length === 0) {
        this.velocity = direction;
        break;
      }
    }
  }

  _filterAttention(boids, distance, maxCosAngle) {
    let filterFunc = this._isInAttention.bind(this, distance, maxCosAngle);
    return boids.filter(filterFunc);
  }

  _isInAttention(distance, maxCosAngle, boid) {
    if (boid === this) {
      return false;
    }
    if (boid.position.distanceTo(this.position) > distance) {
      return false;
    }
    let vectorToBoid = boid.position.clone().sub(this.position);
    vectorToBoid.normalize();
    let cosAngle = vectorToBoid.dot(this.velocity.clone().normalize());
    return cosAngle > maxCosAngle;
  }

  *_generateDirections() {
    let phiSteps = 4;
    let phiStepSize = (2 * Math.PI) / phiSteps;
    let thetaSteps = 10;
    let thetaStepSize = Math.PI / thetaSteps;

    let nullVector = new THREE.Vector3(0, 0, 0);
    let upVector = new THREE.Vector3(0, 0, 1);
    let xVector = new THREE.Vector3(1, 0, 0);
    let yVector = new THREE.Vector3(0, 1, 0);

    let matrix = new THREE.Matrix4();
    matrix.lookAt(nullVector, this.velocity, upVector);
    let matrixRot = new THREE.Matrix4();
    matrixRot.makeRotationX(-Math.PI / 2);
    matrix.multiply(matrixRot);

    for (let theta = 1; theta < thetaSteps; theta++) {
      for (let phi = 0; phi < phiSteps; phi++) {
        let direction = new THREE.Vector3(0, 1, 0);
        direction.applyAxisAngle(xVector, theta * thetaStepSize);
        direction.applyAxisAngle(yVector, phi * phiStepSize);
        direction.applyMatrix4(matrix);
        yield direction;
      }
    }
  }
}
