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

        // Zone A: Skyscraper Assembly (Repositioned closer to ring and higher)
        this.tower = new THREE.Group();
        this.tower.position.set(6, -2, 0);
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

        // 4. Ultra-Fine Detailed Skyscraper
        const floorCount = 15;
        const floorH = 0.8;

        // Comprehensive Materials Library
        const goldMat = new THREE.MeshPhongMaterial({ color: 0xD4BD9B, shininess: 100 });
        const silverMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 150 });
        const glassMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, shininess: 200 });
        const coreMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const neonColors = [0x00FFFF, 0xFF00FF, 0xFFFF00, 0x00FF00];

        for (let i = 0; i < floorCount; i++) {
            const floor = new THREE.Group();

            // a. Internal Concrete Core
            const coreGeo = new THREE.BoxGeometry(1.2, floorH, 1.2);
            const core = new THREE.Mesh(coreGeo, coreMat);
            floor.add(core);

            // b. Detailed Glass Facade with Window Mullions
            const glass = new THREE.Mesh(new THREE.BoxGeometry(2.8, floorH - 0.05, 2.8), glassMat);
            floor.add(glass);

            // Horizontal Mullions (Dividers)
            const hMullionGeo = new THREE.BoxGeometry(2.85, 0.05, 2.85);
            for (let j = -1; j <= 1; j++) {
                const hm = new THREE.Mesh(hMullionGeo, silverMat);
                hm.position.y = (j * floorH) / 3;
                floor.add(hm);
            }

            // Vertical Mullions
            const vMullionGeo = new THREE.BoxGeometry(0.05, floorH, 2.86);
            for (let k = -1; k <= 1; k++) {
                const vm = new THREE.Mesh(vMullionGeo, silverMat);
                vm.position.x = k * 0.9;
                floor.add(vm);
            }
            const vMullionGeo2 = new THREE.BoxGeometry(2.86, floorH, 0.05);
            for (let k = -1; k <= 1; k++) {
                const vm = new THREE.Mesh(vMullionGeo2, silverMat);
                vm.position.z = k * 0.9;
                floor.add(vm);
            }

            // c. Architectural Gold Caps (Top/Bottom Plates)
            const plateGeo = new THREE.BoxGeometry(3.1, 0.08, 3.1);
            const topP = new THREE.Mesh(plateGeo, goldMat);
            topP.position.y = floorH / 2;
            const botP = new THREE.Mesh(plateGeo, goldMat);
            botP.position.y = -floorH / 2;
            floor.add(topP, botP);

            // d. Vibrant Neon Corner Strips
            const neonMat = new THREE.MeshBasicMaterial({
                color: neonColors[i % neonColors.length],
                transparent: true,
                opacity: 0.8
            });
            const neonGeo = new THREE.BoxGeometry(0.15, floorH, 0.15);
            const corners = [[1.5, 0, 1.5], [1.5, 0, -1.5], [-1.5, 0, 1.5], [-1.5, 0, -1.5]];
            corners.forEach(p => {
                const strip = new THREE.Mesh(neonGeo, neonMat);
                strip.position.set(...p);
                floor.add(strip);
            });

            // e. Red Aviation Beacon (Top Floor only)
            if (i === floorCount - 1) {
                const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
                beacon.position.y = floorH / 2 + 0.1;
                floor.add(beacon);
                floor.userData.beacon = beacon;
            }

            const targetY = i * (floorH + 0.05) + 0.5;
            floor.position.y = targetY - 5;
            floor.userData.targetY = targetY;

            floor.visible = false;
            floor.scale.set(0.1, 0.1, 0.1);
            this.tower.add(floor);
            this.floors.push(floor);
        }

        // Glowing Foundation Pad
        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.8, 0.2, 32),
            new THREE.MeshPhongMaterial({ color: 0x111111, emissive: 0x00FFFF, emissiveIntensity: 0.3 })
        );
        pad.position.y = -0.1;
        this.tower.add(pad);

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

        // Materials (Premium Construction Palette)
        const yellowMat = new THREE.MeshPhongMaterial({ color: 0xFFD700, shininess: 80 });
        const darkMat = new THREE.MeshPhongMaterial({ color: 0x1A1A1A, shininess: 50 });
        const silverMat = new THREE.MeshPhongMaterial({ color: 0xCCCCCC, shininess: 120 });
        const glassMat = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.5,
            shininess: 150
        });

        // 1. Chassis/Body
        const chassisGeo = new THREE.BoxGeometry(1.6, 0.6, 0.9);
        const chassis = new THREE.Mesh(chassisGeo, yellowMat);
        chassis.position.y = 0.5;
        this.jcb.add(chassis);

        // 2. Cabin Structure
        const cabinGroup = new THREE.Group();
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.75), glassMat);
        glass.position.set(-0.1, 1.1, 0);
        cabinGroup.add(glass);

        // Cabin Pillars (Poles)
        const pillarGeo = new THREE.BoxGeometry(0.05, 0.8, 0.05);
        const pPositions = [
            [0.3, 1.1, 0.35], [0.3, 1.1, -0.35],
            [-0.5, 1.1, 0.35], [-0.5, 1.1, -0.35]
        ];
        pPositions.forEach(p => {
            const pillar = new THREE.Mesh(pillarGeo, darkMat);
            pillar.position.set(...p);
            cabinGroup.add(pillar);
        });

        // Cabin Roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.85), yellowMat);
        roof.position.set(-0.1, 1.5, 0);
        cabinGroup.add(roof);
        this.jcb.add(cabinGroup);

        // 3. Heavy Wheels with Rims
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
        const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.27, 24);
        const wheelPos = [
            [-0.55, 0.35, 0.55], [-0.55, 0.35, -0.55],
            [0.55, 0.35, 0.55], [0.55, 0.35, -0.55]
        ];
        wheelPos.forEach(p => {
            const wGroup = new THREE.Group();
            const tire = new THREE.Mesh(wheelGeo, darkMat);
            const rim = new THREE.Mesh(rimGeo, silverMat);
            wGroup.add(tire, rim);
            wGroup.position.set(...p);
            wGroup.rotation.x = Math.PI / 2;
            this.jcb.add(wGroup);
        });

        // 4. Backhoe Arm (Rear)
        const rearArm = new THREE.Group();
        rearArm.position.set(-0.8, 0.6, 0);

        const boomRear = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 0.2), yellowMat);
        boomRear.position.set(-0.4, 0.3, 0);
        boomRear.rotation.z = Math.PI / 3;
        rearArm.add(boomRear);

        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), silverMat);
        piston.position.set(-0.2, 0.3, 0);
        piston.rotation.z = Math.PI / 3;
        rearArm.add(piston);

        const dipperRear = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.15), yellowMat);
        dipperRear.position.set(-0.8, 0.8, 0);
        dipperRear.rotation.z = -Math.PI / 4;
        rearArm.add(dipperRear);

        const rearBucket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.5), darkMat);
        rearBucket.position.set(-1.1, 0.6, 0);
        rearArm.add(rearBucket);
        this.jcb.add(rearArm);

        // 5. Front Loader (Front)
        const frontArm = new THREE.Group();
        frontArm.position.set(0.8, 0.4, 0);

        const fArm1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.1), yellowMat);
        fArm1.position.set(0.4, 0.2, 0.3);
        fArm1.rotation.z = -Math.PI / 8;
        const fArm2 = fArm1.clone();
        fArm2.position.z = -0.3;
        frontArm.add(fArm1, fArm2);

        const frontBucket = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 1.2), yellowMat);
        frontBucket.position.set(0.8, 0, 0);
        const frontBucketEdge = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 1.3), darkMat);
        frontBucketEdge.position.set(0.8, -0.3, 0);
        frontArm.add(frontBucket, frontBucketEdge);
        this.jcb.add(frontArm);

        this.jcb.scale.set(0.8, 0.8, 0.8); // Increased size
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
        this.arcGroup.add(this.innerRing);

        // Update JCB Position and Wheel Rotation: 2 Rounds per construction cycle
        if (this.jcb) {
            const jcbTheta = progress * Math.PI * 4; // 2 Full Rounds
            const angle = Math.PI - jcbTheta;
            const radius = 8;
            this.jcb.position.x = Math.sin(angle) * radius;
            this.jcb.position.z = Math.cos(angle) * radius;
            this.jcb.position.y = -4.8;

            // 1. Correct Orientation: Face the direction of travel
            this.jcb.rotation.y = angle + Math.PI;

            // 2. Continuous Micro-Animations
            const time = Date.now() * 0.005;
            this.jcb.position.y += Math.sin(time * 2) * 0.02; // Working bounce

            // 3. Wheel Rotation (Faster for 2 rounds)
            this.jcb.children.forEach(child => {
                if (child.isGroup && child.children.length === 2) {
                    child.children.forEach(wPart => {
                        wPart.rotation.y += 0.3; // Doubled wheel speed
                    });
                }
            });

            // 4. Arm movement based on progress
            const arm = this.jcb.children.find(c => c.isGroup && c.children.length === 3);
            if (arm) {
                arm.rotation.x = Math.sin(time) * 0.1;
            }
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

            // Flashing Beacons
            if (floor.userData.beacon) {
                floor.userData.beacon.material.opacity = Math.sin(Date.now() * 0.01) > 0 ? 1 : 0.2;
                floor.userData.beacon.material.transparent = true;
            }

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
