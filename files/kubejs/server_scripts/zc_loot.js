// ZomboidCraft - where the military salvage comes from (LootJS 2.x, Forge 1.20.1).
// kubejs:weapon_parts / kubejs:military_electronics have NO crafting recipe: loot only.
// zc_world / Lost Cities chests whose loot-table id mentions military/police/army/armory/bunker/weapon/gun
// get good odds; every other chest has a small chance (you can still find a stray part in a house).

LootJS.modifiers(event => {
  const MILITARY = /(military|militar|army|police|policia|armory|arsenal|bunker|weapon|gun|soldier)/

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
})
