class BoidParams {
  constructor() {
    this.targetVelocity = 1;
    this.velocityWeight = 10;
    this.separationWeight = 0.5;
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
