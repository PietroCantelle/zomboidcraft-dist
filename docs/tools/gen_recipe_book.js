// Generates the "Caderno de Sobrevivência" Patchouli book (KubeJS assets/data) from the list below.
//   node docs/tools/gen_recipe_book.js <dirs with every mod jar and the 1.20.1 client jar...>
// Writes (under files/kubejs):
//   ZC_HAIR/src/main/resources/data/zc_hair/patchouli_books/caderno/book.json  (Patchouli only finds book.json
//     inside a mod jar under data/<that mod's id>/: it ships in zc_hair.jar, so the book is zc_hair:caderno;
//     set ZC_HAIR to that project's folder)
//   assets/zc_hair/patchouli_books/caderno/en_us/{categories,entries}/...  (text is lang keys: i18n)
//   data/zc_recipes/advancements/learned/<key>.json   (no display: invisible, granted by the notes)
//   server_scripts/zc_recipe_notes_list.js            (the same list for the server script)
// The jar dir is only used to find each item's name key (item.x.y or block.x.y).
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.resolve(__dirname, '../../files/kubejs');
const JARS = process.argv.slice(2);

// [category, output item, recipe ids (1-2, as Patchouli pages)]  - page type from the recipe kind:
// c: crafting, f: campfire_cooking, s: smelting
const LIST = [
  ['primeiros_passos', 'notreepunching:flint_knife', 'c:notreepunching:flint_knife'],
  ['primeiros_passos', 'notreepunching:flint_axe', 'c:notreepunching:flint_axe'],
  ['primeiros_passos', 'notreepunching:flint_pickaxe', 'c:notreepunching:flint_pickaxe'],
  ['primeiros_passos', 'notreepunching:flint_shovel', 'c:notreepunching:flint_shovel'],
  ['primeiros_passos', 'notreepunching:flint_hoe', 'c:notreepunching:flint_hoe'],
  ['primeiros_passos', 'notreepunching:plant_string', 'c:notreepunching:plant_string'],
  ['primeiros_passos', 'notreepunching:fire_starter', 'c:notreepunching:fire_starter'],
  ['primeiros_passos', 'minecraft:campfire', 'c:zomboidcraft:campfire_from_fire_starter'],
  ['primeiros_passos', 'notreepunching:clay_tool', 'c:notreepunching:clay_tool'],
  ['primeiros_passos', 'notreepunching:macuahuitl', 'c:notreepunching:macuahuitl'],
  ['primeiros_passos', 'notreepunching:iron_knife', 'c:notreepunching:iron_knife'],
  ['primeiros_passos', 'notreepunching:iron_saw', 'c:notreepunching:iron_saw'],

  ['abrigo', 'minecraft:crafting_table', 'c:minecraft:crafting_table'],
  ['abrigo', 'minecraft:chest', 'c:zomboidcraft:chest_with_nails'],
  ['abrigo', 'minecraft:barrel', 'c:zomboidcraft:barrel_with_nails'],
  ['abrigo', 'minecraft:torch', 'c:zomboidcraft:torch'],
  ['abrigo', 'minecraft:white_bed', 'c:zomboidcraft:white_bed'],
  ['abrigo', 'minecraft:furnace', 'c:minecraft:furnace'],
  ['abrigo', 'minecraft:lantern', 'c:minecraft:lantern'],
  ['abrigo', 'minecraft:bucket', 'c:minecraft:bucket'],
  ['abrigo', 'farmersdelight:canvas', 'c:farmersdelight:canvas'],
  ['abrigo', 'farmersdelight:flint_knife', 'c:farmersdelight:flint_knife'],
  ['abrigo', 'farmersdelight:cutting_board', 'c:farmersdelight:cutting_board'],
  ['abrigo', 'farmersdelight:cooking_pot', 'c:farmersdelight:cooking_pot'],
  ['abrigo', 'farmersdelight:stove', 'c:farmersdelight:stove'],
  ['abrigo', 'immersiveengineering:hammer', 'c:immersiveengineering:crafting/hammer'],
  ['abrigo', 'immersiveengineering:plate_iron', 'c:immersiveengineering:crafting/plate_iron_hammering'],

  ['saude', 'zc_survival:rag', 'c:zc_survival:rag_from_clothing', 'c:zc_survival:rag_from_string'],
  ['saude', 'zc_survival:bandage', 'c:zc_survival:bandage'],
  ['saude', 'zc_survival:sterile_bandage', 'f:zc_survival:sterile_bandage_campfire', 's:zc_survival:sterile_bandage_smelting'],
  ['saude', 'zc_survival:splint', 'c:zc_survival:splint'],
  ['saude', 'zc_survival:disinfectant', 'c:zc_survival:disinfectant'],
  ['saude', 'zc_survival:suture_kit', 'c:zc_survival:suture_kit'],
  ['saude', 'zc_survival:empty_bottle', 'c:zc_survival:empty_bottle'],
  ['saude', 'zc_survival:boiled_water_bottle', 'f:zc_survival:boiled_water_campfire', 's:zc_survival:boiled_water_smelting'],

  ['roupas', 'zc_clothing:needle', 'c:zc_clothing:needle'],
  ['roupas', 'zc_clothing:thread', 'c:zc_clothing:thread'],
  ['roupas', 'zc_clothing:fabric', 'c:zc_clothing:fabric_from_rags', 'c:zc_clothing:fabric_from_wool'],
  ['roupas', 'zc_clothing:leather_strips', 'c:zc_clothing:leather_strips'],
  ['roupas', 'zc_clothing:socks', 'c:zc_clothing:socks'],
  ['roupas', 'zc_clothing:hoodie', 'c:zc_clothing:hoodie'],
  ['roupas', 'zc_clothing:winter_coat', 'c:zc_clothing:winter_coat'],
  ['roupas', 'zc_clothing:raincoat', 'c:zc_clothing:raincoat'],
  ['roupas', 'zc_clothing:work_boots', 'c:zc_clothing:work_boots'],
  ['roupas', 'zc_clothing:quiet_shoes', 'c:zc_clothing:quiet_shoes'],
  ['roupas', 'zc_clothing:leather_gloves', 'c:zc_clothing:leather_gloves'],
  ['roupas', 'zc_clothing:wool_beanie', 'c:zc_clothing:wool_beanie'],

  ['equipamento', 'sophisticatedbackpacks:backpack', 'c:sophisticatedbackpacks:backpack'],
  ['equipamento', 'zc_player:fanny_pack', 'c:zc_player:fanny_pack'],
  ['equipamento', 'minecraft:shield', 'c:minecraft:shield'],
  ['equipamento', 'tacz:gun_smith_table', 'c:zomboidcraft:gun_smith_table'],

  ['maquinas', 'create:andesite_alloy', 'c:create:crafting/materials/andesite_alloy'],
  ['maquinas', 'create:shaft', 'c:create:crafting/kinetics/shaft'],
  ['maquinas', 'create:cogwheel', 'c:create:crafting/kinetics/cogwheel'],
  ['maquinas', 'create:water_wheel', 'c:create:crafting/kinetics/water_wheel'],
  ['maquinas', 'create:mechanical_press', 'c:create:crafting/kinetics/mechanical_press'],
];
const CATEGORIES = [
  ['primeiros_passos', 'notreepunching:flint_knife'],
  ['abrigo', 'minecraft:chest'],
  ['saude', 'zc_survival:bandage'],
  ['roupas', 'zc_clothing:hoodie'],
  ['equipamento', 'sophisticatedbackpacks:backpack'],
  ['maquinas', 'create:cogwheel'],
];
const PAGE = { c: 'patchouli:crafting', f: 'patchouli:campfire', s: 'patchouli:smelting' };

