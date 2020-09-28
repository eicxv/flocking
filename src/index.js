import { initFlock, addBoundary } from "./flocking/setup";
import Viewport from "./viewport/viewport";
import Gui, { settings } from "./gui";
import "./styles.css";

function main() {
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container, true);
  const scene = viewport.getScene();
  addBoundary(scene);
  const flock = initFlock(settings.numberOfBoids, scene, settings.dt);
  const gui = new Gui(flock);

  function update() {
    if (settings.run === true) {
      flock.update(settings.dt);
    }
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
}

main();
