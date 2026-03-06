"use client";

// ══════════════════════════════════════════════════════════
//  Poetry Museum — Share Image Generator v4
//  Real-world scenes + analog film treatment
//  Top 62% art panel / Bottom 38% quote panel
// ══════════════════════════════════════════════════════════

const W  = 1080;
const H  = 1350;
const AH = Math.round(H * 0.62);   // ~837px art panel
const QH = H - AH;                  // ~513px quote panel

export async function generateShareImage({ text, poem, seed }) {
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const rng  = makeRng(seed || Date.now());
  const pal  = buildPalette(poem.atmosphere);
  const slug = poem.slug || "";

  // ── Route to scene ─────────────────────────────────────────────────
  // "Sorrow"                 — oak by stream, tears, dark sapphire night
  if      (slug === "sorrow")                        sceneOakStream(ctx, W, AH, pal, rng);
  // "To Keats"               — golden autumn sky, soaring birds, warm light
  else if (slug === "to-keats")                      sceneGoldenField(ctx, W, AH, pal, rng);
  // "An Ode to Fireflies"    — moonless dark woods, glimmering emerald lights
  else if (slug === "an-ode-to-fireflies")           sceneFireflies(ctx, W, AH, pal, rng);
  // "When I Die"             — pastoral meadow, moor, daffodils, soft spring
  else if (slug === "when-i-die")                    sceneMeadow(ctx, W, AH, pal, rng);
  // "I've Killed a Butterfly" — dark garden, flower funeral, fireflies
  else if (slug === "ive-killed-a-butterfly-today")  sceneButterflyGarden(ctx, W, AH, pal, rng);
  // "Ten Summers"            — burning pink-amber sky, heat shimmer, ash
  else if (slug === "ten-summers")                   sceneSummerBurn(ctx, W, AH, pal, rng);
  else                                               sceneAtmospheric(ctx, W, AH, pal, rng);

  // ── Film overlays (after scene is drawn) ─────────────
  ctx.filter = "none";
  filmVignette(ctx, W, AH, rng);
  filmColorTint(ctx, W, AH, pal, rng);
  filmGrain(ctx, W, AH, rng);

  // ── Quote panel ──────────────────────────────────────
  ctx.filter = "none";
  ctx.fillStyle = "#f4f0e8";
  ctx.fillRect(0, AH, W, QH);
  ctx.save();
  ctx.strokeStyle = hexRgba(pal.accent, 0.18);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(72, AH); ctx.lineTo(W - 72, AH); ctx.stroke();
  ctx.restore();
  paintQuote(ctx, W, AH, QH, poem, text, pal);

  return canvas.toDataURL("image/png");
}

// ═══════════════════════════════════════════════════════
//  SCENE 1 — THE LAST LIGHT
//  Ref: warm golden dusk sky, dark field, birds in formation
// ═══════════════════════════════════════════════════════
function sceneGoldenField(ctx, w, h, pal, rng) {
  // Sky — deep amber top to bright gold horizon
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,    "#0d0804");
  sky.addColorStop(0.18, "#3d1506");
  sky.addColorStop(0.42, "#8a3d08");
  sky.addColorStop(0.65, "#c47518");
  sky.addColorStop(0.73, "#dea030");
  sky.addColorStop(0.78, "#e8c060");
  sky.addColorStop(1,    "#0a0804");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Ground — near-black field at bottom
  const ground = ctx.createLinearGradient(0, h * 0.73, 0, h);
  ground.addColorStop(0, "#0a0703");
  ground.addColorStop(1, "#030200");
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.73, w, h * 0.27);

  // Horizon sun glow
  ctx.save();
  ctx.filter = "blur(55px)";
  const sunX = w * (0.38 + rng() * 0.24);
  const sunGrad = ctx.createRadialGradient(sunX, h * 0.73, 0, sunX, h * 0.73, w * 0.52);
  sunGrad.addColorStop(0,   "rgba(255,215,90,0.95)");
  sunGrad.addColorStop(0.25,"rgba(230,150,40,0.6)");
  sunGrad.addColorStop(0.6, "rgba(180,80,10,0.2)");
  sunGrad.addColorStop(1,   "transparent");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, h * 0.3, w, h * 0.6);
  ctx.restore();

  // Horizon line glow
  ctx.save();
  ctx.filter = "blur(4px)";
  ctx.strokeStyle = "rgba(255,230,120,0.55)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.73); ctx.lineTo(w, h * 0.73);
  ctx.stroke();
  ctx.restore();

  // BIRDS — two loose flocks, diagonal formation
  const flockOriginX = w * (0.22 + rng() * 0.28);
  const flockOriginY = h * (0.14 + rng() * 0.16);

  // Main flock — 14-20 birds in rising diagonal
  ctx.save();
  ctx.filter = "blur(1.2px)";
  ctx.strokeStyle = "rgba(6,4,2,0.88)";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  const mainCount = 14 + Math.floor(rng() * 8);
  for (let i = 0; i < mainCount; i++) {
    const t = i / mainCount;
    const bx = flockOriginX + t * w * 0.48 + (rng() - 0.5) * 55;
    const by = flockOriginY - t * h * 0.12 + (rng() - 0.5) * 40;
    const sz = 18 - t * 5 + rng() * 8;
    drawBird(ctx, bx, by, sz);
  }
  ctx.restore();

  // Second distant flock — smaller, higher
  ctx.save();
  ctx.filter = "blur(2.5px)";
  ctx.strokeStyle = "rgba(10,6,2,0.45)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const distCount = 7 + Math.floor(rng() * 6);
  for (let i = 0; i < distCount; i++) {
    const bx = w * 0.55 + i * 28 + (rng() - 0.5) * 35;
    const by = h * (0.07 + rng() * 0.09) + i * 5;
    drawBird(ctx, bx, by, 8 + rng() * 7);
  }
  ctx.restore();

  // Field texture — faint dark grass suggestion
  ctx.save();
  ctx.filter = "blur(3px)";
  ctx.strokeStyle = "rgba(8,5,1,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const gx = rng() * w;
    const gy = h * 0.73 + rng() * h * 0.27;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (rng()-0.5)*20, gy - 15 - rng()*25);
    ctx.stroke();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE 2 — SALT & CARTOGRAPHY
