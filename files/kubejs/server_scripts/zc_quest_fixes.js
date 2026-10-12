// ZomboidCraft v0.3.4 - fixes so every quest in the diary can actually be completed as written.
// Found in the 0.3.4 quest audit (items described in the quests vs. what the recipes/loot really do).

ServerEvents.recipes(event => {
  // "Temperatura corporal" (prologue) asks for a campfire item and "Fundação" (act 2) for a Farmer's Delight
  // stove, which needs a campfire. No Tree Punching deletes the vanilla campfire recipe and a placed campfire
  // drops charcoal, so neither quest could be finished. Fire starter + sticks + logs keeps the NTP feel.
  event.shaped('minecraft:campfire', [' S ', 'SFS', 'LLL'], {
    S: '#forge:rods/wooden',
    F: 'notreepunching:fire_starter',
    L: '#minecraft:logs'
  }).id('zomboidcraft:campfire_from_fire_starter')

  // "A Receita" (act 5) says to craft the reversal injection, but it needed a ghast tear and the Nether is closed.
  event.replaceInput({ id: 'zc_player:reversal_injection' }, 'minecraft:ghast_tear', 'zc_survival:antibiotics')

  // The prologue teaches "Barbante Vegetal" (plant string) and the quests say barbante works for thread,
  // fanny pack, rags and the suture kit; those recipes only took vanilla string.
  ;['zc_clothing:thread', 'zc_player:fanny_pack', 'zc_survival:rag_from_string', 'zc_survival:suture_kit'].forEach(id => {
    event.replaceInput({ id: id }, 'minecraft:string', '#notreepunching:string')
  })
})

// "O Escudo" (act 4): the quest says the Batalhão arsenal opens with the arsenal key in hand, but the arsenal
// doors are plain iron doors with no lock. With the key in hand, right-clicking an iron door inside the
// Batalhão opens or closes it. Outside the Batalhão nothing changes.
let zcqfLocationsApi = null
try { zcqfLocationsApi = Java.loadClass('gg.zomboidcraft.world.api.ZcLocations') } catch (e) { console.warn('[zc_quest_fixes] ZcLocations: ' + e) }

BlockEvents.rightClicked('minecraft:iron_door', event => {
  if (event.hand != 'MAIN_HAND' || event.item.id != 'zc_story:chave_arsenal' || !zcqfLocationsApi) return
  const block = event.block
  if (!zcqfLocationsApi.isInside(event.level, 'batalhao', block.pos)) return
  const state = block.blockState
  const open = String(block.properties.get('open')) == 'true'
  state.block.setOpen(event.player, event.level, state, block.pos, !open)
  event.player.addTag('zc_story_door_chave_arsenal_opened')
  event.cancel()
})
