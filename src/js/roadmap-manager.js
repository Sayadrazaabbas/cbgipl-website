import * as THREE from 'three';

class RoadmapManager {
    constructor() {
        this.container = document.getElementById('roadmap-3d-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.scrollProgress = 0;
        this.initRoadmap();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('scroll', () => this.onScroll());
    }

    initRoadmap() {
        // 1. Spline Timeline Path
        this.path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 5, 10),
            new THREE.Vector3(5, 2, 5),
            new THREE.Vector3(-5, -1, 0),
            new THREE.Vector3(3, -4, -5),
            new THREE.Vector3(0, -8, -10)
        ]);

        // 2. Glowing Path Mesh
        const pathGeo = new THREE.TubeGeometry(this.path, 100, 0.05, 8, false);
        const pathMat = new THREE.MeshPhongMaterial({
            color: 0xD4BD9B,
            emissive: 0xD4BD9B,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6
        });
        this.pathMesh = new THREE.Mesh(pathGeo, pathMat);
        this.scene.add(this.pathMesh);

        // 3. Floating Particles (Strategic Dust)
        const particlesGeo = new THREE.BufferGeometry();
        const pCount = 500;
        const posArray = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({
            color: 0xD4BD9B,
            size: 0.05,
            transparent: true,
            opacity: 0.4
        });
        this.particles = new THREE.Points(particlesGeo, particlesMat);
        this.scene.add(this.particles);

        // 4. Floating Nodes (Placeholders for Phases)
        this.nodes = [];
        const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const nodeMat = new THREE.MeshPhongMaterial({ color: 0xD4BD9B, emissive: 0xD4BD9B });

        for (let i = 0; i < 3; i++) {
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            const t = 0.2 + i * 0.3; // Distribute along path
            this.path.getPoint(t, node.position);
            this.scene.add(node);
            this.nodes.push(node);
        }

        // 5. Lighting
        const ambient = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambient);

        const spot = new THREE.SpotLight(0xD4BD9B, 20);
        spot.position.set(10, 10, 10);
        this.scene.add(spot);

        this.camera.position.set(0, 0, 15);
    }

    onScroll() {
        const roadmapSection = document.getElementById('roadmap');
        if (!roadmapSection) return;

        const rect = roadmapSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate progress through the section
        // Starts when section top hits 80% viewport, ends when bottom hits 20%
        const start = viewportHeight;
        const total = rect.height;
        const current = -rect.top + viewportHeight * 0.5;

        this.scrollProgress = Math.min(Math.max(current / total, 0), 1);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 1. Path Flow Animation
        if (this.pathMesh) {
            this.pathMesh.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.2;
        }

        // 2. Camera Movement along Spline
        // Move camera lookAt and position based on scrollProgress
        const camPosT = Math.min(this.scrollProgress * 0.8, 0.99); // Stay on path
        const lookAtT = Math.min(camPosT + 0.1, 1);

        const targetCamPos = this.path.getPointAt(camPosT);
        const targetLookAt = this.path.getPointAt(lookAtT);

        // Smooth interpolation
        this.camera.position.lerp(new THREE.Vector3(
            targetCamPos.x + 5,
            targetCamPos.y + 2,
            targetCamPos.z + 10
        ), 0.05);

        this.camera.lookAt(targetLookAt);

        // 3. Particle Drift
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.z += 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

export const roadmapManager = new RoadmapManager();
