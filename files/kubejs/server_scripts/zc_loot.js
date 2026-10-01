// ZomboidCraft - where the military salvage comes from (LootJS 2.x, Forge 1.20.1).
// kubejs:weapon_parts / kubejs:military_electronics have NO crafting recipe: loot only.
// zc_world / Lost Cities chests whose loot-table id mentions military/police/army/armory/bunker/weapon/gun
// get good odds; every other chest has a small chance (you can still find a stray part in a house).

LootJS.modifiers(event => {
  // LootJS matches the WHOLE loot-table id against the regex (matches(), not find()) - hence the .* around it.
  // (Before 0.2.4 it had no .* and silently never matched: only the 3%/1% "any chest" rolls were working.)
  const MILITARY = /.*(military|militar|army|police|policia|armory|arsenal|bunker|weapon|gun|soldier).*/

  event.addLootTableModifier(MILITARY)
    .randomChance(0.45)
    .addLoot(LootEntry.of('kubejs:weapon_parts').limitCount([1, 2]))
  event.addLootTableModifier(MILITARY)
    .randomChance(0.20)
    .addLoot('kubejs:military_electronics')

  // any other chest (houses, shops, ruins, mineshafts...)
  event.addLootTypeModifier(LootType.CHEST)
    .randomChance(0.03)
    .addLoot('kubejs:weapon_parts')
  event.addLootTypeModifier(LootType.CHEST)
    .randomChance(0.01)
    .addLoot('kubejs:military_electronics')

  // v0.2.4 - armor is rare: clothing (zc_clothing) must be what survivors wear.
  // Diamond / golden / netherite armor never comes out of a chest; iron armor half as often.
  // (Marbled's Arsenal military armor stays in military loot on purpose - it has no recipe.)
  event.addLootTypeModifier(LootType.CHEST)
    .removeLoot(Ingredient.of(/^minecraft:(diamond|golden|netherite)_(helmet|chestplate|leggings|boots)$/))
  event.addLootTypeModifier(LootType.CHEST)
    .randomChance(0.5)
    .removeLoot(Ingredient.of(/^minecraft:(iron|chainmail)_(helmet|chestplate|leggings|boots)$/))

  // Marbled's Arsenal military suits have NO recipe (zc_armor.js) and no loot table of their own:
  // only military/police/army chests (same regex as above) may hold one piece.
  const suit = (colors, kind) => {
    let out = []
    colors.forEach(c => ['helmet', 'chestplate', 'leggings', 'boots'].forEach(p =>
      out.push(LootEntry.of(`marbledsarsenal:${c}_${kind}_armor_${p}`))))
    return out
  }
  event.addLootTableModifier(MILITARY)
    .randomChance(0.06)
    .addWeightedLoot(suit(['winter', 'desert'], 'military'))
  event.addLootTableModifier(MILITARY)
    .randomChance(0.015)
    .addWeightedLoot(suit(['olive', 'black'], 'juggernaut'))

  // v0.2.4 - No Tree Punching: the survivor starts with NO tool or weapon. The starter-house chest
  // (zc_world:chests/starter_house) loses its bat / stone sword / any tool, and has a 50% chance of a flint shard
  // (flint shard + stick = flint knife: the first step of the NTP progression, see CLIENT.md "Como comecar").
  const NO_START_TOOLS = /^(minecraft|notreepunching|farmersdelight):(wooden|stone|iron|golden|diamond|flint)_(sword|axe|pickaxe|shovel|hoe|knife|mattock|saw)$/
  event.addLootTableModifier('zc_world:chests/starter_house')
    .removeLoot(Ingredient.of(NO_START_TOOLS))
  event.addLootTableModifier('zc_world:chests/starter_house')
    .randomChance(0.5)
    .addLoot('notreepunching:flint_shard')

  // City start without walking far (NTP): gravel gives a bit more flint, leaves a bit more sticks, and digging
  // dirt/grass by hand sometimes turns up a loose rock. (Loose rocks also generate on zc_world asphalt/sidewalks:
  // kubejs/data/notreepunching/tags/blocks/loose_rock_placeable_on.json.)
  event.addBlockLootModifier('minecraft:gravel')
    .randomChance(0.15)
    .addLoot('minecraft:flint')
  event.addBlockLootModifier('#minecraft:leaves')
    .randomChance(0.08)
    .addLoot('minecraft:stick')
  event.addBlockLootModifier(['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:rooted_dirt'])
    .randomChance(0.05)
    .addLoot('notreepunching:stone_loose_rock')
})
