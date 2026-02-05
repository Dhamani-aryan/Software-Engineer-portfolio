/* ================================================
   THREE.JS SCENE — Immersive Particle Universe
   Interactive 3D background with floating geometry
   ================================================ */

(function() {
    'use strict';

    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // ==================== SCENE SETUP ====================
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const isMobileDevice = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !isMobileDevice, // Disable AA on mobile for performance
        alpha: true,
        powerPreference: isMobileDevice ? 'low-power' : 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);

    // ==================== MOUSE / TOUCH TRACKING ====================
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    document.addEventListener('mousemove', function(e) {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Touch support for mobile — gentle parallax on touch move
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
            mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });

    // Also respond to device orientation on mobile
    if (isMobileDevice && window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
            if (e.gamma !== null && e.beta !== null) {
                mouse.targetX = Math.max(-1, Math.min(1, e.gamma / 30));
                mouse.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
            }
        }, { passive: true });
    }

    // ==================== DETECT THEME ====================
    function isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    }

    function getThemeColors() {
        if (isDarkTheme()) {
            return {
                particle1: new THREE.Color(0x00d4ff),
                particle2: new THREE.Color(0xa855f7),
                particle3: new THREE.Color(0xf472b6),
                wireframe: new THREE.Color(0x00d4ff),
                ambient: 0x111128
            };
        } else {
            return {
                particle1: new THREE.Color(0x0066ff),
                particle2: new THREE.Color(0x7c3aed),
                particle3: new THREE.Color(0xec4899),
                wireframe: new THREE.Color(0x0066ff),
                ambient: 0xe2e5ef
            };
        }
    }

    // ==================== PARTICLE SYSTEM ====================
    var PARTICLE_COUNT = 800;
    if (isSmallMobile) {
        PARTICLE_COUNT = 150;
    } else if (isMobileDevice) {
        PARTICLE_COUNT = 300;
    }

    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = [];

    const themeColors = getThemeColors();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Spread particles in a sphere-like distribution
        const radius = 20 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi) - 15;

        // Random color between accent colors
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.4) {
            color = themeColors.particle1;
        } else if (colorChoice < 0.75) {
            color = themeColors.particle2;
        } else {
            color = themeColors.particle3;
        }

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 0.5;

        velocities.push({
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01,
            originalX: positions[i3],
            originalY: positions[i3 + 1],
            originalZ: positions[i3 + 2]
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for better-looking particles
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float uTime;
            uniform float uPixelRatio;

            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float dist = length(mvPosition.xyz);
                vAlpha = smoothstep(60.0, 10.0, dist);
                gl_PointSize = size * uPixelRatio * (200.0 / dist);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;

                float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ==================== FLOATING GEOMETRY ====================
    const geometries = [];

    // Icosahedron
    const icoGeom = new THREE.IcosahedronGeometry(3, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: themeColors.wireframe,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const icosahedron = new THREE.Mesh(icoGeom, icoMat);
    icosahedron.position.set(-12, 5, -5);
    scene.add(icosahedron);
    geometries.push({
        mesh: icosahedron,
        rotSpeed: { x: 0.003, y: 0.005, z: 0.002 },
        floatSpeed: 0.0008,
        floatAmplitude: 2,
        originalY: 5
    });

    // Torus
    const torusGeom = new THREE.TorusGeometry(2.5, 0.8, 16, 32);
    const torusMat = new THREE.MeshBasicMaterial({
        color: themeColors.particle2,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.position.set(14, -3, -8);
    scene.add(torus);
    geometries.push({
        mesh: torus,
        rotSpeed: { x: 0.004, y: 0.002, z: 0.006 },
        floatSpeed: 0.0012,
        floatAmplitude: 1.5,
        originalY: -3
    });

    // Octahedron
    const octaGeom = new THREE.OctahedronGeometry(2, 0);
    const octaMat = new THREE.MeshBasicMaterial({
        color: themeColors.particle3,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const octahedron = new THREE.Mesh(octaGeom, octaMat);
    octahedron.position.set(8, 8, -12);
    scene.add(octahedron);
    geometries.push({
        mesh: octahedron,
        rotSpeed: { x: 0.005, y: 0.003, z: 0.004 },
        floatSpeed: 0.001,
        floatAmplitude: 2.5,
        originalY: 8
    });

    // Dodecahedron (extra shape)
    const dodecaGeom = new THREE.DodecahedronGeometry(2, 0);
    const dodecaMat = new THREE.MeshBasicMaterial({
        color: themeColors.particle1,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const dodecahedron = new THREE.Mesh(dodecaGeom, dodecaMat);
    dodecahedron.position.set(-10, -7, -10);
    scene.add(dodecahedron);
    geometries.push({
        mesh: dodecahedron,
        rotSpeed: { x: 0.002, y: 0.006, z: 0.003 },
        floatSpeed: 0.0009,
        floatAmplitude: 1.8,
        originalY: -7
    });

    // Torus Knot (extra premium shape) — skip on small mobile
    var torusKnot = null;
    if (!isSmallMobile) {
        var knotGeom = new THREE.TorusKnotGeometry(1.8, 0.5, isMobileDevice ? 32 : 64, 8, 2, 3);
        var knotMat = new THREE.MeshBasicMaterial({
            color: themeColors.particle2,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        torusKnot = new THREE.Mesh(knotGeom, knotMat);
        torusKnot.position.set(-5, -12, -6);
        scene.add(torusKnot);
        geometries.push({
            mesh: torusKnot,
            rotSpeed: { x: 0.001, y: 0.004, z: 0.002 },
            floatSpeed: 0.0007,
            floatAmplitude: 1.2,
            originalY: -12
        });
    }

    // ==================== CONNECTION LINES ====================
    const lineMaterial = new THREE.LineBasicMaterial({
        color: themeColors.particle1,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending
    });

    var CONNECTION_DISTANCE = 8;
    var MAX_CONNECTIONS = 150;
    if (isSmallMobile) {
        MAX_CONNECTIONS = 20;
        CONNECTION_DISTANCE = 10;
    } else if (isMobileDevice) {
        MAX_CONNECTIONS = 50;
    }

    let linesMesh = null;

    function updateConnections() {
        if (linesMesh) {
            scene.remove(linesMesh);
            linesMesh.geometry.dispose();
        }

        const linePositions = [];
        let connectionCount = 0;

        const posArr = particleGeometry.attributes.position.array;

        for (let i = 0; i < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS; i++) {
            for (let j = i + 1; j < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS; j++) {
                const dx = posArr[i * 3] - posArr[j * 3];
                const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
                const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < CONNECTION_DISTANCE) {
                    linePositions.push(
                        posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2],
                        posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]
                    );
                    connectionCount++;
                }
            }
        }

        if (linePositions.length > 0) {
            const lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(linesMesh);
        }
    }

    // Initial connections
    updateConnections();

    // ==================== THEME UPDATE ====================
    window.updateThreeTheme = function() {
        const colors = getThemeColors();

        // Update wireframe geometry colors
        icosahedron.material.color = colors.wireframe;
        torus.material.color = colors.particle2;
        octahedron.material.color = colors.particle3;
        dodecahedron.material.color = colors.particle1;
        if (torusKnot) torusKnot.material.color = colors.particle2;

        // Update particle colors
        const colorAttr = particleGeometry.attributes.color;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            const choice = Math.random();
            let color;
            if (choice < 0.4) color = colors.particle1;
            else if (choice < 0.75) color = colors.particle2;
            else color = colors.particle3;

            colorAttr.array[i3] = color.r;
            colorAttr.array[i3 + 1] = color.g;
            colorAttr.array[i3 + 2] = color.b;
        }
        colorAttr.needsUpdate = true;

        // Update line color
        lineMaterial.color = colors.particle1;
    };

    // ==================== ANIMATION LOOP ====================
    let time = 0;
    let frameCount = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        frameCount++;

        // Smooth mouse follow
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Rotate particle system based on mouse
        particles.rotation.y = mouse.x * 0.3;
        particles.rotation.x = mouse.y * 0.2;

        // Animate particles
        const posAttr = particleGeometry.attributes.position;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            const vel = velocities[i];

            // Gentle floating motion
            posAttr.array[i3] = vel.originalX + Math.sin(time + i * 0.01) * 0.3;
            posAttr.array[i3 + 1] = vel.originalY + Math.cos(time + i * 0.015) * 0.3;
            posAttr.array[i3 + 2] = vel.originalZ + Math.sin(time * 0.5 + i * 0.02) * 0.2;

            // Mouse influence — particles are gently pushed
            posAttr.array[i3] += mouse.x * 2;
            posAttr.array[i3 + 1] += mouse.y * 2;
        }
        posAttr.needsUpdate = true;

        // Update time uniform
        particleMaterial.uniforms.uTime.value = time;

        // Animate floating geometry
        geometries.forEach(function(g) {
            g.mesh.rotation.x += g.rotSpeed.x;
            g.mesh.rotation.y += g.rotSpeed.y;
            g.mesh.rotation.z += g.rotSpeed.z;

            // Float up and down
            g.mesh.position.y = g.originalY + Math.sin(time * g.floatSpeed * 100) * g.floatAmplitude;

            // Subtle mouse parallax on geometry
            g.mesh.position.x += mouse.x * 0.02;
            g.mesh.position.y += mouse.y * 0.02;
        });

        // Update connections periodically (less often on mobile)
        var connectionInterval = isMobileDevice ? 90 : 30;
        if (frameCount % connectionInterval === 0) {
            updateConnections();
        }

        renderer.render(scene, camera);
    }

    animate();

    // ==================== RESIZE HANDLER ====================
    var resizeTimeout;
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        var maxPixelRatio = window.innerWidth < 768 ? 1.5 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
        particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, maxPixelRatio);
    }

    // Debounce resize to prevent rapid re-renders during orientation change
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });

    // Also listen for orientation change on mobile
    window.addEventListener('orientationchange', function() {
        setTimeout(handleResize, 300);
    });

    // ==================== SCROLL PARALLAX ====================
    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY || window.pageYOffset;
        var heroHeight = window.innerHeight;
        if (scrollY < heroHeight * 1.5) {
            camera.position.y = -scrollY * 0.005;
            particles.position.y = scrollY * 0.01;
        }
    });

})();
