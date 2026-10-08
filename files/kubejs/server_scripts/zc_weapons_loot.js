// ZomboidCraft 0.3.6 - weapons in EVERY chest (LootJS 2.13, Forge 1.20.1). The zc_world chest tables already follow these
// rules (forge/zc_world/tools/loot_weapons.py); this script covers the rest: Lost Cities, vanilla structures, Keerdm's cars
// and gun chests, Lootr-wrapped tables, other mods.
//   * no potions (healing or any other) - only plain water bottles stay (they are the "dirty glass water" of the pack);
//   * vanilla swords -> a melee weapon of Lot-a-Melees 60% of the time (damaged), nothing otherwise;
//   * bows / crossbows / arrows -> TaCZ ammo, or (rarely) a simple gun;
//   * a stray box of rounds in ~8% of any chest; guns only through the military / police / gun chests, and rare;
//   * the top tier (AWP, M95, M249, RPK, RPG-7, golden Deagle) never comes out of a chest;
//   * Keerdm's "point blank" gun chests lose their guns 3 times out of 4.
LootJS.modifiers(event => {
  const MELEE = [['baseball_bat', 10], ['crowbar', 8], ['pipe_wrench', 8], ['police_baton', 6], ['machete', 5], ['modern_axe', 4],
    ['steel_baseball_bat', 3], ['barbed_baseball_bat', 3], ['tomahawk', 3], ['fire_axe', 2], ['sledgehammer', 2], ['katana', 1],
    ['tanto', 2], ['bone_saw', 2], ['stop_sign', 1]]
  const SIMPLE = [['glock_17', 'SEMI', 6], ['cz75', 'SEMI', 5], ['db_short', 'SEMI', 4], ['uzi', 'AUTO', 3], ['db_long', 'SEMI', 2]]
  const GOOD = [['hk_mp5a5', 'AUTO', 4], ['ump45', 'AUTO', 4], ['ak47', 'AUTO', 3], ['m4a1', 'AUTO', 3], ['sks_tactical', 'SEMI', 3],
    ['m16a1', 'BURST', 2], ['vector45', 'AUTO', 2], ['deagle', 'SEMI', 2], ['scar_h', 'AUTO', 1], ['hk_g3', 'AUTO', 1], ['aa12', 'AUTO', 1]]
  const AMMO = [['9mm', 12, 4, 14], ['12g', 8, 2, 8], ['45acp', 7, 4, 12], ['762x39', 6, 5, 15], ['556x45', 6, 5, 15], ['357mag', 3, 3, 8],
    ['50ae', 2, 2, 6], ['762x51', 2, 4, 10], ['46x30', 2, 6, 14]]
  const TOP = ['tacz:ai_awp', 'tacz:m95', 'tacz:m249', 'tacz:rpk', 'tacz:rpg7', 'tacz:deagle_golden']

  const pick = list => {
    let total = 0
    list.forEach(e => { total += e[e.length - 1] })
    let r = Math.random() * total
    for (const e of list) { r -= e[e.length - 1]; if (r < 0) return e }
    return list[0]
  }
  const gunStack = g => Item.of('tacz:modern_kinetic_gun', `{GunId:"tacz:${g[0]}",GunFireMode:"${g[1]}",GunCurrentAmmoCount:0,HasBulletInBarrel:0b}`)
  const ammoStack = (a, mult) => {
    const n = Math.floor(a[2] * mult + Math.random() * (a[3] - a[2]) * mult)
    return Item.of('tacz:ammo', `{AmmoId:"tacz:${a[0]}"}`).withCount(Math.max(1, n))
  }
  const meleeStack = () => {
    const s = Item.of('marbledsmelees:' + pick(MELEE)[0])
    try { s.damageValue = Math.floor(s.maxDamage * (0.2 + Math.random() * 0.55)) } catch (e) { }
    return s
  }
  const gunId = stack => String(stack.nbt ? stack.nbt.getString('GunId') : '')
  const isGun = stack => String(stack.id) === 'tacz:modern_kinetic_gun'

  const SWORD = /^minecraft:(wooden|stone|iron|golden|diamond|netherite)_sword$/
  const RANGED = /^minecraft:(bow|crossbow|arrow|spectral_arrow|tipped_arrow)$/
  const POTION = ItemFilter.custom(s => /^minecraft:(splash_|lingering_)?potion$/.test(String(s.id))
    && String(s.nbt ? s.nbt.getString('Potion') : '') !== 'minecraft:water')
  const MILITARY = /.*(military|militar|army|police|policia|armory|arsenal|bunker|weapon|gun|soldier|batalhao|base_cerco|portao1).*/

  // 1. potions out of every chest
  event.addLootTypeModifier(LootType.CHEST).removeLoot(POTION)
  // 2. swords -> melee weapons (fewer than there were swords)
  event.addLootTypeModifier(LootType.CHEST)
    .modifyLoot(Ingredient.of(SWORD), s => Math.random() < 0.6 ? meleeStack() : Item.of('minecraft:air'))
  // 3. bows and arrows -> rounds; 1 in 10 a simple gun
  event.addLootTypeModifier(LootType.CHEST)
    .modifyLoot(Ingredient.of(RANGED), s => Math.random() < 0.1 ? gunStack(pick(SIMPLE)) : ammoStack(pick(AMMO), 1))
  // 4. the top tier never, and most guns of Keerdm's gun chests are gone
  event.addLootTypeModifier(LootType.CHEST)
    .removeLoot(ItemFilter.custom(s => isGun(s) && TOP.indexOf(gunId(s)) >= 0))
  event.addLootTableModifier(/.*vics_point_blank_gunchest.*/)
    .randomChance(0.75)
    .removeLoot(ItemFilter.custom(s => isGun(s)))
  // 5. a stray box of rounds anywhere (zc_world tables already have their own rounds: skip them)
  event.addLootTableModifier(/^(?!zc_world:).*/)
    .randomChance(0.08)
    .addWeightedLoot(AMMO.map(a => LootEntry.of(ammoStack(a, 1)).withWeight(a[1])))
  // 6. military / police / gun chests of OTHER mods and Lost Cities: more rounds, a rare gun (the zc_world ones are built in)
  const OTHER_MILITARY = /^(?!zc_world:).*(military|militar|army|police|policia|armory|arsenal|bunker|weapon|gun|soldier).*/
  event.addLootTableModifier(OTHER_MILITARY)
    .randomChance(0.5)
    .addWeightedLoot(AMMO.map(a => LootEntry.of(ammoStack(a, 1.8)).withWeight(a[1])))
  event.addLootTableModifier(OTHER_MILITARY)
    .randomChance(0.05)
    .addWeightedLoot(SIMPLE.map(g => LootEntry.of(gunStack(g)).withWeight(g[2])))
  event.addLootTableModifier(OTHER_MILITARY)
    .randomChance(0.01)
    .addWeightedLoot(GOOD.map(g => LootEntry.of(gunStack(g)).withWeight(g[2])))
})
