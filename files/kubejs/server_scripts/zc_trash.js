// ZomboidCraft - trash bag piles (zc_world:trash_bags): flies buzzing around them + scavenging drops.
// KubeJS 6 / Forge 1.20.1. The 3D model lives in kubejs/assets/zc_world/models/block/trash_bags.json.
//
// Why scripts and not a loot table: zc_world registers the block with noLootTable(), so a
// data/zc_world/loot_tables/blocks/trash_bags.json would be ignored. We drop by hand on BlockEvents.broken.
// Why server-side particles: the block has no animateTick in Java. The server scans the blocks around each
// player every 2 s, caches the piles it found, and sends a few "fly" particles to them every 4 ticks.

const TRASH_BLOCK = 'zc_world:trash_bags'

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
  let total = 0
  table.forEach(e => { total += e[1] })
  let r = Math.random() * total
  for (const e of table) { r -= e[1]; if (r < 0) return e[0] }
  return table[table.length - 1][0]
}

BlockEvents.broken(TRASH_BLOCK, event => {
  const who = event.entity
  if (who && who.isCreative && who.isCreative()) return
  const block = event.block
  const r = Math.random()
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

let tick = 0
const piles = new Map()   // player uuid -> [[x, y, z], ...]

ServerEvents.tick(event => {
  tick++
  if (tick % SPAWN_EVERY !== 0) return
  const rescan = tick % SCAN_EVERY === 0
  event.server.players.forEach(player => {
    const level = player.level
    const key = String(player.uuid)
    if (rescan || !piles.has(key)) {
      const found = []
      const px = Math.floor(player.x), py = Math.floor(player.y), pz = Math.floor(player.z)
      for (let dx = -SCAN_R; dx <= SCAN_R; dx++) {
        for (let dz = -SCAN_R; dz <= SCAN_R; dz++) {
          for (let dy = -SCAN_H; dy <= SCAN_H; dy++) {
            if (level.getBlock(px + dx, py + dy, pz + dz).id === TRASH_BLOCK) {
              found.push([px + dx, py + dy, pz + dz, dx * dx + dy * dy + dz * dz])
            }
          }
        }
      }
      found.sort((a, b) => a[3] - b[3])
      piles.set(key, found.slice(0, MAX_PILES))
    }
    const list = piles.get(key)
    if (!list || list.length === 0) return
    list.forEach(p => {
      // one fly per burst per pile, sometimes two
      const n = Math.random() < 0.3 ? 2 : 1
      for (let i = 0; i < n; i++) {
        const x = p[0] + 0.2 + Math.random() * 0.6
        const y = p[1] + 0.45 + Math.random() * 0.5
        const z = p[2] + 0.2 + Math.random() * 0.6
        // count 0 = the "offset" triple is used as velocity (scaled by the last argument)
        level.spawnParticles(FLY, false, x, y, z, (Math.random() - 0.5) * 0.8, (Math.random() - 0.3) * 0.4, (Math.random() - 0.5) * 0.8, 0, 1.0)
      }
    })
  })
})

ServerEvents.loaded(() => { piles.clear(); tick = 0 })
