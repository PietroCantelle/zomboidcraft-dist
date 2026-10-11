// ZomboidCraft 0.4.2 - no Nether mobs in Itaverá (the Overworld). The Hordes' default spawn table brought zombified
// piglins, zoglins and piglin brutes in its late-game hordes (kubejs/data/hordes/horde_data/tables now has zombies only)
// and portals can still push piglins through. config/incontrol/spawn.json denies them; this script also removes the
// ones already saved in the world (they vanish when their chunk loads) and any that appear some other way.
// The Deep Void's Abductor (carried players to its dimension) is off too: config "Deep Void Config.toml".

const ZC_NETHER_MOBS = [
  'minecraft:zombified_piglin', 'minecraft:piglin', 'minecraft:piglin_brute', 'minecraft:hoglin', 'minecraft:zoglin',
  'minecraft:blaze', 'minecraft:ghast', 'minecraft:wither_skeleton', 'minecraft:magma_cube', 'minecraft:strider',
  'the_deep_void:abductor',
  // 0.4.2 hotfix: no zombie horses either (The Hordes' default table brought them)
  'minecraft:zombie_horse'
]

ZC_NETHER_MOBS.forEach(id => {
  EntityEvents.spawned(id, event => {
    if (String(event.level.dimension) !== 'minecraft:overworld') return
    // KubeJS 6: cancel() ends the handler on the spot, so it must be the last call
    event.cancel()
  })
})
