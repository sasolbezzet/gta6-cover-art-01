// Fixed scenes for screenshots:
// ?shot=cover shows the canvas cover alone (fullscreen)
// ?shot=editor shows the editor UI with sample photos loaded
export async function runShot(shot, query, loadScene) {
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }
  const layout = query.get('layout') || 'grid4';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || 'square';
  const title = query.get('title') || 'SUNSET HEIST';
  const subtitle = query.get('sub') || 'VICE CITY · 2026';

  await loadScene({ layout, grade, size, title, subtitle });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
