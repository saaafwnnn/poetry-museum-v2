"use client";

// ══════════════════════════════════════════════════════════════
//  Poetry Museum — Audio Engine v5
//  NO noise buffers anywhere — not even in reverb.
//  Reverb = clean multi-tap delay network.
//  Instruments: violin · viola · cello · piano · flute · saxophone
//  Nature: bird calls · water drops · bee hum · frog tones
//  Everything is a shaped sine / sawtooth oscillator.
// ══════════════════════════════════════════════════════════════

let _ac = null;
const active = {};

function ac() {
  if (typeof window === "undefined") return null;
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  return _ac;
}

// Await resume before doing anything with the context
async function acReady() {
  const ctx = ac();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    try { await ctx.resume(); } catch(_) {}
  }
  return ctx;
}

// Exported so the loading screen can share this context
export function getSharedAudioContext() { return ac(); }

// Call this on any early user interaction to pre-warm the context
export function primeAudio() { acReady(); }

export function startAmbience(slug, _n, _w, vol = 0.08) {
  stopAmbience(slug);
  // Fire async — await resume, then start scene
  acReady().then(ctx => {
    if (!ctx) return;
    // Guard: user may have stopped before context resumed
    if (active[slug] === "pending") {
      active[slug] = (SCENES[slug] || sceneDefault)(ctx, vol);
    }
  });
  active[slug] = "pending"; // placeholder so stopAmbience can cancel
  return () => stopAmbience(slug);
}
export function stopAmbience(slug) {
  const node = active[slug];
  if (!node) return;
  delete active[slug]; // delete first so pending check in startAmbience sees it gone
  if (typeof node === "function") node(); // only call if fully started
}
export function stopAllAmbience() { Object.keys(active).forEach(stopAmbience); }
export function setAmbienceVolume() {}

const SCENES = {
  "sorrow":                       sceneSorrow,
  "to-keats":                     sceneToKeats,
  "an-ode-to-fireflies":          sceneFireflies,
  "when-i-die":                   sceneWhenIDie,
  "ive-killed-a-butterfly-today": sceneButterfly,
  "ten-summers":                  sceneTenSummers,
};

// ══════════════════════════════════════════════════════════════
//  SORROW — cello drone · violin lament · piano grief · rain drops
// ══════════════════════════════════════════════════════════════
function sceneSorrow(ctx, vol) {
  const master = masterGain(ctx, vol * 0.82, 5.0);
  const rev = makeDelay(ctx, master);
  const T = [];

  // Cello D2 + A2 — open fifth drone
  hold(ctx, 73.42,  "cello", 0.28, master, rev);
  hold(ctx, 110.00, "cello", 0.16, master, rev);

  // Viola F3
  hold(ctx, 174.61, "viola", 0.12, master, rev);

  // Violin — descending lament D5 → C5 → Bb4
  const vlnNotes = [587.33, 523.25, 466.16];
  let li = 0;
  const vln = stringOsc(ctx, vlnNotes[0], "violin");
  route(vln.out, master, rev);
  const lament = () => {
    vln.osc.frequency.setValueAtTime(vlnNotes[li % 3], ctx.currentTime);
    env(vln.gn, [[0,0],[0.13,1.0],[0.09,4.2],[0,5.8]], ctx.currentTime);
    li++;
  };
  lament();
  T.push(setInterval(lament, 6200));

  // Piano — soft Dm chord every 9s
  const dmChord = [146.83, 174.61, 220.0];
  const chord = () => dmChord.forEach((f,i) => setTimeout(() => piano(ctx,f,0.07,rev), i*200));
  chord();
  T.push(setInterval(chord, 9000));

  // Rain drops — piano high notes at random intervals
  const rainPitches = [1318.51, 1174.66, 1046.50, 987.77, 880.00];
  const schedRain = () => {
    piano(ctx, rainPitches[Math.floor(Math.random()*5)], 0.038, rev);
    T.push(setTimeout(schedRain, 350 + Math.random()*800));
  };
  T.push(setTimeout(schedRain, 2500));

  return stop(ctx, master, T, [vln]);
}

