// ZomboidCraft 0.4.2 - TaCZ rounds with an AmmoId that does not exist in the installed gun pack show up as a pink/black
// "item.tacz.ammo". tacz:762x51 was never part of "Timeless & Classics" (its 7.62x51 / .308 round is tacz:308, used by
// the SCAR-H, G3, MK14 and minigun): the chest tables and zc_weapons_loot.js handed it out. Every loot table now gives
// tacz:308 instead, and rounds already in the world are converted when they reach a player's inventory.

const ZC_AMMO_FIX = { 'tacz:762x51': 'tacz:308' }

const zcFixedAmmo = stack => {
  if (!stack || stack.isEmpty() || String(stack.id) !== 'tacz:ammo' || !stack.nbt) return null
  let to = ZC_AMMO_FIX[String(stack.nbt.getString('AmmoId'))]
  return to ? Item.of('tacz:ammo', `{AmmoId:"${to}"}`).withCount(stack.count) : null
}

LootJS.modifiers(event => {
  event.addLootTableModifier(/.*/)
    .modifyLoot(ItemFilter.custom(s => zcFixedAmmo(s) !== null), s => zcFixedAmmo(s))
})

const zcFixAmmoInventory = player => {
  let inv = player.inventory
  for (let i = 0; i < inv.containerSize; i++) {
    let fixed = zcFixedAmmo(inv.getItem(i))
    if (fixed) inv.setItem(i, fixed)
  }
}

PlayerEvents.loggedIn(event => zcFixAmmoInventory(event.player))
// event.slot is a menu slot (not an inventory index): rescan the inventory instead
PlayerEvents.inventoryChanged(event => {
  if (zcFixedAmmo(event.item)) zcFixAmmoInventory(event.player)
})