//  Ref: deep blue underwater bokeh, soft light circles, horizon
// ═══════════════════════════════════════════════════════
function sceneOceanBokeh(ctx, w, h, pal, rng) {
  // Deep ocean gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   "#04101e");
  bg.addColorStop(0.3, "#071828");
  bg.addColorStop(0.6, "#0a2038");
  bg.addColorStop(1,   "#051018");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Horizon light band — light from the surface
  ctx.save();
  ctx.filter = "blur(65px)";
  const horizY = h * (0.38 + rng() * 0.12);
  const horizGrad = ctx.createLinearGradient(0, horizY - 100, 0, horizY + 150);
  horizGrad.addColorStop(0,   "transparent");
  horizGrad.addColorStop(0.4, "rgba(85,145,190,0.38)");
  horizGrad.addColorStop(0.6, "rgba(70,120,165,0.28)");
  horizGrad.addColorStop(1,   "transparent");
  ctx.fillStyle = horizGrad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Wave strokes — layered horizontal curves
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const wy = h * (0.1 + i * 0.053 + rng() * 0.018);
    const alpha = 0.06 + rng() * 0.15;
    const blurPx = 1 + rng() * 4;
    ctx.filter = `blur(${blurPx}px)`;
    ctx.strokeStyle = `rgba(100,170,215,${alpha})`;
    ctx.lineWidth = 0.7 + rng() * 2.8;
    ctx.beginPath();
    ctx.moveTo(-10, wy);
    const freq = 1.8 + rng() * 3;
    const amp  = 7  + rng() * 28;
    const phase = rng() * Math.PI * 2;
    for (let x = 0; x <= w + 10; x += 18) {
      ctx.lineTo(x, wy + Math.sin((x / w) * Math.PI * freq + phase) * amp);
    }
    ctx.stroke();
  }
  ctx.restore();

  // BOKEH circles — scattered soft orbs, like underwater light
  ctx.save();
  const bokehCount = 22 + Math.floor(rng() * 14);
  for (let i = 0; i < bokehCount; i++) {
    const bx = rng() * w;
    const by = rng() * h;
    const br = 8 + rng() * 72;
    const alpha = 0.05 + rng() * 0.18;
    ctx.filter = `blur(${br * 0.9}px)`;
    const bokehGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br * 1.8);
    bokehGrad.addColorStop(0,   `rgba(210,240,255,${alpha * 2.5})`);
    bokehGrad.addColorStop(0.45,`rgba(150,205,235,${alpha * 1.2})`);
    bokehGrad.addColorStop(0.8, `rgba(80,140,185,${alpha * 0.4})`);
    bokehGrad.addColorStop(1,   "transparent");
    ctx.fillStyle = bokehGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Faint map grid — cartography reference
  ctx.save();
  ctx.filter = "blur(1.5px)";
  ctx.strokeStyle = "rgba(100,160,200,0.055)";
  ctx.lineWidth = 0.6;
  const gridX = 8, gridY = 7;
  for (let i = 0; i <= gridX; i++) {
    ctx.beginPath(); ctx.moveTo(i * (w / gridX), 0); ctx.lineTo(i * (w / gridX), h); ctx.stroke();
  }
  for (let j = 0; j <= gridY; j++) {
    ctx.beginPath(); ctx.moveTo(0, j * (h / gridY)); ctx.lineTo(w, j * (h / gridY)); ctx.stroke();
  }
  // Compass rose hint
  const cx = w * (0.72 + rng() * 0.15), cy = h * (0.72 + rng() * 0.15);
  ctx.strokeStyle = "rgba(100,160,200,0.09)";
  ctx.lineWidth = 0.8;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 55, cy + Math.sin(a) * 55);
    ctx.stroke();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE 3 — MUSEUM OF SMALL THINGS
