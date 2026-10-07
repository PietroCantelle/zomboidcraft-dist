const { decode, encode, px, set, create } = require('./png.js');
const base = decode('curios/ddm/assets/curios/textures/gui/inventory.png');
const out = create(256, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) set(out, x, y, px(base, x, y));
// Botao do Curios: sprite normal em (50,0) 14x14, hover em (50,14) 14x14.
// Visual: moldura laranja (igual ao hover da hotbar), fundo escuro, camiseta clara no meio.
const SHIRT = [
  '..............',
  '..............',
  '..##......##..',
  '.####.##.####.',
  '.##.######.##.',
  '.##..####..##.',
  '..#..####..#..',
  '.....####.....',
  '.....####.....',
  '.....####.....',
  '.....####.....',
  '.....######...',
  '..............',
  '..............',
];
function button(ox, oy, border, bg, shirt, glow) {
  for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
    const edge = x === 0 || y === 0 || x === 13 || y === 13;
    const corner = (x === 0 || x === 13) && (y === 0 || y === 13);
    if (corner) { set(out, ox + x, oy + y, [0, 0, 0, 0]); continue; }
    if (edge) { set(out, ox + x, oy + y, border); continue; }
    const inner = x === 1 || y === 1 || x === 12 || y === 12;
    set(out, ox + x, oy + y, inner ? glow : bg);
  }
  for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) if (SHIRT[y][x] === '#') set(out, ox + x, oy + y, shirt);
}
button(50, 0, [232, 160, 48], [22, 20, 18], [225, 218, 200], [70, 44, 20]);     // normal
button(50, 14, [255, 214, 96], [92, 38, 20], [255, 255, 255], [150, 70, 22]);   // hover
encode('curios_inventory.png', out);
console.log('ok');
