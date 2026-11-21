// Vice City Cover Art Engine v2.0 - Multi-panel layout, color grading, Hollywood billing block & genre accents

/**
 * Draws a multi-panel cover art onto the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} state - State with layout, grade, title, subtitle, tagline, panels, accents
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const {
    layout = 'grid4',
    grade = 'sunset',
    title = 'SUNSET HEIST',
    subtitle = 'VICE CITY · 2026',
    tagline = 'TRUST · VICE CITY · 2026',
    panels = [],
    showBilling = true,
    showLaurels = true,
    showQuote = true,
    showRibbon = true
  } = state;

  // Background
  ctx.fillStyle = '#06070c';
  ctx.fillRect(0, 0, w, h);

  // Compute panel bounding boxes
  const gutter = Math.max(8, Math.round(w * 0.012));
  const bottomReserve = showBilling ? Math.round(h * 0.09) : 0;
  const contentH = h - bottomReserve;
  const boxes = getLayoutBoxes(layout, w, contentH, gutter);

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

    if (img && img.naturalWidth) {
      // Draw image to fill box
      const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * zoom;
      const pw = img.naturalWidth * scale;
      const ph = img.naturalHeight * scale;
      const cx = box.x + (box.w - pw) / 2 + (panX * box.w * 0.2);
      const cy = box.y + (box.h - ph) / 2 + (panY * box.h * 0.2);
      ctx.drawImage(img, cx, cy, pw, ph);
    } else {
      // Fallback stylized dark panel
      ctx.fillStyle = idx % 2 === 0 ? '#14182b' : '#1c152a';
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }

    // Apply color grade tint per panel
    applyGrade(ctx, box.x, box.y, box.w, box.h, grade);

    // Inner subtle vignette
    const vig = ctx.createRadialGradient(
      box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) * 0.25,
      box.x + box.w / 2, box.y + box.h / 2, Math.max(box.w, box.h) * 0.72
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(box.x, box.y, box.w, box.h);

    ctx.restore();

    // Dark framing stroke around panel
    ctx.lineWidth = gutter;
    ctx.strokeStyle = '#06070c';
    ctx.strokeRect(box.x, box.y, box.w, box.h);
  });

  // Overall outer framing
  ctx.lineWidth = gutter * 2;
  ctx.strokeStyle = '#06070c';
  ctx.strokeRect(0, 0, w, h);

  // Decorative Accents
  if (showLaurels) {
    drawFestivalLaurels(ctx, Math.round(w * 0.2), Math.round(h * 0.15), Math.round(w * 0.08));
  }

  if (showQuote) {
    drawReviewQuote(ctx, Math.round(w * 0.8), Math.round(h * 0.15), Math.round(w * 0.32));
  }

  if (showRibbon && tagline) {
    drawTaglineRibbon(ctx, w / 2, Math.round(h * 0.72), tagline);
  }

  // Genre Lettering & Typography
  drawLettering(ctx, w, h, title, subtitle, showBilling);

  // Official Movie Billing Block
  if (showBilling) {
    drawBillingBlock(ctx, w, h);
  }
}

function getLayoutBoxes(layout, w, h, g) {
  const boxes = [];
  if (layout === 'single') {
    boxes.push({ x: g, y: g, w: w - 2 * g, h: h - 2 * g });
  } else if (layout === 'split3') {
    const topH = Math.round((h - 3 * g) * 0.58);
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
  } else if (layout === 'comic6') {
    const halfW = Math.round((w - 3 * g) / 2);
    const thirdH = Math.round((h - 4 * g) / 3);
    for (let r = 0; r < 3; r++) {
      const y = g + r * (thirdH + g);
      boxes.push({ x: g, y, w: halfW, h: thirdH });
      boxes.push({ x: halfW + 2 * g, y, w: w - halfW - 3 * g, h: thirdH });
    }
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
    grad.addColorStop(0, 'rgba(40, 15, 80, 0.22)');
    grad.addColorStop(0.45, 'rgba(255, 45, 135, 0.38)');
    grad.addColorStop(1, 'rgba(255, 140, 30, 0.58)');
  } else if (grade === 'golden') {
    grad.addColorStop(0, 'rgba(80, 40, 10, 0.18)');
    grad.addColorStop(0.55, 'rgba(255, 175, 25, 0.38)');
    grad.addColorStop(1, 'rgba(240, 95, 15, 0.58)');
  } else if (grade === 'night') {
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
    grad.addColorStop(0.55, 'rgba(70, 20, 120, 0.42)');
    grad.addColorStop(1, 'rgba(12, 6, 26, 0.72)');
  } else if (grade === 'poster') {
    grad.addColorStop(0, 'rgba(255, 235, 160, 0.22)');
    grad.addColorStop(0.7, 'rgba(180, 120, 80, 0.35)');
    grad.addColorStop(1, 'rgba(30, 18, 35, 0.55)');
  } else if (grade === 'heatwave') {
    grad.addColorStop(0, 'rgba(255, 20, 80, 0.32)');
    grad.addColorStop(0.5, 'rgba(255, 220, 0, 0.28)');
    grad.addColorStop(1, 'rgba(10, 5, 20, 0.75)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

function drawFestivalLaurels(ctx, cx, cy, radius) {
  ctx.save();
  ctx.strokeStyle = '#ffd000';
  ctx.fillStyle = '#ffd000';
  ctx.lineWidth = Math.max(2, Math.round(radius * 0.04));

  // Left laurel branch
  ctx.beginPath();
  ctx.arc(cx - radius * 0.5, cy, radius * 0.7, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();

  // Right laurel branch
  ctx.beginPath();
  ctx.arc(cx + radius * 0.5, cy, radius * 0.7, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  // Little leaves along the branches
  for (let a = -0.3; a <= 0.3; a += 0.15) {
    const lx = cx - radius * 0.5 + Math.cos(Math.PI + a) * (radius * 0.7);
    const ly = cy + Math.sin(Math.PI + a) * (radius * 0.7);
    ctx.beginPath();
    ctx.ellipse(lx - 4, ly, 6, 3, a, 0, Math.PI * 2);
    ctx.fill();

    const rx = cx + radius * 0.5 + Math.cos(a) * (radius * 0.7);
    const ry = cy + Math.sin(a) * (radius * 0.7);
    ctx.beginPath();
    ctx.ellipse(rx + 4, ry, 6, 3, a, 0, Math.PI * 2);
    ctx.fill();
  }

  // Centered festival text
  const fontSize = Math.max(9, Math.round(radius * 0.16));
  ctx.font = `800 ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('OFFICIAL SELECTION', cx, cy - fontSize * 0.9);
  ctx.font = `900 ${fontSize + 1}px sans-serif`;
  ctx.fillText('LEONIDA FILM FESTIVAL', cx, cy + fontSize * 0.3);
  ctx.font = `700 ${fontSize - 1}px sans-serif`;
  ctx.fillText('2026', cx, cy + fontSize * 1.5);

  ctx.restore();
}

function drawReviewQuote(ctx, cx, cy, maxWidth) {
  ctx.save();
  ctx.textAlign = 'center';

  // Gold 5 Stars
  const starSize = Math.max(12, Math.round(maxWidth * 0.08));
  ctx.font = `900 ${starSize}px sans-serif`;
  ctx.fillStyle = '#ffd000';
  ctx.shadowColor = 'rgba(255, 208, 0, 0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText('★ ★ ★ ★ ★', cx, cy - starSize * 0.6);
  ctx.shadowBlur = 0;

  // Review Quote
  const quoteSize = Math.max(10, Math.round(maxWidth * 0.055));
  ctx.font = `italic 700 ${quoteSize}px sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('"MOST ANTICIPATED MASTERPIECE"', cx, cy + quoteSize * 0.8);

  // Source attribution
  const attrSize = Math.max(8, Math.round(quoteSize * 0.75));
  ctx.font = `800 ${attrSize}px sans-serif`;
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('— VICE CITY GAZETTE', cx, cy + quoteSize * 2.0);

  ctx.restore();
}

function drawTaglineRibbon(ctx, cx, cy, text) {
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  const fontSize = Math.max(12, Math.round(cy * 0.026));
  ctx.font = `900 ${fontSize}px sans-serif`;

  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const padX = fontSize * 1.6;
  const padY = fontSize * 0.6;
  const rw = textWidth + padX * 2;
  const rh = fontSize + padY * 2;
  const rx = cx - rw / 2;
  const ry = cy - rh / 2;

  // Ribbon pill background
  const bgGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry);
  bgGrad.addColorStop(0, 'rgba(255, 42, 133, 0.85)');
  bgGrad.addColorStop(1, 'rgba(0, 240, 255, 0.85)');
  ctx.fillStyle = bgGrad;

  // Rounded pill
  ctx.beginPath();
  const radius = rh / 2;
  ctx.roundRect ? ctx.roundRect(rx, ry, rw, rh, radius) : ctx.rect(rx, ry, rw, rh);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText(text.toUpperCase(), cx, cy + fontSize * 0.36);

  ctx.restore();
}

function drawLettering(ctx, w, h, title, subtitle, hasBilling) {
  const tText = (title || '').trim().toUpperCase();
  const sText = (subtitle || '').trim().toUpperCase();
  if (!tText && !sText) return;

  const btmReserve = hasBilling ? Math.round(h * 0.09) : 0;
  const btmY = h - btmReserve - Math.round(h * 0.04);

  // Background banner backing
  const bannerH = Math.round(h * 0.22);
  const bannerY = h - btmReserve - bannerH;
  const bgGrad = ctx.createLinearGradient(0, bannerY, 0, h - btmReserve);
  bgGrad.addColorStop(0, 'rgba(6, 7, 12, 0)');
  bgGrad.addColorStop(0.35, 'rgba(6, 7, 12, 0.86)');
  bgGrad.addColorStop(1, 'rgba(6, 7, 12, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, bannerY, w, bannerH);

  // Subtitle
  if (sText) {
    const subSize = Math.max(14, Math.round(h * 0.026));
    ctx.font = `800 ${subSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.65)';
    ctx.shadowBlur = 8;
    ctx.fillText(sText, w / 2, btmY - Math.round(h * 0.076));
    ctx.shadowBlur = 0;
  }

  // Main Title
  if (tText) {
    let titleSize = Math.round(h * 0.082);
    ctx.font = `900 ${titleSize}px sans-serif`;
    while (ctx.measureText(tText).width > w * 0.90 && titleSize > 18) {
      titleSize -= 2;
      ctx.font = `900 ${titleSize}px sans-serif`;
    }

    ctx.textAlign = 'center';

    // Deep drop shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(tText, w / 2 + 5, btmY + 5);

    // Thick outer border
    ctx.lineWidth = Math.max(6, Math.round(titleSize * 0.12));
    ctx.strokeStyle = '#040508';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(tText, w / 2, btmY);

    // Fill with gradient
    const titleGrad = ctx.createLinearGradient(0, btmY - titleSize, 0, btmY);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.65, '#f5f7fc');
    titleGrad.addColorStop(1, '#ffd000');
    ctx.fillStyle = titleGrad;
    ctx.fillText(tText, w / 2, btmY);
  }
}

function drawBillingBlock(ctx, w, h) {
  ctx.save();
  const barH = Math.round(h * 0.09);
  const barY = h - barH;

  // Solid dark billing bar
  ctx.fillStyle = '#06070c';
  ctx.fillRect(0, barY, w, barH);

  // Top separator hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(w, barY);
  ctx.stroke();

  // Hollywood Billing credits lines
  const fontSize = Math.max(7, Math.round(barH * 0.14));
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9aa8c7';

  const lineSpacing = fontSize * 1.55;
  const startY = barY + barH * 0.26;

  ctx.fillText("ROCKSTAR GAMES PRESENTS A FILM BY JASON & LUCIA 'VICE CITY HEIST'", w / 2, startY);
  ctx.fillText("STARRING LEONIDA CRIMINALS · MUSIC BY VICE SOUND SYSTEM · COSTUMES BY OCEAN DRIVE", w / 2, startY + lineSpacing);
  ctx.fillText("EDITED BY SAM HOUSER · PRODUCTION DESIGN AARON GARBUT · EXECUTIVE PRODUCERS ROB NELSON", w / 2, startY + lineSpacing * 2);
  ctx.fillStyle = '#ffd000';
  ctx.fillText("RATED M FOR MATURE 17+ · SOUNDTRACK ON LEONIDA RECORDS · WWW.ROCKSTARGAMES.COM/VI", w / 2, startY + lineSpacing * 3);

  ctx.restore();
}
