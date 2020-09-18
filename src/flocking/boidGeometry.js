import * as THREE from "three";

export default class BoidBufferGeometry extends THREE.BufferGeometry {
  constructor() {
    super();
    this.type = "BoidBufferGeometry";
    let vertices = new Float32Array([
      0.0,
      0.0,
      2.0,
      1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      0.0,
      0.0,
      -0.6,
      0.0,
      0.5,
      0.0,
    ]);
    let indices = [0, 1, 3, 0, 3, 2, 0, 4, 1, 0, 2, 4, 1, 4, 3, 2, 3, 4];
    this.setIndex(indices);
    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
  }
}
