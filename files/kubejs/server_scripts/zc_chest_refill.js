// ZomboidCraft - shared loot chests that refill on a real-time clock (KubeJS 6 / Forge 1.20.1).
//
// Design (v0.3.4):
//   * Lootr is OFF (config/lootr-common.toml: disable = true). Loot chests are plain vanilla chests again:
//     ONE loot for everybody - whoever gets there first takes it, the next player finds it empty.
//   * Every loot chest refills REFILL_MS after it was last filled (2 real-life days), no matter how much
//     in-game time passed. The refill happens lazily, the next time someone opens it.
//   * Story chests and the spawn house refill every 30 min (FAST_REFILL), so every player still gets the quest
//     documents; the metro construction kits never refill (NO_REFILL).
//
// How: zc_world places chests with a vanilla LootTable tag; vanilla removes that tag when the chest is first
// opened. We hook the right-click BEFORE vanilla opens the chest, remember the table in the chest's
// ForgeData (persists through saves, survives the tag being consumed) and, when it is time, put the LootTable
// tag back: loading a chest with a LootTable tag wipes its items, and vanilla rolls fresh loot on open.
// Player-placed chests never had a LootTable tag, so they are never touched.

const REFILL_MS = 2 * 24 * 60 * 60 * 1000   // 2 real days
const CONTAINERS = ['minecraft:chest', 'minecraft:trapped_chest', 'minecraft:barrel']
// Story chests hold quest documents every player needs, and the spawn house is every new player's first chest.
// With shared loot the first player would take them for everyone, so these refill FAST instead of never.
const FAST_REFILL_MS = 30 * 60 * 1000       // 30 real minutes
const FAST_REFILL = [
  /:chests\/story\//,
  /^zc_world:chests\/starter_house$/
]
// Loot tables that must NOT refill at all: the metro construction kits (one-time progression items).
const NO_REFILL = [
  /^zc_world:chests\/metro_(kit|spare)$/
]
const noRefill = id => NO_REFILL.some(rx => rx.test(id))
const refillMs = id => FAST_REFILL.some(rx => rx.test(id)) ? FAST_REFILL_MS : REFILL_MS

// Handles one container block. Returns a short status string for debugging.
function handle(block, now) {
  const nbt = block.entityData
  if (!nbt) return 'no-entity'
  const forge = nbt.getCompound('ForgeData')
  const known = forge.getString('zc_table')

  if (nbt.contains('LootTable')) {
    // Still unopened (fresh from worldgen, or we just put the tag back): remember/refresh the stamp.
    const table = String(nbt.getString('LootTable'))
    if (noRefill(table)) return 'story'
    if (!known || forge.getDouble('zc_filled') === 0) {
      block.mergeEntityData({ ForgeData: { zc_table: table, zc_filled: now } })
      return 'tracked'
    }
    return 'unopened'
  }

  if (!known) return 'untracked'               // opened before this script existed, or player-placed
  const filled = forge.getDouble('zc_filled')
  if (now - filled < refillMs(known)) return 'waiting'
  // A player may have turned this world chest into storage: if there is anything inside, it is theirs - never wipe it.
  // (Chests placed by players never had a LootTable tag, so they are never tracked in the first place.)
  if (nbt.getList('Items', 10).size() > 0) return 'in-use'
  // Time's up: put the loot table back (this empties the chest) and stamp it. Seed 0 = new random roll.
  block.mergeEntityData({ LootTable: known, LootTableSeed: 0, ForgeData: { zc_filled: now } })
  return 'refilled'
}

CONTAINERS.forEach(id => BlockEvents.rightClicked(id, event => {
  if (String(event.hand) !== 'MAIN_HAND') return
  const block = event.block
  const now = Date.now()
  const r = handle(block, now)
  // Double chests: the other half unpacks its own loot table when the menu opens, so stamp it too.
  if (block.id !== 'minecraft:barrel') {
    ;[block.north, block.south, block.east, block.west].forEach(n => {
      if (n && n.id === block.id) handle(n, now)
    })
  }
  if (r === 'refilled' || r === 'tracked') console.info(`[ZC] loot chest ${r} at ${block.pos} (${block.entityData.getCompound('ForgeData').getString('zc_table')})`)
}))
