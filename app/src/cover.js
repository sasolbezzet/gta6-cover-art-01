// Vice City Cover Art Engine - Multi-panel layout, color grading & genre lettering

/**
 * Draws a multi-panel cover art onto the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} state - State with layout, grade, title, subtitle, and panel images
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const { layout = 'grid4', grade = 'sunset', title = 'SUNSET HEIST', subtitle = 'VICE CITY · 2026', panels = [] } = state;

  // Background
  ctx.fillStyle = '#080910';
  ctx.fillRect(0, 0, w, h);

  // Compute panel bounding boxes
  const gutter = Math.max(8, Math.round(w * 0.012));
  const boxes = getLayoutBoxes(layout, w, h, gutter);

  // Draw each panel
  boxes.forEach((box, idx) => {
    const pData = panels[idx] || {};
    const img = pData.image;
    const zoom = pData.zoom || 1.0;
    const panX = pData.panX || 0;
    const panY = pData.panY || 0;

    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();

    if (img) {
      // Draw image to fill box
      const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * zoom;
      const pw = img.naturalWidth * scale;
      const ph = img.naturalHeight * scale;
      const cx = box.x + (box.w - pw) / 2 + (panX * box.w * 0.2);
      const cy = box.y + (box.h - ph) / 2 + (panY * box.h * 0.2);
      ctx.drawImage(img, cx, cy, pw, ph);
    } else {
      // Fallback stylized dark panel
      ctx.fillStyle = idx % 2 === 0 ? '#181e36' : '#231b34';
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }

    // Apply color grade tint per panel
    applyGrade(ctx, box.x, box.y, box.w, box.h, grade);

    // Inner subtle vignette
    const vig = ctx.createRadialGradient(
      box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) * 0.3,
      box.x + box.w / 2, box.y + box.h / 2, Math.max(box.w, box.h) * 0.7
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(box.x, box.y, box.w, box.h);

    ctx.restore();

    // Dark framing stroke around panel
    ctx.lineWidth = gutter;
    ctx.strokeStyle = '#080910';
    ctx.strokeRect(box.x, box.y, box.w, box.h);
  });

  // Overall outer framing
  ctx.lineWidth = gutter * 2;
  ctx.strokeStyle = '#080910';
  ctx.strokeRect(0, 0, w, h);

  // Genre Lettering & Typography
  drawLettering(ctx, w, h, title, subtitle);
}

function getLayoutBoxes(layout, w, h, g) {
  const boxes = [];
  if (layout === 'single') {
    boxes.push({ x: g, y: g, w: w - 2 * g, h: h - 2 * g });
  } else if (layout === 'split3') {
    const topH = Math.round((h - 3 * g) * 0.6);
    const btmH = h - 3 * g - topH;
    const halfW = Math.round((w - 3 * g) / 2);
    boxes.push({ x: g, y: g, w: w - 2 * g, h: topH });
    boxes.push({ x: g, y: topH + 2 * g, w: halfW, h: btmH });
    boxes.push({ x: halfW + 2 * g, y: topH + 2 * g, w: w - halfW - 3 * g, h: btmH });
  } else if (layout === 'montage5') {
    const centerW = Math.round((w - 4 * g) * 0.44);
    const sideW = Math.round((w - 4 * g - centerW) / 2);
    const halfH = Math.round((h - 3 * g) / 2);
    // Center hero
    boxes.push({ x: sideW + 2 * g, y: g, w: centerW, h: h - 2 * g });
    // Left top / btm
    boxes.push({ x: g, y: g, w: sideW, h: halfH });
    boxes.push({ x: g, y: halfH + 2 * g, w: sideW, h: h - halfH - 3 * g });
    // Right top / btm
    boxes.push({ x: sideW + centerW + 3 * g, y: g, w: sideW, h: halfH });
    boxes.push({ x: sideW + centerW + 3 * g, y: halfH + 2 * g, w: sideW, h: h - halfH - 3 * g });
  } else {
    // Default: grid4
    const halfW = Math.round((w - 3 * g) / 2);
    const halfH = Math.round((h - 3 * g) / 2);
    boxes.push({ x: g, y: g, w: halfW, h: halfH });
    boxes.push({ x: halfW + 2 * g, y: g, w: w - halfW - 3 * g, h: halfH });
    boxes.push({ x: g, y: halfH + 2 * g, w: halfW, h: h - halfH - 3 * g });
    boxes.push({ x: halfW + 2 * g, y: halfH + 2 * g, w: w - halfW - 3 * g, h: h - halfH - 3 * g });
  }
  return boxes;
}

function applyGrade(ctx, x, y, w, h, grade) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  if (grade === 'sunset') {
    grad.addColorStop(0, 'rgba(40, 15, 80, 0.2)');
    grad.addColorStop(0.5, 'rgba(255, 60, 140, 0.35)');
    grad.addColorStop(1, 'rgba(255, 140, 40, 0.55)');
  } else if (grade === 'golden') {
    grad.addColorStop(0, 'rgba(80, 40, 10, 0.15)');
    grad.addColorStop(0.6, 'rgba(255, 170, 30, 0.35)');
    grad.addColorStop(1, 'rgba(240, 100, 20, 0.55)');
  } else if (grade === 'night') {
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    grad.addColorStop(0.6, 'rgba(60, 20, 110, 0.4)');
    grad.addColorStop(1, 'rgba(15, 8, 30, 0.65)');
  } else if (grade === 'poster') {
    grad.addColorStop(0, 'rgba(255, 230, 150, 0.2)');
    grad.addColorStop(1, 'rgba(30, 20, 40, 0.5)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

function drawLettering(ctx, w, h, title, subtitle) {
  const tText = (title || '').trim().toUpperCase();
  const sText = (subtitle || '').trim().toUpperCase();
  if (!tText && !sText) return;

  const btmY = h - Math.round(h * 0.08);

  // Background banner backing
  const bannerH = Math.round(h * 0.18);
  const bannerY = h - bannerH;
  const bgGrad = ctx.createLinearGradient(0, bannerY, 0, h);
  bgGrad.addColorStop(0, 'rgba(8, 10, 18, 0)');
  bgGrad.addColorStop(0.35, 'rgba(8, 10, 18, 0.85)');
  bgGrad.addColorStop(1, 'rgba(8, 10, 18, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, bannerY, w, bannerH);

  // Subtitle
  if (sText) {
    const subSize = Math.max(14, Math.round(h * 0.024));
    ctx.font = `800 ${subSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(sText, w / 2, btmY - Math.round(h * 0.075));
    ctx.shadowBlur = 0;
  }

  // Main Title
  if (tText) {
    let titleSize = Math.round(h * 0.08);
    ctx.font = `900 ${titleSize}px sans-serif`;
    while (ctx.measureText(tText).width > w * 0.88 && titleSize > 16) {
      titleSize -= 2;
      ctx.font = `900 ${titleSize}px sans-serif`;
    }

    ctx.textAlign = 'center';

    // Deep drop shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(tText, w / 2 + 5, btmY + 5);

    // Thick outer border
    ctx.lineWidth = Math.max(6, Math.round(titleSize * 0.12));
    ctx.strokeStyle = '#05060b';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(tText, w / 2, btmY);

    // Fill with gradient or pure white
    const titleGrad = ctx.createLinearGradient(0, btmY - titleSize, 0, btmY);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.7, '#f0f5ff');
    titleGrad.addColorStop(1, '#ffd000');
    ctx.fillStyle = titleGrad;
    ctx.fillText(tText, w / 2, btmY);
  }
}
