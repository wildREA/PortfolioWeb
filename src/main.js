import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from './objects/Water';
import { Ground } from './objects/Ground';
import { SeaFloor } from './objects/SeaFloor';
import { setupUI } from './ui';

// Animation
const clock = new THREE.Clock();

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.cursor = 'none'; // Hide cursor

// Environment map
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('/threejs-water-shader/');
const environmentMap = cubeTextureLoader.load([
  'px.png', // positive x
  'nx.png', // negative x 
  'py.png', // positive y
  'ny.png', // negative y
  'pz.png', // positive z
  'nz.png'  // negative z
]);

const poolTexture = new THREE.TextureLoader().load('/threejs-water-shader/ocean_floor.png');

scene.background = environmentMap;
scene.environment = environmentMap;

// Camera position
camera.position.set(4, 1, 2);

// Base look target
const baseLookTarget = new THREE.Vector3(-10000, 0, -4000);
let currentLookTarget = baseLookTarget.clone();
let orbitAngle = 0;
const ORBIT_SPEED = 0.015;
let isOrbiting = false;
let targetOrbitAngle = 0;

window.addEventListener('mousemove', (event) => {
  // Normalize mouse position between -1 and 1
  const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
  const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;
  
  // Update look target with normalized values
  currentLookTarget.x = baseLookTarget.x + (normalizedX * 1000);
  currentLookTarget.y = baseLookTarget.y - (normalizedY * 500);
});

// Simple dive animation
let targetY = 1;
const MAX_HEIGHT = 1;    // Maximum height (surface)
const MIN_HEIGHT = -1.2; // Maximum dive depth

window.addEventListener('wheel', (event) => {
  if (event.deltaY > 0) { // Scrolling down (dive)
    targetY = Math.max(MIN_HEIGHT, targetY - 0.1);
    // Only change target angle if we're above water
    if (camera.position.y >= 0) {
      targetOrbitAngle = Math.PI / 3;
    } else {
      // When underwater, reverse the direction
      targetOrbitAngle = -orbitAngle;
    }
  } else { // Scrolling up (surface)
    targetY = Math.min(MAX_HEIGHT, targetY + 0.1);
    targetOrbitAngle = 0;
  }
  isOrbiting = true;
});

// Add some light to see the ground material
const ambientLight = new THREE.AmbientLight(0xffffff, 0.28);
scene.add(ambientLight);

const waterResolution = { size: 256 };
const water = new Water({
  environmentMap,
  resolution: waterResolution.size
});
water.scale.set(5, 5, 5);
scene.add(water);

// Add the sea floor between water and ground
const seaFloor = new SeaFloor();
scene.add(seaFloor);

const ground = new Ground({
  texture: poolTexture
});
scene.add(ground);

function animate() {
  const elapsedTime = clock.getElapsedTime();
  
  // Smooth camera movement
  camera.position.y += (targetY - camera.position.y) * 0.05;
  
  // Smooth orbital movement
  if (isOrbiting) {
    if (camera.position.y < 0) {
      // Underwater: smoothly transition to looking up from current angle
      orbitAngle += (targetOrbitAngle - orbitAngle) * (ORBIT_SPEED * 0.5); // Slower transition
    } else {
      orbitAngle += (targetOrbitAngle - orbitAngle) * ORBIT_SPEED;
    }
    
    // Calculate new look target position in an arc
    const radius = 10000;
    const x = currentLookTarget.x + Math.sin(orbitAngle) * radius;
    const y = currentLookTarget.y - Math.sin(orbitAngle) * radius;
    const z = currentLookTarget.z;
    
    camera.lookAt(x, y, z);
    
    // Stop orbiting when very close to target angle
    if (Math.abs(targetOrbitAngle - orbitAngle) < 0.001) {
      isOrbiting = false;
    }
  } else {
    camera.lookAt(currentLookTarget);
  }
  
  water.update(elapsedTime);
  ground.update(elapsedTime);
  seaFloor.update(elapsedTime);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
setupUI({ waterResolution, water, ground });


