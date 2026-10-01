// ZomboidCraft - armor is LATE and EXPENSIVE; clothing (zc_clothing, Curios slots) is always the priority.
// (KubeJS 6, Forge 1.20.1). v0.2.4.
//
// Every item whose class extends net.minecraft.world.item.ArmorItem is found at runtime (not a hand-written list),
// so armor from mods added later is covered too. Excluded: zc_clothing:*, sophisticatedbackpacks:* and anything with
// 0 armor points (Steam 'n' Rails conductor caps, flower crown - cosmetic).
//
// A) LOOT-ONLY (every recipe that makes them is removed, incl. smithing):
//    diamond / golden / netherite (vanilla), chainmail (vanilla has no recipe anyway), Create netherite diving gear,
//    The Deep Void armor sets (fantasy dimension), Mutant Monsters skeleton armor, Marbled's Arsenal military
//    (winter/desert) and juggernaut suits (found on the military, not made in a garage).
// B) Everything else keeps its own ingredients but becomes a Create MECHANICAL CRAFTING recipe (needs a mechanical
//    crafter array = mid/late Create) with extra rows appended to the original pattern, by armor points of the piece:
//      T1 (1-2 pts: leather cap/boots, iron helmet/boots, gas masks, ghillie, hats, cardboard, faraday...):
//         + 2 canvas (farmersdelight:canvas) + 1 iron plate
//      T2 (3-5 pts: leather tunic, turtle shell, iron leggings, IE steel helmet/boots... Alex's Mobs gear):
//         + 1 precision mechanism + 2 steel plates
//      T3 (6+ pts: iron chestplate, IE/mcore steel chest+legs, titanium, riot/SWAT, plate carriers):
//         + 2 precision mechanisms + 2 steel plates + 2 leather straps
//    Iron in vanilla iron armor is also swapped for iron plates (as before).
// C) Loot: see zc_loot.js (diamond/gold/netherite armor stripped from chests, iron armor halved).

const ZC_ARMOR_LOOT_ONLY = [
  /^minecraft:(diamond|golden|netherite|chainmail)_(helmet|chestplate|leggings|boots)$/,
  /^create:netherite_/,
  /^the_deep_void:/,
  /^mutantmonsters:/,
  /^marbledsarsenal:(winter|desert)_military_armor_/,
  /^marbledsarsenal:(olive|black)_juggernaut_armor_/,
  // 0.2.5: Zombie Extreme (combat/exo/hazmat/civilian suits made of its own disabled ores) and THE UNDEAD REVAMPED
  // (mutant-part armor upgrades): not craftable, the whole item side of both mods is off (zc_specials.js)
  /^zombie_extreme:/,
  /^undead_revamp2:/
]
const ZC_ARMOR_EXCLUDED = /^(zc_clothing|sophisticatedbackpacks|curios):/