// ══════════════════════════════════════════════════════════════
//  TO KEATS — violin soar · piano harp · flute breath · bird calls
// ══════════════════════════════════════════════════════════════
function sceneToKeats(ctx, vol) {
  const master = masterGain(ctx, vol * 0.80, 3.5);
  const rev = makeDelay(ctx, master);
  const T = [];

  // Cello G2 + viola B3 pad
  hold(ctx, 98.0,   "cello", 0.13, master, rev);
  hold(ctx, 246.94, "viola", 0.09, master, rev);

  // Violin — ascending G4→B4→D5→G5
  const soarNotes = [392.0, 493.88, 587.33, 783.99, 659.25, 880.0, 783.99, 587.33];
  let si = 0;
  const vln = stringOsc(ctx, soarNotes[0], "violin");
  route(vln.out, master, rev);
  const soar = () => {
    vln.osc.frequency.setValueAtTime(soarNotes[si++ % soarNotes.length], ctx.currentTime);
    env(vln.gn, [[0,0],[0.16,0.18],[0.001,1.6]], ctx.currentTime);
  };
  soar();
  T.push(setInterval(soar, 1900));

  // Piano harp — ascending arpeggios
  const harp = [392.0, 493.88, 587.33, 659.25, 783.99, 1046.5];
  let hi = 0;
  const schedHarp = () => {
    piano(ctx, harp[hi++ % harp.length], 0.09, rev);
    T.push(setTimeout(schedHarp, 750 + Math.random()*1100));
  };
  T.push(setTimeout(schedHarp, 1500));

  // Flute — G5 breath, gently moving
  const fl = fluteOsc(ctx, 783.99);
  route(fl.out, master, rev);
  fl.gn.gain.setValueAtTime(0, ctx.currentTime);
  fl.gn.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 5);
  const flMel = [783.99, 987.77, 880.0, 1046.5];
  let fli = 0;
  T.push(setInterval(() => {
    fl.osc.frequency.setValueAtTime(flMel[fli++ % flMel.length], ctx.currentTime);
  }, 4500));

  // Bird calls
  const schedBird = () => {
    bird(ctx, rev, 1100 + Math.random()*700);
    T.push(setTimeout(schedBird, 3500 + Math.random()*5500));
  };
  T.push(setTimeout(schedBird, 3000));

  return stop(ctx, master, T, [vln, fl]);
}

// ══════════════════════════════════════════════════════════════
//  AN ODE TO FIREFLIES — flute glints · piano pings · frog tones · crickets
// ══════════════════════════════════════════════════════════════
function sceneFireflies(ctx, vol) {
  const master = masterGain(ctx, vol * 0.65, 7.0);
  const rev = makeDelay(ctx, master);
  const T = [];

  // Cello A1 — barely audible undertone
  hold(ctx, 55.0, "cello", 0.05, master, rev);

  // Flute glints — single high notes, long glassy decay
  const glintPitches = [880.0, 1046.5, 1174.66, 1318.51, 1567.98];
  const schedGlint = () => {
    const f = glintPitches[Math.floor(Math.random()*glintPitches.length)];
    const fl = fluteOsc(ctx, f);
    route(fl.out, master, rev);
    env(fl.gn, [[0,0],[0.10,0.09],[0.001, 3.2 + Math.random()*1.8]], ctx.currentTime);
    T.push(setTimeout(() => fl.osc.stop(), 6000));
    T.push(setTimeout(schedGlint, 1600 + Math.random()*3000));
  };
  schedGlint();

  // Piano pings — single note, like a drop of light
  const pingPitches = [1046.5, 1174.66, 987.77, 880.0, 1318.51];
  const schedPing = () => {
    piano(ctx, pingPitches[Math.floor(Math.random()*pingPitches.length)], 0.065, rev);
    T.push(setTimeout(schedPing, 2800 + Math.random()*4200));
  };
  T.push(setTimeout(schedPing, 3200));

  // Cricket tones — short sine bursts at musical frequency (NOT noise-band)
  // Using 880Hz (A5) short pulses — sounds like a cricket chirp
  const schedCricket = () => {
    const count = 2 + Math.floor(Math.random()*3);
    for (let i = 0; i < count; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 880 + Math.random()*110;
      const bt = ctx.currentTime + i * 0.055;
      g.gain.setValueAtTime(0, bt);
      g.gain.linearRampToValueAtTime(0.022, bt + 0.007);
      g.gain.linearRampToValueAtTime(0, bt + 0.040);
      o.connect(g); g.connect(rev.input);
      o.start(bt); o.stop(bt + 0.06);
    }
    T.push(setTimeout(schedCricket, 900 + Math.random()*1800));
  };
  schedCricket();

  // Frog tones — soft low sine, like a pond at night
  const schedFrog = () => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 128 + Math.random()*32;
    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.032, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
    o.connect(g); g.connect(rev.input);
    o.start(t0); o.stop(t0 + 0.6);
    T.push(setTimeout(schedFrog, 3500 + Math.random()*5500));
  };
  T.push(setTimeout(schedFrog, 4000));

  return stop(ctx, master, T, []);
}

