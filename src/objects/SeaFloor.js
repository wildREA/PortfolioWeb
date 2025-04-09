import * as THREE from 'three';

export class SeaFloor extends THREE.Mesh {
  constructor() {
    super();
    
    // Create more realistic ocean colors
    const oceanColor = new THREE.Color('#0a3d62');       // Deep ocean blue
    const oceanColorDark = new THREE.Color('#001f3f');   // Very dark blue for depth
    const lightScatterColor = new THREE.Color('#4a90e2'); // Light scattering color
    
    // Create a shader material for realistic underwater effect
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: oceanColor },
        bottomColor: { value: oceanColorDark },
        lightScatterColor: { value: lightScatterColor },
        offset: { value: 0.0 },
        exponent: { value: 1.5 },
        fogDensity: { value: 0.8 },
        time: { value: 0.0 },
        lightDirection: { value: new THREE.Vector3(0, 1, 0) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vDepth;
        varying vec3 vViewDirection;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          vDepth = -worldPosition.y;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDirection = -normalize(mvPosition.xyz);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 lightScatterColor;
        uniform float offset;
        uniform float exponent;
        uniform float fogDensity;
        uniform float time;
        uniform vec3 lightDirection;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vDepth;
        varying vec3 vViewDirection;
        
        // Simplex noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        void main() {
          // Calculate how much we're looking through the water
          float viewThroughWater = abs(dot(normalize(vNormal), vViewDirection));
          
          // Calculate depth-based fog
          float depthFactor = 1.0 - exp(-vDepth * fogDensity);
          
          // Add some noise for water movement
          float noise = snoise(vec3(vWorldPosition.xz * 0.1, time * 0.1)) * 0.1;
          
          // Calculate light scattering
          float lightDot = max(dot(normalize(vNormal), lightDirection), 0.0);
          vec3 scatter = lightScatterColor * lightDot * (1.0 - depthFactor);
          
          // Mix colors based on depth and add scattering
          vec3 baseColor = mix(topColor, bottomColor, depthFactor);
          
          // Create volumetric effect
          float volumetricFactor = mix(1.0, 0.3, viewThroughWater);
          vec3 volumetricColor = mix(baseColor, scatter, 0.3 * volumetricFactor);
          
          // Add depth-based darkness
          float darknessFactor = mix(1.0, 0.5, depthFactor * viewThroughWater);
          vec3 finalColor = volumetricColor * darknessFactor;
          
          // Add some depth-based transparency
          float alpha = mix(0.8, 0.95, viewThroughWater) - depthFactor * 0.3;
          
          // Determine if camera is underwater
          bool isUnderwater = cameraPosition.y < 0.0;
          
          // Check if it's a side face
          bool isSideFace = abs(vNormal.y) < 0.5;
          
          if (isSideFace) {
            if (isUnderwater) {
              // Underwater looking at sides: show with dark blue color
              gl_FragColor = vec4(0.02, 0.05, 0.1, 0.9);
            } else {
              // Above water looking at sides: show normal water with added opacity
              gl_FragColor = vec4(finalColor, alpha * 0.9);
            }
          } else {
            // Top/bottom faces always use water color
            gl_FragColor = vec4(finalColor, alpha);
          }
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });

    // Create a box that matches the ground size (10x10)
    this.geometry = new THREE.BoxGeometry(10, 1.4, 10);
    
    // Adjust vertical positioning so the water is correctly placed
    this.position.y = -0.72;
  }

  update(time) {
    // Update time for animation
    this.material.uniforms.time.value = time;
    
    // Animate light direction for a dynamic look
    this.material.uniforms.lightDirection.value.y = Math.sin(time * 0.2) * 0.1 + 0.9;
  }
}