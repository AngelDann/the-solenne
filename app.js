/**
 * THE SOLENNE — Brickell Bay · Miami
 * Interactive Luxury Real Estate Experience Clone
 */

const FLOOR_BANDS = [
  { floor: 33, type: 'sky-penthouse', top: 9.7,  height: 6.4, left: 39.2, width: 21.6 },
  { floor: 32, type: 'corner-penthouse', top: 16.5, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 31, type: 'corner-penthouse', top: 19.6, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 30, type: 'corner-penthouse', top: 22.8, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 29, type: 'residence-a', top: 25.9, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 28, type: 'residence-a', top: 29.0, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 27, type: 'residence-a', top: 32.2, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 26, type: 'residence-a', top: 35.3, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 25, type: 'residence-a', top: 38.4, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 24, type: 'residence-a', top: 41.6, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 23, type: 'residence-a', top: 44.7, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 22, type: 'residence-a', top: 47.8, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 21, type: 'residence-a', top: 51.0, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 20, type: 'residence-a', top: 54.1, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 19, type: 'residence-a', top: 57.2, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 18, type: 'residence-a', top: 60.4, height: 3.1, left: 37.9, width: 24.2 },
  { floor: 17, type: 'residence-a', top: 63.5, height: 3.1, left: 37.9, width: 24.2 }
];

const RESIDENCE_CATALOG = {
  'residence-a': {
    id: 'residence-a',
    name: 'Residence A',
    beds: '2',
    baths: '2',
    sqft: '1,450',
    specsLine: '2 Bed · 2 Bath · 1,450 SF',
    basePrice: 1.56,
    status: 'AVAILABLE',
    bgColor: '#04122c',
    dollhouseImg: 'public/assets/res-a-dollhouse.png',
    cavityPreviewImg: 'public/assets/res-a-living.png',
    description:
      "A bay-facing two-bedroom with a full wall of glass, an open chef's kitchen and a primary suite with a spa bath and walk-in closet. Plus 120 SF balcony.",
    rooms: [
      {
        id: 'living-kitchen',
        title: 'Living & Kitchen',
        tabLabel: 'LIVING & KITCHEN',
        image: 'public/assets/res-a-living.png',
        pinX: 52.5,
        pinY: 56.0
      },
      {
        id: 'primary-bedroom',
        title: 'Primary Bedroom',
        tabLabel: 'PRIMARY BEDROOM',
        image: 'public/assets/res-a-bedroom.png',
        pinX: 18.5,
        pinY: 47.5
      },
      {
        id: 'primary-bath',
        title: 'Primary Bath',
        tabLabel: 'PRIMARY BATH',
        image: 'public/assets/res-a-bath.png',
        pinX: 38.0,
        pinY: 24.5
      }
    ]
  },

  'corner-penthouse': {
    id: 'corner-penthouse',
    name: 'Corner Penthouse',
    beds: '3',
    baths: '3.5',
    sqft: '3,200',
    specsLine: '3 Bed · 3.5 Bath · 3,200 SF',
    basePrice: 6.8,
    status: 'AVAILABLE',
    bgColor: '#05080e',
    dollhouseImg: 'public/assets/penthouse-dollhouse.png',
    cavityPreviewImg: 'public/assets/penthouse-greatroom.png',
    description:
      "A full corner of sky. Glass on two sides, a wraparound terrace, a chef's kitchen in black marble and a primary suite with a soaking tub. Plus 1,100 SF wraparound terrace.",
    rooms: [
      {
        id: 'great-room',
        title: 'Great Room',
        tabLabel: 'GREAT ROOM',
        image: 'public/assets/penthouse-greatroom.png',
        pinX: 49.0,
        pinY: 56.0
      },
      {
        id: 'chefs-kitchen',
        title: "Chef's Kitchen",
        tabLabel: "CHEF'S KITCHEN",
        image: 'public/assets/penthouse-kitchen.png',
        pinX: 52.8,
        pinY: 32.5
      },
      {
        id: 'primary-suite',
        title: 'Primary Suite',
        tabLabel: 'PRIMARY SUITE',
        image: 'public/assets/penthouse-suite.png',
        pinX: 25.0,
        pinY: 41.5
      },
      {
        id: 'spa-bath',
        title: 'Spa Bath',
        tabLabel: 'SPA BATH',
        image: 'public/assets/penthouse-bath.png',
        pinX: 21.5,
        pinY: 23.5
      }
    ]
  },

  'sky-penthouse': {
    id: 'sky-penthouse',
    name: 'Sky Penthouse',
    beds: '3',
    baths: '3.5',
    sqft: '3,200',
    specsLine: '3 Bed · 3.5 Bath · 3,200 SF',
    basePrice: 7.2,
    status: 'AVAILABLE',
    bgColor: '#05080e',
    dollhouseImg: 'public/assets/penthouse-dollhouse.png',
    cavityPreviewImg: 'public/assets/penthouse-greatroom.png',
    description:
      "A full corner of sky. Glass on two sides, a wraparound terrace, a chef's kitchen in black marble and a primary suite with a soaking tub. Plus 1,100 SF wraparound terrace.",
    rooms: [
      {
        id: 'great-room',
        title: 'Great Room',
        tabLabel: 'GREAT ROOM',
        image: 'public/assets/penthouse-greatroom.png',
        pinX: 49.0,
        pinY: 56.0
      },
      {
        id: 'chefs-kitchen',
        title: "Chef's Kitchen",
        tabLabel: "CHEF'S KITCHEN",
        image: 'public/assets/penthouse-kitchen.png',
        pinX: 52.8,
        pinY: 32.5
      },
      {
        id: 'primary-suite',
        title: 'Primary Suite',
        tabLabel: 'PRIMARY SUITE',
        image: 'public/assets/penthouse-suite.png',
        pinX: 25.0,
        pinY: 41.5
      },
      {
        id: 'spa-bath',
        title: 'Spa Bath',
        tabLabel: 'SPA BATH',
        image: 'public/assets/penthouse-bath.png',
        pinX: 21.5,
        pinY: 23.5
      }
    ]
  }
};

