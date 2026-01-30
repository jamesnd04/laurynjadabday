// Three.js Birthday Background Animation
// Creates a dreamy, romantic particle field with floating geometries

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bg-canvas'),
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Colors from our palette
const colors = {
    deepPurple: 0x2d1b4e,
    royalPurple: 0x6b3fa0,
    softPurple: 0x9b6dcc,
    lavender: 0xc4a7e7,
    oceanBlue: 0x3d5a80,
    teal: 0x4ecdc4,
    mint: 0x95d5b2,
    softGreen: 0x74c69d
};

const colorArray = [
    colors.softPurple,
    colors.lavender,
    colors.teal,
    colors.mint,
    colors.oceanBlue
];

// Particle System - Floating Stars
const particleCount = 2000;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Spread particles in a large sphere
    const radius = 50 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Random color from palette
    const color = new THREE.Color(colorArray[Math.floor(Math.random() * colorArray.length)]);
    particleColors[i3] = color.r;
    particleColors[i3 + 1] = color.g;
    particleColors[i3 + 2] = color.b;
    
    // Varying sizes
    sizes[i] = Math.random() * 2 + 0.5;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// Custom shader for glowing particles
const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        pixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float pixelRatio;
        
        void main() {
            vColor = color;
            vec3 pos = position;
            
            // Gentle floating motion
            pos.y += sin(time * 0.5 + position.x * 0.1) * 2.0;
            pos.x += cos(time * 0.3 + position.z * 0.1) * 1.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        
        void main() {
            // Create soft circular particle
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            // Soft glow effect
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha *= 0.8;
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Floating Geometric Shapes
const geometries = [];
const shapeMaterials = [];

// Create various floating shapes
function createFloatingShape(geometry, color, position, scale) {
    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.setScalar(scale);
    mesh.userData = {
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: position.y
    };
    
    return mesh;
}

// Add various shapes
const shapes = [
    createFloatingShape(
        new THREE.IcosahedronGeometry(1, 0),
        colors.lavender,
        { x: -15, y: 5, z: -20 },
        3
    ),
    createFloatingShape(
        new THREE.OctahedronGeometry(1, 0),
        colors.teal,
        { x: 20, y: -8, z: -25 },
        4
    ),
    createFloatingShape(
        new THREE.TetrahedronGeometry(1, 0),
        colors.mint,
        { x: -25, y: -5, z: -30 },
        3.5
    ),
    createFloatingShape(
        new THREE.TorusGeometry(1, 0.3, 8, 16),
        colors.softPurple,
        { x: 25, y: 10, z: -35 },
        2.5
    ),
    createFloatingShape(
        new THREE.DodecahedronGeometry(1, 0),
        colors.oceanBlue,
        { x: 0, y: 15, z: -40 },
        2
    ),
    createFloatingShape(
        new THREE.IcosahedronGeometry(1, 1),
        colors.lavender,
        { x: -30, y: 12, z: -45 },
        2.5
    ),
    createFloatingShape(
        new THREE.TorusKnotGeometry(1, 0.3, 64, 8),
        colors.teal,
        { x: 30, y: -12, z: -50 },
        1.5
    )
];

shapes.forEach(shape => scene.add(shape));

// Heart shape using custom geometry
function createHeartShape() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    
    const geometry = new THREE.ShapeGeometry(heartShape);
    const material = new THREE.MeshBasicMaterial({
        color: colors.lavender,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
    });
    
    const heart = new THREE.Mesh(geometry, material);
    heart.position.set(0, 0, -15);
    heart.scale.setScalar(2);
    heart.rotation.z = Math.PI;
    heart.userData = {
        rotationSpeed: { x: 0, y: 0.005, z: 0 },
        floatSpeed: 0.8,
        floatOffset: 0,
        originalY: 0
    };
    
    return heart;
}

const heart = createHeartShape();
scene.add(heart);
shapes.push(heart);

// Ambient light rings
function createLightRing(radius, color, y) {
    const geometry = new THREE.TorusGeometry(radius, 0.05, 8, 100);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    ring.userData = {
        rotationSpeed: { x: 0, y: 0, z: 0.002 }
    };
    
    return ring;
}

const rings = [
    createLightRing(20, colors.softPurple, -5),
    createLightRing(25, colors.teal, 5),
    createLightRing(30, colors.lavender, 0)
];

rings.forEach(ring => scene.add(ring));

// Camera position
camera.position.z = 30;

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

// Scroll interaction
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Update particle shader time
    particleMaterial.uniforms.time.value = elapsedTime;
    
    // Rotate particle system slowly
    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
    
    // Animate floating shapes
    shapes.forEach((shape, index) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        
        // Floating motion
        shape.position.y = shape.userData.originalY + 
            Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 2;
    });
    
    // Animate rings
    rings.forEach((ring, index) => {
        ring.rotation.z += ring.userData.rotationSpeed.z * (index + 1);
    });
    
    // Smooth camera movement based on mouse
    targetX = mouseX * 5;
    targetY = -mouseY * 3;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    
    // Parallax effect on scroll
    const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);
    camera.position.z = 30 + scrollProgress * 20;
    particles.rotation.y += scrollProgress * 0.001;
    
    // Look at center with slight offset
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    particleMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
});

// Video placeholder handling
const video = document.getElementById('birthday-video');
const placeholder = document.querySelector('.video-placeholder');

video.addEventListener('loadeddata', () => {
    if (placeholder) {
        placeholder.style.display = 'none';
    }
});

video.addEventListener('error', () => {
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate sections on scroll
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(section);
});

// Initial hero visibility
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';

console.log('🎂 Happy Birthday Lauryn! 💜');