// ══════════════════════════════════════════════════════════════
//  WHEN I DIE — breathing quartet · piano lullaby · bees · thrush
// ══════════════════════════════════════════════════════════════
function sceneWhenIDie(ctx, vol) {
  const master = masterGain(ctx, vol * 0.68, 8.0);
  const rev = makeDelay(ctx, master);
  const T = [];

  hold(ctx, 65.41,  "cello", 0.20, master, rev);
  hold(ctx, 155.56, "viola", 0.12, master, rev);

  // Two violins with breathing gain
  const v1 = stringOsc(ctx, 392.0, "violin");
  route(v1.out, master, rev);
  v1.gn.gain.setValueAtTime(0, ctx.currentTime);
  v1.gn.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 7);
  breath(ctx, v1.gn.gain, 1/7, 0.035);

  const v2 = stringOsc(ctx, 622.25, "violin");
  route(v2.out, master, rev);
  v2.gn.gain.setValueAtTime(0, ctx.currentTime);
  v2.gn.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 11);
  breath(ctx, v2.gn.gain, 1/9, 0.025);

  // Piano lullaby — Cm arpeggio
  const lullaby = [130.81, 155.56, 196.0, 261.63, 196.0, 155.56];
  let pi = 0;
  const schedPiano = () => {
    piano(ctx, lullaby[pi++ % lullaby.length], 0.065, rev);
    T.push(setTimeout(schedPiano, 1300 + Math.random()*500));
  };
  T.push(setTimeout(schedPiano, 3000));

  // Flute — Eb5, slow swell
  const fl = fluteOsc(ctx, 622.25);
  route(fl.out, master, rev);
  fl.gn.gain.setValueAtTime(0, ctx.currentTime);
  fl.gn.gain.linearRampToValueAtTime(0.048, ctx.currentTime + 14);

  // Bee hum — two close sine oscillators, gentle beating
  const beeA = ctx.createOscillator();
  const beeB = ctx.createOscillator();
  const beeG = ctx.createGain();
  beeA.type = beeB.type = "sine";
  beeA.frequency.value = 220; beeB.frequency.value = 223;
  beeG.gain.value = 0;
  beeG.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 8);
  beeA.connect(beeG); beeB.connect(beeG); beeG.connect(rev.input);
  beeA.start(); beeB.start();

  // Thrush 3-note phrase
  const schedThrush = () => {
    bird(ctx, rev, 660);
    T.push(setTimeout(() => bird(ctx, rev, 880), 280));
    T.push(setTimeout(() => bird(ctx, rev, 740), 580));
    T.push(setTimeout(schedThrush, 9000 + Math.random()*7000));
  };
  T.push(setTimeout(schedThrush, 5000));

  return stop(ctx, master, T,
    [v1, v2, fl, { osc: beeA }, { osc: beeB }]);
}

