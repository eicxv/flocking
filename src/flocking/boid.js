import * as THREE from "three";

class BoidParams {
  constructor() {
    this.maxVelocity = 1;
    this.separationWeight = 2;
    this.alignmentWeight = 1;
    this.cohesionWeight = 0.5;

    this.attentionAngle = 0.65 * Math.PI;
    this.attentionDistance = 2;
    this.avoidObstacleDistance = 2;
  }

  set attentionDistance(distance) {
    this._attentionDistance = distance;
    this.attentionDistanceSquared = distance ** 2;
  }

  get attentionDistance() {
    return this._attentionDistance;
  }

  set attentionAngle(angle) {
    this._attentionAngle = angle;
    this.cosAttentionAngle = Math.cos(this._attentionAngle);
  }

  get attentionAngle() {
    return this._attentionAngle;
  }
}

export const boidParams = new BoidParams();

const dummyVector = new THREE.Vector3();
const dummyVector2 = new THREE.Vector3();

export default class Boid {
  constructor(position, velocity) {
    this.position = position
      ? position
      : new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        );
    this.velocity = velocity
      ? velocity
      : new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        );

    this.params = boidParams;
  }

  steer(scene, boidsHashMap, dt) {
    let boidsNearby = boidsHashMap.retrieve(
      this.position,
      this.params.attentionDistance
    );
    boidsNearby = this._filterAttention(
      boidsNearby,
      this.params.attentionDistanceSquared,
      this.params.cosAttentionAngle
    );

    if (boidsNearby.length !== 0) {
      let steerForce;
      steerForce = this._alignment(boidsNearby);
      this._updateVelocity(steerForce, dt, this.params.alignmentWeight);
      steerForce = this._cohesion(boidsNearby);
      this._updateVelocity(steerForce, dt, this.params.cohesionWeight);
      steerForce = this._separation(boidsNearby);
      this._updateVelocity(steerForce, dt, this.params.separationWeight);
    }

    if (this._isOnCollisionCourse(scene, this.params.avoidObstacleDistance)) {
      this._avoidObstacles(scene, this.params.avoidObstacleDistance);
    }

    this.velocity.normalize();
    this.velocity.multiplyScalar(this.params.maxVelocity);
  }

  move(dt) {
    let velocity = dummyVector.copy(this.velocity);
    this.position.add(velocity.multiplyScalar(dt));
  }

  _updateVelocity(force, dt, weight = 1) {
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
      let distanceSquared = boid.position.distanceToSquared(this.position);
      let selfPosition = dummyVector.copy(this.position);
      let dir = selfPosition.sub(boid.position);
      dir.divideScalar(distanceSquared ** 2);
      separationForce.add(dir);
    });
    separationForce.divideScalar(boids.length);
    separationForce.sub(this.velocity);
    return separationForce;
  }

  _isOnCollisionCourse(scene, avoidDistance) {
    let raycaster = new THREE.Raycaster(
      this.position,
      this.velocity,
      0,
      avoidDistance
    );
    raycaster.layers.set(1);
    let intersects = raycaster.intersectObjects(scene.children);
    return intersects.length !== 0;
  }

  _avoidObstacles(scene, avoidDistance) {
    let directionIt = this._generateDirections();
    for (let direction of directionIt) {
      let raycaster = new THREE.Raycaster(
        this.position,
        direction,
        0,
        avoidDistance
      );
      raycaster.layers.set(1);
      let intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length === 0) {
        this.velocity = direction;
        break;
      }
    }
  }

  _filterAttention(boids, distanceSquared, maxCosAngle) {
    let filterFunc = this._isInAttention.bind(
      this,
      distanceSquared,
      maxCosAngle
    );
    return boids.filter(filterFunc);
  }

  _isInAttention(distanceSquared, maxCosAngle, boid) {
    if (boid === this) {
      return false;
    }
    if (boid.position.distanceToSquared(this.position) > distanceSquared) {
      return false;
    }
    let boidPosition = dummyVector.copy(boid.position);
    let vectorToBoid = boidPosition.sub(this.position);
    vectorToBoid.normalize();
    let selfVelocity = dummyVector2.copy(this.velocity);
    selfVelocity.normalize();
    let cosAngle = vectorToBoid.dot(selfVelocity);
    return cosAngle > maxCosAngle;
  }

  *_generateDirections() {
    let phiSteps = 4;
    let phiStepSize = (2 * Math.PI) / phiSteps;
    let thetaSteps = 6;
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
    let phiOffset = Math.floor(Math.random() * phiSteps);

    for (let theta = 1; theta < thetaSteps; theta++) {
      for (let phi = 0; phi < phiSteps; phi++) {
        let direction = new THREE.Vector3(0, 1, 0);
        direction.applyAxisAngle(xVector, theta * thetaStepSize);
        direction.applyAxisAngle(
          yVector,
          ((phi + phiOffset) % phiSteps) * phiStepSize
        );
        direction.applyMatrix4(matrix);
        yield direction;
      }
    }
  }
}
