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
        const floorGeo = new THREE.BoxGeometry(3, 0.8, 3);
        const floorCount = 15;
        for (let i = 0; i < floorCount; i++) {
            const floor = new THREE.Group();
            const core = new THREE.Mesh(floorGeo, this.goldMat);
            const frame = new THREE.Mesh(floorGeo, this.wireMat);
            floor.add(core, frame);

            const targetY = i * 0.85 + 0.4;
            floor.position.y = targetY - 5; // Start below ground for growing effect
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

        this.initJCB();
    }

    initCrane() {
        // Vertical Pillar (Removed)
        // Horizontal Boom (Removed)
        // Delivery beam (Removed)
    }

    initJCB() {
        this.jcb = new THREE.Group();

        // Materials
        const yellowMat = new THREE.MeshPhongMaterial({ color: 0xFFD700, flatShading: true });
        const blackMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const glassMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });

        // Body
        const bodyGeo = new THREE.BoxGeometry(1.2, 0.6, 0.8);
        const body = new THREE.Mesh(bodyGeo, yellowMat);
        body.position.y = 0.4;
        this.jcb.add(body);

        // Cabin
        const cabinGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const cabin = new THREE.Mesh(cabinGeo, glassMat);
        cabin.position.set(-0.1, 0.9, 0);
        this.jcb.add(cabin);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16);
        const wheelPos = [
            [-0.4, 0.25, 0.45], [-0.4, 0.25, -0.45],
            [0.4, 0.25, 0.45], [0.4, 0.25, -0.45]
        ];
        wheelPos.forEach(p => {
            const wheel = new THREE.Mesh(wheelGeo, blackMat);
            wheel.position.set(...p);
            wheel.rotation.x = Math.PI / 2;
            this.jcb.add(wheel);
        });

        // Arm/Boom
        const armGroup = new THREE.Group();
        armGroup.position.set(0.6, 0.5, 0);

        const boomGeo = new THREE.BoxGeometry(0.8, 0.2, 0.2);
        const boom = new THREE.Mesh(boomGeo, yellowMat);
        boom.position.x = 0.3;
        boom.rotation.z = Math.PI / 4;
        armGroup.add(boom);

        const dipperGeo = new THREE.BoxGeometry(0.6, 0.15, 0.15);
        const dipper = new THREE.Mesh(dipperGeo, yellowMat);
        dipper.position.set(0.7, 0.3, 0);
        dipper.rotation.z = -Math.PI / 6;
        armGroup.add(dipper);

        // Bucket
        const bucketGeo = new THREE.BoxGeometry(0.3, 0.3, 0.4);
        const bucket = new THREE.Mesh(bucketGeo, blackMat);
        bucket.position.set(1.1, 0.1, 0);
        armGroup.add(bucket);

        this.jcb.add(armGroup);
        this.jcb.scale.set(0.4, 0.4, 0.4);
        this.scene.add(this.jcb);
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

        // Inner Tech Ring
        const innerGeo = new THREE.TorusGeometry(7.5, 0.05, 16, 100, theta || 0.001);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xE0CDA8,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        this.innerRing = new THREE.Mesh(innerGeo, innerMat);
        this.innerRing.rotation.x = Math.PI / 2;
        this.innerRing.rotation.z = -Math.PI;
        this.arcGroup.add(this.innerRing);

        // Update JCB Position on Ring
        if (this.jcb) {
            const angle = Math.PI - theta;
            const radius = 8;
            this.jcb.position.x = Math.sin(angle) * radius;
            this.jcb.position.z = Math.cos(angle) * radius;
            this.jcb.position.y = -4.8; // Level with ring center (grid at -5)

            // Orient JCB to follow tangent
            this.jcb.rotation.y = angle + Math.PI / 2;

            // Subtle bounce or arm movement
            this.jcb.position.y += Math.sin(Date.now() * 0.01) * 0.05;
        }
    }

    updateProgress(progress) {
        this.targetProgress = progress;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 1. Smooth Progress Interpolation
        this.progress = THREE.MathUtils.lerp(this.progress || 0, this.targetProgress || 0, 0.1);
        this.updateProgressArc(this.progress);

        // 2. Skyscraper Assembly: Smooth one-by-one transitions
        const activeFloorCount = this.progress * this.floors.length;

        this.floors.forEach((floor, index) => {
            const floorThreshold = index;
            const floorSubProgress = THREE.MathUtils.clamp(activeFloorCount - floorThreshold, 0, 1);

            if (floorSubProgress > 0) {
                floor.visible = true;

                // Smooth Rise-up: position and scale lerped based on sub-progress
                const risingHeight = 1.5; // Come from 1.5 units below
                const targetY = floor.userData.targetY;
                const currentY = targetY - (risingHeight * (1 - floorSubProgress));

                floor.position.y = THREE.MathUtils.lerp(floor.position.y, currentY, 0.1);
                const targetScale = 0.5 + (0.5 * floorSubProgress);
                const currentScale = THREE.MathUtils.lerp(floor.scale.x, targetScale, 0.15);
                floor.scale.set(currentScale, currentScale, currentScale);

                // Light focus follows construction
                if (index === Math.floor(activeFloorCount)) {
                    this.buildLight.position.y = floor.position.y;
                    this.buildLight.intensity = floorSubProgress * 5;
                }
            } else {
                floor.visible = false;
                floor.position.y = floor.userData.targetY - 2;
            }
        });

        if (this.tower) {
            this.tower.rotation.y += 0.002;
        }

        if (this.grid) {
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
