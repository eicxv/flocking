import * as THREE from "three";
// import Flock from "./flocking/flock";
import { initFlock, addBoundary } from "./flocking/setup";
import Viewport from "./viewport/viewport";
import "./styles.css";

let dt = 0.1;
let numberBoids = 500;

function main() {
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container, true);
  const scene = viewport.getScene();
  addBoundary(scene);
  const flock = initFlock(numberBoids, scene, dt);

  function update() {
    flock.update(dt);
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
}

main();
