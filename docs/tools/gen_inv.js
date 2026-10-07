const { decode, encode, px, set, create } = require('./png.js');
const van = decode('vanilla/assets/minecraft/textures/gui/container/inventory.png');
const ddm = decode('zcui/ddm/assets/minecraft/textures/gui/container/inventory.png');
const out = create(256, 256);
// deterministic PRNG
let seed = 1337; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const C = {
  panel: [30, 28, 26], panelHi: [66, 62, 57], panelSh: [15, 14, 13], border: [0, 0, 0],
  slot: [11, 10, 9], slotDark: [4, 4, 4], slotLight: [50, 46, 42],
  backdrop: [6, 6, 6], arrow: [122, 112, 100], hazY: [232, 160, 48], hazB: [12, 11, 10],
  rust1: [92, 38, 20], rust2: [150, 70, 22], rust3: [60, 22, 14], stain: [22, 20, 18],
};
const W = 176, H = 166;
for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
  if (x >= W || y >= H) { set(out, x, y, px(ddm, x, y)); continue; }
  const c = px(van, x, y); if (c[3] === 0) { set(out, x, y, [0, 0, 0, 0]); continue; }
  const k = c[0];
  const inArrow = x >= 134 && x <= 150 && y >= 29 && y <= 41;
  let n;
  if (k === 198) n = C.panel; else if (k === 139) n = inArrow ? C.arrow : C.slot; else if (k === 55) n = C.slotDark;
  else if (k === 255) n = (x <= 2 || y <= 2) ? C.panelHi : C.slotLight; else if (k === 85) n = C.panelSh; else if (k === 0) n = C.border; else if (k === 33) n = C.backdrop; else n = [c[0], c[1], c[2]];
  set(out, x, y, n);
}
// rust specks and stains on panel background only
const isPanel = (x, y) => { const c = px(van, x, y); return c[0] === 198 && c[3] === 255 && x < W && y < H; };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!isPanel(x, y)) continue; const r = rnd();
  if (r < 0.010) set(out, x, y, C.rust3); else if (r < 0.016) set(out, x, y, C.rust1); else if (r < 0.018) set(out, x, y, C.rust2); else if (r < 0.06) set(out, x, y, C.stain);
}
// small rust clusters near corners
const clusters = [[4, 4], [170, 4], [4, 160], [170, 160], [95, 82], [78, 10]];
for (const [cx, cy] of clusters) for (let i = 0; i < 10; i++) { const x = cx + Math.floor((rnd() - 0.5) * 8), y = cy + Math.floor((rnd() - 0.5) * 8); if (isPanel(x, y)) set(out, x, y, rnd() < 0.5 ? C.rust1 : C.rust3); }
// hazard stripe band along the top inner edge (y 3..5, x 3..172): diagonal yellow/black
for (let y = 3; y <= 5; y++) for (let x = 3; x <= 172; x++) { const d = ((x + y) % 8); set(out, x, y, d < 4 ? C.hazY : C.hazB); }
// dark line under the band
for (let x = 3; x <= 172; x++) set(out, x, 6, C.slotDark);
// blood-red inner frame line 1px inside the border (left/right/bottom)
const red = [96, 14, 10];
for (let y = 3; y < H - 3; y++) { if (isPanel(3, y)) set(out, 3, y, red); if (isPanel(W - 4, y)) set(out, W - 4, y, red); }
for (let x = 3; x < W - 3; x++) { if (isPanel(x, H - 4)) set(out, x, H - 4, red); }
encode('inventory.png', out);
// preview 3x
const pv = create(W * 3, H * 3); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = px(out, x, y); for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) set(pv, x * 3 + dx, y * 3 + dy, c); } encode('inventory_preview3x.png', pv);
console.log('ok');