// Application State
const state = {
  view: 'tower', // 'tower' | 'transitioning' | 'dollhouse' | 'room'
  activeFloorBand: FLOOR_BANDS.find((b) => b.floor === 19),
  activeResidence: RESIDENCE_CATALOG['residence-a'],
  activeRoomIndex: 0,
  primaryPhotoActive: true
};

// DOM Elements
const appViewport = document.getElementById('app');
const towerStage = document.getElementById('towerStage');
const towerCamera = document.getElementById('towerCamera');
const floorHighlightBand = document.getElementById('floorHighlightBand');
const floorTooltipWrapper = document.getElementById('floorTooltipWrapper');
const floorNumCurrent = document.getElementById('floorNumCurrent');
const tooltipUnitName = document.getElementById('tooltipUnitName');
const tooltipUnitSpecs = document.getElementById('tooltipUnitSpecs');
const tooltipAvailability = document.getElementById('tooltipAvailability');
const floorHitZones = document.getElementById('floorHitZones');
const cavityRoomPreview = document.getElementById('cavityRoomPreview');

const dollhouseStage = document.getElementById('dollhouseStage');
const dollhouseVisualArea = document.getElementById('dollhouseVisualArea');
const dollhouseModelWrapper = document.getElementById('dollhouseModelWrapper');
const dollhouseImage = document.getElementById('dollhouseImage');
const dollhouseHotspots = document.getElementById('dollhouseHotspots');

const cardEyebrow = document.getElementById('cardEyebrow');
const cardTitle = document.getElementById('cardTitle');
const statBeds = document.getElementById('statBeds');
const statBaths = document.getElementById('statBaths');
const statSqft = document.getElementById('statSqft');
const cardPrice = document.getElementById('cardPrice');
const cardDescription = document.getElementById('cardDescription');
const cardRoomList = document.getElementById('cardRoomList');

