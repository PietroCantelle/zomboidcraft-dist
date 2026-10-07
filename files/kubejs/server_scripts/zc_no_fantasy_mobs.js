// ZomboidCraft v0.3.4 - no fantasy creatures from Alex's Mobs. Itaverá keeps the real animals only.
// config/alexsmobs.toml sets these spawn weights to 0 (natural spawns). This script also removes the ones
// that already exist in the world (they vanish when their chunk loads) and any that appear some other way
// (structures, events, other mobs). Real animals (bears, crocodiles, snakes, birds, fish...) are untouched.

const ZC_FANTASY_MOBS = [
  'bone_serpent', 'sunbird', 'crimson_mosquito', 'endergrade', 'centipede_head', 'warped_toad', 'mimicube',
  'soul_vulture', 'spectre', 'mungus', 'guster', 'warped_mosco', 'straddler', 'stradpole', 'dropbear',
  'enderiophage', 'void_worm', 'froststalker', 'tusklin', 'laviathan', 'cosmaw', 'rocky_roller', 'flutter',
  'cosmic_cod', 'bunfungus', 'skelewag', 'farseer', 'skreecher', 'underminer', 'murmur', 'sea_bear'
].map(id => 'alexsmobs:' + id)

ZC_FANTASY_MOBS.forEach(id => {
  EntityEvents.spawned(id, event => {
    event.cancel()
  })
})