// ══════════════════════════════════════════════════════════════
//  I'VE KILLED A BUTTERFLY — cello cluster · violin shards · piano dirge · cicadas
// ══════════════════════════════════════════════════════════════
function sceneButterfly(ctx, vol) {
  const master = masterGain(ctx, vol * 0.78, 4.0);
  const rev = makeDelay(ctx, master);
  const T = [];

  // Cello D2 + Ab2 tritone — unsettled
  hold(ctx, 73.42,  "cello", 0.15, master, rev);
  hold(ctx, 103.83, "cello", 0.09, master, rev);
  hold(ctx, 174.61, "viola", 0.10, master, rev);

  // Violin — fragmented shards, cut off abruptly
  const shards = [293.66, 311.13, 349.23, 440.0, 415.30, 261.63];
  let si = 0;
  const vln = stringOsc(ctx, shards[0], "violin");
  route(vln.out, master, rev);
  const playShards = () => {
    const count = 1 + Math.floor(Math.random()*3);
    for (let i = 0; i < count; i++) {
      T.push(setTimeout(() => {
        vln.osc.frequency.setValueAtTime(shards[(si+i) % shards.length], ctx.currentTime);
        env(vln.gn, [[0,0],[0.12,0.06],[0,0.30+Math.random()*0.25]], ctx.currentTime);
      }, i * 310));
    }
    si += count;
    T.push(setTimeout(playShards, 2400 + Math.random()*3400));
  };
  playShards();

  // Piano — slow Dm dirge chord
  const dirge = () => {
    [146.83, 174.61, 220.0, 261.63].forEach((f,i) =>
      T.push(setTimeout(() => piano(ctx, f, 0.055, rev), i*220))
    );
    T.push(setTimeout(dirge, 12000 + Math.random()*5000));
  };
  T.push(setTimeout(dirge, 4500));

  // Cicada sine tones — short musical bursts at A5 (880Hz) — clear tone not noise
  const schedCicada = () => {
    const count = 3 + Math.floor(Math.random()*4);
    for (let i = 0; i < count; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 860 + Math.random()*40;
      const bt = ctx.currentTime + i * 0.042;
      g.gain.setValueAtTime(0, bt);
      g.gain.linearRampToValueAtTime(0.018, bt + 0.005);
      g.gain.linearRampToValueAtTime(0, bt + 0.030);
      o.connect(g); g.connect(rev.input);
      o.start(bt); o.stop(bt + 0.05);
    }
    T.push(setTimeout(schedCicada, 2000 + Math.random()*2500));
  };
  T.push(setTimeout(schedCicada, 1200));

  // Mournful flute — F4
  const fl = fluteOsc(ctx, 349.23);
  route(fl.out, master, rev);
  fl.gn.gain.setValueAtTime(0, ctx.currentTime);
  fl.gn.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 9);

  return stop(ctx, master, T, [vln, fl]);
}

// ══════════════════════════════════════════════════════════════
//  TEN SUMMERS — cello warmth · violin sigh · saxophone · summer tones
// ══════════════════════════════════════════════════════════════
function sceneTenSummers(ctx, vol) {
  const master = masterGain(ctx, vol * 0.83, 4.5);
  const rev = makeDelay(ctx, master);
  const T = [];

  hold(ctx, 87.31, "cello", 0.22, master, rev);

  // Saxophone — A3 warm and breathy
  const sax = saxOsc(ctx, 220.0);
  route(sax.out, master, rev);
  sax.gn.gain.setValueAtTime(0, ctx.currentTime);
  sax.gn.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 5);

  // Violin — descending F4→E4→D4→C4 (summers withering)
  const fadeNotes = [349.23, 329.63, 293.66, 261.63, 246.94, 261.63, 293.66];
  let fni = 0;
  const vln = stringOsc(ctx, fadeNotes[0], "violin");
  route(vln.out, master, rev);
  const playFade = () => {
    vln.osc.frequency.setValueAtTime(fadeNotes[fni++ % fadeNotes.length], ctx.currentTime);
    env(vln.gn, [[0,0],[0.13,0.55],[0.09,3.8],[0,5.2]], ctx.currentTime);
  };
  playFade();
  T.push(setInterval(playFade, 5600));

  // Piano — sparse F major memories
  const piNotes = [174.61, 220.0, 261.63, 349.23, 293.66];
  let pni = 0;
  const schedPi = () => {
    piano(ctx, piNotes[pni++ % piNotes.length], 0.065, rev);
    T.push(setTimeout(schedPi, 2200 + Math.random()*2200));
  };
  T.push(setTimeout(schedPi, 2000));

  // Summer insect hum — two pure sine tones very close in pitch (gentle beating, NOT noise)
  const insA = ctx.createOscillator();
  const insB = ctx.createOscillator();
  const insG = ctx.createGain();
  insA.type = insB.type = "sine";
  insA.frequency.value = 392; insB.frequency.value = 394.5; // G4 pair — gentle beat
  insG.gain.value = 0;
  insG.gain.linearRampToValueAtTime(0.014, ctx.currentTime + 7);
  insA.connect(insG); insB.connect(insG); insG.connect(rev.input);
  insA.start(); insB.start();

  // Slow self-dim
  master.gain.linearRampToValueAtTime(vol * 0.83, ctx.currentTime + 55);
  master.gain.linearRampToValueAtTime(vol * 0.22, ctx.currentTime + 120);

  return stop(ctx, master, T,
    [vln, sax, { osc: insA }, { osc: insB }]);
}