const roomStage = document.getElementById('roomStage');
const roomPanWrapper = document.getElementById('roomPanWrapper');
const roomImagePrimary = document.getElementById('roomImagePrimary');
const roomImageSecondary = document.getElementById('roomImageSecondary');
const roomMetaEyebrow = document.getElementById('roomMetaEyebrow');
const roomDisplayTitle = document.getElementById('roomDisplayTitle');
const roomSwitcherBar = document.getElementById('roomSwitcherBar');

const inquiryModal = document.getElementById('inquiryModal');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');

/**
 * Formats price dynamically based on floor elevation
 */
function getFormattedPrice(band) {
  const unit = RESIDENCE_CATALOG[band.type];
  if (band.type === 'sky-penthouse') return '$7.2M';
  if (band.type === 'corner-penthouse') {
    const val = (6.6 + (band.floor - 30) * 0.2).toFixed(1);
    return `$${val}M`;
  }
  const price = (unit.basePrice + (band.floor - 19) * 0.03).toFixed(2);
  return `$${price}M`;
}

/**
 * Build interactive hit strips for each floor band on the tower
 */
function initTowerFloorSelector() {
  floorHitZones.innerHTML = '';
  // Position hit-zones container to span the full viewport so each band uses exact % coordinates
  floorHitZones.style.left = '0';
  floorHitZones.style.top = '0';
  floorHitZones.style.width = '100%';
  floorHitZones.style.height = '100%';
  floorHitZones.style.display = 'block';

  FLOOR_BANDS.forEach((band) => {
    const strip = document.createElement('div');
    strip.className = 'floor-hit-strip';
    strip.style.position = 'absolute';
    strip.style.left = `${band.left}%`;
    strip.style.width = `${band.width}%`;
    strip.style.top = `${band.top}%`;
    strip.style.height = `${band.height}%`;
    strip.dataset.floor = band.floor;

    strip.addEventListener('mouseenter', () => {
      if (state.view !== 'tower') return;
      selectFloorBand(band);
    });

    strip.addEventListener('click', () => {
      if (state.view !== 'tower') return;
      selectFloorBand(band);
      enterFloorCutaway(band);
    });

    floorHitZones.appendChild(strip);
  });

  // Set initial floor (Floor 19)
  selectFloorBand(state.activeFloorBand, true);
}

/**
 * Updates the floor highlight box and floating tooltip card when hovering floors
 */
function selectFloorBand(band, immediate = false) {
  const prevFloor = state.activeFloorBand ? state.activeFloorBand.floor : band.floor;
  state.activeFloorBand = band;
  const unit = RESIDENCE_CATALOG[band.type];
  state.activeResidence = unit;

  // Move floor highlight box
  floorHighlightBand.style.left = `${band.left}%`;
  floorHighlightBand.style.width = `${band.width}%`;
  floorHighlightBand.style.top = `${band.top}%`;
  floorHighlightBand.style.height = `${band.height}%`;

  // Move tooltip card & leader line
  const centerY = band.top + band.height / 2;
  floorTooltipWrapper.style.left = `${band.left + band.width}%`;
  floorTooltipWrapper.style.top = `${centerY}%`;

  // Animate vertical rolling floor number
  if (!immediate && prevFloor !== band.floor) {
    const direction = band.floor > prevFloor ? -14 : 14;
    floorNumCurrent.style.transform = `translateY(${direction}px)`;
    floorNumCurrent.style.opacity = '0.35';
    setTimeout(() => {
      floorNumCurrent.textContent = band.floor;
      floorNumCurrent.style.transform = 'translateY(0)';
      floorNumCurrent.style.opacity = '1';
    }, 90);
  } else {
    floorNumCurrent.textContent = band.floor;
  }

  const priceStr = getFormattedPrice(band);
  tooltipUnitName.textContent = unit.name;
  tooltipUnitSpecs.textContent = unit.specsLine;
  tooltipAvailability.textContent = `${unit.status} · FROM ${priceStr}`;
}

