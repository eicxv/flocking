import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export default class Viewport {
  constructor(container, showStats = false) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
    });
    if (showStats) {
      this.stats = Stats();
      document.body.appendChild(this.stats.dom);
      this.render = this._renderStats;
    }
    this._initCamera();
    this._addGrid(5, 8);
    this.render();
  }

  getScene() {
    return this.scene;
  }

  _addGrid(size, divisions) {
    let grid = new THREE.GridHelper(size, divisions, 0x333333, 0x444444);
    grid.rotateX(Math.PI / 2);
    this.scene.add(grid);
  }

  _resizeRenderer() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const needResize =
      this.container.width !== width || this.container.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect =
        this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  _initCamera() {
    let aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(3, 3, 3);
    this.camera.lookAt(0, 0, 0);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  render() {
    this._resizeRenderer();
    this.renderer.render(this.scene, this.camera);
  }

  _renderStats() {
    this._resizeRenderer();
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}
