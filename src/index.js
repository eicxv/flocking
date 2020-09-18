import { initFlock, addBoundary } from "./flocking/setup";
import Viewport from "./viewport/viewport";
import Gui from "./gui";
import "./styles.css";

let dt = 0.1;
let numberBoids = 500;

function main() {
  const gui = new Gui();
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container, true);
  const scene = viewport.getScene();
  addBoundary(scene);
  const flock = initFlock(numberBoids, scene, dt);

  function update() {
    if (gui.obj.run === true) {
      flock.update(dt);
    }
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
}

main();