//  Ref: warm interior, overexposed light, object silhouettes on shelf
// ═══════════════════════════════════════════════════════
function sceneWarmInterior(ctx, w, h, pal, rng) {
  // Warm amber base
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0,   "#8a6530");
  bg.addColorStop(0.35,"#a07840");
  bg.addColorStop(0.7, "#7a5520");
  bg.addColorStop(1,   "#5a3a10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Overexposed light center (like image 11 — bright window/doorway)
  ctx.save();
  ctx.filter = "blur(90px)";
  const lx = w * (0.42 + rng() * 0.16);
  const ly = h * (0.25 + rng() * 0.15);
  const centerLight = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.65);
  centerLight.addColorStop(0,   "rgba(255,252,235,1.0)");
  centerLight.addColorStop(0.15,"rgba(255,240,200,0.95)");
  centerLight.addColorStop(0.4, "rgba(240,210,150,0.7)");
  centerLight.addColorStop(0.75,"rgba(190,145,70,0.3)");
  centerLight.addColorStop(1,   "transparent");
  ctx.fillStyle = centerLight;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Vertical light shafts — curtain-filtered light
  ctx.save();
  const shaftCount = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < shaftCount; i++) {
    const sx = w * (0.08 + i * 0.21 + (rng() - 0.5) * 0.07);
    const sw = 50 + rng() * 80;
    ctx.filter = `blur(${18 + rng() * 20}px)`;
    const shaftGrad = ctx.createLinearGradient(sx, 0, sx + sw, h);
    shaftGrad.addColorStop(0,   `rgba(255,248,220,${0.18 + rng() * 0.14})`);
    shaftGrad.addColorStop(0.5, `rgba(240,225,180,${0.12 + rng() * 0.10})`);
    shaftGrad.addColorStop(1,   "transparent");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(sx - 10, 0, sw + 20, h);
  }
  ctx.restore();

  // Museum shelf — a horizontal surface in lower third
  const shelfY = h * (0.64 + rng() * 0.06);
  ctx.save();
  ctx.filter = "blur(2px)";
  ctx.fillStyle = "rgba(60,35,10,0.45)";
  ctx.fillRect(w * 0.08, shelfY, w * 0.84, 4);

  // Object silhouettes — cups, vases, bottles
  ctx.globalAlpha = 1;
  const objCount = 5 + Math.floor(rng() * 4);
  for (let i = 0; i < objCount; i++) {
    const ox = w * (0.14 + i * (0.72 / objCount) + rng() * 0.05);
    const ow = 24 + rng() * 52;
    const oh = 35 + rng() * 95;
    const type = Math.floor(rng() * 3); // 0=bottle, 1=cup, 2=vase
    ctx.fillStyle = `rgba(${c(40 + rng()*20)},${c(22 + rng()*15)},${c(8 + rng()*10)},${0.3 + rng()*0.35})`;
    drawObject(ctx, ox, shelfY, ow, oh, type, rng);
  }
  ctx.restore();

  // Dust particles — floating specks
  ctx.save();
  ctx.filter = "blur(1.5px)";
  for (let i = 0; i < 40; i++) {
    const px = rng() * w;
    const py = rng() * h * 0.65;
    const pr = 1.5 + rng() * 3.5;
    ctx.globalAlpha = 0.08 + rng() * 0.18;
    ctx.fillStyle = "rgba(255,240,200,1)";
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE 4 — INSTRUCTIONS FOR WINTER
//  Ref: bold tree silhouette + reflection, strong color wash (img 12)
// ═══════════════════════════════════════════════════════
function sceneTreeReflection(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);

  // Sky half — muted version of accent color
  const skyR = c(ar * 0.55 + 40), skyG = c(ag * 0.45 + 25), skyB = c(ab * 0.65 + 40);
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, `rgb(${c(skyR*0.7)},${c(skyG*0.6)},${c(skyB*0.8)})`);
  sky.addColorStop(1, `rgb(${skyR},${skyG},${skyB})`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.5);

  // Water half — slightly darker
  const water = ctx.createLinearGradient(0, h * 0.5, 0, h);
  water.addColorStop(0, `rgb(${c(skyR*0.85)},${c(skyG*0.75)},${c(skyB*0.9)})`);
  water.addColorStop(1, `rgb(${c(skyR*0.55)},${c(skyG*0.45)},${c(skyB*0.6)})`);
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  // Strong color wash over entire scene (like image 12 — bold monochrome tone)
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.82;
  const toneColor = `rgb(${c(ar*1.15)},${c(ag*0.65)},${c(ab*1.05)})`;
  ctx.fillStyle = toneColor;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Thin color band at horizon (water surface)
  ctx.save();
  ctx.filter = "blur(5px)";
  ctx.fillStyle = `rgba(${c(ar+50)},${c(ag+30)},${c(ab+55)},0.55)`;
  ctx.fillRect(0, h * 0.495, w, 12);
  ctx.restore();

  // Pre-compute tree canopy points (same for tree + reflection)
  const treeCX = w * (0.38 + rng() * 0.24);
  const treeBaseY = h * 0.5;
  const treeH = h * (0.22 + rng() * 0.12);
  const canopyR = 95 + rng() * 130;
  const canopyY = treeBaseY - treeH;
  const canopyPts = [];
  const ptCount = 28;
  for (let i = 0; i <= ptCount; i++) {
    const angle = (i / ptCount) * Math.PI * 2;
    const r = canopyR * (0.72 + rng() * 0.55);
    canopyPts.push([
      treeCX + Math.cos(angle) * r * (0.88 + rng() * 0.28),
      canopyY + Math.sin(angle) * r * 0.72,
    ]);
  }
  const trunkW = 14 + rng() * 18;

  // Tree silhouette
  ctx.save();
  ctx.filter = "blur(2.5px)";
  ctx.fillStyle = `rgba(${c(ar*0.28)},${c(ag*0.18)},${c(ab*0.28)},0.94)`;
  ctx.beginPath();
  ctx.moveTo(canopyPts[0][0], canopyPts[0][1]);
  canopyPts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(treeCX - trunkW/2, canopyY + canopyR * 0.38, trunkW, treeH - canopyR * 0.38);
  ctx.restore();

  // Reflected tree (vertically flipped, below horizon)
  ctx.save();
  ctx.filter = "blur(5px)";
  ctx.globalAlpha = 0.58;
  ctx.fillStyle = `rgba(${c(ar*0.28)},${c(ag*0.18)},${c(ab*0.28)},0.85)`;
  ctx.save();
  ctx.translate(treeCX, treeBaseY);
  ctx.scale(1 + rng() * 0.05, -0.9);
  ctx.translate(-treeCX, -treeBaseY);
  ctx.beginPath();
  ctx.moveTo(canopyPts[0][0], canopyPts[0][1]);
  canopyPts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(treeCX - trunkW/2, canopyY + canopyR * 0.38, trunkW, treeH - canopyR * 0.38);
  ctx.restore();
  ctx.restore();

  // Watercolor grain texture on top
  ctx.save();
  ctx.filter = "blur(0.5px)";
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 200; i++) {
    const px = rng() * w, py = rng() * h;
    ctx.fillStyle = rng() > 0.5 ? "white" : "black";
    ctx.fillRect(px, py, 1 + rng() * 3, 0.8);
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE 5 — APERTURE
//  Ref: dark room, directional light rays from corner, lens circle
// ═══════════════════════════════════════════════════════
function sceneDarkRoom(ctx, w, h, pal, rng) {
  // Very dark near-black background
  ctx.fillStyle = "#03040a";
  ctx.fillRect(0, 0, w, h);

  // Subtle dark texture variations
  ctx.save();
  ctx.filter = "blur(40px)";
  for (let i = 0; i < 4; i++) {
    const gx = rng() * w, gy = rng() * h;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 180 + rng() * 280);
    g.addColorStop(0, `rgba(20,25,45,0.35)`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // Light ray origin — upper-left corner
  const rayX = w * (0.04 + rng() * 0.1);
  const rayY = h * (0.03 + rng() * 0.07);
  const [ar, ag, ab] = hexRgb(pal.accent);

  // LIGHT RAYS — fanning out like image 14
  ctx.save();
  const rayCount = 7 + Math.floor(rng() * 4);
  const spreadStart = 0.15 + rng() * 0.1;
  const spreadEnd   = 0.75 + rng() * 0.15;

  for (let i = 0; i < rayCount; i++) {
    const t = i / (rayCount - 1);
    const angle = spreadStart + t * (spreadEnd - spreadStart);
    const len = h * (0.55 + rng() * 0.45);
    const spreadW = 18 + rng() * 55;
    const alpha = 0.04 + rng() * 0.065;

    ctx.filter = `blur(${10 + rng() * 18}px)`;
    const ex = rayX + Math.cos(angle) * len;
    const ey = rayY + Math.sin(angle) * len;
    const rayGrad = ctx.createLinearGradient(rayX, rayY, ex, ey);
    rayGrad.addColorStop(0,   `rgba(${c(ar+90)},${c(ag+65)},${c(ab+45)},${alpha * 3.5})`);
    rayGrad.addColorStop(0.3, `rgba(${c(ar+50)},${c(ag+35)},${c(ab+20)},${alpha})`);
    rayGrad.addColorStop(1,   "transparent");

    ctx.beginPath();
    ctx.moveTo(
      rayX - Math.cos(angle + Math.PI/2) * spreadW,
      rayY - Math.sin(angle + Math.PI/2) * spreadW
    );
    ctx.lineTo(ex + Math.cos(angle + Math.PI/2) * spreadW * (2 + t * 3),
               ey + Math.sin(angle + Math.PI/2) * spreadW * (2 + t * 3));
    ctx.lineTo(
      rayX + Math.cos(angle + Math.PI/2) * spreadW,
      rayY + Math.sin(angle + Math.PI/2) * spreadW
    );
    ctx.fillStyle = rayGrad;
    ctx.fill();
  }
  ctx.restore();

  // Aperture iris — concentric rings with bright center
  const acx = w * (0.42 + rng() * 0.2);
  const acy = h * (0.38 + rng() * 0.22);
  const outerR = 90 + rng() * 100;
  const innerR = outerR * 0.3;

  ctx.save();
  // Dark ring (the iris opening)
  ctx.filter = "blur(14px)";
  const ringGrad = ctx.createRadialGradient(acx, acy, innerR, acx, acy, outerR * 1.6);
  ringGrad.addColorStop(0,   "transparent");
  ringGrad.addColorStop(0.25,"rgba(0,0,0,0.0)");
  ringGrad.addColorStop(0.55,"rgba(0,0,0,0.75)");
  ringGrad.addColorStop(0.85,"rgba(0,0,0,0.45)");
  ringGrad.addColorStop(1,   "transparent");
  ctx.fillStyle = ringGrad;
  ctx.beginPath(); ctx.arc(acx, acy, outerR * 1.7, 0, Math.PI * 2); ctx.fill();

  // Bright inner light — the wound light comes through
  ctx.filter = "blur(18px)";
  const lightGrad = ctx.createRadialGradient(acx, acy, 0, acx, acy, innerR * 2);
  lightGrad.addColorStop(0,   `rgba(${c(ar+110)},${c(ag+90)},${c(ab+70)},0.95)`);
  lightGrad.addColorStop(0.4, `rgba(${c(ar+60)},${c(ag+45)},${c(ab+30)},0.55)`);
  lightGrad.addColorStop(1,   "transparent");
  ctx.fillStyle = lightGrad;
  ctx.beginPath(); ctx.arc(acx, acy, innerR * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Film scratches — analog artifact
  ctx.save();
  ctx.filter = "blur(0.4px)";
  ctx.strokeStyle = "rgba(180,165,140,0.07)";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 8; i++) {
    const sx = rng() * w;
    ctx.beginPath();
    ctx.moveTo(sx + (rng()-0.5)*8, 0);
    ctx.lineTo(sx + (rng()-0.5)*25, h);
    ctx.stroke();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE 6 — A THEORY OF TIDES
//  Ref: dark water, concentric ripples, golden glow, floating element
// ═══════════════════════════════════════════════════════
function sceneTidalRipples(ctx, w, h, pal, rng) {
  // Dark deep water
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   "#030e0b");
  bg.addColorStop(0.45,"#051610");
  bg.addColorStop(0.8, "#041008");
  bg.addColorStop(1,   "#020806");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle water color atmosphere
  ctx.save();
  ctx.filter = "blur(55px)";
  const [ar, ag, ab] = hexRgb(pal.accent);
  for (let i = 0; i < 5; i++) {
    const gx = rng() * w, gy = rng() * h;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 200 + rng() * 300);
    g.addColorStop(0, `rgba(${c(ar*0.4)},${c(ag*1.3)},${c(ab*1.1)},0.18)`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // Ripple center
  const rcx = w * (0.38 + rng() * 0.24);
  const rcy = h * (0.38 + rng() * 0.22);

  // CONCENTRIC RIPPLE RINGS
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const r = 20 + i * 62 + rng() * 18;
    const alpha = Math.max(0.025, 0.28 - i * 0.024);
    ctx.filter = `blur(${0.5 + i * 0.6}px)`;
    ctx.strokeStyle = `rgba(${c(ar*0.55)},${c(ag*1.4)},${c(ab*1.2)},${alpha})`;
    ctx.lineWidth = Math.max(0.4, 1.6 - i * 0.12);
    ctx.beginPath();
    // Slightly wobbly ellipse for organic water feel
    const ptCount = 80;
    for (let j = 0; j <= ptCount; j++) {
      const angle = (j / ptCount) * Math.PI * 2;
      const wobble = r * (1 + (rng() * 0.022 - 0.011));
      const px = rcx + Math.cos(angle) * wobble;
      const py = rcy + Math.sin(angle) * wobble * 0.82;
      j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Golden glow at center — warm light from beneath
  ctx.save();
  ctx.filter = "blur(35px)";
  const centerGlow = ctx.createRadialGradient(rcx, rcy, 0, rcx, rcy, 150);
  centerGlow.addColorStop(0,   "rgba(210,165,50,0.65)");
  centerGlow.addColorStop(0.4, "rgba(140,110,30,0.35)");
  centerGlow.addColorStop(1,   "transparent");
  ctx.fillStyle = centerGlow;
  ctx.fillRect(rcx - 250, rcy - 250, 500, 500);
  ctx.restore();

  // Floating lotus / water lily (like images 18, 19)
  ctx.save();
  ctx.filter = "blur(1.8px)";
  const petalCount = 8;
  const petalR = 22 + rng() * 16;
  const flowerAlpha = 0.75 + rng() * 0.2;

  // Outer petals
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const px = rcx + Math.cos(angle) * petalR * 0.72;
    const py = rcy + Math.sin(angle) * petalR * 0.52;
    ctx.globalAlpha = flowerAlpha * 0.8;
    ctx.fillStyle = `rgba(225,218,210,0.88)`;
    ctx.beginPath();
    ctx.ellipse(px, py, petalR * 0.68, petalR * 0.42, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  // Inner petals
  for (let i = 0; i < petalCount - 2; i++) {
    const angle = (i / (petalCount-2)) * Math.PI * 2 + 0.3;
    const px = rcx + Math.cos(angle) * petalR * 0.38;
    const py = rcy + Math.sin(angle) * petalR * 0.28;
    ctx.globalAlpha = flowerAlpha;
    ctx.fillStyle = `rgba(240,230,218,0.92)`;
    ctx.beginPath();
    ctx.ellipse(px, py, petalR * 0.45, petalR * 0.28, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  // Center
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,245,210,0.95)";
  ctx.beginPath();
  ctx.arc(rcx, rcy, petalR * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE DEFAULT — atmospheric color field
// ═══════════════════════════════════════════════════════
function sceneAtmospheric(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);
  const bg = ctx.createLinearGradient(0, 0, w * 0.5, h);
  bg.addColorStop(0, `rgb(${c(ar*0.18)},${c(ag*0.13)},${c(ab*0.15)})`);
  bg.addColorStop(1, `rgb(${c(ar*0.09)},${c(ag*0.07)},${c(ab*0.09)})`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.filter = "blur(70px)";
  for (let i = 0; i < 6; i++) {
    const gx = rng() * w, gy = rng() * h;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 200 + rng() * 380);
    g.addColorStop(0, `rgba(${c(ar+rng()*70)},${c(ag+rng()*55)},${c(ab+rng()*80)},0.5)`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE — SORROW
//  Dark blue-violet night, oak tree silhouette, moonlit stream, thistle crowns
// ═══════════════════════════════════════════════════════
function sceneOakStream(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);

  // Deep indigo-black night sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,   "#03040e");
  sky.addColorStop(0.45,"#06091a");
  sky.addColorStop(0.72,"#08102a");
  sky.addColorStop(1,   "#030508");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Moon glow — soft diffuse through leaves
  ctx.save();
  ctx.filter = "blur(70px)";
  const moonX = w * (0.62 + rng() * 0.18);
  const moonG = ctx.createRadialGradient(moonX, h * 0.12, 0, moonX, h * 0.12, 320);
  moonG.addColorStop(0,   "rgba(200,210,245,0.55)");
  moonG.addColorStop(0.4, "rgba(140,155,210,0.22)");
  moonG.addColorStop(1,   "transparent");
  ctx.fillStyle = moonG;
  ctx.fillRect(0, 0, w, h * 0.6);
  ctx.restore();

  // Stars — scattered faint points
  ctx.save();
  for (let i = 0; i < 80; i++) {
    const sx = rng() * w;
    const sy = rng() * h * 0.65;
    const sr = 0.5 + rng() * 1.8;
    ctx.globalAlpha = 0.15 + rng() * 0.55;
    ctx.fillStyle = `rgba(${c(ar+120)},${c(ag+120)},${c(ab+140)},1)`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Stream — reflective silver band across lower third
  const streamY = h * (0.66 + rng() * 0.06);
  ctx.save();
  ctx.filter = "blur(8px)";
  const streamG = ctx.createLinearGradient(0, streamY - 14, 0, streamY + 55);
  streamG.addColorStop(0,   "transparent");
  streamG.addColorStop(0.3, `rgba(${c(ar+80)},${c(ag+90)},${c(ab+120)},0.38)`);
  streamG.addColorStop(0.6, `rgba(${c(ar+60)},${c(ag+70)},${c(ab+100)},0.22)`);
  streamG.addColorStop(1,   "transparent");
  ctx.fillStyle = streamG;
  ctx.fillRect(0, streamY - 14, w, 75);
  ctx.restore();

  // Stream shimmer lines
  ctx.save();
  ctx.filter = "blur(2px)";
  for (let i = 0; i < 9; i++) {
    const ly = streamY + 4 + i * 5 + rng() * 4;
    ctx.strokeStyle = `rgba(${c(ar+100)},${c(ag+110)},${c(ab+135)},${0.08 + rng() * 0.14})`;
    ctx.lineWidth = 0.7 + rng() * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    for (let x = 0; x <= w; x += 22) {
      ctx.lineTo(x, ly + Math.sin(x / 60 + rng()) * (2 + rng() * 5));
    }
    ctx.stroke();
  }
  ctx.restore();

  // OAK TREE — large gnarled silhouette left of center
  const treeCX = w * (0.28 + rng() * 0.12);
  const treeBaseY = streamY;
  const trunkH = h * (0.30 + rng() * 0.10);
  const trunkW = 22 + rng() * 18;

  ctx.save();
  ctx.filter = "blur(1.5px)";
  ctx.fillStyle = "rgba(4,3,8,0.96)";

  // Trunk
  ctx.beginPath();
  ctx.moveTo(treeCX - trunkW/2, treeBaseY);
  ctx.quadraticCurveTo(treeCX - trunkW * 0.7, treeBaseY - trunkH * 0.5, treeCX - trunkW * 0.3, treeBaseY - trunkH);
  ctx.lineTo(treeCX + trunkW * 0.3, treeBaseY - trunkH);
  ctx.quadraticCurveTo(treeCX + trunkW * 0.7, treeBaseY - trunkH * 0.5, treeCX + trunkW/2, treeBaseY);
  ctx.closePath();
  ctx.fill();

  // Canopy — irregular dark mass
  const canopyPts = [];
  const cptCount = 32;
  const canopyR = 140 + rng() * 100;
  const canopyCY = treeBaseY - trunkH - canopyR * 0.38;
  for (let i = 0; i <= cptCount; i++) {
    const a = (i / cptCount) * Math.PI * 2;
    const r = canopyR * (0.62 + rng() * 0.55);
    canopyPts.push([treeCX + Math.cos(a) * r * (0.9 + rng() * 0.22), canopyCY + Math.sin(a) * r * 0.82]);
  }
  ctx.beginPath();
  ctx.moveTo(canopyPts[0][0], canopyPts[0][1]);
  canopyPts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // THISTLE — delicate spiky crowns at base of tree
  ctx.save();
  ctx.filter = "blur(1px)";
  const thistleCount = 5 + Math.floor(rng() * 4);
  for (let i = 0; i < thistleCount; i++) {
    const tx = treeCX - 80 + i * 38 + (rng()-0.5)*20;
    const ty = treeBaseY - 5 - rng() * 15;
    const stemH = 30 + rng() * 50;
    ctx.strokeStyle = `rgba(${c(ar+50)},${c(ag+40)},${c(ab+80)},${0.35 + rng()*0.3})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - stemH); ctx.stroke();
    // Spiky head
    ctx.fillStyle = `rgba(${c(ar+60)},${c(ag+50)},${c(ab+90)},${0.25 + rng()*0.25})`;
    for (let j = 0; j < 8; j++) {
      const sa = (j / 8) * Math.PI * 2;
      const sl = 6 + rng() * 8;
      ctx.beginPath();
      ctx.moveTo(tx, ty - stemH);
      ctx.lineTo(tx + Math.cos(sa)*sl, ty - stemH + Math.sin(sa)*sl);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(tx, ty - stemH, 4 + rng()*3, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();

  // Ground — dark earth
  const groundG = ctx.createLinearGradient(0, streamY, 0, h);
  groundG.addColorStop(0, "rgba(3,4,10,0.0)");
  groundG.addColorStop(0.5, "rgba(3,3,8,0.88)");
  groundG.addColorStop(1, "rgba(2,2,5,0.98)");
  ctx.fillStyle = groundG;
  ctx.fillRect(0, streamY, w, h - streamY);
}

// ═══════════════════════════════════════════════════════
//  SCENE — AN ODE TO FIREFLIES
//  Dark forest floor, scattered emerald firefly lights, tall tree forms
// ═══════════════════════════════════════════════════════
function sceneFireflies(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);

  // Near-black forest night
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   "#030905");
  bg.addColorStop(0.5, "#040d06");
  bg.addColorStop(1,   "#020603");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Forest canopy silhouette at top — dark overlapping mass
  ctx.save();
  ctx.filter = "blur(3px)";
  ctx.fillStyle = "rgba(2,5,2,0.95)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= w; x += 30) {
    const treeH = h * (0.12 + rng() * 0.22);
    ctx.lineTo(x, treeH + Math.sin(x * 0.04) * 40 * rng());
  }
  ctx.lineTo(w, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Tree trunk verticals
  ctx.save();
  ctx.filter = "blur(2px)";
  const trunkCount = 6 + Math.floor(rng() * 4);
  for (let i = 0; i < trunkCount; i++) {
    const tx = w * (0.04 + rng() * 0.92);
    const tw = 8 + rng() * 28;
    ctx.fillStyle = `rgba(2,5,2,${0.7 + rng()*0.28})`;
    ctx.fillRect(tx - tw/2, 0, tw, h);
  }
  ctx.restore();

  // Subtle green atmospheric glow — depth in forest
  ctx.save();
  ctx.filter = "blur(80px)";
  for (let i = 0; i < 4; i++) {
    const gx = rng() * w, gy = h * (0.3 + rng() * 0.5);
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 220 + rng() * 300);
    g.addColorStop(0, `rgba(${c(ar*0.3)},${c(ag*1.1)},${c(ab*0.4)},0.18)`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // FIREFLIES — the stars of the scene
  const flyCount = 55 + Math.floor(rng() * 35);
  ctx.save();
  for (let i = 0; i < flyCount; i++) {
    const fx = rng() * w;
    const fy = h * (0.15 + rng() * 0.72);
    const fr = 2.5 + rng() * 6.5;
    const brightness = 0.45 + rng() * 0.55;
    const warmGreen = rng() > 0.3; // most are warm yellow-green, some cooler

    // Outer halo
    ctx.filter = `blur(${fr * 2.8 + rng() * 8}px)`;
    ctx.globalAlpha = brightness * 0.4;
    const haloG = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr * 5);
    haloG.addColorStop(0, warmGreen ? `rgba(210,255,120,0.8)` : `rgba(160,255,200,0.6)`);
    haloG.addColorStop(1, "transparent");
    ctx.fillStyle = haloG;
    ctx.beginPath(); ctx.arc(fx, fy, fr * 5, 0, Math.PI * 2); ctx.fill();

    // Core bright dot
    ctx.filter = `blur(${fr * 0.4}px)`;
    ctx.globalAlpha = brightness;
    ctx.fillStyle = warmGreen ? "rgba(240,255,160,0.95)" : "rgba(180,255,220,0.88)";
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Ground — dark earth and roots
  const groundG = ctx.createLinearGradient(0, h * 0.75, 0, h);
  groundG.addColorStop(0, "transparent");
  groundG.addColorStop(0.6, "rgba(2,5,2,0.75)");
  groundG.addColorStop(1,  "rgba(1,3,1,0.97)");
  ctx.fillStyle = groundG;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);
}

// ═══════════════════════════════════════════════════════
//  SCENE — WHEN I DIE
//  Soft pastoral: meadow, daffodil field, gentle moor, spring haze
// ═══════════════════════════════════════════════════════
function sceneMeadow(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);

  // Overcast soft sky — light gray-green
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,   "#c8d8b8");
  sky.addColorStop(0.38,"#d8e8c8");
  sky.addColorStop(0.6, "#c0d4a8");
  sky.addColorStop(0.72,"#8aaa60");
  sky.addColorStop(1,   "#304818");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Warm spring light diffusion
  ctx.save();
  ctx.filter = "blur(80px)";
  const lx = w * (0.35 + rng() * 0.30);
  const skyLight = ctx.createRadialGradient(lx, h * 0.18, 0, lx, h * 0.18, w * 0.7);
  skyLight.addColorStop(0,   "rgba(255,252,228,0.75)");
  skyLight.addColorStop(0.4, "rgba(235,240,195,0.35)");
  skyLight.addColorStop(1,   "transparent");
  ctx.fillStyle = skyLight;
  ctx.fillRect(0, 0, w, h * 0.7);
  ctx.restore();

  // Moor horizon — subtle roll of hills
  const hillY = h * (0.58 + rng() * 0.06);
  ctx.save();
  ctx.filter = "blur(4px)";
  ctx.fillStyle = `rgba(${c(ar*0.55+18)},${c(ag*1.1+15)},${c(ab*0.35+8)},0.65)`;
  ctx.beginPath();
  ctx.moveTo(0, hillY);
  for (let x = 0; x <= w; x += 40) {
    ctx.lineTo(x, hillY + Math.sin(x * 0.007 + rng()*0.5) * 28 + rng() * 12);
  }
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Ground meadow
  const meadowG = ctx.createLinearGradient(0, hillY, 0, h);
  meadowG.addColorStop(0, `rgb(${c(ar*0.45+20)},${c(ag*1.05+18)},${c(ab*0.3+10)})`);
  meadowG.addColorStop(0.5,`rgb(${c(ar*0.4+14)},${c(ag*0.9+14)},${c(ab*0.25+8)})`);
  meadowG.addColorStop(1, `rgb(${c(ar*0.3+8)},${c(ag*0.7+10)},${c(ab*0.2+5)})`);
  ctx.fillStyle = meadowG;
  ctx.fillRect(0, hillY, w, h - hillY);

  // DAFFODILS — field of nodding flowers
  ctx.save();
  const daffCount = 32 + Math.floor(rng() * 20);
  for (let i = 0; i < daffCount; i++) {
    const dx = rng() * w;
    const dy = hillY + 10 + rng() * (h - hillY - 30);
    const scale = 0.5 + rng() * 0.9;
    const stemH = (28 + rng() * 42) * scale;
    const alpha = 0.55 + rng() * 0.42;

    // Stem
    ctx.filter = "blur(1px)";
    ctx.strokeStyle = `rgba(60,90,30,${alpha * 0.8})`;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.quadraticCurveTo(dx + (rng()-0.5)*12, dy - stemH*0.6, dx + (rng()-0.5)*8, dy - stemH);
    ctx.stroke();

    // Petals
    ctx.filter = `blur(${0.8 + rng()}px)`;
    ctx.globalAlpha = alpha;
    const petalCount = 6;
    const headX = dx + (rng()-0.5)*8;
    const headY = dy - stemH;
    const pr = (7 + rng() * 7) * scale;

    for (let j = 0; j < petalCount; j++) {
      const pa = (j / petalCount) * Math.PI * 2;
      ctx.fillStyle = "rgba(255,242,100,0.92)";
      ctx.beginPath();
      ctx.ellipse(headX + Math.cos(pa)*pr*0.9, headY + Math.sin(pa)*pr*0.65,
                  pr * 0.55, pr * 0.35, pa, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cup center
    ctx.fillStyle = "rgba(255,210,60,0.95)";
    ctx.beginPath(); ctx.arc(headX, headY, pr * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Spring haze — gentle white veil over distance
  ctx.save();
  ctx.filter = "blur(15px)";
  const hazeG = ctx.createLinearGradient(0, hillY - 40, 0, hillY + 80);
  hazeG.addColorStop(0, "transparent");
  hazeG.addColorStop(0.5, "rgba(245,250,240,0.28)");
  hazeG.addColorStop(1, "transparent");
  ctx.fillStyle = hazeG;
  ctx.fillRect(0, hillY - 40, w, 130);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE — I'VE KILLED A BUTTERFLY TODAY
//  Darkened garden, flowers in mourning, firefly pinpoints, rose shadows
// ═══════════════════════════════════════════════════════
function sceneButterflyGarden(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);

  // Deep burgundy-dark background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   `rgb(${c(ar*0.14)},${c(ag*0.06)},${c(ab*0.08)})`);
  bg.addColorStop(0.55,`rgb(${c(ar*0.18)},${c(ag*0.08)},${c(ab*0.10)})`);
  bg.addColorStop(1,   `rgb(${c(ar*0.08)},${c(ag*0.04)},${c(ab*0.05)})`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft atmospheric color blooms
  ctx.save();
  ctx.filter = "blur(80px)";
  for (let i = 0; i < 5; i++) {
    const gx = rng() * w, gy = rng() * h;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 200 + rng() * 300);
    g.addColorStop(0, `rgba(${c(ar*0.8+20)},${c(ag*0.25)},${c(ab*0.35)},0.30)`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // ROSES in mourning — dark, heavy bloomed silhouettes
  ctx.save();
  const roseCount = 7 + Math.floor(rng() * 5);
  for (let i = 0; i < roseCount; i++) {
    const rx = w * (0.04 + rng() * 0.92);
    const ry = h * (0.35 + rng() * 0.5);
    const rs = 28 + rng() * 52;
    const alpha = 0.18 + rng() * 0.28;

    // Stem
    ctx.filter = "blur(2px)";
    ctx.strokeStyle = `rgba(${c(ar*0.3)},${c(ag*0.25)},${c(ab*0.22)},${alpha * 1.5})`;
    ctx.lineWidth = 2 + rng();
    ctx.beginPath();
    ctx.moveTo(rx, ry + rs);
    ctx.quadraticCurveTo(rx + (rng()-0.5)*20, ry + rs*0.5, rx, ry);
    ctx.stroke();

    // Drooping petals — concentric irregular circles
    ctx.filter = `blur(${2.5 + rng()*3}px)`;
    ctx.globalAlpha = alpha;
    for (let j = 3; j >= 0; j--) {
      const pr = rs * (0.35 + j * 0.22);
      const droopY = ry + j * 6; // droop downward
      ctx.strokeStyle = `rgba(${c(ar*0.75+15)},${c(ag*0.15)},${c(ab*0.22)},0.6)`;
      ctx.lineWidth = 0.8 + j * 0.4;
      ctx.beginPath();
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        const wb = pr * (0.82 + rng() * 0.28);
        const px = rx + Math.cos(a) * wb;
        const py = droopY + Math.sin(a) * wb * 0.88;
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // BUTTERFLY — ghost/silhouette form, fading
  ctx.save();
  const bfx = w * (0.40 + rng() * 0.20);
  const bfy = h * (0.22 + rng() * 0.20);
  const bfs = 55 + rng() * 40;
  ctx.filter = "blur(5px)";
  ctx.globalAlpha = 0.12 + rng() * 0.14;
  ctx.fillStyle = `rgba(${c(ar+70)},${c(ag+50)},${c(ab+60)},1)`;
  // Upper wings
  ctx.beginPath();
  ctx.ellipse(bfx - bfs*0.7, bfy - bfs*0.22, bfs*0.72, bfs*0.52, -0.4, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bfx + bfs*0.7, bfy - bfs*0.22, bfs*0.72, bfs*0.52, 0.4, 0, Math.PI*2);
  ctx.fill();
  // Lower wings
  ctx.beginPath();
  ctx.ellipse(bfx - bfs*0.52, bfy + bfs*0.32, bfs*0.45, bfs*0.35, -0.6, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bfx + bfs*0.52, bfy + bfs*0.32, bfs*0.45, bfs*0.35, 0.6, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // Fireflies — sparse mourning lights
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const fx = rng() * w;
    const fy = h * (0.20 + rng() * 0.65);
    const fr = 1.8 + rng() * 4;
    ctx.filter = `blur(${fr * 2.5}px)`;
    ctx.globalAlpha = 0.25 + rng() * 0.45;
    ctx.fillStyle = `rgba(${c(ar+90)},${c(ag+60)},${c(ab+40)},0.9)`;
    ctx.beginPath(); ctx.arc(fx, fy, fr * 3, 0, Math.PI * 2); ctx.fill();
    ctx.filter = `blur(${fr * 0.3}px)`;
    ctx.globalAlpha = 0.6 + rng() * 0.4;
    ctx.fillStyle = "rgba(255,235,200,0.95)";
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  SCENE — TEN SUMMERS
//  Burning pink-amber sky, heat shimmer horizon, fading warm light
// ═══════════════════════════════════════════════════════
function sceneSummerBurn(ctx, w, h, pal, rng) {
  const [ar, ag, ab] = hexRgb(pal.accent);

  // Pink-to-amber-to-dark gradient sky (the "sky is pink" line)
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,    "#1a0508");
  sky.addColorStop(0.15, "#4a1018");
  sky.addColorStop(0.32, "#9a3528");
  sky.addColorStop(0.50, "#d46040");
  sky.addColorStop(0.64, "#e8a060");
  sky.addColorStop(0.72, "#f0c88a");  // peak warm gold at horizon
  sky.addColorStop(0.78, `rgb(${c(ar+10)},${c(ag*0.7+40)},${c(ab*0.5+30)})`);
  sky.addColorStop(1,    "#0a0404");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Pink upper atmosphere bloom
  ctx.save();
  ctx.filter = "blur(90px)";
  const pinkG = ctx.createRadialGradient(w * 0.5, h * 0.08, 0, w * 0.5, h * 0.08, w * 0.7);
  pinkG.addColorStop(0,   "rgba(220,100,120,0.60)");
  pinkG.addColorStop(0.45,"rgba(180,60,80,0.28)");
  pinkG.addColorStop(1,   "transparent");
  ctx.fillStyle = pinkG;
  ctx.fillRect(0, 0, w, h * 0.55);
  ctx.restore();

  // Burning horizon sun — low and wide, like end of a long summer
  ctx.save();
  ctx.filter = "blur(65px)";
  const sunX = w * (0.40 + rng() * 0.20);
  const sunG = ctx.createRadialGradient(sunX, h * 0.74, 0, sunX, h * 0.74, w * 0.58);
  sunG.addColorStop(0,   "rgba(255,220,100,1.0)");
  sunG.addColorStop(0.18,"rgba(240,160,50,0.85)");
  sunG.addColorStop(0.45,"rgba(200,80,30,0.45)");
  sunG.addColorStop(0.75,"rgba(140,30,20,0.18)");
  sunG.addColorStop(1,   "transparent");
  ctx.fillStyle = sunG;
  ctx.fillRect(0, h * 0.3, w, h * 0.6);
  ctx.restore();

  // Heat shimmer lines near horizon
  ctx.save();
  ctx.filter = "blur(3px)";
  const horizonY = h * (0.70 + rng() * 0.05);
  for (let i = 0; i < 14; i++) {
    const ly = horizonY + i * 7 + rng() * 5;
    const alpha = Math.max(0, 0.22 - i * 0.016);
    ctx.strokeStyle = `rgba(255,200,120,${alpha})`;
    ctx.lineWidth = 0.5 + rng() * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    for (let x = 0; x <= w; x += 16) {
      ctx.lineTo(x, ly + Math.sin(x / 38 + rng()) * (1.5 + rng() * 3.5));
    }
    ctx.stroke();
  }
  ctx.restore();

  // Dark silhouette land mass at bottom
  const landG = ctx.createLinearGradient(0, horizonY, 0, h);
  landG.addColorStop(0, "rgba(8,3,2,0.0)");
  landG.addColorStop(0.3,"rgba(8,3,2,0.88)");
  landG.addColorStop(1,  "rgba(4,1,1,0.98)");
  ctx.fillStyle = landG;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // BURNING PAPER / ASH PARTICLES — poems being burned
  ctx.save();
  const ashCount = 40 + Math.floor(rng() * 25);
  for (let i = 0; i < ashCount; i++) {
    const ax = rng() * w;
    const ay = h * (0.25 + rng() * 0.55);
    const as_ = 2.5 + rng() * 9;
    const alpha = 0.08 + rng() * 0.22;

    ctx.filter = `blur(${1 + rng()*2}px)`;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = rng() > 0.5
      ? `rgba(${c(ar+40)},${c(ag*0.6+20)},${c(ab*0.4+10)},0.9)` // ember glow
      : "rgba(30,20,15,0.85)";  // dark ash fleck

    // Irregular ash shape
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(rng() * Math.PI);
    ctx.beginPath();
    ctx.ellipse(0, 0, as_, as_ * (0.3 + rng() * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  FILM OVERLAYS
// ═══════════════════════════════════════════════════════

function filmVignette(ctx, w, h, rng) {
  // Strong corner darkening
  const strength = 0.55 + rng() * 0.12;
  const vg = ctx.createRadialGradient(w/2, h*0.48, h * 0.22, w/2, h*0.48, h * 0.72);
  vg.addColorStop(0,   "transparent");
  vg.addColorStop(0.55,"rgba(0,0,0,0.06)");
  vg.addColorStop(0.82,"rgba(0,0,0,0.28)");
  vg.addColorStop(1,   `rgba(0,0,0,${strength})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

function filmColorTint(ctx, w, h, pal, rng) {
  // Light color grade to unify image
  const [ar, ag, ab] = hexRgb(pal.accent);
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.07 + rng() * 0.05;
  ctx.fillStyle = `rgb(${c(ar+25)},${c(ag+15)},${c(ab+8)})`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function filmGrain(ctx, w, h, rng) {
  // Analog grain — intensity varies per regeneration
  const intensity = 36 + rng() * 18;
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  let n = Math.floor(rng() * 0xffffff);
  for (let i = 0; i < d.length; i += 4) {
    n = (n * 1664525 + 1013904223) & 0xffffffff;
    const v = ((n >>> 0) / 0x100000000 - 0.5) * intensity;
    d[i]     = c(d[i]     + v);
    d[i + 1] = c(d[i + 1] + v);
    d[i + 2] = c(d[i + 2] + v);
  }
  ctx.putImageData(data, 0, 0);
}

// ═══════════════════════════════════════════════════════
//  QUOTE PANEL
// ═══════════════════════════════════════════════════════

function paintQuote(ctx, w, artH, qH, poem, quote, pal) {
  const mid = w / 2;
  const top = artH;
  ctx.filter = "none";
  ctx.textAlign = "center";

  ctx.font      = "400 20px 'Courier New', monospace";
  ctx.fillStyle = hexRgba(pal.accent, 0.9);
  ctx.fillText(poem.title.toUpperCase(), mid, top + 66);

  ctx.font      = "300 12px 'Courier New', monospace";
  ctx.fillStyle = hexRgba(pal.accent, 0.4);
  ctx.fillText(`· ${poem.year} ·`, mid, top + 96);

  ctx.save();
  ctx.strokeStyle = hexRgba(pal.accent, 0.15);
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(mid - 50, top + 116); ctx.lineTo(mid + 50, top + 116); ctx.stroke();
  ctx.restore();

  ctx.font      = "italic 50px Georgia, serif";
  ctx.fillStyle = hexRgba(pal.accent, 0.12);
  ctx.fillText("\u201C", 76, top + 192);

  ctx.font      = "italic 26px Georgia, serif";
  ctx.fillStyle = "#1c1710";
  const lines  = wrapLines(ctx, quote.trim(), w - 150);
  const lineH  = 43;
  const blockH = lines.length * lineH;
  const startY = top + 140 + Math.max(0, (qH - 140 - 52 - blockH) / 2);
  lines.forEach((ln, i) => ctx.fillText(ln, mid, startY + i * lineH));

  ctx.font      = "300 10px 'Courier New', monospace";
  ctx.fillStyle = hexRgba(pal.accent, 0.22);
  ctx.fillText("POETRY MUSEUM", mid, artH + qH - 26);
}

// ═══════════════════════════════════════════════════════
//  DRAWING HELPERS
// ═══════════════════════════════════════════════════════

// Bird — clean M-wing silhouette
function drawBird(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x - size,          y + size * 0.18);
  ctx.quadraticCurveTo(x - size * 0.52, y - size * 0.38, x, y + size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.52, y - size * 0.38, x + size, y + size * 0.18);
  ctx.stroke();
}

// Object silhouette — bottle / cup / vase
function drawObject(ctx, cx, baseY, w, h, type, rng) {
  ctx.beginPath();
  if (type === 0) {
    // Bottle
    ctx.moveTo(cx - w*0.22, baseY);
    ctx.lineTo(cx - w*0.22, baseY - h*0.55);
    ctx.quadraticCurveTo(cx - w*0.38, baseY - h*0.72, cx - w*0.14, baseY - h*0.88);
    ctx.lineTo(cx - w*0.14, baseY - h);
    ctx.lineTo(cx + w*0.14, baseY - h);
    ctx.lineTo(cx + w*0.14, baseY - h*0.88);
    ctx.quadraticCurveTo(cx + w*0.38, baseY - h*0.72, cx + w*0.22, baseY - h*0.55);
    ctx.lineTo(cx + w*0.22, baseY);
    ctx.closePath();
  } else if (type === 1) {
    // Cup
    ctx.moveTo(cx - w*0.42, baseY);
    ctx.lineTo(cx - w*0.32, baseY - h);
    ctx.lineTo(cx + w*0.32, baseY - h);
    ctx.lineTo(cx + w*0.42, baseY);
    ctx.closePath();
  } else {
    // Vase
    ctx.moveTo(cx - w*0.18, baseY);
    ctx.quadraticCurveTo(cx - w*0.5, baseY - h*0.4, cx - w*0.38, baseY - h*0.72);
    ctx.quadraticCurveTo(cx - w*0.2, baseY - h*0.88, cx - w*0.12, baseY - h);
    ctx.lineTo(cx + w*0.12, baseY - h);
    ctx.quadraticCurveTo(cx + w*0.2, baseY - h*0.88, cx + w*0.38, baseY - h*0.72);
    ctx.quadraticCurveTo(cx + w*0.5, baseY - h*0.4, cx + w*0.18, baseY);
    ctx.closePath();
  }
  ctx.fill();
}

// ═══════════════════════════════════════════════════════
//  PALETTE + RNG + UTILITIES
// ═══════════════════════════════════════════════════════

function buildPalette(atm) {
  return { accent: atm.accent || "#c8902a", hue: atm.hue || "#0e0a06" };
}

function makeRng(seed) {
  let s = seed ^ 0xdeadbeef;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = (s ^ (s >>> 16)) & 0xffffffff || 0xabcd1234;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [], cur = [""];
  for (const word of words) {
    const test = cur[0] ? `${cur[0]} ${word}` : word;
    if (ctx.measureText(test).width > maxW && cur[0]) { lines.push(cur[0]); cur[0] = word; }
    else cur[0] = test;
  }
  if (cur[0]) lines.push(cur[0]);
  return lines;
}

function hexRgb(hex) {
  const h = hex.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function hexRgba(hex, a) { const [r,g,b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; }
function c(v) { return Math.max(0, Math.min(255, Math.round(v))); }
