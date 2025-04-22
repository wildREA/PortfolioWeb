// Project 3D Image Rotation with Three.js
class ProjectImageRotator {
    constructor(containerId, imageSrc) {
        this.container = document.getElementById(containerId);
        this.imageSrc = imageSrc;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.isAnimating = true;
        this.autoRotationSpeed = 0.01;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Camera setup
        const containerRect = this.container.getBoundingClientRect();
        const aspect = containerRect.width / containerRect.height;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.z = 1.2;
        
        // Renderer setup with improved quality
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(containerRect.width, containerRect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Enhanced lighting setup for brighter, more uniform illumination
        // Stronger ambient light for overall brightness
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        
        // Main front light (brighter)
        const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
        frontLight.position.set(0, 0, 2);
        this.scene.add(frontLight);
        
        // Additional lights from multiple angles to ensure even lighting
        const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
        backLight.position.set(0, 0, -2);
        this.scene.add(backLight);
        
        const leftLight = new THREE.DirectionalLight(0xffffff, 0.8);
        leftLight.position.set(-2, 0, 0);
        this.scene.add(leftLight);
        
        const rightLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rightLight.position.set(2, 0, 0);
        this.scene.add(rightLight);
        
        const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
        topLight.position.set(0, 2, 0);
        this.scene.add(topLight);
        
        // Create a plane geometry for the image
        const geometry = new THREE.PlaneGeometry(1, 1, 1);
        
        // Load texture with improved settings
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.imageSrc, (texture) => {
            // Improve texture quality
            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            // Adjust plane aspect ratio to match image
            const imageAspect = texture.image.width / texture.image.height;
            
            let width, height;
            if (imageAspect > 1) {
                width = 1;
                height = 1 / imageAspect;
            } else {
                width = imageAspect;
                height = 1;
            }
            
            // Update geometry with correct aspect ratio
            this.mesh.geometry = new THREE.PlaneGeometry(width, height, 1);
            
            // Create material with the loaded texture
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
                metalness: 0.3,
                roughness: 0.7
            });
            
            this.mesh.material = material;
        });
        
        // Create mesh with placeholder material until texture loads
        const placeholderMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, placeholderMaterial);
        this.scene.add(this.mesh);
        
        // Set up interaction events
        this.setupEvents();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    setupEvents() {
        // Mouse interaction
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Touch interaction for mobile
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Mouse enter/leave to pause/resume auto rotation
        this.container.addEventListener('mouseenter', () => { this.isAnimating = false; });
        this.container.addEventListener('mouseleave', () => { 
            this.isAnimating = true;
            this.isDragging = false;
        });
    }
    
    onMouseDown(event) {
        event.preventDefault();
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    onMouseMove(event) {
        if (!this.isDragging) return;
        
        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };
        
        // Horizontal rotation around Y axis
        this.mesh.rotation.y += deltaMove.x * 0.01;
        
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (!this.isDragging || event.touches.length !== 1) return;
        
        const deltaMove = {
            x: event.touches[0].clientX - this.previousMousePosition.x,
            y: event.touches[0].clientY - this.previousMousePosition.y
        };
        
        // Horizontal rotation around Y axis
        this.mesh.rotation.y += deltaMove.x * 0.01;
        
        this.previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    onWindowResize() {
        const containerRect = this.container.getBoundingClientRect();
        this.camera.aspect = containerRect.width / containerRect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(containerRect.width, containerRect.height);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Auto-rotate if not being dragged
        if (this.isAnimating && !this.isDragging && this.mesh) {
            this.mesh.rotation.y += this.autoRotationSpeed;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize 3D project images when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for the carousel to initialize first
    setTimeout(() => {
        setupProjectImages();
    }, 100);
});

function setupProjectImages() {
    const projectContainers = document.querySelectorAll('.project-3d-container');
    
    // Initialize each project image with 3D rotation
    projectContainers.forEach((container, index) => {
        const id = container.id;
        const imageElement = container.getAttribute('data-image');
        new ProjectImageRotator(id, imageElement);
    });
}

// Function to update 3D containers when carousel changes
function updateActiveProject(index) {
    // This can be called from carousel navigation code
    // to reinitialize 3D for visible projects
    const visibleContainer = document.querySelector(`.project-card[data-index="${index}"] .project-3d-container`);
    if (visibleContainer) {
        const id = visibleContainer.id;
        const imageElement = visibleContainer.getAttribute('data-image');
        new ProjectImageRotator(id, imageElement);
    }
}