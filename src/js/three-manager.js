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
        // 1. Blueprint Grid Foundation
        const gridSize = 40;
        const divisions = 40;
        this.grid = new THREE.GridHelper(gridSize, divisions, 0xD4BD9B, 0x1A3A40);
        this.grid.position.y = -5;
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.25;
        this.scene.add(this.grid);

        // 2. Construction Zone Layout
        this.constructionSite = new THREE.Group();
        this.scene.add(this.constructionSite);

        // Zone A: Skyscraper Assembly (Right Side)
        this.tower = new THREE.Group();
        this.tower.position.set(3, -5, 0);
        this.constructionSite.add(this.tower);
        this.floors = [];

        // Zone B: Gantry Crane/Construction (Left Side)
        this.crane = new THREE.Group();
        this.crane.position.set(-5, -5, 0);
        this.constructionSite.add(this.crane);
        this.initCrane();

        // 3. Materials
        this.goldMat = new THREE.MeshPhongMaterial({
            color: 0xD4BD9B,
            transparent: true,
            opacity: 0.9,
            flatShading: true,
            shininess: 100
        });

        this.wireMat = new THREE.MeshBasicMaterial({
            color: 0xE0CDA8,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });

        // 4. Skyscraper Structure (Building floors to be revealed)
        const floorGeo = new THREE.BoxGeometry(3, 1, 3);
        const floorCount = 7;
        for (let i = 0; i < floorCount; i++) {
            const floor = new THREE.Group();
            const core = new THREE.Mesh(floorGeo, this.goldMat);
            const frame = new THREE.Mesh(floorGeo, this.wireMat);
            floor.add(core, frame);

            const targetY = i * 1.05 + 0.5;
            floor.position.y = targetY + 10; // Start high up for fly-in
            floor.userData.targetY = targetY;

            floor.visible = false;
            floor.scale.set(0.1, 0.1, 0.1);
            this.tower.add(floor);
            this.floors.push(floor);
        }

        // 5. Progress Ring (Unified Workspace Enclosure)
        this.updateProgressArc(0);

        // 6. Lighting
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.position.set(10, 20, 10);
        this.scene.add(sun);

        const buildLight = new THREE.PointLight(0xD4BD9B, 3, 30);
        this.scene.add(buildLight);
        this.buildLight = buildLight;

        this.scene.add(new THREE.AmbientLight(0x404040, 2));

        this.camera.position.set(12, 8, 15);
        this.camera.lookAt(0, 0, 0);
    }

    initCrane() {
        // Vertical Pillar (Removed)
        // Horizontal Boom (Removed)
        // Delivery beam (Removed)
    }

    updateProgressArc(progress) {
        if (this.arcGroup) {
            this.scene.remove(this.arcGroup);
        }

        this.arcGroup = new THREE.Group();
        this.scene.add(this.arcGroup);

        const theta = progress * Math.PI * 2;

        // Outer Glow Ring
        const geometry = new THREE.TorusGeometry(8, 0.15, 16, 100, theta || 0.001);
        const material = new THREE.MeshPhongMaterial({
            color: 0xD4BD9B,
            transparent: true,
            opacity: 0.6,
            emissive: 0xD4BD9B,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        });

        this.arcMesh = new THREE.Mesh(geometry, material);
        this.arcMesh.rotation.x = Math.PI / 2;
        this.arcMesh.rotation.z = Math.PI;
        this.arcGroup.add(this.arcMesh);

        // Inner Tech Ring (Dashed/Segmented look)
        const innerGeo = new THREE.TorusGeometry(7.5, 0.05, 16, 100, theta || 0.001);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xE0CDA8,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        this.innerRing = new THREE.Mesh(innerGeo, innerMat);
        this.innerRing.rotation.x = Math.PI / 2;
        this.innerRing.rotation.z = -Math.PI; // Opposite rotation
        this.arcGroup.add(this.innerRing);
    }

    updateProgress(progress) {
        this.progress = progress;
        this.updateProgressArc(progress);

        // Skyscraper Assembly: Strict one-by-one visibility
        const currentActiveFloor = Math.ceil(progress * this.floors.length) - 1;

        this.floors.forEach((floor, index) => {
            if (index <= currentActiveFloor) {
                floor.visible = true;

                // If it's the latest floor being added, we can do a quick snap-in
                if (index === currentActiveFloor) {
                    floor.position.y = floor.userData.targetY;
                    floor.scale.set(1, 1, 1);

                    // Light focus on active building level
                    this.buildLight.position.set(3, floor.position.y, 2);
                    this.buildLight.intensity = 5;
                } else {
                    floor.position.y = floor.userData.targetY;
                    floor.scale.set(1, 1, 1);
                }
            } else {
                floor.visible = false;
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        if (this.tower) {
            // Subtle rotation for better structure viewing
            this.tower.rotation.y += 0.002;
        }

        // Reverted: No complex ring rotation/wobble

        if (this.grid) {
            // "Blueprint scrolling" effect
            this.grid.position.z = (Date.now() * 0.0005) % 1;
        }

        this.renderer.render(this.scene, this.camera);
    }

    fadeOut() {
        if (!this.container) return;
        this.container.style.transition = 'opacity 1.2s ease-out, transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        this.container.style.opacity = '0';
        this.container.style.transform = 'scale(1.2) rotateX(10deg)';
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 1500);
    }
}

export const threeManager = new ThreeManager();
