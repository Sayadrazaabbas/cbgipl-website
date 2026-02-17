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

        this.progress = 0;
        this.initScene();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initScene() {
        // 1. Structural Blueprint Environment (Grid)
        const gridSize = 30;
        const divisions = 30;
        this.grid = new THREE.GridHelper(gridSize, divisions, 0xD4BD9B, 0x1A3A40);
        this.grid.position.y = -4;
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.2;
        this.scene.add(this.grid);

        // 2. Central Structural Core (Building-like stack)
        const coreGroup = new THREE.Group();
        this.buildingParts = [];

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshPhongMaterial({
            color: 0xD4BD9B,
            transparent: true,
            opacity: 0.8,
            flatShading: true,
            shininess: 100
        });

        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xE0CDA8,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        // Create a 3x3 base that "rises" or "assembles"
        for (let i = 0; i < 3; i++) {
            const level = new THREE.Group();
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    if (Math.random() > 0.4) {
                        const box = new THREE.Mesh(boxGeo, boxMat);
                        const wire = new THREE.Mesh(boxGeo, wireMat);
                        box.position.set(x * 1.1, i * 1.1, z * 1.1);
                        wire.position.copy(box.position);
                        level.add(box);
                        level.add(wire);
                    }
                }
            }
            coreGroup.add(level);
            this.buildingParts.push(level);
        }

        coreGroup.position.y = -1;
        this.scene.add(coreGroup);
        this.core = coreGroup;

        // 3. Prominent Progress Arc (Infrastructure Ring)
        // We use thetaLength to show actual progress.
        // inner radius 3.8, tube 0.15
        this.updateProgressArc(0);

        // 4. Lights
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(5, 10, 5);
        this.scene.add(mainLight);

        const fillLight = new THREE.PointLight(0xD4BD9B, 2, 20);
        fillLight.position.set(-5, 5, 2);
        this.scene.add(fillLight);

        this.scene.add(new THREE.AmbientLight(0x404040, 1.5));

        this.camera.position.set(8, 6, 12);
        this.camera.lookAt(0, 0, 0);
    }

    updateProgressArc(progress) {
        if (this.arcMesh) {
            this.scene.remove(this.arcMesh);
            this.arcMesh.geometry.dispose();
        }

        const theta = progress * Math.PI * 2;
        const geometry = new THREE.TorusGeometry(5, 0.15, 16, 100, theta || 0.001);
        const material = new THREE.MeshBasicMaterial({
            color: 0xD4BD9B,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        this.arcMesh = new THREE.Mesh(geometry, material);
        this.arcMesh.rotation.x = Math.PI / 2; // Lie flat
        this.arcMesh.rotation.z = Math.PI; // Start from top
        this.scene.add(this.arcMesh);
    }

    updateProgress(progress) {
        this.progress = progress;
        this.updateProgressArc(progress);

        // Assembly effect: bring in building parts based on progress
        if (this.buildingParts) {
            this.buildingParts.forEach((part, index) => {
                const threshold = index / this.buildingParts.length;
                if (progress > threshold) {
                    part.visible = true;
                    const subProgress = (progress - threshold) * this.buildingParts.length;
                    part.scale.set(
                        Math.min(1, subProgress),
                        Math.min(1, subProgress),
                        Math.min(1, subProgress)
                    );
                } else {
                    part.visible = false;
                }
            });
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.core) {
            this.core.rotation.y += 0.005;
        }

        if (this.grid) {
            // Subtle grid movement
            this.grid.position.z = (Date.now() * 0.001) % 1;
        }

        this.renderer.render(this.scene, this.camera);
    }

    fadeOut() {
        if (!this.container) return;
        this.container.style.transition = 'opacity 1s ease-out, transform 1.5s ease-in';
        this.container.style.opacity = '0';
        this.container.style.transform = 'scale(1.1) translateY(-20px)';
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 1500);
    }
}

export const threeManager = new ThreeManager();