// ---- name keys: block.ns.path if some en_us.json defines it, else item.ns.path
function zipEntries(b) {
  let e = b.length - 22; while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--; if (e < 0) return [];
  const n = b.readUInt16LE(e + 10); let o = b.readUInt32LE(e + 16); const out = [];
  for (let i = 0; i < n; i++) {
    const method = b.readUInt16LE(o + 10), csize = b.readUInt32LE(o + 20), nl = b.readUInt16LE(o + 28), xl = b.readUInt16LE(o + 30), cl = b.readUInt16LE(o + 32), lo = b.readUInt32LE(o + 42);
    const name = b.toString('utf8', o + 46, o + 46 + nl); o += 46 + nl + xl + cl;
    out.push({ name, read() { const ln = b.readUInt16LE(lo + 26), lx = b.readUInt16LE(lo + 28); const d = b.subarray(lo + 30 + ln + lx, lo + 30 + ln + lx + csize); return method === 8 ? zlib.inflateRawSync(d) : d; } });
  }
  return out;
}
const keys = new Set();
for (const f of JARS.flatMap(d => fs.readdirSync(d).map(n => path.join(d, n)))) {
  let es; try { es = zipEntries(fs.readFileSync(f)); } catch (e) { continue; }
  for (const e of es) if (/^assets\/[^/]+\/lang\/en_us\.json$/.test(e.name)) {
    try { Object.keys(JSON.parse(e.read().toString('utf8'))).forEach(k => keys.add(k)); } catch (x) { /* some mods ship lenient json */ }
  }
}
const nameKey = id => { const [ns, p] = id.split(':'); return keys.has(`block.${ns}.${p}`) ? `block.${ns}.${p}` : `item.${ns}.${p}`; };