/**
 * Executes the multi-stage cinematic building zoom + horizontal split cutaway
 * before arriving at the 3D Isometric Dollhouse Floor Plan view.
 */
function enterFloorCutaway(band) {
  if (state.view === 'transitioning') return;
  state.view = 'transitioning';

  const unit = RESIDENCE_CATALOG[band.type];
  state.activeResidence = unit;

  // Prepare the Dollhouse screen behind the scenes
  populateDollhouseStage(band, unit);

  // Set the horizontal split line (--split-y) right at the clicked floor's vertical center
  const splitYPercent = band.top + band.height / 2;
  document.documentElement.style.setProperty('--split-y', `${splitYPercent}%`);
  cavityRoomPreview.style.backgroundImage = `url('${unit.cavityPreviewImg}')`;

  // Stage 1: Camera zooms smoothly into the clicked floor on the tower
  towerStage.classList.add('is-zooming');
  const originY = Math.min(Math.max(splitYPercent, 20), 75);
  towerCamera.style.transformOrigin = `50% ${originY}%`;
  towerCamera.style.transform = 'scale(2.35)';

  // Stage 2: Building splits horizontally at the selected floor, revealing the interior cavity
  setTimeout(() => {
    towerStage.classList.add('is-splitting');
  }, 480);

  // Stage 3: Building slices part open and transition into the 3D Isometric Dollhouse View
  setTimeout(() => {
    towerStage.classList.add('is-parting-out');
    dollhouseStage.classList.add('active');
  }, 1250);

  setTimeout(() => {
    towerStage.classList.remove('active', 'is-zooming', 'is-splitting', 'is-parting-out');
    towerCamera.style.transform = 'scale(1)';
    state.view = 'dollhouse';
  }, 1900);
}

/**
 * Populates the 3D Isometric Dollhouse view, hotspots, and right-hand specification card
 */
function populateDollhouseStage(band, unit) {
  const priceStr = getFormattedPrice(band);

  // Match background gradient to the dollhouse render background
  dollhouseStage.style.background =
    unit.id === 'residence-a'
      ? 'radial-gradient(ellipse at 38% 52%, #051431 0%, #030a1a 75%)'
      : 'radial-gradient(ellipse at 38% 52%, #090e18 0%, #05080e 75%)';

  dollhouseImage.src = unit.dollhouseImg;
  cardEyebrow.textContent = `FLOOR ${band.floor} · ${unit.status}`;
  cardTitle.textContent = unit.name;
  statBeds.textContent = unit.beds;
  statBaths.textContent = unit.baths;
  statSqft.textContent = unit.sqft;
  cardPrice.textContent = priceStr;
  cardDescription.textContent = unit.description;

  // Render interactive 3D floor plan pins
  dollhouseHotspots.innerHTML = '';
  cardRoomList.innerHTML = '';

  unit.rooms.forEach((room, idx) => {
    // 1. Hotspot pin on the 3D Dollhouse
    const pin = document.createElement('button');
    pin.className = 'dollhouse-pin';
    pin.style.left = `${room.pinX}%`;
    pin.style.top = `${room.pinY}%`;
    pin.dataset.roomIndex = idx;
    pin.setAttribute('aria-label', `Explore ${room.title}`);

    const pill = document.createElement('span');
    pill.className = 'pin-label-pill';
    pill.textContent = room.tabLabel;
    pin.appendChild(pill);

    pin.addEventListener('click', () => enterRoomView(idx));
    dollhouseHotspots.appendChild(pin);

    // 2. Room item in the right-hand sidebar list
    const li = document.createElement('li');
    li.className = 'card-room-item';
    li.innerHTML = `
      <span class="room-item-left">
        <span class="room-bullet"></span>
        <span>${room.title}</span>
      </span>
      <span class="room-arrow">→</span>
    `;

    li.addEventListener('mouseenter', () => {
      pin.classList.add('is-highlighted');
    });
    li.addEventListener('mouseleave', () => {
      pin.classList.remove('is-highlighted');
    });
    li.addEventListener('click', () => enterRoomView(idx));

    cardRoomList.appendChild(li);
  });
}

