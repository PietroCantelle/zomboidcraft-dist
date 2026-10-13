// ZomboidCraft - trash bag piles (zc_world:trash_bags): flies buzzing around them + scavenging drops.
// KubeJS 6 / Forge 1.20.1. The 3D model lives in kubejs/assets/zc_world/models/block/trash_bags.json.
//
// Why scripts and not a loot table: zc_world registers the block with noLootTable(), so a
// data/zc_world/loot_tables/blocks/trash_bags.json would be ignored. We drop by hand on BlockEvents.broken.
// Why server-side particles: the block has no animateTick in Java. The server scans the blocks around each
// player every 2 s, caches the piles it found, and sends a few "fly" particles to them every 4 ticks.

var TRASH_BLOCK = 'zc_world:trash_bags'

// ------------------------------------------------------------------ drops
// Tearing a pile open always gives ONE random thing out of what people throw away. Three tiers:
//   JUNK  (75%) - bottles, rotten food, rags, bones... (sometimes 2 of them)
//   USEFUL (20%) - a sealed water bottle, bread, a nugget, a battery
//   RARE   (5%) - canned food, meds, an iron ingot, and a sliver of a chance of military salvage
// Weighted entries: [item id, weight]. Everything here exists in the pack (zc_survival / vanilla / addons).
const JUNK = [
  ['zc_survival:dirty_water_bottle', 10], ['zc_survival:empty_bottle', 10], ['zc_survival:soda_can', 6],
  ['minecraft:rotten_flesh', 12], ['minecraft:poisonous_potato', 6], ['minecraft:bone', 6],
  ['minecraft:paper', 8], ['minecraft:string', 6], ['minecraft:stick', 6], ['zc_survival:rag', 8],
  ['minecraft:glass_bottle', 4]
]
const USEFUL = [
  ['zc_survival:water_bottle', 8], ['zc_survival:glass_water_bottle', 4], ['minecraft:bread', 5], ['minecraft:iron_nugget', 8],
  ['minecraft:leather', 4], ['flashlightmod:battery', 3], ['farmersdelight:onion', 4], ['minecraft:apple', 4]
]
const RARE = [
  ['zc_survival:canned_beans', 6], ['zc_survival:canned_soup', 6], ['zc_survival:canned_peaches', 4],
  ['zc_survival:painkillers', 5], ['zc_survival:bandage', 5], ['zc_survival:antibiotics', 2],
  ['zc_survival:flu_medicine', 3], ['minecraft:iron_ingot', 4], ['kubejs:weapon_parts', 1]
]

function weighted(table) {
  var total = 0
  table.forEach(e => { total += e[1] })
  var r = Math.random() * total
  for (var e of table) { r -= e[1]; if (r < 0) return e[0] }
  return table[table.length - 1][0]
}

BlockEvents.broken(TRASH_BLOCK, event => {
  var who = event.entity
  if (who && who.isCreative && who.isCreative()) return
  var block = event.block
  var r = Math.random()
  if (r < 0.05) {
    block.popItem(Item.of(weighted(RARE)))
  } else if (r < 0.25) {
    block.popItem(Item.of(weighted(USEFUL)))
  } else {
    block.popItem(Item.of(weighted(JUNK)))
    if (Math.random() < 0.35) block.popItem(Item.of(weighted(JUNK)))
  }
})

// ------------------------------------------------------------------ flies
// Small dark dust specks: they fade in and out over the pile and drift a little, like a cloud of gnats.
const FLY = 'dust 0.07 0.07 0.09 0.35'
const SCAN_R = 8          // horizontal scan radius around each player (blocks)
const SCAN_H = 3          // vertical
const SCAN_EVERY = 40     // ticks between scans (2 s)
const SPAWN_EVERY = 4     // ticks between particle bursts
const MAX_PILES = 24      // piles per player that get flies (closest ones win)

var tick = 0
const piles = new Map()   // player uuid -> [[x, y, z], ...]