// ---- write
const write = (rel, obj) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n'); };
const BOOK = 'assets/zc_hair/patchouli_books/caderno/en_us';
fs.rmSync(path.join(ROOT, BOOK), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'data/zc_recipes/advancements'), { recursive: true, force: true });

const ZC_HAIR = process.env.ZC_HAIR || path.resolve(__dirname, '../../../zc_hair');
const bookJson = path.join(ZC_HAIR, 'src/main/resources/data/zc_hair/patchouli_books/caderno/book.json');
fs.mkdirSync(path.dirname(bookJson), { recursive: true });
fs.writeFileSync(bookJson, JSON.stringify({
  name: 'zc.recipes.journal.name',
  landing_text: 'zc.recipes.journal.landing',
  subtitle: 'zc.recipes.journal.subtitle',
  i18n: true,
  use_resource_pack: true,
  custom_book_item: 'kubejs:survival_journal',
  dont_generate_book: true,
  show_progress: false,   // the bar overflows the spine and stays empty with secret entries
  show_toasts: false,
  pause_game: false,
  // worn notebook look: docs/tools/age_book.js turns Patchouli's book_brown/crafting into these
  book_texture: 'zc_recipes:textures/gui/caderno.png',
  crafting_texture: 'zc_recipes:textures/gui/caderno_crafting.png',
  text_color: '3a2b1c',
  header_color: '4a2812',
  nameplate_color: 'f0e2c0',
  link_color: '8a3412',
  link_hover_color: 'b5521f',
  progress_bar_color: '8a3412',
  progress_bar_background: 'c9b48a'
}, null, 2) + '\n');
CATEGORIES.forEach(([id, icon], i) => write(`${BOOK}/categories/${id}.json`, {
  name: `zc.recipes.cat.${id}`, description: `zc.recipes.cat.${id}.desc`, icon, sortnum: i,
  secret: true   // hidden (not a lock icon) until it has a stored recipe
}));
const list = [];
const sort = {};
for (const [cat, item, ...recipes] of LIST) {
  const key = item.replace(':', '_');
  sort[cat] = (sort[cat] || 0) + 1;
  const pages = [];
  const crafting = recipes.filter(r => r[0] === 'c').map(r => r.slice(2));
  if (crafting.length) pages.push(Object.assign({ type: PAGE.c, recipe: crafting[0] }, crafting[1] ? { recipe2: crafting[1] } : {}));
  recipes.filter(r => r[0] !== 'c').forEach(r => pages.push({ type: PAGE[r[0]], recipe: r.slice(2) }));
  // the survivor's own scribble on the facing page (one text per category, lang zc.recipes.flavor.<cat>)
  pages.push({ type: 'patchouli:text', text: `zc.recipes.flavor.${cat}` });
  write(`${BOOK}/entries/${cat}/${key}.json`, {
    name: nameKey(item), icon: item, category: `zc_hair:${cat}`,
    advancement: `zc_recipes:learned/${key}`, secret: true, sortnum: sort[cat], pages
  });
  write(`data/zc_recipes/advancements/learned/${key}.json`, { criteria: { learned: { trigger: 'minecraft:impossible' } } });
  list.push([item, `zc_hair:${cat}/${key}`, `zc_recipes:learned/${key}`, recipes.map(r => r.slice(2))]);
}
fs.writeFileSync(path.join(ROOT, 'server_scripts/zc_recipe_notes_list.js'),
  '// GENERATED by docs/tools/gen_recipe_book.js - edit the list there and run it again.\n' +
  '// [output item, Patchouli entry, advancement, recipe ids]\n' +
  'var ZC_RECIPE_NOTES = ' + JSON.stringify(list, null, 1).replace(/\n\s+(?=["\]])/g, ' ') + '\n');
console.log(`${list.length} entries, ${CATEGORIES.length} categories; name keys: ${list.filter(l => nameKey(l[0]).startsWith('block')).length} blocks`);