/**
 * Transitions from the 3D Dollhouse Floor Plan into the first-person Interior Room View
 */
function enterRoomView(roomIndex) {
  if (state.view === 'transitioning') return;
  state.view = 'transitioning';
  state.activeRoomIndex = roomIndex;

  const unit = state.activeResidence;
  const band = state.activeFloorBand;
  const room = unit.rooms[roomIndex];

  // Zoom into the pin location on the 3D dollhouse
  dollhouseModelWrapper.style.transformOrigin = `${room.pinX}% ${room.pinY}%`;
  dollhouseModelWrapper.classList.add('is-zooming-room');

  // Set up initial room image and switcher buttons
  roomImagePrimary.src = room.image;
  roomImagePrimary.classList.add('active');
  roomImageSecondary.classList.remove('active');
  state.primaryPhotoActive = true;

  updateRoomOverlayText(band, unit, room);
  renderRoomSwitcherTabs(unit, roomIndex);

  setTimeout(() => {
    roomStage.classList.add('active');
    dollhouseStage.classList.remove('active');
  }, 320);

  setTimeout(() => {
    dollhouseModelWrapper.classList.remove('is-zooming-room');
    dollhouseModelWrapper.style.transformOrigin = '50% 50%';
    state.view = 'room';
  }, 800);
}

/**
 * Updates bottom-left room metadata and title
 */
function updateRoomOverlayText(band, unit, room) {
  roomMetaEyebrow.textContent = `FLOOR ${band.floor} · ${unit.name.toUpperCase()}`;
  roomDisplayTitle.textContent = room.title;
}

/**
 * Renders the bottom-right room selector tabs (e.g., LIVING & KITCHEN | PRIMARY BEDROOM | PRIMARY BATH)
 */
function renderRoomSwitcherTabs(unit, activeIdx) {
  roomSwitcherBar.innerHTML = '';
  unit.rooms.forEach((room, idx) => {
    const btn = document.createElement('button');
    btn.className = `room-tab-btn ${idx === activeIdx ? 'active' : ''}`;
    btn.textContent = room.tabLabel;
    btn.addEventListener('click', () => switchRoomTab(idx));
    roomSwitcherBar.appendChild(btn);
  });
}

/**
 * Smoothly crossfades between interior rooms when clicking bottom-right tabs
 */
function switchRoomTab(newIndex) {
  if (newIndex === state.activeRoomIndex) return;
  state.activeRoomIndex = newIndex;

  const unit = state.activeResidence;
  const band = state.activeFloorBand;
  const room = unit.rooms[newIndex];

  // Crossfade using dual image layers
  if (state.primaryPhotoActive) {
    roomImageSecondary.src = room.image;
    roomImageSecondary.classList.add('active');
    roomImagePrimary.classList.remove('active');
  } else {
    roomImagePrimary.src = room.image;
    roomImagePrimary.classList.add('active');
    roomImageSecondary.classList.remove('active');
  }
  state.primaryPhotoActive = !state.primaryPhotoActive;

  updateRoomOverlayText(band, unit, room);

  // Update active button state
  const buttons = roomSwitcherBar.querySelectorAll('.room-tab-btn');
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === newIndex);
  });
}

/**
 * Returns from Interior Room View back to the 3D Dollhouse Floor Plan
 */
function returnToFloorPlan() {
  if (state.view === 'transitioning') return;
  state.view = 'transitioning';

  dollhouseStage.classList.add('active');
  roomStage.classList.remove('active');

  setTimeout(() => {
    state.view = 'dollhouse';
  }, 600);
}

/**
 * Returns from Dollhouse View or Room View back to the Exterior Tower View
 */