// Perf: the scan used to read all 17x17x7 blocks through Rhino for every player on the same tick. Now each 16^3 chunk
// section the box touches is first asked (palette lookup, Java side) whether it can hold a pile at all; only those
// are walked. Results are sorted by distance with the old (dx, dz, dy) walk order as tie-break, so the list is the
// same as before. Players are spread over the 40-tick period by their UUID (each still rescans every 40 ticks).
var ZcTrashRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
var ZC_TRASH_ID = new ResourceLocation(TRASH_BLOCK)
// null when zc_world is missing (the registry would hand back air, which must never match)
var ZC_TRASH_BLK = ZcTrashRegistries.BLOCK.containsKey(ZC_TRASH_ID) ? ZcTrashRegistries.BLOCK.get(ZC_TRASH_ID) : null
var ZC_TRASH_PRED = s => s.is(ZC_TRASH_BLK)

function zcTrashScan(level, px, py, pz) {
  var found = []
  if (ZC_TRASH_BLK == null) return found
  var x0 = px - SCAN_R, x1 = px + SCAN_R, y0 = py - SCAN_H, y1 = py + SCAN_H, z0 = pz - SCAN_R, z1 = pz + SCAN_R
  for (var cx = x0 >> 4; cx <= x1 >> 4; cx++) {
    for (var cz = z0 >> 4; cz <= z1 >> 4; cz++) {
      var sections = null
      for (var sy = y0 >> 4; sy <= y1 >> 4; sy++) {
        var idx = level.getSectionIndexFromSectionY(sy)
        if (idx < 0 || idx >= level.getSectionsCount()) continue // outside build height: void air
        if (sections == null) sections = level.getChunk(cx, cz).getSections()
        var sec = sections[idx]
        if (sec.hasOnlyAir() || !sec.maybeHas(ZC_TRASH_PRED)) continue
        var ax = Math.max(x0, cx << 4), bx = Math.min(x1, (cx << 4) + 15)
        var ay = Math.max(y0, sy << 4), by = Math.min(y1, (sy << 4) + 15)
        var az = Math.max(z0, cz << 4), bz = Math.min(z1, (cz << 4) + 15)
        for (var x = ax; x <= bx; x++) {
          for (var z = az; z <= bz; z++) {
            for (var y = ay; y <= by; y++) {
              if (sec.getBlockState(x & 15, y & 15, z & 15).is(ZC_TRASH_BLK)) {
                var dx = x - px, dy = y - py, dz = z - pz
                found.push([x, y, z, dx * dx + dy * dy + dz * dz, dx, dz, dy])
              }
            }
          }
        }
      }
    }
  }
  // distance first, then the order the old dx -> dz -> dy walk produced
  found.sort((a, b) => (a[3] - b[3]) || (a[4] - b[4]) || (a[5] - b[5]) || (a[6] - b[6]))
  if (found.length > MAX_PILES) found = found.slice(0, MAX_PILES)
  return found.map(p => [p[0], p[1], p[2], p[3]])
}

ServerEvents.tick(event => {
  tick++
  if (tick % SPAWN_EVERY !== 0) return
  event.server.players.forEach(player => {
    var level = player.level
    var key = String(player.uuid)
    // stable per-player phase (a multiple of SPAWN_EVERY) inside the SCAN_EVERY period
    var phase = (Math.abs(player.uuid.hashCode()) % (SCAN_EVERY / SPAWN_EVERY)) * SPAWN_EVERY
    if ((tick - phase) % SCAN_EVERY === 0 || !piles.has(key)) {
      piles.set(key, zcTrashScan(level, Math.floor(player.x), Math.floor(player.y), Math.floor(player.z)))
    }
    var list = piles.get(key)
    if (!list || list.length === 0) return
    list.forEach(p => {
      // one fly per burst per pile, sometimes two
      var n = Math.random() < 0.3 ? 2 : 1
      for (var i = 0; i < n; i++) {
        var x = p[0] + 0.2 + Math.random() * 0.6
        var y = p[1] + 0.45 + Math.random() * 0.5
        var z = p[2] + 0.2 + Math.random() * 0.6
        // count 0 = the "offset" triple is used as velocity (scaled by the last argument)
        level.spawnParticles(FLY, false, x, y, z, (Math.random() - 0.5) * 0.8, (Math.random() - 0.3) * 0.4, (Math.random() - 0.5) * 0.8, 0, 1.0)
      }
    })
  })
})

PlayerEvents.loggedOut(event => { piles.delete(String(event.player.uuid)) })

ServerEvents.loaded(() => { piles.clear(); tick = 0 })
