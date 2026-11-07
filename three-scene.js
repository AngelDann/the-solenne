/**
 * THE SOLENNE — High-Detail Three.js 3D Architectural Dollhouse Engine
 * Procedural architectural scale model with full interior furnishings,
 * rich material contrast, appliances, closets, curtains, wall art, and 3D labels.
 */

class ThreeSolenneApp {
  constructor() {
    this.container = null;
    this.labelOverlay = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentUnit = 'residence-a';
    this.hotspots = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activePin = null;
    this.furnitureGroup = new THREE.Group();
    this.clock = new THREE.Clock();

    // Richer, higher-contrast procedural architectural textures
    this.lightOakTex = this.createPlankTexture('#b69268', '#9f7b52', '#7d5d3b');
    this.darkWalnutTex = this.createPlankTexture('#463020', '#352315', '#22150b');
    this.teakDeckTex = this.createPlankTexture('#68492e', '#523821', '#332010', true);
    this.marbleWhiteTex = this.createMarbleTexture('#eae6df', '#bfb8ad', '#968f84');
    this.marbleBlackTex = this.createMarbleTexture('#14161b', '#e8edf5', '#5a6270');
    this.travertineTex = this.createMarbleTexture('#dfd2be', '#c4b299', '#a69278');
    this.rugJuteTex = this.createRugTexture('#c4b49b', '#ab997e');
    this.rugSilkTex = this.createRugTexture('#d8d0c2', '#bfb5a4');
  }

