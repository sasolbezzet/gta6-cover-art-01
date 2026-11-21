// Vice City Cover Studio Pro - Interactive Controller & State Engine
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover-canvas');
const titleInput = document.getElementById('title-input');
const subInput = document.getElementById('sub-input');
const taglineInput = document.getElementById('tagline-input');
const btnExport = document.getElementById('btn-export');
const exportStatus = document.getElementById('export-status');
const slotsContainer = document.getElementById('panel-slots-container');
const dimIndicator = document.getElementById('canvas-dim-indicator');
const layoutIndicator = document.getElementById('layout-indicator');

const toggleBilling = document.getElementById('toggle-billing');
const toggleLaurels = document.getElementById('toggle-laurels');
const toggleQuote = document.getElementById('toggle-quote');
const toggleRibbon = document.getElementById('toggle-ribbon');

// Size Dimensions
const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080 px (1:1)' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350 px (4:5)' },
  landscape: { w: 1920, h: 1080, label: '1920 x 1080 px (16:9)' }
};

// Preset sample photos
const SAMPLES = [
  { id: 'pier', name: 'Ocean Beach Pier', path: './samples/pier.jpg' },
  { id: 'boulevard', name: 'Vice Boulevard', path: './samples/boulevard.jpg' },
  { id: 'rooftop', name: 'Downtown Skyline', path: './samples/rooftop.jpg' },
  { id: 'neon', name: 'Ocean Drive Neon', path: './samples/neon.jpg' }
];

// App State
const state = {
  size: 'square',
  layout: 'grid4',
  grade: 'sunset',
  title: 'SUNSET HEIST',
  subtitle: 'VICE CITY · 2026',
  tagline: 'TRUST · VICE CITY · 2026',
  showBilling: true,
  showLaurels: true,
  showQuote: true,
  showRibbon: true,
  panels: [
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'pier' },
    { image: null, zoom: 1.1, panX: 0, panY: 0, sampleKey: 'boulevard' },
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'rooftop' },
    { image: null, zoom: 1.05, panX: 0, panY: 0, sampleKey: 'neon' },
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'pier' },
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'boulevard' }
  ]
};

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function preloadDefaultSamples() {
  for (let i = 0; i < state.panels.length; i++) {
    const sample = SAMPLES[i % SAMPLES.length];
    try {
      state.panels[i].image = await loadImage(sample.path);
    } catch (e) {
      // Ignored
    }
  }
}

function updateCanvasSize() {
  const dims = SIZES[state.size] || SIZES.square;
  canvas.width = dims.w;
  canvas.height = dims.h;
  if (dimIndicator) dimIndicator.textContent = dims.label;
  if (layoutIndicator) layoutIndicator.textContent = state.layout.toUpperCase();
}

function render() {
  state.title = titleInput.value;
  state.subtitle = subInput.value;
  state.tagline = taglineInput.value;
  state.showBilling = toggleBilling.checked;
  state.showLaurels = toggleLaurels.checked;
  state.showQuote = toggleQuote.checked;
  state.showRibbon = toggleRibbon.checked;
  drawCover(canvas, state);
}

function buildSlotControls() {
  slotsContainer.replaceChildren();
  const count = state.layout === 'single' ? 1 : state.layout === 'split3' ? 3 : state.layout === 'montage5' ? 5 : state.layout === 'comic6' ? 6 : 4;

  for (let i = 0; i < count; i++) {
    const p = state.panels[i];
    const card = document.createElement('div');
    card.className = 'slot-card';

    const header = document.createElement('div');
    header.className = 'slot-header';
    header.textContent = `Panel #${i + 1}`;
    card.append(header);

    const controls = document.createElement('div');
    controls.className = 'slot-controls';

    const select = document.createElement('select');
    select.title = `Choose sample photo for Panel #${i + 1}`;
    for (const s of SAMPLES) {
      const opt = document.createElement('option');
      opt.value = s.path;
      opt.textContent = s.name;
      if (s.id === p.sampleKey) opt.selected = true;
      select.append(opt);
    }

    select.addEventListener('change', async () => {
      p.image = await loadImage(select.value);
      const found = SAMPLES.find(x => x.path === select.value);
      if (found) p.sampleKey = found.id;
      render();
    });

    const zoomRow = document.createElement('div');
    zoomRow.className = 'slider-row';
    const zoomLabel = document.createElement('span');
    zoomLabel.textContent = 'Zoom:';
    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.min = '0.8';
    zoomSlider.max = '2.0';
    zoomSlider.step = '0.05';
    zoomSlider.value = String(p.zoom || 1.0);
    zoomSlider.addEventListener('input', () => {
      p.zoom = parseFloat(zoomSlider.value);
      render();
    });
    zoomRow.append(zoomLabel, zoomSlider);

    controls.append(select, zoomRow);
    card.append(controls);
    slotsContainer.append(card);
  }
}

function initEventListeners() {
  titleInput.addEventListener('input', render);
  subInput.addEventListener('input', render);
  taglineInput.addEventListener('input', render);

  toggleBilling.addEventListener('change', render);
  toggleLaurels.addEventListener('change', render);
  toggleQuote.addEventListener('change', render);
  toggleRibbon.addEventListener('change', render);

  // Size buttons
  document.querySelectorAll('#size-selector .opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#size-selector .opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.size = btn.dataset.size;
      updateCanvasSize();
      render();
    });
  });

  // Layout buttons
  document.querySelectorAll('#layout-selector .opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#layout-selector .opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.layout = btn.dataset.layout;
      buildSlotControls();
      updateCanvasSize();
      render();
    });
  });

  // Grade buttons
  document.querySelectorAll('#grade-selector .opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#grade-selector .opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.grade = btn.dataset.grade;
      render();
    });
  });

  // Export action
  btnExport.addEventListener('click', () => {
    render();
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GTA6_COVER_${state.layout.toUpperCase()}_${state.size.toUpperCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      exportStatus.textContent = 'Cover Art PNG successfully exported!';
      setTimeout(() => { exportStatus.textContent = ''; }, 3000);
    }, 'image/png');
  });
}

// Check query params for screenshot headless runner
const params = new URLSearchParams(window.location.search);
const shotMode = params.get('shot');

if (shotMode) {
  // Headless screenshot mode
  runShot(canvas, state, params).then(() => {
    document.body.classList.add('shot-ready');
  });
} else {
  // Interactive mode
  (async () => {
    await preloadDefaultSamples();
    updateCanvasSize();
    buildSlotControls();
    initEventListeners();
    render();
  })();
}
