import * as THREE from 'three';
import causticsVertexShader from '../shaders/caustics.vert?raw';
import causticsFragmentShader from '../shaders/caustics.frag?raw';

export class Ground extends THREE.Mesh {
  constructor(options = {}) {
    super();
    this.material = new THREE.ShaderMaterial({
      vertexShader: causticsVertexShader,
      fragmentShader: causticsFragmentShader,
      uniforms: {
        uTexture: { value: options.texture },
        uTime: { value: 0 },
        uCausticsColor: { value: new THREE.Color('#ffffff') }, // already darker caustics color
        uCausticsIntensity: { value: 0.2 },
        uCausticsScale: { value: 20.0 },
        uCausticsSpeed: { value: 1.0 },
        uCausticsThickness: { value: 0.4 },
        uCausticsOffset: { value: 0.75 },
        // New uniform to darken the sand
        uSandDarkness: { value: 0.7 }
      }
    });

    this.geometry = new THREE.PlaneGeometry(15, 15);
    this.rotation.x = -Math.PI * 0.5;
    this.position.y = -1.5;
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
  }
}