  createPlankTexture(baseHex, midHex, lineHex, isDeck = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    const plankH = isDeck ? 14 : 24;
    for (let y = 0; y < 512; y += plankH) {
      ctx.fillStyle = (y / plankH) % 2 === 0 ? baseHex : midHex;
      ctx.fillRect(0, y, 512, plankH);
      ctx.fillStyle = lineHex;
      ctx.fillRect(0, y, 512, isDeck ? 2.2 : 1.5);

      const jointX = ((y * 137) % 420) + 40;
      ctx.fillRect(jointX, y, 1.5, plankH);
    }

    ctx.fillStyle = lineHex;
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 1100; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 75 + 15, 1.5);
    }
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  createMarbleTexture(bgHex, vein1Hex, vein2Hex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 512);

    const drawVeins = (color, alpha, width, count) => {
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        let x = Math.random() * 512;
        let y = 0;
        ctx.moveTo(x, y);
        while (y < 512) {
          x += (Math.random() - 0.48) * 55;
          y += Math.random() * 35 + 12;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    drawVeins(vein2Hex, 0.28, 3.0, 6);
    drawVeins(vein1Hex, 0.6, 1.5, 10);
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createRugTexture(c1, c2) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = c2;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 236);
    ctx.fillStyle = c2;
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 2800; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 1.5);
    }
    ctx.globalAlpha = 1.0;
    return new THREE.CanvasTexture(canvas);
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const width = this.container.clientWidth || 960;
    const height = this.container.clientHeight || 680;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 1000);
    this.camera.position.set(-19, 20, 22);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.98;
    this.container.appendChild(this.renderer.domElement);

    // Floating HTML labels overlay container
    this.labelOverlay = document.createElement('div');
    this.labelOverlay.className = 'three-labels-overlay';
    this.labelOverlay.style.cssText =
      'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:15;';
    this.container.appendChild(this.labelOverlay);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxPolarAngle = Math.PI / 2.18;
      this.controls.minPolarAngle = Math.PI / 8;
      this.controls.minDistance = 12;
      this.controls.maxDistance = 48;
      this.controls.target.set(0, 0.8, 0);
    }

    this.setupLighting();
    this.scene.add(this.furnitureGroup);
    this.buildModel(this.currentUnit);

    window.addEventListener('resize', () => this.onResize());
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onPointerMove(e));
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));

    this.animate();
  }

  setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xdde8ff, 0x382e24, 0.78);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff0d6, 1.55);
    sunLight.position.set(-16, 28, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 4;
    sunLight.shadow.camera.far = 65;
    const d = 18;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x6e98c8, 0.65);
    fillLight.position.set(20, 14, -18);
    this.scene.add(fillLight);

    const warm1 = new THREE.PointLight(0xffcf8c, 0.9, 15);
    warm1.position.set(-5, 3.2, -1);
    this.scene.add(warm1);

    const warm2 = new THREE.PointLight(0xffcf8c, 0.9, 15);
    warm2.position.set(4, 3.2, 1);
    this.scene.add(warm2);
  }

  clearScene() {
    while (this.furnitureGroup.children.length > 0) {
      const obj = this.furnitureGroup.children[0];
      this.furnitureGroup.remove(obj);
    }
    this.hotspots = [];
    if (this.labelOverlay) {
      this.labelOverlay.innerHTML = '';
    }
  }

  fitCameraToViewport() {
    if (!this.camera || !this.controls || !this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / Math.max(height, 1);
    // Pull camera back on portrait/narrow viewports so horizontal span fits
    const zoomScale = aspect < 1.25 ? Math.min(1.85, 1.28 / Math.max(aspect, 0.45)) : 1.0;

    if (this.currentUnit === 'sky-penthouse' || this.currentUnit === 'corner-penthouse') {
      this.camera.position.set(0, 23 * zoomScale, 30 * zoomScale);
      this.controls.target.set(0, 0.6, -0.5);
    } else {
      this.camera.position.set(-18.5 * zoomScale, 19.5 * zoomScale, 22 * zoomScale);
      this.controls.target.set(0.5, 0.6, 0.5);
    }
    this.controls.maxDistance = 68;
    this.controls.update();
  }

  buildModel(unitId) {
    this.clearScene();
    this.currentUnit = unitId;

    if (unitId === 'sky-penthouse' || unitId === 'corner-penthouse') {
      this.buildSkyPenthouseModel();
    } else {
      this.buildResidenceAModel();
    }
    this.fitCameraToViewport();
  }

  // =========================================================================
  // REUSABLE ARCHITECTURAL & FURNITURE BUILDERS
  // =========================================================================

  addCutawayWall(w, h, d, x, z, rotY = 0, wallColor = 0xede6d8) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.82 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x161920, roughness: 0.4 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xd0c6b4, roughness: 0.6 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.07, d + 0.02), capMat);
    cap.position.y = h + 0.035;
    group.add(cap);

    const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.1, d + 0.03), baseMat);
    base.position.y = 0.05;
    group.add(base);

    this.furnitureGroup.add(group);
    return group;
  }

  addWallArtwork(x, y, z, rotY = 0, w = 1.4, h = 1.05) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.4 })
    );
    frame.castShadow = true;
    group.add(frame);

    const matBoard = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.12, h - 0.12, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.8 })
    );
    group.add(matBoard);

    const art = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.55, h * 0.55, 0.07),
      new THREE.MeshStandardMaterial({ color: 0x3b495e, roughness: 0.6 })
    );
    group.add(art);

    this.furnitureGroup.add(group);
  }

  addMullionedGlassWall(length, height, x, z, rotY = 0, panels = 4, withCurtains = true) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x16181d,
      roughness: 0.3,
      metalness: 0.6
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9ac4ec,
      transparent: true,
      opacity: 0.28,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.72
    });

    const topTrack = new THREE.Mesh(new THREE.BoxGeometry(length, 0.09, 0.12), frameMat);
    topTrack.position.y = height - 0.045;
    group.add(topTrack);

    const botTrack = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, 0.12), frameMat);
    botTrack.position.y = 0.04;
    group.add(botTrack);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(length, height - 0.16, 0.04), glassMat);
    glass.position.y = height / 2;
    group.add(glass);

    for (let i = 0; i <= panels; i++) {
      const mx = -length / 2 + (length / panels) * i;
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, height, 0.12), frameMat);
      mullion.position.set(mx, height / 2, 0);
      mullion.castShadow = true;
      group.add(mullion);
    }

    // Sheer floor-to-ceiling drapery panels on ends
    if (withCurtains) {
      const curtainMat = new THREE.MeshStandardMaterial({
        color: 0xf2ece1,
        roughness: 0.9,
        transparent: true,
        opacity: 0.88
      });
      [-length / 2 + 0.35, length / 2 - 0.35].forEach((cx) => {
        const drape = new THREE.Mesh(new THREE.BoxGeometry(0.55, height - 0.12, 0.18), curtainMat);
        drape.position.set(cx, height / 2, -0.14);
        drape.castShadow = true;
        group.add(drape);
      });
    }

    this.furnitureGroup.add(group);
  }

  addBalconyRailing(length, x, z, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const railH = 1.05;
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1d2026, metalness: 0.5, roughness: 0.3 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xb4d4f5,
      transparent: true,
      opacity: 0.36,
      roughness: 0.1
    });

    const glass = new THREE.Mesh(new THREE.BoxGeometry(length, railH, 0.04), glassMat);
    glass.position.y = railH / 2;
    group.add(glass);

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(length + 0.04, 0.05, 0.08), metalMat);
    topBar.position.y = railH;
    group.add(topBar);

    const posts = Math.max(2, Math.round(length / 2.2));
    for (let i = 0; i <= posts; i++) {
      const px = -length / 2 + (length / posts) * i;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, railH + 0.04, 0.07), metalMat);
      post.position.set(px, railH / 2, 0);
      group.add(post);
    }

    this.furnitureGroup.add(group);
  }

  addLuxuryBed(x, z, rotY = 0, isDark = false, withNightstands = true) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const frameMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x3b322c : 0xc4b7a3,
      roughness: 0.75
    });
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ee, roughness: 0.85 });
    const throwMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x524034 : 0x8c7a66,
      roughness: 0.88
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x332419 : 0x9e7d56,
      roughness: 0.45
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xe5c178,
      metalness: 0.8,
      roughness: 0.2
    });

    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 0.025, 3.5),
      new THREE.MeshStandardMaterial({ map: this.rugSilkTex, roughness: 0.95 })
    );
    rug.position.set(0, 0.09, 0.2);
    rug.receiveShadow = true;
    group.add(rug);

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.34, 2.7), frameMat);
    base.position.set(0, 0.24, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 2.5), sheetMat);
    mattress.position.set(0, 0.5, 0.04);
    mattress.castShadow = true;
    group.add(mattress);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.34, 0.95), throwMat);
    blanket.position.set(0, 0.51, 0.82);
    blanket.castShadow = true;
    group.add(blanket);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.55, 1.35, 0.22), frameMat);
    headboard.position.set(0, 0.74, -1.28);
    headboard.castShadow = true;
    group.add(headboard);

    const pillowGeo = new THREE.BoxGeometry(0.82, 0.22, 0.42);
    [-0.52, 0.52].forEach((px) => {
      const pBack = new THREE.Mesh(pillowGeo, sheetMat);
      pBack.position.set(px, 0.74, -0.92);
      pBack.rotation.x = 0.25;
      pBack.castShadow = true;
      group.add(pBack);

      const pFront = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.2, 0.35), throwMat);
      pFront.position.set(px, 0.72, -0.62);
      pFront.rotation.x = 0.2;
      pFront.castShadow = true;
      group.add(pFront);
    });

    if (withNightstands) {
      [-1.65, 1.65].forEach((nx) => {
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.48, 0.55), woodMat);
        stand.position.set(nx, 0.3, -1.05);
        stand.castShadow = true;
        group.add(stand);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.28, 16), brassMat);
        stem.position.set(nx, 0.68, -1.05);
        group.add(stem);

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
          new THREE.MeshStandardMaterial({
            color: 0xffe4a8,
            emissive: 0xffb84d,
            emissiveIntensity: 0.75,
            roughness: 0.25,
            metalness: 0.5
          })
        );
        dome.position.set(nx, 0.78, -1.05);
        group.add(dome);
      });
    }

    this.furnitureGroup.add(group);
  }

  addFreestandingTub(x, z, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfa, roughness: 0.18 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0xc2e6f2,
      roughness: 0.08,
      metalness: 0.1
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.2
    });

    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.56, 0.62, 32), ceramicMat);
    outer.scale.set(1.55, 1, 0.92);
    outer.position.y = 0.38;
    outer.castShadow = true;
    group.add(outer);

    const innerWater = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.5, 0.05, 32), waterMat);
    innerWater.scale.set(1.48, 1, 0.85);
    innerWater.position.y = 0.67;
    group.add(innerWater);

    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.82, 12), brassMat);
    pipe.position.set(0, 0.45, -0.68);
    group.add(pipe);

    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.22), brassMat);
    spout.position.set(0, 0.84, -0.58);
    group.add(spout);

    this.furnitureGroup.add(group);
  }

  addDoubleVanity(x, z, rotY = 0, isDark = false) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const cabMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x3b2a1e : 0xb38f68,
      roughness: 0.45
    });
    const topMat = new THREE.MeshStandardMaterial({
      map: isDark ? this.marbleBlackTex : this.marbleWhiteTex,
      roughness: 0.2
    });
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xdce8f7,
      metalness: 0.85,
      roughness: 0.08
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xfff3d6,
      emissive: 0xffe09e,
      emissiveIntensity: 0.9
    });

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.52, 0.62), cabMat);
    cab.position.set(0, 0.58, 0);
    cab.castShadow = true;
    group.add(cab);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.08, 0.65), topMat);
    counter.position.set(0, 0.88, 0);
    group.add(counter);

    [-0.55, 0.55].forEach((sx) => {
      const basin = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.03, 0.34),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 })
      );
      basin.position.set(sx, 0.925, 0.02);
      group.add(basin);

      if (isDark) {
        const glowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.95, 0.03), glowMat);
        glowFrame.position.set(sx, 1.48, -0.28);
        group.add(glowFrame);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.87, 0.04), mirrorMat);
        glass.position.set(sx, 1.48, -0.27);
        group.add(glass);
      } else {
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 28), glowMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(sx, 1.46, -0.28);
        group.add(rim);

        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 28), mirrorMat);
        glass.rotation.x = Math.PI / 2;
        glass.position.set(sx, 1.46, -0.27);
        group.add(glass);
      }
    });

    this.furnitureGroup.add(group);
  }

  addDiningSet(x, z, rotY = 0, chairsPerSide = 3, isDark = false) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const tableLen = chairsPerSide * 0.88 + 0.5;
    const tableW = 1.15;
    const woodMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x453122 : 0xb38f68,
      roughness: 0.38
    });
    const chairFabric = new THREE.MeshStandardMaterial({ color: 0xebe3d5, roughness: 0.85 });

    const top = new THREE.Mesh(new THREE.BoxGeometry(tableLen, 0.08, tableW), woodMat);
    top.position.y = 0.78;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    [-tableLen / 2 + 0.4, tableLen / 2 - 0.4].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, tableW * 0.7), woodMat);
      leg.position.set(lx, 0.38, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.16, 0.1, 20),
      new THREE.MeshStandardMaterial({ color: 0x2c3527, roughness: 0.6 })
    );
    bowl.position.set(0, 0.86, 0);
    group.add(bowl);

    for (let i = 0; i < chairsPerSide; i++) {
      const cx = -((chairsPerSide - 1) * 0.82) / 2 + i * 0.82;
      [-0.74, 0.74].forEach((cz) => {
        const chair = new THREE.Group();
        chair.position.set(cx, 0, cz);
        chair.rotation.y = cz < 0 ? 0 : Math.PI;

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.46), chairFabric);
        seat.position.y = 0.46;
        seat.castShadow = true;
        chair.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.42, 0.07), chairFabric);
        back.position.set(0, 0.68, -0.2);
        back.castShadow = true;
        chair.add(back);

        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.16, 0.42, 12), woodMat);
        ped.position.y = 0.22;
        chair.add(ped);

        group.add(chair);
      });
    }

    this.furnitureGroup.add(group);
  }

  addKitchenIsland(x, z, rotY = 0, len = 3.2, isBlackMarble = false) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const marbleMat = new THREE.MeshStandardMaterial({
      map: isBlackMarble ? this.marbleBlackTex : this.marbleWhiteTex,
      roughness: 0.18,
      metalness: 0.05
    });
    const stoolSeatMat = new THREE.MeshStandardMaterial({
      color: isBlackMarble ? 0x9c5a2d : 0xc9b59a,
      roughness: 0.65
    });
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e2024, metalness: 0.6, roughness: 0.3 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.94, 1.15), marbleMat);
    body.position.y = 0.48;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.03, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x22252a, metalness: 0.7, roughness: 0.2 })
    );
    sink.position.set(0, 0.955, -0.15);
    group.add(sink);

    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 10), darkMetal);
    faucet.position.set(0, 1.1, -0.35);
    group.add(faucet);

    const stoolCount = Math.floor(len / 0.85);
    for (let i = 0; i < stoolCount; i++) {
      const sx = -((stoolCount - 1) * 0.82) / 2 + i * 0.82;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.4), stoolSeatMat);
      seat.position.set(sx, 0.68, 0.78);
      seat.castShadow = true;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.06), stoolSeatMat);
      back.position.set(sx, 0.82, 0.95);
      group.add(back);

      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.14, 0.64, 12), darkMetal);
      leg.position.set(sx, 0.32, 0.78);
      group.add(leg);
    }

    this.furnitureGroup.add(group);
  }

  addWalkInCloset(len, x, z, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa6855e, roughness: 0.5 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(len, 1.75, 0.12), woodMat);
    back.position.set(0, 0.88, -0.25);
    group.add(back);

    const topShelf = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.55), woodMat);
    topShelf.position.set(0, 1.55, 0);
    group.add(topShelf);

    const colors = [0xf2eee6, 0xd8cfc2, 0x998e7e, 0x2c3038, 0xe3dac9, 0x6e6559];
    const count = Math.floor(len / 0.22);
    for (let i = 0; i < count; i++) {
      const gx = -len / 2 + 0.2 + i * 0.21;
      const garment = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.85, 0.42),
        new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.85 })
      );
      garment.position.set(gx, 1.02, 0);
      garment.castShadow = true;
      group.add(garment);
    }

    this.furnitureGroup.add(group);
  }

  addSunLounger(x, z, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.6 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.85 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 1.95), woodMat);
    base.position.y = 0.14;
    base.castShadow = true;
    group.add(base);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 1.35), cushionMat);
    mattress.position.set(0, 0.26, 0.25);
    mattress.castShadow = true;
    group.add(mattress);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.62), cushionMat);
    backrest.position.set(0, 0.42, -0.62);
    backrest.rotation.x = 0.48;
    backrest.castShadow = true;
    group.add(backrest);

    this.furnitureGroup.add(group);
  }

  addPottedOliveTree(x, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.34, 0.68, 20),
      new THREE.MeshStandardMaterial({ color: 0x282b30, roughness: 0.75 })
    );
    pot.position.y = 0.34;
    pot.castShadow = true;
    group.add(pot);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: 0x594636, roughness: 0.9 })
    );
    trunk.position.y = 0.95;
    group.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4b5d43, roughness: 0.92 });
    [
      [0, 1.55, 0, 0.62],
      [-0.28, 1.42, 0.18, 0.45],
      [0.26, 1.48, -0.16, 0.48],
      [0.1, 1.78, 0.12, 0.42]
    ].forEach(([lx, ly, lz, r]) => {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), leafMat);
      crown.position.set(lx, ly, lz);
      crown.castShadow = true;
      group.add(crown);
    });

    this.furnitureGroup.add(group);
  }

  // =========================================================================
  // 1. RESIDENCE A — HIGH-DETAIL 3D DOLLHOUSE MODEL
  // =========================================================================
  buildResidenceAModel() {
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.65 });
    const oakFloorMat = new THREE.MeshStandardMaterial({ map: this.lightOakTex, roughness: 0.38 });
    const bathTileMat = new THREE.MeshStandardMaterial({ map: this.travertineTex, roughness: 0.32 });
    const deckMat = new THREE.MeshStandardMaterial({ map: this.teakDeckTex, roughness: 0.55 });

    // Left Wing: Primary Suite + Bath + Walk-in Closet
    const leftSlab = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.6, 11.5), slabMat);
    leftSlab.position.set(-6.2, -0.3, -0.5);
    leftSlab.receiveShadow = true;
    this.furnitureGroup.add(leftSlab);

    const leftFloor = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.08, 6.2), oakFloorMat);
    leftFloor.position.set(-6.2, 0.04, 2.0);
    leftFloor.receiveShadow = true;
    this.furnitureGroup.add(leftFloor);

    const primaryBathFloor = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.09, 5.0), bathTileMat);
    primaryBathFloor.position.set(-6.2, 0.045, -3.6);
    primaryBathFloor.receiveShadow = true;
    this.furnitureGroup.add(primaryBathFloor);

    // Center & Right Wing: Living, Dining, Chef's Kitchen, Bed 2 & Bath 2
    const mainSlab = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.6, 11.0), slabMat);
    mainSlab.position.set(4.8, -0.3, 0.5);
    mainSlab.receiveShadow = true;
    this.furnitureGroup.add(mainSlab);

    const mainFloor = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.08, 10.6), oakFloorMat);
    mainFloor.position.set(4.8, 0.04, 0.5);
    mainFloor.receiveShadow = true;
    this.furnitureGroup.add(mainFloor);

    // Front Bay-Facing Balcony Slab & Deck
    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.45, 2.4), slabMat);
    balconySlab.position.set(1.5, -0.22, 6.8);
    this.furnitureGroup.add(balconySlab);

    const balconyDeck = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.08, 2.2), deckMat);
    balconyDeck.position.set(1.5, 0.04, 6.8);
    balconyDeck.receiveShadow = true;
    this.furnitureGroup.add(balconyDeck);

    // Balcony Glass Railings
    this.addBalconyRailing(8.1, 1.5, 7.9, 0);
    this.addBalconyRailing(2.2, -2.55, 6.8, Math.PI / 2);
    this.addBalconyRailing(2.2, 5.55, 6.8, Math.PI / 2);

    // Mullioned Sliding Glass Doors (Living Room & Primary Bedroom)
    this.addMullionedGlassWall(7.8, 1.95, 1.5, 5.65, 0, 4, true);
    this.addMullionedGlassWall(3.8, 1.95, -7.8, 5.1, 0, 2, true);

    // Exterior & Interior Cutaway Walls
    const wh = 1.95;
    this.addCutawayWall(0.32, wh, 11.4, -10.3, -0.5);
    this.addCutawayWall(8.4, wh, 0.32, -6.2, -6.1);
    this.addCutawayWall(0.28, wh, 10.2, -2.1, 0.2);
    this.addCutawayWall(4.2, 1.75, 0.24, -8.1, -1.1);
    this.addCutawayWall(0.24, 1.75, 4.8, -6.0, -3.6);

    this.addCutawayWall(14.4, wh, 0.32, 4.8, -4.8);
    this.addCutawayWall(0.32, wh, 10.8, 11.9, 0.5);
    this.addCutawayWall(0.26, wh, 9.2, 7.2, 1.1);
    this.addCutawayWall(4.6, 1.75, 0.24, 9.5, 0.2);

    // --- 1. PRIMARY BEDROOM & WALK-IN CLOSET (Left Wing) ---
    this.addLuxuryBed(-7.0, 2.1, Math.PI / 2, false, true);
    // Walk-in closet placed inside the top-left closet room (-8.2, -3.6)
    this.addWalkInCloset(3.4, -9.85, -3.6, Math.PI / 2);
    this.addWalkInCloset(3.2, -8.1, -5.65, 0);

    // --- 2. PRIMARY BATH (Top-Left Wing) ---
    this.addFreestandingTub(-4.4, -4.6, 0.3);
    this.addDoubleVanity(-3.2, -2.8, -Math.PI / 2, false);

    const showerGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.8, 0.05),
      new THREE.MeshPhysicalMaterial({ color: 0xbbe0ff, transparent: true, opacity: 0.32 })
    );
    showerGlass.position.set(-3.1, 0.92, -1.3);
    this.furnitureGroup.add(showerGlass);

    // --- 3. LIVING ROOM & MEDIA WALL (Center) ---
    const livingRug = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.025, 4.4),
      new THREE.MeshStandardMaterial({ map: this.rugJuteTex, roughness: 0.95 })
    );
    livingRug.position.set(1.1, 0.09, 2.4);
    livingRug.receiveShadow = true;
    this.furnitureGroup.add(livingRug);

    const mediaConsole = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.48, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xa6835a, roughness: 0.45 })
    );
    mediaConsole.position.set(-1.65, 0.3, 2.2);
    mediaConsole.castShadow = true;
    this.furnitureGroup.add(mediaConsole);

    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.1, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x0d1017, roughness: 0.15, metalness: 0.5 })
    );
    tvScreen.position.set(-1.88, 1.22, 2.2);
    this.furnitureGroup.add(tvScreen);

    // Signature Curved Cream Bouclé Sofa
    const sofaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, 0, 0.6),
      new THREE.Vector3(1.6, 0, 1.4),
      new THREE.Vector3(1.9, 0, 2.9),
      new THREE.Vector3(1.1, 0, 4.1)
    ]);
    const boucléMat = new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.85 });
    const sofaBase = new THREE.Mesh(new THREE.TubeGeometry(sofaCurve, 36, 0.52, 16, false), boucléMat);
    sofaBase.scale.set(1, 0.72, 1);
    sofaBase.position.set(0.3, 0.36, 0);
    sofaBase.castShadow = true;
    this.furnitureGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.TubeGeometry(sofaCurve, 36, 0.24, 14, false), boucléMat);
    sofaBack.position.set(0.52, 0.72, 0);
    sofaBack.castShadow = true;
    this.furnitureGroup.add(sofaBack);

    // Accent Wooden Lounge Chair
    const accentChair = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.52, 0.78),
      new THREE.MeshStandardMaterial({ color: 0xe6dec8, roughness: 0.8 })
    );
    accentChair.position.set(-0.3, 0.32, 0.9);
    accentChair.rotation.y = 0.5;
    accentChair.castShadow = true;
    this.furnitureGroup.add(accentChair);

    // Round Travertine Coffee Table + Art Book
    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.78, 0.34, 32),
      new THREE.MeshStandardMaterial({ map: this.travertineTex, roughness: 0.4 })
    );
    coffeeTable.position.set(0.2, 0.25, 2.3);
    coffeeTable.castShadow = true;
    this.furnitureGroup.add(coffeeTable);

    const artBook = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.05, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xc89d54, roughness: 0.4 })
    );
    artBook.position.set(0.2, 0.44, 2.3);
    artBook.rotation.y = 0.4;
    this.furnitureGroup.add(artBook);

    // Dining Table & 6 Chairs
    this.addDiningSet(4.6, 3.3, 0, 3, false);

    // --- 4. CHEF'S KITCHEN (Center-Back) ---
    const oakCabMat = new THREE.MeshStandardMaterial({ color: 0xa8845c, roughness: 0.42 });
    const backCab = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.85, 0.72), oakCabMat);
    backCab.position.set(4.1, 0.96, -4.25);
    backCab.castShadow = true;
    this.furnitureGroup.add(backCab);

    const sideCab = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.85, 3.6), oakCabMat);
    sideCab.position.set(1.4, 0.96, -2.5);
    sideCab.castShadow = true;
    this.furnitureGroup.add(sideCab);

    // Recessed Marble Counter & Black Induction Cooktop
    const cooktop = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.04, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.15, metalness: 0.5 })
    );
    cooktop.position.set(4.2, 0.96, -3.85);
    this.furnitureGroup.add(cooktop);

    this.addKitchenIsland(4.2, -1.6, 0, 3.1, false);

    // --- 5. SECOND BEDROOM & BATH (Right Wing) ---
    this.addLuxuryBed(9.5, 3.1, -Math.PI / 2, false, false);
    this.addWallArtwork(11.7, 1.2, 3.1, -Math.PI / 2, 1.5, 0.95);

    // Balcony Lounger & Potted Plants
    this.addSunLounger(0.3, 6.8, Math.PI / 2);
    this.addPottedOliveTree(-1.8, 6.8, 0.85);
    this.addPottedOliveTree(4.6, 6.8, 0.85);

    // --- 6. INTERACTIVE 3D HOTSPOTS + LABELS ---
    this.addHotspot('living-kitchen', 'LIVING & KITCHEN', 1.2, 1.5, 2.3, 0);
    this.addHotspot('primary-bedroom', 'PRIMARY BEDROOM', -7.0, 1.5, 2.1, 1);
    this.addHotspot('primary-bath', 'PRIMARY BATH', -4.2, 1.5, -3.8, 2);
  }

  // =========================================================================
  // 2. SKY PENTHOUSE — HIGH-DETAIL V-SHAPED CORNER 3D DOLLHOUSE MODEL
  // =========================================================================
  buildSkyPenthouseModel() {
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.7 });
    const walnutFloorMat = new THREE.MeshStandardMaterial({ map: this.darkWalnutTex, roughness: 0.35 });
    const stoneFloorMat = new THREE.MeshStandardMaterial({ map: this.travertineTex, roughness: 0.32 });
    const deckMat = new THREE.MeshStandardMaterial({ map: this.teakDeckTex, roughness: 0.5 });

    const root = new THREE.Group();
    root.rotation.y = Math.PI / 4;
    this.furnitureGroup.add(root);

    const prevGroup = this.furnitureGroup;
    this.furnitureGroup = root;

    // 1. Base Architectural Slabs & Wrap-Around Teak Terrace Deck
    const mainSlab = new THREE.Mesh(new THREE.BoxGeometry(19.6, 0.65, 19.6), slabMat);
    mainSlab.position.set(0, -0.32, 0);
    mainSlab.receiveShadow = true;
    root.add(mainSlab);

    const deckFloor = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.08, 19.2), deckMat);
    deckFloor.position.set(0, 0.04, 0);
    deckFloor.receiveShadow = true;
    root.add(deckFloor);

    // Interior Travertine Stone Flooring (Great Room, Kitchen, Spa Bath)
    const interiorStone = new THREE.Mesh(new THREE.BoxGeometry(15.0, 0.12, 15.0), stoneFloorMat);
    interiorStone.position.set(1.6, 0.07, -1.6);
    interiorStone.receiveShadow = true;
    root.add(interiorStone);

    // Dark Walnut Flooring filling the entire Primary Suite up to the glass walls
    const leftSuiteWood = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.13, 9.4), walnutFloorMat);
    leftSuiteWood.position.set(-3.0, 0.075, 1.1);
    leftSuiteWood.receiveShadow = true;
    root.add(leftSuiteWood);

    // Dark Walnut Flooring in Secondary Suite & Study (Right Wing)
    const rightSuiteWood = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.13, 9.2), walnutFloorMat);
    rightSuiteWood.position.set(6.2, 0.075, -4.5);
    rightSuiteWood.receiveShadow = true;
    root.add(rightSuiteWood);

    // 2. Wrap-Around Glass Balcony Railings
    this.addBalconyRailing(19.2, 0, 9.55, 0);
    this.addBalconyRailing(19.2, -9.55, 0, Math.PI / 2);

    // 3. Floor-to-Ceiling Mullioned Glass Corner Walls
    this.addMullionedGlassWall(15.0, 2.15, 1.6, 5.9, 0, 6, true);
    this.addMullionedGlassWall(15.0, 2.15, -5.85, -1.6, Math.PI / 2, 6, true);

    // 4. Cutaway Interior & Back Walls with Dark Caps
    const wh = 2.15;
    this.addCutawayWall(15.2, wh, 0.35, 1.6, -9.1);
    this.addCutawayWall(0.35, wh, 15.2, 9.1, -1.6);
    // Primary Suite & Fireplace Divider Wall
    this.addCutawayWall(0.35, wh, 9.5, -0.2, 1.1);
    this.addCutawayWall(5.6, 1.85, 0.28, -3.0, -3.6);
    // Partition wall separating Spa Bath from Chef's Kitchen
    this.addCutawayWall(0.28, wh, 5.4, -2.1, -6.3);
    // Right Wing Guest Suite & Study Partitions
    this.addCutawayWall(0.3, wh, 9.6, 3.3, -4.3);
    this.addCutawayWall(5.6, 1.85, 0.28, 6.2, -2.2);

    // --- 5. GREAT ROOM (Front Corner with L-Sectional, Fireplace & Dining) ---
    const fireplaceWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 2.22, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xd8cfc2, roughness: 0.5 })
    );
    fireplaceWall.position.set(0.15, 1.14, 2.2);
    fireplaceWall.castShadow = true;
    root.add(fireplaceWall);

    const fireGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.28, 2.1),
      new THREE.MeshStandardMaterial({
        color: 0xffaa44,
        emissive: 0xff5500,
        emissiveIntensity: 1.5
      })
    );
    fireGlow.position.set(0.42, 0.38, 2.2);
    root.add(fireGlow);

    const greatRoomTv = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.05, 1.95),
      new THREE.MeshStandardMaterial({ color: 0x0c0e14, roughness: 0.15, metalness: 0.6 })
    );
    greatRoomTv.position.set(0.45, 1.35, 2.2);
    root.add(greatRoomTv);

    // Massive L-Shaped Cream Sectional Sofa + Jute Rug + Walnut Coffee Table
    const greatRug = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.025, 5.2),
      new THREE.MeshStandardMaterial({ map: this.rugJuteTex, roughness: 0.95 })
    );
    greatRug.position.set(3.2, 0.14, 2.4);
    greatRug.receiveShadow = true;
    root.add(greatRug);

    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xf7f3eb, roughness: 0.85 });
    const sec1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.68, 1.25), sofaMat);
    sec1.position.set(3.3, 0.42, 0.6);
    sec1.castShadow = true;
    root.add(sec1);

    const sec2 = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.68, 3.8), sofaMat);
    sec2.position.set(4.8, 0.42, 2.5);
    sec2.castShadow = true;
    root.add(sec2);

    // Backrests & Throw Cushions on Sectional
    const back1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.32, 0.28), sofaMat);
    back1.position.set(3.3, 0.82, 0.12);
    root.add(back1);

    const back2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 3.8), sofaMat);
    back2.position.set(5.28, 0.82, 2.5);
    root.add(back2);

    const coffeeTbl = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.32, 1.65),
      new THREE.MeshStandardMaterial({ color: 0x362417, roughness: 0.35 })
    );
    coffeeTbl.position.set(2.8, 0.28, 2.4);
    coffeeTbl.castShadow = true;
    root.add(coffeeTbl);

    // 8-Seat Walnut Dining Table next to Great Room
    this.addDiningSet(6.6, 2.2, Math.PI / 2, 4, true);

    // --- 6. CHEF'S KITCHEN IN BLACK MARQUINA MARBLE (Center-Back) ---
    const walnutCabMat = new THREE.MeshStandardMaterial({ color: 0x3b281b, roughness: 0.4 });
    const kWallCab = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.1, 0.78), walnutCabMat);
    kWallCab.position.set(0.6, 1.12, -8.5);
    kWallCab.castShadow = true;
    root.add(kWallCab);

    this.addKitchenIsland(0.6, -5.8, 0, 3.8, true);

    // --- 7. PRIMARY SUITE (Left Glass Wing) ---
    this.addLuxuryBed(-3.1, 1.8, -Math.PI / 2, true, true);
    this.addWalkInCloset(3.2, -3.0, -3.2, 0);

    // --- 8. SPA BATH (Back-Left Corner Sanctuary) ---
    this.addFreestandingTub(-4.2, -7.4, 0.4);
    this.addDoubleVanity(-3.8, -5.3, -Math.PI / 2, true);

    // --- 9. SECONDARY SUITE & HOME OFFICE (Right Wing) ---
    this.addLuxuryBed(6.2, -6.2, Math.PI, true, false);
    this.addWallArtwork(8.8, 1.3, -5.8, -Math.PI / 2, 1.8, 1.1);

    // --- 10. WRAP-AROUND TERRACE LOUNGERS & OLIVE TREES ---
    this.addSunLounger(-3.5, 7.8, Math.PI / 2);
    this.addSunLounger(-1.2, 7.8, Math.PI / 2);
    this.addSunLounger(2.8, 7.8, -Math.PI / 2);
    this.addSunLounger(5.2, 7.8, -Math.PI / 2);

    this.addPottedOliveTree(-8.2, 8.2, 1.15);
    this.addPottedOliveTree(0.6, 8.2, 1.05);
    this.addPottedOliveTree(8.2, 8.2, 1.1);
    this.addPottedOliveTree(-8.2, 1.5, 1.0);
    this.addPottedOliveTree(-8.2, -5.5, 1.05);

    // --- 11. INTERACTIVE 3D HOTSPOTS + FLOATING LABELS ---
    this.addHotspot('great-room', 'GREAT ROOM', 2.8, 1.6, 2.4, 0, root);
    this.addHotspot('chefs-kitchen', "CHEF'S KITCHEN", 0.6, 1.6, -5.8, 1, root);
    this.addHotspot('primary-suite', 'PRIMARY SUITE', -3.1, 1.6, 1.8, 2, root);
    this.addHotspot('spa-bath', 'SPA BATH', -4.2, 1.6, -6.6, 3, root);

    this.furnitureGroup = prevGroup;
  }

  addHotspot(id, title, x, y, z, roomIndex, targetContainer = this.furnitureGroup) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8);
    const stemMat = new THREE.MeshBasicMaterial({
      color: 0xe5d4b3,
      transparent: true,
      opacity: 0.65
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = -0.42;
    group.add(stem);

    const ringGeo = new THREE.TorusGeometry(0.45, 0.055, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    const sphereGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.95,
      roughness: 0.15
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    const hitGeo = new THREE.SphereGeometry(0.95, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);

    let labelEl = null;
    if (this.labelOverlay) {
      labelEl = document.createElement('div');
      labelEl.className = 'three-floating-label';
      labelEl.textContent = title;
      labelEl.style.cssText = `
        position: absolute;
        transform: translate(-50%, -100%);
        background: rgba(10, 14, 22, 0.92);
        border: 1px solid rgba(229, 212, 179, 0.45);
        color: #f7f4ee;
        padding: 4px 10px;
        font-family: 'Inter', sans-serif;
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.16em;
        white-space: nowrap;
        pointer-events: auto;
        cursor: pointer;
        border-radius: 2px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.65);
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      `;
      labelEl.addEventListener('mouseenter', () => this.highlightPin(group));
      labelEl.addEventListener('mouseleave', () => this.resetHighlightedPin());
      labelEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.enterRoomView === 'function') {
          window.enterRoomView(roomIndex);
        }
      });
      this.labelOverlay.appendChild(labelEl);
    }

    hitMesh.userData = { id, title, roomIndex, parentGroup: group };
    group.add(hitMesh);

    group.userData = { ring, sphere, labelEl, roomIndex };
    targetContainer.add(group);
    this.hotspots.push(hitMesh);
  }

  updateFloatingLabels() {
    if (!this.camera || !this.renderer || !this.labelOverlay) return;
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    const worldPos = new THREE.Vector3();

    this.hotspots.forEach((hitMesh) => {
      const group = hitMesh.userData.parentGroup;
      const labelEl = group?.userData?.labelEl;
      if (!labelEl) return;

      group.getWorldPosition(worldPos);
      worldPos.y += 0.55;
      worldPos.project(this.camera);

      const x = (worldPos.x * 0.5 + 0.5) * width;
      const y = (-(worldPos.y * 0.5) + 0.5) * height;

      labelEl.style.left = `${x}px`;
      labelEl.style.top = `${y}px`;
    });
  }

  onPointerMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hotspots);

    if (intersects.length > 0) {
      this.renderer.domElement.style.cursor = 'pointer';
      const hit = intersects[0].object;
      this.highlightPin(hit.userData.parentGroup);
    } else {
      this.renderer.domElement.style.cursor = 'grab';
      this.resetHighlightedPin();
    }
  }

  highlightPin(pinGroup) {
    if (this.activePin === pinGroup) return;
    this.resetHighlightedPin();
    this.activePin = pinGroup;
    pinGroup.userData.ring.material.color.setHex(0xe5d4b3);
    pinGroup.userData.sphere.material.color.setHex(0xffffff);
    pinGroup.userData.sphere.material.emissive.setHex(0xe5d4b3);
    pinGroup.scale.set(1.25, 1.25, 1.25);
    if (pinGroup.userData.labelEl) {
      pinGroup.userData.labelEl.style.background = '#e5d4b3';
      pinGroup.userData.labelEl.style.color = '#0b0f16';
    }
  }

  resetHighlightedPin() {
    if (this.activePin) {
      this.activePin.userData.ring.material.color.setHex(0x3b82f6);
      this.activePin.userData.sphere.material.color.setHex(0x60a5fa);
      this.activePin.userData.sphere.material.emissive.setHex(0x2563eb);
      this.activePin.scale.set(1, 1, 1);
      if (this.activePin.userData.labelEl) {
        this.activePin.userData.labelEl.style.background = 'rgba(10, 14, 22, 0.92)';
        this.activePin.userData.labelEl.style.color = '#f7f4ee';
      }
      this.activePin = null;
    }
  }

  onPointerClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hotspots);

    if (intersects.length > 0) {
      const roomIndex = intersects[0].object.userData.roomIndex;
      if (typeof window.enterRoomView === 'function') {
        window.enterRoomView(roomIndex);
      }
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.fitCameraToViewport();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    this.hotspots.forEach((hitMesh) => {
      const group = hitMesh.userData.parentGroup;
      if (group && group !== this.activePin) {
        const pulse = 1 + Math.sin(elapsed * 3.5) * 0.14;
        group.userData.ring.scale.set(pulse, pulse, pulse);
        group.userData.ring.material.opacity = 0.48 + Math.sin(elapsed * 3.5) * 0.38;
      }
    });

    if (this.controls) {
      this.controls.update();
    }

    this.updateFloatingLabels();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

class ThreeAtmosphereApp {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = 120;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.z = 18;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.container.appendChild(this.renderer.domElement);

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 240, 200, 1)');
    grad.addColorStop(0.3, 'rgba(229, 212, 179, 0.8)');
    grad.addColorStop(1, 'rgba(229, 212, 179, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.particleCount * 3);
    const speeds = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      speeds[i] = Math.random() * 0.4 + 0.2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.speeds = speeds;

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.65
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < this.particleCount; i++) {
        pos[i * 3 + 1] += this.speeds[i] * 0.008;
        pos[i * 3 + 0] += Math.sin(pos[i * 3 + 1] * 0.5) * 0.004;

        if (pos[i * 3 + 1] > 9) {
          pos[i * 3 + 1] = -9;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 26;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.ThreeSolenne = new ThreeSolenneApp();
window.ThreeAtmosphere = new ThreeAtmosphereApp();
