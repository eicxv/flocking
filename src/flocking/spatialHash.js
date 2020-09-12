// Spatial hash using objects of this form
// let obj = {
//   position: { x: Number, y: Number, z: Number },
//   _hashKey: undefined,
// };

export default class SpatialHash {
  constructor(powerOfTwo, origin, length) {
    this._powerOfTwo = powerOfTwo;
    this._hash = new Map();
    this._initialize(origin, length);
  }

  insert(obj) {
    let key = this._makeKey(obj.position);
    obj._hashKey = key;
    this._hash.get(key).add(obj);
  }

  remove(obj) {
    this._hash.get(obj._hashKey).delete(obj);
  }

  update(obj) {
    let key = this._makeKey(obj.position);
    if (obj._hashKey === key) {
      return;
    }
    this.remove(obj);
    this._insertAtKey(obj, key);
  }

  retrieve(point, radius) {
    let ret = [];
    let keysIt = this._genKeys(point, radius);
    for (let key of keysIt) {
      if (this._hash.has(key)) {
        ret.push(...this._hash.get(key));
      }
    }
    return ret;
  }

  _initialize(origin, length) {
    let keysIt = this._genKeys(origin, length);
    for (let key of keysIt) {
      this._hash.set(key, new Set());
    }
  }

  _insertAtKey(obj, key) {
    obj._hashKey = key;
    this._hash.get(key).add(obj);
  }

  _makeKey(point) {
    return (
      (point.x >> this._powerOfTwo) +
      ":" +
      (point.y >> this._powerOfTwo) +
      ":" +
      (point.z >> this._powerOfTwo)
    );
  }

  *_genKeys(point, offset) {
    let lx = (point.x - offset) >> this._powerOfTwo;
    let ly = (point.y - offset) >> this._powerOfTwo;
    let lz = (point.z - offset) >> this._powerOfTwo;
    let ux = (point.x + offset) >> this._powerOfTwo;
    let uy = (point.y + offset) >> this._powerOfTwo;
    let uz = (point.z + offset) >> this._powerOfTwo;
    for (let z = lz; z <= uz; z++) {
      for (let y = ly; y <= uy; y++) {
        for (let x = lx; x <= ux; x++) {
          yield x + ":" + y + ":" + z;
        }
      }
    }
  }
}