// ══════════════════════════════════════════════════════════════
//  DEFAULT
// ══════════════════════════════════════════════════════════════
function sceneDefault(ctx, vol) {
  const master = masterGain(ctx, vol, 3.5);
  const rev = makeDelay(ctx, master);
  hold(ctx, 196.0,  "cello",  0.12, master, rev);
  hold(ctx, 293.66, "viola",  0.09, master, rev);
  const vln = stringOsc(ctx, 440.0, "violin");
  vln.gn.gain.value = 0.08;
  route(vln.out, master, rev);
  return stop(ctx, master, [], [vln]);
}

// ══════════════════════════════════════════════════════════════
//  INSTRUMENT OSCILLATORS
//  All purely oscillator-based — zero noise buffers
// ══════════════════════════════════════════════════════════════

function stringOsc(ctx, freq, type) {
  const SPEC = {
    violin: { cut: 3500, q: 0.7, vib: 5.4, vd: 2.4, det: 2.2 },
    viola:  { cut: 2200, q: 0.8, vib: 4.7, vd: 2.8, det: 2.5 },
    cello:  { cut: 1600, q: 0.9, vib: 4.1, vd: 3.2, det: 3.0 },
  };
  const sp = SPEC[type] || SPEC.violin;

  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const gn = ctx.createGain();
  const vLfo = ctx.createOscillator();
  const vG   = ctx.createGain();

  o1.type = o2.type = "sawtooth";
  o1.frequency.value = freq; o2.frequency.value = freq;
  o1.detune.value = -sp.det; o2.detune.value = +sp.det;
  lp.type = "lowpass"; lp.frequency.value = sp.cut; lp.Q.value = sp.q;
  vLfo.type = "sine"; vLfo.frequency.value = sp.vib; vG.gain.value = sp.vd;

  vLfo.connect(vG); vG.connect(o1.frequency); vG.connect(o2.frequency);
  o1.connect(lp); o2.connect(lp); lp.connect(gn);

  o1.start(); o2.start(); vLfo.start();
  const out = gn;
  return { osc: o1, gn, out,
    stop: () => { try{o1.stop();o2.stop();vLfo.stop();}catch(_){} } };
}

function fluteOsc(ctx, freq) {
  const o1 = ctx.createOscillator(); // fundamental — pure sine
  const o2 = ctx.createOscillator(); // 2nd harmonic — soft breath
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();
  const gn = ctx.createGain();
  const vLfo = ctx.createOscillator();
  const vG   = ctx.createGain();

  o1.type = "sine"; o1.frequency.value = freq;
  o2.type = "sine"; o2.frequency.value = freq * 2.005;
  g1.gain.value = 0.82; g2.gain.value = 0.10;
  vLfo.type = "sine"; vLfo.frequency.value = 5.0; vG.gain.value = 1.8;
  gn.gain.value = 0;

  vLfo.connect(vG); vG.connect(o1.frequency);
  o1.connect(g1); o2.connect(g2);
  g1.connect(gn); g2.connect(gn);

  o1.start(); o2.start(); vLfo.start();
  const out = gn;
  return { osc: o1, gn, out,
    stop: () => { try{o1.stop();o2.stop();vLfo.stop();}catch(_){} } };
}

function saxOsc(ctx, freq) {
  const osc  = ctx.createOscillator();
  const lp   = ctx.createBiquadFilter();
  const peak = ctx.createBiquadFilter();
  const gn   = ctx.createGain();
  const vLfo = ctx.createOscillator();
  const vG   = ctx.createGain();

  osc.type = "sawtooth"; osc.frequency.value = freq;
  lp.type = "lowpass";   lp.frequency.value = 2600; lp.Q.value = 1.1;
  peak.type = "peaking"; peak.frequency.value = 850; peak.gain.value = 5;
  vLfo.type = "sine"; vLfo.frequency.value = 4.8; vG.gain.value = 3.2;
  gn.gain.value = 0;

  vLfo.connect(vG); vG.connect(osc.frequency);
  osc.connect(lp); lp.connect(peak); peak.connect(gn);

  osc.start(); vLfo.start();
  const out = gn;
  return { osc, gn, out,
    stop: () => { try{osc.stop();vLfo.stop();}catch(_){} } };
}

