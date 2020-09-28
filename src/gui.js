import dat from "three/examples/jsm/libs/dat.gui.module";
import { boidParams } from "./flocking/boidParams";

export const settings = {
  run: true,
  numberOfBoids: 500,
  dt: 0.1,
};

export default class Gui {
  constructor(flock) {
    this.gui = new dat.GUI();
    this.gui.add(boidParams, "targetVelocity", 0, 2).name("target velocity");
    this.gui
      .add(boidParams, "velocityWeight", 0, 20)
      .name("velocity adherence");
    this.gui.add(boidParams, "separationWeight", 0, 4).name("separation");
    this.gui.add(boidParams, "alignmentWeight", 0, 4).name("alignment");
    this.gui.add(boidParams, "cohesionWeight", 0, 4).name("cohesion");
    this.gui.add(boidParams, "attentionAngle", 0, Math.PI).name("vision angle");
    this.gui.add(boidParams, "attentionDistance", 0, 5).name("vision distance");
    this.gui.add(boidParams, "separationDistance", 0, 5).name("safe distance");
    this.gui.add(settings, "run");
    this.gui
      .add(settings, "numberOfBoids", 0, 500)
      .name("number of boids")
      .onChange((n) => flock.setNumberOfBoids(n));
  }
}