ServerEvents.recipes(event => {
  const ArmorItem = Java.loadClass('net.minecraft.world.item.ArmorItem')
  const BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')

  // ---- 1. find every armor item
  const armor = {}   // id -> armor points
  BuiltInRegistries.ITEM.forEach(it => {
    if (!(it instanceof ArmorItem)) return
    let id = String(BuiltInRegistries.ITEM.getKey(it))
    if (ZC_ARMOR_EXCLUDED.test(id)) return
    let def = it.getDefense()
    if (def <= 0) return
    armor[id] = def
  })
  const ids = Object.keys(armor)
  const lootOnly = id => ZC_ARMOR_LOOT_ONLY.some(re => re.test(id))

  // ---- 2. collect the recipes that make them
  const EXTRA = {
    1: { rows: ['787'], key: { '7': { item: 'farmersdelight:canvas' }, '8': { tag: 'forge:plates/iron' } } },
    2: { rows: ['797'], key: { '7': { tag: 'forge:plates/steel' }, '9': { item: 'create:precision_mechanism' } } },
    3: { rows: ['797', '696'], key: { '7': { tag: 'forge:plates/steel' }, '9': { item: 'create:precision_mechanism' }, '6': { item: 'minecraft:leather' } } }
  }
  const tierOf = def => def >= 6 ? 3 : def >= 3 ? 2 : 1
  const swapIron = obj => {
    // vanilla iron armor: ingots -> plates (the old zc_crafting rule, now done here)
    if (obj && obj.item == 'minecraft:iron_ingot') return { tag: 'forge:plates/iron' }
    return obj
  }

  let removed = [], rebuilt = [], skipped = []
  let todo = []
  event.forEachRecipe({ output: ids }, r => {
    let rid = String(r.getId())
    let j
    try { j = JSON.parse(String(r.json.toString())) } catch (e) { skipped.push(rid + ' (json)'); return }
    let out = j.result ? (j.result.item || j.result.id) : null
    let type = String(r.getType())
    if (!out || armor[out] === undefined) { skipped.push(rid + ' (output ' + out + ')'); return }
    if (lootOnly(out)) { todo.push({ r: r, kind: 'remove', rid: rid, out: out }); return }
    if (type != 'minecraft:crafting_shaped' && type != 'minecraft:crafting_shapeless') {
      // smithing upgrades of non-loot-only armor (none today) / other machines: remove, stays craftable by hand path
      todo.push({ r: r, kind: 'remove', rid: rid, out: out }); return
    }
    todo.push({ r: r, kind: 'rebuild', rid: rid, out: out, json: j, type: type })
  })

  todo.forEach(t => {
    t.r.remove()
    if (t.kind == 'remove') { removed.push(t.rid); return }
    let j = t.json
    let key = {}, pattern = []
    if (t.type == 'minecraft:crafting_shaped') {
      pattern = j.pattern.map(s => String(s))
      Object.keys(j.key).forEach(k => {
        let v = j.key[k]
        key[k] = Array.isArray(v) ? v.map(swapIron) : swapIron(v)
      })
    } else {
      // shapeless -> lay the ingredients out in rows of 3
      let letters = 'ABCDEFGHI'
      let row = ''
      j.ingredients.forEach((ing, i) => {
        key[letters[i]] = Array.isArray(ing) ? ing.map(swapIron) : swapIron(ing)
        row += letters[i]
        if (row.length == 3) { pattern.push(row); row = '' }
      })
      if (row.length) pattern.push(row)
    }
    let ex = EXTRA[tierOf(armor[t.out])]
    ex.rows.forEach(r => pattern.push(r))
    Object.keys(ex.key).forEach(k => { key[k] = ex.key[k] })
    let w = Math.max.apply(null, pattern.map(s => s.length))
    pattern = pattern.map(s => { while (s.length < w) s += ' '; return s })
    let count = (j.result && j.result.count) ? j.result.count : 1
    event.custom({
      type: 'create:mechanical_crafting',
      acceptMirrored: true,
      pattern: pattern,
      key: key,
      result: { item: t.out, count: count }
    }).id('zomboidcraft:armor/' + t.rid.replace(':', '/'))
    rebuilt.push(t.rid)
  })

  console.info(`[ZC] armor: ${ids.length} armor items with protection; recipes removed (loot-only) = ${removed.length}, ` +
    `rebuilt as mechanical crafting = ${rebuilt.length}, skipped = ${skipped.length}`)
  console.info(`[ZC] armor removed: ${removed.join(' ')}`)
  console.info(`[ZC] armor rebuilt: ${rebuilt.join(' ')}`)
  if (skipped.length) console.warn(`[ZC] armor skipped: ${skipped.join(' ')}`)

  // ---- 3. no enchanting, no End (v0.2.4). zc_world blocks the table/anvil use and portals server-side;
  // here we only take away the recipes.
  event.remove({ output: 'minecraft:enchanting_table' })
  event.remove({ output: 'minecraft:ender_eye' })
})
