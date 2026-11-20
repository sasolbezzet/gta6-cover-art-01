// Vice City Cover Studio - Main Interactive Application Entrypoint
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover-canvas');
const titleInput = document.getElementById('title-input');
const subInput = document.getElementById('sub-input');
const btnExport = document.getElementById('btn-export');
const exportStatus = document.getElementById('export-status');
const slotsContainer = document.getElementById('panel-slots-container');

// Size Dimensions
const SIZES = {
  square: { w: 1080, h: 1080, label: '1080x1080' },
  portrait: { w: 1080, h: 1350, label: '1080x1350' },
  landscape: { w: 1920, h: 1080, label: '1920x1080' }
};

// Preset sample photos
const SAMPLES = [
  { id: 'pier', name: 'Ocean Beach Pier', path: './samples/pier.jpg' },
  { id: 'boulevard', name: 'Boulevard Boulevard', path: './samples/boulevard.jpg' },
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
  panels: [
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'pier' },
    { image: null, zoom: 1.1, panX: 0, panY: 0, sampleKey: 'boulevard' },
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'rooftop' },
    { image: null, zoom: 1.05, panX: 0, panY: 0, sampleKey: 'neon' },
    { image: null, zoom: 1.0, panX: 0, panY: 0, sampleKey: 'pier' }
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
}

function render() {
  state.title = titleInput.value;
  state.subtitle = subInput.value;
  drawCover(canvas, state);
}

function buildSlotControls() {
  slotsContainer.replaceChildren();
  const count = state.layout === 'single' ? 1 : state.layout === 'split3' ? 3 : state.layout === 'montage5' ? 5 : 4;

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
      p.sampleKey = select.value;
      render();
    });

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.title = 'Or upload custom image';
    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      p.image = await loadImage(URL.createObjectURL(f));
      render();
    });

    const zoomLabel = document.createElement('label');
    zoomLabel.textContent = 'Zoom';
    const zoomRange = document.createElement('input');
    zoomRange.type = 'range';
    zoomRange.min = '1.0';
    zoomRange.max = '2.5';
    zoomRange.step = '0.05';
    zoomRange.value = String(p.zoom);
    zoomRange.addEventListener('input', () => {
      p.zoom = parseFloat(zoomRange.value);
      render();
    });
    zoomLabel.append(zoomRange);

    controls.append(select, fileInput, zoomLabel);
    card.append(controls);
    slotsContainer.append(card);
  }
}

// Button group bindings
function bindButtonGroup(groupId, stateKey, onSwitch) {
  const container = document.getElementById(groupId);
  if (!container) return;
  const buttons = container.querySelectorAll('.opt-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[stateKey] = btn.dataset[stateKey.toLowerCase()] || btn.dataset.size || btn.dataset.layout || btn.dataset.grade;
      if (onSwitch) onSwitch();
      render();
    });
  });
}

bindButtonGroup('size-selector', 'size', () => {
  updateCanvasSize();
});

bindButtonGroup('layout-selector', 'layout', () => {
  buildSlotControls();
});

bindButtonGroup('grade-selector', 'grade');

titleInput.addEventListener('input', render);
subInput.addEventListener('input', render);

btnExport.addEventListener('click', () => {
  const dims = SIZES[state.size] || SIZES.square;
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${dims.label}.png`;
    a.click();
    exportStatus.textContent = `Exported lossless vice-city-cover-${dims.label}.png`;
  }, 'image/png');
});

// Initialization
await preloadDefaultSamples();
updateCanvasSize();
buildSlotControls();
render();

// Screenshot query parameter handling
const urlParams = new URLSearchParams(location.search);
const shot = urlParams.get('shot');
if (shot) {
  runShot(shot, urlParams, async (scene) => {
    state.layout = scene.layout;
    state.grade = scene.grade;
    state.size = scene.size;
    state.title = scene.title;
    state.subtitle = scene.subtitle;
    updateCanvasSize();
    buildSlotControls();
    render();
  });
}
