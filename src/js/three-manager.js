import * as THREE from 'three';

class ThreeManager {
    constructor() {
        this.container = document.getElementById('three-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.initScene();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initScene() {
        // Geometric Crystal (Icosahedron + Wireframe)
        const geometry = new THREE.IcosahedronGeometry(2, 0);
        const wireframeGeometry = new THREE.IcosahedronGeometry(2.1, 0);

        // Progress Ring (Torus)
        const ringGeometry = new THREE.TorusGeometry(3.5, 0.05, 16, 100);

        // Gold-like material
        const material = new THREE.MeshPhongMaterial({
            color: 0xD4BD9B,
            shininess: 100,
            transparent: true,
            opacity: 0.8,
            flatShading: true
        });

        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xE0CDA8,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xD4BD9B,
            transparent: true,
            opacity: 0
        });

        this.crystal = new THREE.Mesh(geometry, material);
        this.wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.progressRing = new THREE.Mesh(ringGeometry, ringMaterial);

        // Start ring invisible and scaled down
        this.progressRing.scale.set(0.8, 0.8, 0.8);

        this.scene.add(this.crystal);
        this.scene.add(this.wireframe);
        this.scene.add(this.progressRing);

        // Lights
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xD4BD9B, 2, 10);
        pointLight.position.set(-2, 2, 2);
        this.scene.add(pointLight);

        this.camera.position.z = 8;
    }

    updateProgress(progress) {
        if (!this.progressRing) return;

        // Update ring scale and opacity based on progress
        const targetScale = 0.8 + (progress * 0.2);
        this.progressRing.scale.set(targetScale, targetScale, targetScale);
        this.progressRing.material.opacity = progress * 0.8;

        // Subtle glow effect
        if (progress > 0.9) {
            this.progressRing.material.color.setHex(0xFFFFFF);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.crystal) {
            this.crystal.rotation.x += 0.005;
            this.crystal.rotation.y += 0.01;

            this.wireframe.rotation.x -= 0.003;
            this.wireframe.rotation.y -= 0.005;

            if (this.progressRing) {
                this.progressRing.rotation.z += 0.01;
            }

            // Subtle pulse
            const time = Date.now() * 0.001;
            const scaleBase = 1 + Math.sin(time * 2) * 0.05;
            this.crystal.scale.set(scaleBase, scaleBase, scaleBase);
            this.wireframe.scale.set(scaleBase, scaleBase, scaleBase);
        }

        this.renderer.render(this.scene, this.camera);
    }

    fadeOut() {
        if (!this.container) return;
        this.container.style.transition = 'opacity 1s ease-out';
        this.container.style.opacity = '0';
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 1000);
    }
}

export const threeManager = new ThreeManager();