// Sustained string voice (set-and-forget)
function hold(ctx, freq, type, gainVal, master, rev) {
  const s = stringOsc(ctx, freq, type);
  s.gn.gain.value = gainVal;
  route(s.out, master, rev);
}

// Piano — sine with fast attack, long exponential decay
function piano(ctx, freq, gain, rev) {
  const o  = ctx.createOscillator();
  const o2 = ctx.createOscillator(); // 2nd harmonic for body
  const g  = ctx.createGain();
  const g2 = ctx.createGain();
  o.type = "sine"; o.frequency.value = freq;
  o2.type = "sine"; o2.frequency.value = freq * 2;
  g2.gain.value = 0.12;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.007);
  g.gain.exponentialRampToValueAtTime(0.001, t + 4.8);
  o.connect(g); g.connect(rev.input);
  o2.connect(g2); g2.connect(rev.input);
  o.start(t); o.stop(t + 5.2);
  o2.start(t); o2.stop(t + 5.2);
}

// Bird call — two-note sine phrase
function bird(ctx, rev, baseF) {
  [[baseF, 0], [baseF*1.25, 0.16], [baseF*1.1, 0.36]].forEach(([f, offset]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = f;
    const bt = ctx.currentTime + offset;
    g.gain.setValueAtTime(0, bt);
    g.gain.linearRampToValueAtTime(0.042, bt + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, bt + 0.55);
    o.connect(g); g.connect(rev.input);
    o.start(bt); o.stop(bt + 0.7);
  });
}

// ══════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════

// Breathing LFO added to an AudioParam
function breath(ctx, param, rate, depth) {
  const lfo = ctx.createOscillator();
  const g   = ctx.createGain();
  lfo.type = "sine"; lfo.frequency.value = rate; g.gain.value = depth;
  lfo.connect(g); g.connect(param); lfo.start();
}

// Envelope helper — [[value, deltaTime], ...]
function env(gn, points, now) {
  gn.gain.cancelScheduledValues(now);
  let t = now;
  points.forEach(([v, dt], i) => {
    t = now + dt;
    if (i === 0) gn.gain.setValueAtTime(v, t);
    else if (v <= 0.001) gn.gain.exponentialRampToValueAtTime(0.001, t);
    else gn.gain.linearRampToValueAtTime(v, t);
  });
}

// Route an instrument output to both master and delay
function route(out, master, rev) {
  out.connect(master);
  out.connect(rev.input);
}

// Master gain with fade-in
function masterGain(ctx, vol, fadeIn) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + fadeIn);
  g.connect(ctx.destination);
  return g;
}

// ══════════════════════════════════════════════════════════════
//  CLEAN DELAY-BASED REVERB — zero noise buffer
//  Multi-tap feedback delay network (FDN-lite)
//  This produces natural reverb with NO hiss or noise.
// ══════════════════════════════════════════════════════════════
function makeDelay(ctx, master) {
  // Four delay lines at prime-ish lengths for diffuse reflections
  const TAPS = [0.031, 0.047, 0.071, 0.103]; // seconds
  const FB   = 0.38;   // feedback — controls reverb time
  const WET  = 0.28;   // wet mix level into master

  const input  = ctx.createGain(); input.gain.value = 1.0;
  const wetOut = ctx.createGain(); wetOut.gain.value = WET;
  wetOut.connect(master);

  TAPS.forEach(dt => {
    const dly = ctx.createDelay(0.5);
    const fbG  = ctx.createGain();
    const lp   = ctx.createBiquadFilter(); // damps high frequencies over time
    dly.delayTime.value = dt;
    fbG.gain.value = FB;
    lp.type = "lowpass"; lp.frequency.value = 3200;

    input.connect(dly);
    dly.connect(lp);
    lp.connect(fbG);
    fbG.connect(dly);   // feedback loop
    lp.connect(wetOut);
  });

  return { input };
}

// Fade out and clean up
function stop(ctx, master, timers, oscs) {
  return () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 2.5);
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    setTimeout(() => {
      oscs.forEach(o => { try { (o.stop || o.osc?.stop?.bind(o.osc))?.(); } catch(_){} });
      try { master.disconnect(); } catch(_) {}
    }, 3000);
  };
}