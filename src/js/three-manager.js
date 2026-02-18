import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class ThreeManager {
    constructor() {
        this.container = document.getElementById('three-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.container.appendChild(this.renderer.domElement);

        // Post-Processing Setup
        const renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0.2;
        this.bloomPass.strength = 1.0;
        this.bloomPass.radius = 0.5;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);

        this.progress = 0;
        this.targetProgress = 0;
        this.towers = [];
        this.allFloors = []; // Track floors for both buildings

        this.initScene();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initScene() {
        // 1. Blueprint Grid Foundation
        const gridSize = 40;
        const divisions = 40;
        this.grid = new THREE.GridHelper(gridSize, divisions, 0xD4BD9B, 0x1A3A40);
        this.grid.position.y = -9;
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.25;
        this.scene.add(this.grid);

        // 2. Construction Zone Layout
        this.constructionSite = new THREE.Group();
        this.scene.add(this.constructionSite);

        this.towers = [];
        this.allFloors = [];
        this.workers = [];

        // Zone A: Dual Skyscraper Assembly
        this.createTower(-8, -5, 0); // Left Tower
        this.createTower(8, -5, 0);  // Right Tower

        // Scatter 12 Ground Workers
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 6 + Math.random() * 4;
            this.createWorker(Math.sin(angle) * dist, -8.8, Math.cos(angle) * dist);
        }

        // 3. Progress Ring (Unified Workspace Enclosure)
        this.updateProgressArc(0);

        // 4. Lighting
        this.initLightingAndCamera();

        this.initJCB();
    }

    initLightingAndCamera() {
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.position.set(10, 20, 10);
        this.scene.add(sun);

        const buildLight = new THREE.PointLight(0xD4BD9B, 3, 30);
        this.scene.add(buildLight);
        this.buildLight = buildLight;

        this.scene.add(new THREE.AmbientLight(0x404040, 2));

        this.camera.position.set(18, 12, 22);
        this.camera.lookAt(0, 0, 0);

        this.initStars();
        this.initJCB();
    }

    initStars() {
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1000;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) {
            starPos[i] = (Math.random() - 0.5) * 200;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xD4BD9B,
            size: 0.15,
            transparent: true,
            opacity: 0.4
        });
        this.stars = new THREE.Points(starGeo, starMat);
        this.scene.add(this.stars);
    }
    createWorker(x, y, z) {
        const worker = new THREE.Group();
        worker.position.set(x, y, z);

        const skinMat = new THREE.MeshPhongMaterial({ color: 0xD4BD9B });
        const vestMat = new THREE.MeshPhongMaterial({ color: 0xFF8C00 }); // Safety Orange
        const blueMat = new THREE.MeshPhongMaterial({ color: 0x1A3A40 });
        const hatMat = new THREE.MeshPhongMaterial({ color: 0xFFFF00 }); // Yellow Hat

        // Body
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.35), vestMat);
        torso.position.y = 0.45;
        worker.add(torso);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.06, 0.3, 0.06);
        const lLeg = new THREE.Mesh(legGeo, blueMat);
        lLeg.position.set(-0.04, 0.15, 0);
        const rLeg = lLeg.clone();
        rLeg.position.x = 0.04;
        worker.add(lLeg, rLeg);

        // Head & Hard Hat
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
        head.position.y = 0.7;
        worker.add(head);

        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), hatMat);
        hat.position.y = 0.78;
        worker.add(hat);

        worker.scale.set(1.5, 1.5, 1.5);
        this.constructionSite.add(worker);
        this.workers.push(worker);
        return worker;
    }

    createTower(x, y, z) {
        const towerGroup = new THREE.Group();
        towerGroup.position.set(x, y, z);
        this.constructionSite.add(towerGroup);
        this.towers.push(towerGroup);

        const floorCount = 15;
        const floorH = 0.8;
        const silverMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.8, roughness: 0.1 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4, metalness: 0.9, roughness: 0.05 });
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4BD9B, metalness: 0.9, roughness: 0.1 });
        const neonColors = [0x00FFFF, 0xFF00FF, 0xFFFF00, 0x00FF00];

        for (let i = 0; i < floorCount; i++) {
            const floor = new THREE.Group();

            // Core
            const core = new THREE.Mesh(new THREE.BoxGeometry(1.2, floorH, 1.2), coreMat);
            floor.add(core);

            // Glass
            const glass = new THREE.Mesh(new THREE.BoxGeometry(2.8, floorH - 0.05, 2.8), glassMat);
            floor.add(glass);

            // Mullions
            const hMullionGeo = new THREE.BoxGeometry(2.85, 0.05, 2.85);
            [-1, 0, 1].forEach(j => {
                const hm = new THREE.Mesh(hMullionGeo, silverMat);
                hm.position.y = (j * floorH) / 3;
                floor.add(hm);
            });

            const vMullionGeo = new THREE.BoxGeometry(0.05, floorH, 2.86);
            const vMullionGeo2 = new THREE.BoxGeometry(2.86, floorH, 0.05);
            [-1, 0, 1].forEach(k => {
                const vm1 = new THREE.Mesh(vMullionGeo, silverMat);
                vm1.position.x = k * 0.9;
                const vm2 = new THREE.Mesh(vMullionGeo2, silverMat);
                vm2.position.z = k * 0.9;
                floor.add(vm1, vm2);
            });

            // Plates
            const plateGeo = new THREE.BoxGeometry(3.1, 0.08, 3.1);
            const topP = new THREE.Mesh(plateGeo, goldMat);
            topP.position.y = floorH / 2;
            const botP = new THREE.Mesh(plateGeo, goldMat);
            botP.position.y = -floorH / 2;
            floor.add(topP, botP);

            // Neon
            const neonMat = new THREE.MeshBasicMaterial({ color: neonColors[i % neonColors.length], transparent: true, opacity: 0.8 });
            const neonGeo = new THREE.BoxGeometry(0.15, floorH, 0.15);
            [[1.5, 0, 1.5], [1.5, 0, -1.5], [-1.5, 0, 1.5], [-1.5, 0, -1.5]].forEach(p => {
                const strip = new THREE.Mesh(neonGeo, neonMat);
                strip.position.set(...p);
                floor.add(strip);
            });

            if (i === floorCount - 1) {
                const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
                beacon.position.y = floorH / 2 + 0.1;
                floor.add(beacon);
                floor.userData.beacon = beacon;
            }

            const targetY = i * (floorH + 0.05) + 0.5;
            floor.position.y = targetY - 5;
            floor.userData.targetY = targetY;
            floor.userData.floorIndex = i; // Save index relative to tower

            floor.visible = false;
            floor.scale.set(0.1, 0.1, 0.1);
            towerGroup.add(floor);
            this.allFloors.push(floor);
        }
    }

    initJCB() {
        this.jcb = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.5, roughness: 0.3 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.8 });
        const silverMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.1 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, metalness: 0.9, roughness: 0.1 });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.9), yellowMat);
        chassis.position.y = 0.5;
        this.jcb.add(chassis);

        const cabin = new THREE.Group();
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.75), glassMat);
        glass.position.set(-0.1, 1.1, 0);
        cabin.add(glass);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.85), yellowMat);
        roof.position.set(-0.1, 1.5, 0);
        cabin.add(roof);
        this.jcb.add(cabin);

        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
        [[-0.55, 0.35, 0.55], [-0.55, 0.35, -0.55], [0.55, 0.35, 0.55], [0.55, 0.35, -0.55]].forEach(p => {
            const w = new THREE.Mesh(wheelGeo, darkMat);
            w.position.set(...p);
            w.rotation.x = Math.PI / 2;
            this.jcb.add(w);
        });

        this.jcb.scale.set(0.8, 0.8, 0.8);
        this.scene.add(this.jcb);
    }

    updateProgressArc(progress) {
        if (!this.arcGroup) {
            this.arcGroup = new THREE.Group();
            this.scene.add(this.arcGroup);
        }
        while (this.arcGroup.children.length > 0) {
            const child = this.arcGroup.children[0];
            this.arcGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
        }

        const radius = 12;
        const theta = progress * Math.PI * 2;
        const geometry = new THREE.TorusGeometry(radius, 0.15, 16, 100, theta || 0.001);
        const material = new THREE.MeshPhongMaterial({ color: 0xD4BD9B, emissive: 0xD4BD9B, emissiveIntensity: 0.8, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = -Math.PI / 2;
        this.arcGroup.add(ring);

        if (this.jcb) {
            const angle = Math.PI - (progress * Math.PI * 4);
            this.jcb.position.x = Math.sin(angle) * radius;
            this.jcb.position.z = Math.cos(angle) * radius;
            this.jcb.position.y = -8.8;
            this.jcb.rotation.y = angle + Math.PI;
            this.jcb.position.y += Math.sin(Date.now() * 0.01) * 0.02;
        }
    }

    updateProgress(progress) {
        this.targetProgress = progress;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.progress = THREE.MathUtils.lerp(this.progress, this.targetProgress, 0.1);
        this.updateProgressArc(this.progress);

        const floorCountPerTower = 15;
        const activeFloorCount = this.progress * floorCountPerTower;

        this.allFloors.forEach(floor => {
            const index = floor.userData.floorIndex;
            const floorSubProgress = THREE.MathUtils.clamp(activeFloorCount - index, 0, 1);

            if (floor.userData.beacon) {
                floor.userData.beacon.material.opacity = Math.sin(Date.now() * 0.01) > 0 ? 1 : 0.2;
                floor.userData.beacon.material.transparent = true;
            }

            if (floorSubProgress > 0) {
                floor.visible = true;
                const targetY = floor.userData.targetY;
                const currentY = targetY - (1.5 * (1 - floorSubProgress));
                floor.position.y = THREE.MathUtils.lerp(floor.position.y, currentY, 0.1);
                const scale = 0.5 + (0.5 * floorSubProgress);
                floor.scale.set(scale, scale, scale);
            } else {
                floor.visible = false;
                floor.position.y = floor.userData.targetY - 2;
            }
        });

        this.towers.forEach(t => t.rotation.y += 0.002);

        // 3. Worker Idle Animations
        if (this.workers) {
            this.workers.forEach((worker, i) => {
                const time = Date.now() * 0.001 + i;
                // Subtle breathing/looking around
                worker.position.y += Math.sin(time * 2) * 0.001;

                // Head bobbing
                const head = worker.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
                if (head) {
                    head.rotation.y = Math.sin(time * 1.5) * 0.1;
                    head.rotation.x = Math.abs(Math.cos(time)) * 0.1;
                }
            });
        }

        if (this.stars) {
            this.stars.rotation.y += 0.0001;
            this.stars.material.opacity = 0.3 + Math.sin(Date.now() * 0.001) * 0.2;
        }

        if (this.grid) this.grid.position.z = (Date.now() * 0.0005) % 1;

        // Use composer for Bloom effect
        this.composer.render();
    }

    fadeOut() {
        if (!this.container) return;
        this.container.style.transition = 'opacity 1.2s ease-out, transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        this.container.style.opacity = '0';
        this.container.style.transform = 'scale(1.2) rotateX(10deg)';
        setTimeout(() => { this.container.style.display = 'none'; }, 1500);
    }
}

export const threeManager = new ThreeManager();
