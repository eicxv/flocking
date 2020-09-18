import * as THREE from "three";

class BoidParams {
  constructor() {
    this.targetVelocity = 1;
    this.velocityWeight = 10;
    this.separationWeight = 2;
    this.alignmentWeight = 1;
    this.cohesionWeight = 0.5;
    this.separationDistance = 1; // minimum distance before separation
    this.attentionAngle = 0.65 * Math.PI; // half the angle of the cone of vision
    this.attentionDistance = 2;
    this.avoidObstacleDistance = 5;
  }

  set attentionDistance(distance) {
    this._attentionDistance = distance;
    this.attentionDistanceSquared = distance ** 2;
  }

  get attentionDistance() {
    return this._attentionDistance;
  }

  set separationDistance(distance) {
    this._separationDistance = distance;
    this.separationDistanceSquared = distance ** 2;
  }

  get separationDistance() {
    return this._separationDistance;
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

// reused objects
const dummyVector = new THREE.Vector3();
const dummyVector2 = new THREE.Vector3();
const dummyVector3 = new THREE.Vector3();
const dummyVector4 = new THREE.Vector3();
const dummyVector5 = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
raycaster.near = 0;
raycaster.far = boidParams.avoidObstacleDistance;
raycaster.layers.set(1);

const matrix = new THREE.Matrix4();
const matrixRot = new THREE.Matrix4();
matrixRot.makeRotationX(-Math.PI / 2);
const nullVector = new THREE.Vector3(0, 0, 0);
const upVector = new THREE.Vector3(0, 0, 1);
const xVector = new THREE.Vector3(1, 0, 0);
const yVector = new THREE.Vector3(0, 1, 0);

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
    let boidsNearby = this._getNearbyBoids(boidsHashMap);
    if (boidsNearby.length !== 0) {
      let flockForce = this._flock(boidsNearby);
      this.velocity.addScaledVector(flockForce, dt);
    }
    if (this._isOnCollisionCourse(scene, this.params.avoidObstacleDistance)) {
      this._avoidObstacles(scene, this.params.avoidObstacleDistance);
    }
    this.velocity.setLength(this.params.targetVelocity);
  }

  move(dt) {
    this.position.addScaledVector(this.velocity, dt);
  }

  _getNearbyBoids(boidsHashMap) {
    let boidsNearby = boidsHashMap.retrieve(
      this.position,
      this.params.attentionDistance
    );
    boidsNearby = this._filterAttention(
      boidsNearby,
      this.params.attentionDistanceSquared,
      this.params.cosAttentionAngle
    );
    return boidsNearby;
  }

  _flock(boids) {
    let flockForce = dummyVector.setScalar(0);
    let alignment = dummyVector2.setScalar(0);
    let cohesion = dummyVector3.setScalar(0);
    let separation = dummyVector4.setScalar(0);
    boids.forEach((boid) => {
      alignment.add(boid.velocity);
      cohesion.add(boid.position);
      let distanceToBoidSq = boid.position.distanceToSquared(this.position);
      if (distanceToBoidSq < this.params.separationDistanceSquared) {
        let boidToSelf = dummyVector5.copy(this.position);
        boidToSelf.sub(boid.position);
        let distanceToBoid = Math.sqrt(distanceToBoidSq);
        let coeff = 1 - distanceToBoid / this.params.separationDistance;
        separation.addScaledVector(boidToSelf, coeff);
        separation.add(boidToSelf);
      }
    });
    alignment.divideScalar(boids.length);
    alignment.sub(this.velocity);
    cohesion.divideScalar(boids.length);
    cohesion.sub(this.position);
    flockForce.addScaledVector(alignment, this.params.alignmentWeight);
    flockForce.addScaledVector(cohesion, this.params.cohesionWeight);
    flockForce.addScaledVector(separation, this.params.separationWeight);
    return flockForce;
  }

  _isOnCollisionCourse(scene, avoidDistance) {
    raycaster.set(this.position, this.velocity);
    let intersects = raycaster.intersectObjects(scene.children);
    return intersects.length !== 0;
  }

  _avoidObstacles(scene, avoidDistance) {
    let directionIt = this._generateDirections();
    for (let direction of directionIt) {
      raycaster.set(this.position, direction);
      let intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length === 0) {
        this.velocity.copy(direction);
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

    matrix.setPosition(nullVector);
    matrix.lookAt(nullVector, this.velocity, upVector);
    matrix.multiply(matrixRot);
    let phiOffset = Math.floor(Math.random() * phiSteps);

    for (let theta = 1; theta < thetaSteps; theta++) {
      for (let phi = 0; phi < phiSteps; phi++) {
        let direction = dummyVector.copy(yVector);
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