function returnToTower() {
  if (state.view === 'tower' || state.view === 'transitioning') return;
  state.view = 'transitioning';

  towerCamera.style.transform = 'scale(1)';
  towerStage.classList.remove('is-zooming', 'is-splitting', 'is-parting-out');
  towerStage.classList.add('active');
  dollhouseStage.classList.remove('active');
  roomStage.classList.remove('active');

  setTimeout(() => {
    state.view = 'tower';
  }, 650);
}

/**
 * Subtle 3D tilt & parallax on the Dollhouse and Room stages
 */
function initMouseParallax() {
  window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;

    if (state.view === 'dollhouse') {
      dollhouseModelWrapper.style.transform = `rotateY(${nx * 3.2}deg) rotateX(${-ny * 2.4}deg)`;
    } else if (state.view === 'room') {
      roomPanWrapper.style.transform = `translate3d(${-nx * 14}px, ${-ny * 10}px, 0)`;
    }
  });
}

/**
 * Wire up navigation buttons, quick pills, and modal
 */
function initControls() {
  document.getElementById('btnBackToTower').addEventListener('click', returnToTower);
  document.getElementById('btnBackToFloorPlan').addEventListener('click', returnToFloorPlan);
  document.getElementById('navBrand').addEventListener('click', returnToTower);

  // Quick floor pills at bottom-left of Tower View
  document.querySelectorAll('.quick-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetFloor = parseInt(pill.dataset.floor, 10);
      const band = FLOOR_BANDS.find((b) => b.floor === targetFloor);
      if (band) {
        selectFloorBand(band);
        enterFloorCutaway(band);
      }
    });
  });

  // Top nav links
  document.querySelector('[data-action="jump-residence"]').addEventListener('click', () => {
    const band = FLOOR_BANDS.find((b) => b.floor === 19);
    if (state.view !== 'tower') {
      returnToTower();
      setTimeout(() => selectFloorBand(band), 350);
    } else {
      selectFloorBand(band);
    }
  });

  document.querySelector('[data-action="jump-penthouse"]').addEventListener('click', () => {
    const band = FLOOR_BANDS.find((b) => b.floor === 33);
    if (state.view !== 'tower') {
      returnToTower();
      setTimeout(() => selectFloorBand(band), 350);
    } else {
      selectFloorBand(band);
    }
  });

  document.querySelector('[data-action="jump-amenities"]').addEventListener('click', () => {
    const band = FLOOR_BANDS.find((b) => b.floor === 17);
    if (state.view !== 'tower') {
      returnToTower();
      setTimeout(() => selectFloorBand(band), 350);
    } else {
      selectFloorBand(band);
    }
  });

  // Modal triggers
  document.getElementById('btnPrivateTour').addEventListener('click', () => {
    modalTitle.textContent = 'Schedule a Private Presentation';
    modalSubtitle.textContent =
      'Arrange a bespoke waterfront tour or private Helicopter arrival at The Solenne Sales Gallery in Brickell Bay.';
    inquiryModal.classList.add('open');
  });

  document.getElementById('btnRequestPlan').addEventListener('click', () => {
    const band = state.activeFloorBand;
    const unit = state.activeResidence;
    modalTitle.textContent = `${unit.name} · Floor ${band.floor} Dossier`;
    modalSubtitle.textContent = `Receive the scaled architectural CAD floor plan, finish schedule, and pricing sheet for ${unit.name} (${unit.sqft} SF).`;
    inquiryModal.classList.add('open');
  });

  document.getElementById('btnCloseModal').addEventListener('click', () => {
    inquiryModal.classList.remove('open');
  });

  document.getElementById('inquiryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'DOSSIER SENT · THANK YOU';
    setTimeout(() => {
      inquiryModal.classList.remove('open');
      submitBtn.textContent = 'REQUEST PRIVATE DOSSIER';
      e.target.reset();
    }, 1400);
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTowerFloorSelector();
  initControls();
  initMouseParallax();
});
