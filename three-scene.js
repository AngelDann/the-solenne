/**
 * THE SOLENNE — Three.js 3D Architectural Engine
 * Interactive 3D Dollhouse and Immersive WebGL Experiences
 */

class ThreeSolenneApp {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentUnit = 'residence-a';
    this.hotspots = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activePin = null;
    this.isOrbiting = false;
    this.animatingCamera = false;
    this.cameraTarget = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.furnitureGroup = new THREE.Group();
    this.clock = new THREE.Clock();

    // Textures & Shared Geometries
    this.woodTexture = this.generateWoodTexture('#c9ad8b', '#a48460');
    this.walnutTexture = this.generateWoodTexture('#3a2c20', '#251b14');
    this.marbleTexture = this.generateMarbleTexture();
    this.rugTexture = this.generateFabricTexture();
  }

  generateWoodTexture(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = color2;
    for (let i = 0; i < 512; i += 32) {
      ctx.fillRect(0, i, 512, 2);
    }
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? color1 : color2;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 60 + 20, 2);
    }
    ctx.globalAlpha = 1.0;
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  generateMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#16191f';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#e6edf5';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = 0;
      ctx.moveTo(x, y);
      while (y < 512) {
        x += (Math.random() - 0.5) * 60;
        y += Math.random() * 40 + 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  generateFabricTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#dcd3c4';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#c7bca9';
    for (let i = 0; i < 3000; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const width = this.container.clientWidth || 900;
    const height = this.container.clientHeight || 650;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // transparent to inherit dark luxury gradient

    // Camera: Isometric Perspective
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(22, 22, -24);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.15; // Don't flip below floor
      this.controls.minDistance = 12;
      this.controls.maxDistance = 55;
      this.controls.target.set(0, 1.2, 0);
    }

    // Lights
    this.setupLighting();

    // Build Model
    this.scene.add(this.furnitureGroup);
    this.buildModel(this.currentUnit);

    // Events
    window.addEventListener('resize', () => this.onResize());
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onPointerMove(e));
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));

    // Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient light with soft twilight tone
    const ambientLight = new THREE.AmbientLight(0x40485a, 1.2);
    this.scene.add(ambientLight);

    // Main warm sunlight at twilight
    const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.0);
    sunLight.position.set(18, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 70;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Cool sky fill light from bay water
    const skyFillLight = new THREE.DirectionalLight(0x5075a0, 0.9);
    skyFillLight.position.set(-20, 15, -15);
    this.scene.add(skyFillLight);

    // Warm interior floor bounce
    const interiorPoint = new THREE.PointLight(0xffd59e, 1.6, 25);
    interiorPoint.position.set(0, 4.5, 0);
    this.scene.add(interiorPoint);
  }

  clearScene() {
    while (this.furnitureGroup.children.length > 0) {
      const obj = this.furnitureGroup.children[0];
      this.furnitureGroup.remove(obj);
    }
    this.hotspots = [];
  }

  buildModel(unitId) {
    this.clearScene();
    this.currentUnit = unitId;

    if (unitId === 'sky-penthouse' || unitId === 'corner-penthouse') {
      this.buildSkyPenthouseModel();
    } else {
      this.buildResidenceAModel();
    }
  }

  /**
   * Builds 3D Architectural Model for Residence A (Rectangular layout)
   */
  buildResidenceAModel() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xedeae1, roughness: 0.85 });
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.woodTexture,
      roughness: 0.35,
      metalness: 0.05
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9bc2e6,
      transparent: true,
      opacity: 0.38,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.65,
      ior: 1.45
    });
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x1d222a, roughness: 0.7 });

    // 1. Concrete Foundation Slab
    const slabGeo = new THREE.BoxGeometry(22.4, 0.8, 12.4);
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(0, -0.4, 0);
    slabMesh.receiveShadow = true;
    this.furnitureGroup.add(slabMesh);

    // 2. Hardwood Interior Floor
    const floorGeo = new THREE.BoxGeometry(22, 0.1, 10.2);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0.05, 0.9);
    floorMesh.receiveShadow = true;
    this.furnitureGroup.add(floorMesh);

    // Balcony Deck Floor
    const balconyGeo = new THREE.BoxGeometry(22, 0.1, 1.8);
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x8a929e, roughness: 0.6 });
    const balconyMesh = new THREE.Mesh(balconyGeo, balconyMat);
    balconyMesh.position.set(0, 0.05, -5.1);
    this.furnitureGroup.add(balconyMesh);

    // 3. Exterior Balcony Glass Railing
    const railingGeo = new THREE.BoxGeometry(22, 1.3, 0.12);
    const railingMesh = new THREE.Mesh(railingGeo, glassMat);
    railingMesh.position.set(0, 0.75, -5.9);
    this.furnitureGroup.add(railingMesh);

    // 4. Exterior Glass Sliding Facade
    const glassFacadeGeo = new THREE.BoxGeometry(22, 2.4, 0.12);
    const glassFacade = new THREE.Mesh(glassFacadeGeo, glassMat);
    glassFacade.position.set(0, 1.25, -4.1);
    this.furnitureGroup.add(glassFacade);

    // 5. Exterior & Interior Partitions
    const wallH = 1.6;
    const addWall = (w, h, d, x, y, z) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.furnitureGroup.add(mesh);
    };

    // Back Exterior Wall (acting as backdrop)
    addWall(22.2, 2.2, 0.45, 0, 1.1, 6.0);
    // Left Exterior Wall
    addWall(0.45, wallH, 10.4, -11.0, wallH / 2, 0.9);
    // Right Exterior Wall
    addWall(0.45, wallH, 10.4, 11.0, wallH / 2, 0.9);

    // Interior Divider: Master Suite on Left
    addWall(0.3, wallH, 8.2, -4.5, wallH / 2, 1.8);
    // Interior Divider: Second Bed/Bath on Right
    addWall(0.3, wallH, 7.8, 5.0, wallH / 2, 2.0);
    // Bathroom Partition Left
    addWall(6.2, wallH, 0.3, -7.6, wallH / 2, 2.5);

    // 6. Furniture: Living Room
    // Curved Bouclé Sofa
    const sofaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, 0, -0.6),
      new THREE.Vector3(-1.0, 0, -1.5),
      new THREE.Vector3(1.4, 0, -1.2),
      new THREE.Vector3(2.6, 0, -0.2)
    ]);
    const sofaTubeGeo = new THREE.TubeGeometry(sofaCurve, 32, 0.65, 12, false);
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e6,
      roughness: 0.88,
      bumpScale: 0.05
    });
    const sofaMesh = new THREE.Mesh(sofaTubeGeo, sofaMat);
    sofaMesh.position.set(0, 0.65, 0);
    sofaMesh.castShadow = true;
    this.furnitureGroup.add(sofaMesh);

    // Area Rug
    const rugGeo = new THREE.BoxGeometry(6.5, 0.04, 4.2);
    const rugMat = new THREE.MeshStandardMaterial({ map: this.rugTexture, roughness: 0.95 });
    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.position.set(0.1, 0.12, -0.5);
    rugMesh.receiveShadow = true;
    this.furnitureGroup.add(rugMesh);

    // Travertine Coffee Table
    const tableGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 32);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xdecbb7, roughness: 0.5 });
    const coffeeTable = new THREE.Mesh(tableGeo, tableMat);
    coffeeTable.position.set(0.2, 0.28, -0.6);
    coffeeTable.castShadow = true;
    this.furnitureGroup.add(coffeeTable);

    // Dining Table & Chairs
    const diningGeo = new THREE.BoxGeometry(3.6, 0.25, 1.6);
    const diningMat = new THREE.MeshStandardMaterial({ color: 0xc4a480, roughness: 0.4 });
    const diningTable = new THREE.Mesh(diningGeo, diningMat);
    diningTable.position.set(0.2, 0.9, 3.6);
    diningTable.castShadow = true;
    this.furnitureGroup.add(diningTable);

    // Kitchen Marble Island
    const islandGeo = new THREE.BoxGeometry(4.2, 1.25, 1.6);
    const islandMat = new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.25 });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(4.2, 0.65, -0.4);
    islandMesh.castShadow = true;
    this.furnitureGroup.add(islandMesh);

    // Master Bedroom King Bed
    const bedGeo = new THREE.BoxGeometry(3.2, 0.8, 3.6);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0xeae6dc, roughness: 0.8 });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.set(-7.8, 0.45, -0.8);
    bedMesh.castShadow = true;
    this.furnitureGroup.add(bedMesh);

    const headboardGeo = new THREE.BoxGeometry(3.4, 1.4, 0.3);
    const headboard = new THREE.Mesh(headboardGeo, new THREE.MeshStandardMaterial({ color: 0xbeb29e }));
    headboard.position.set(-7.8, 0.8, 1.05);
    this.furnitureGroup.add(headboard);

    // Second Bedroom Bed (Right wing)
    const bed2Geo = new THREE.BoxGeometry(3.0, 0.75, 3.4);
    const bed2Mat = new THREE.MeshStandardMaterial({ color: 0xd8d4cc, roughness: 0.8 });
    const bed2Mesh = new THREE.Mesh(bed2Geo, bed2Mat);
    bed2Mesh.position.set(8.0, 0.45, 1.8);
    bed2Mesh.castShadow = true;
    this.furnitureGroup.add(bed2Mesh);

    // Master Bath Tub (Oval Tub)
    const tubGeo = new THREE.CylinderGeometry(0.75, 0.65, 0.7, 32);
    tubGeo.scale(1.4, 1.0, 0.9);
    const tubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
    const tubMesh = new THREE.Mesh(tubGeo, tubMat);
    tubMesh.position.set(-7.8, 0.45, 4.3);
    tubMesh.castShadow = true;
    this.furnitureGroup.add(tubMesh);

    // Terrace Lounge Chair & Potted Palm
    const addBalconyChair = (x, z) => {
      const chair = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.4, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x5a544b })
      );
      chair.position.set(x, 0.25, z);
      this.furnitureGroup.add(chair);
    };
    addBalconyChair(-1.5, -5.2);
    addBalconyChair(1.5, -5.2);

    // 7. Add 3D Floating Hotspots
    this.addHotspot('living-kitchen', 'Living & Kitchen', 0.2, 1.8, -0.5, 0);
    this.addHotspot('primary-bedroom', 'Primary Bedroom', -7.8, 1.8, -0.8, 1);
    this.addHotspot('primary-bath', 'Primary Bath', -7.8, 1.8, 4.3, 2);
  }

  /**
   * Builds 3D Architectural Model for Sky Penthouse (L-shaped corner view)
   */
  buildSkyPenthouseModel() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xdedcd6, roughness: 0.85 });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: this.walnutTexture,
      roughness: 0.3,
      metalness: 0.08
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9bc2e6,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.75
    });

    // L-Shaped Floor Slab
    const slabShape = new THREE.Shape();
    slabShape.moveTo(-12, -12);
    slabShape.lineTo(12, -12);
    slabShape.lineTo(12, 0);
    slabShape.lineTo(0, 0);
    slabShape.lineTo(0, 12);
    slabShape.lineTo(-12, 12);
    slabShape.closePath();

    const extrudeSettings = { depth: 0.7, bevelEnabled: false };
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, extrudeSettings);
    slabGeo.rotateX(-Math.PI / 2);
    const slabMesh = new THREE.Mesh(
      slabGeo,
      new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.75 })
    );
    slabMesh.position.set(0, -0.35, 0);
    slabMesh.receiveShadow = true;
    this.furnitureGroup.add(slabMesh);

    // Penthouse Hardwood Floor
    const floorGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.1, bevelEnabled: false });
    floorGeo.rotateX(-Math.PI / 2);
    const floorMesh = new THREE.Mesh(floorGeo, darkWoodMat);
    floorMesh.position.set(0, 0.05, 0);
    floorMesh.receiveShadow = true;
    this.furnitureGroup.add(floorMesh);

    // Wraparound Glass Terrace Railing
    const addRailing = (x1, z1, x2, z2) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const rGeo = new THREE.BoxGeometry(len, 1.3, 0.1);
      const rMesh = new THREE.Mesh(rGeo, glassMat);
      rMesh.position.set((x1 + x2) / 2, 0.75, (z1 + z2) / 2);
      rMesh.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      this.furnitureGroup.add(rMesh);
    };

    addRailing(-12, -12, 12, -12);
    addRailing(12, -12, 12, 0);
    addRailing(-12, -12, -12, 12);

    // Massive Corner L-Sectional Sofa in Great Room
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.9 });
    const sofa1 = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.85, 1.8), sofaMat);
    sofa1.position.set(2.5, 0.48, -4.5);
    sofa1.castShadow = true;
    this.furnitureGroup.add(sofa1);

    const sofa2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 4.8), sofaMat);
    sofa2.position.set(-0.5, 0.48, -3.0);
    sofa2.castShadow = true;
    this.furnitureGroup.add(sofa2);

    // Dark Marquina Marble Kitchen Island
    const islandGeo = new THREE.BoxGeometry(5.4, 1.3, 2.0);
    const islandMat = new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.2 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(5.2, 0.65, 4.2);
    island.castShadow = true;
    this.furnitureGroup.add(island);

    // Primary Penthouse King Bed
    const bedGeo = new THREE.BoxGeometry(3.6, 0.8, 3.8);
    const bed = new THREE.Mesh(
      bedGeo,
      new THREE.MeshStandardMaterial({ color: 0x423832, roughness: 0.7 })
    );
    bed.position.set(-6.8, 0.45, 4.5);
    bed.castShadow = true;
    this.furnitureGroup.add(bed);

    // Spa Bath Soaking Tub
    const tubGeo = new THREE.CylinderGeometry(0.9, 0.75, 0.75, 32);
    tubGeo.scale(1.4, 1.0, 0.9);
    const tub = new THREE.Mesh(
      tubGeo,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 })
    );
    tub.position.set(-6.8, 0.45, -6.5);
    tub.castShadow = true;
    this.furnitureGroup.add(tub);

    // Terrace Olive Trees in Pots
    const addPottedTree = (x, z) => {
      const potGeo = new THREE.CylinderGeometry(0.5, 0.4, 0.9, 16);
      const pot = new THREE.Mesh(
        potGeo,
        new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.8 })
      );
      pot.position.set(x, 0.5, z);
      this.furnitureGroup.add(pot);

      const foliageGeo = new THREE.SphereGeometry(0.9, 16, 16);
      foliageGeo.scale(1, 1.3, 1);
      const foliage = new THREE.Mesh(
        foliageGeo,
        new THREE.MeshStandardMaterial({ color: 0x3d4b38, roughness: 0.95 })
      );
      foliage.position.set(x, 1.8, z);
      foliage.castShadow = true;
      this.furnitureGroup.add(foliage);
    };

    addPottedTree(10.5, -10.5);
    addPottedTree(-10.5, -10.5);
    addPottedTree(10.5, -2.5);

    // 3D Floating Hotspots
    this.addHotspot('great-room', 'Great Room', 1.5, 1.8, -3.5, 0);
    this.addHotspot('chefs-kitchen', "Chef's Kitchen", 5.2, 1.8, 4.2, 1);
    this.addHotspot('primary-suite', 'Primary Suite', -6.8, 1.8, 4.5, 2);
    this.addHotspot('spa-bath', 'Spa Bath', -6.8, 1.8, -6.5, 3);
  }

  /**
   * Adds an interactive 3D pulsing marker pin in 3D coordinates
   */
  addHotspot(id, title, x, y, z, roomIndex) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Pulsing outer ring
    const ringGeo = new THREE.TorusGeometry(0.48, 0.055, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Inner glowing core sphere
    const sphereGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Invisible hit sphere for easier clicking
    const hitGeo = new THREE.SphereGeometry(0.9, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { id, title, roomIndex, parentGroup: group };
    group.add(hitMesh);

    group.userData = { ring, sphere, baseScale: 1, initialY: y };
    this.furnitureGroup.add(group);
    this.hotspots.push(hitMesh);
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
    pinGroup.scale.set(1.3, 1.3, 1.3);
  }

  resetHighlightedPin() {
    if (this.activePin) {
      this.activePin.userData.ring.material.color.setHex(0x3b82f6);
      this.activePin.userData.sphere.material.color.setHex(0x60a5fa);
      this.activePin.userData.sphere.material.emissive.setHex(0x2563eb);
      this.activePin.scale.set(1, 1, 1);
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
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Subtle breathing animation on 3D hotspots
    this.hotspots.forEach((hitMesh) => {
      const group = hitMesh.userData.parentGroup;
      if (group && group !== this.activePin) {
        const pulse = 1 + Math.sin(elapsed * 3.5) * 0.12;
        group.userData.ring.scale.set(pulse, pulse, pulse);
        group.userData.ring.material.opacity = 0.5 + Math.sin(elapsed * 3.5) * 0.4;
      }
    });

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

/**
 * Three.js 3D Golden Twilight Dust & Motes Particle System
 * Creates depth and luxury atmosphere inside the first-person Room View
 */
class ThreeAtmosphereApp {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.clock = new THREE.Clock();
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

    // Particle texture
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
        pos[i * 3 + 1] += this.speeds[i] * 0.008; // drift upwards
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

// Global instances
window.ThreeSolenne = new ThreeSolenneApp();
window.ThreeAtmosphere = new ThreeAtmosphereApp();
