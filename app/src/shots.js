// Headless screenshot runner for gta6-cover-art-01
import { drawCover } from './cover.js';
import { loadImage } from './main.js';

export async function runShot(canvas, state, query) {
  const shot = query.get('shot');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // Hide sidebars if full cover shot
    const leftBar = document.querySelector('.sidebar-left');
    const rightBar = document.querySelector('.sidebar-right');
    const toolbar = document.querySelector('.viewport-toolbar');
    if (leftBar) leftBar.style.display = 'none';
    if (rightBar) rightBar.style.display = 'none';
    if (toolbar) toolbar.style.display = 'none';
    document.querySelector('.studio-app').style.gridTemplateColumns = '1fr';
    document.querySelector('.canvas-viewport').style.padding = '0';
  }

  state.layout = query.get('layout') || state.layout || 'grid4';
  state.grade = query.get('grade') || state.grade || 'sunset';
  state.size = query.get('size') || state.size || 'square';
  state.title = query.get('title') || state.title || 'SUNSET HEIST';
  state.subtitle = query.get('sub') || state.subtitle || 'VICE CITY · 2026';
  state.tagline = query.get('tagline') || state.tagline || 'TRUST · VICE CITY · 2026';

  state.showBilling = query.get('billing') !== 'false';
  state.showLaurels = query.get('laurels') !== 'false';
  state.showQuote = query.get('quote') !== 'false';
  state.showRibbon = query.get('ribbon') !== 'false';

  // Set canvas dimensions
  if (state.size === 'portrait') {
    canvas.width = 1080;
    canvas.height = 1350;
  } else if (state.size === 'landscape') {
    canvas.width = 1920;
    canvas.height = 1080;
  } else {
    canvas.width = 1080;
    canvas.height = 1080;
  }

  // Preload sample photos
  const samplePaths = [
    './samples/pier.jpg',
    './samples/boulevard.jpg',
    './samples/rooftop.jpg',
    './samples/neon.jpg'
  ];

  for (let i = 0; i < state.panels.length; i++) {
    const p = samplePaths[i % samplePaths.length];
    try {
      state.panels[i].image = await loadImage(p);
    } catch (e) {
      // Ignored
    }
  }

  // Draw final cover
  drawCover(canvas, state);

  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__shotReady = true;
        resolve();
      });
    });
  });
}
