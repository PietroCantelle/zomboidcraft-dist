// ZomboidCraft - custom crafting components (KubeJS 6 / Forge 1.20.1).
// Both are LOOT-ONLY (no crafting recipe): found in military/police chests (see server_scripts/zc_loot.js).
// Textures: kubejs/assets/kubejs/textures/item/<id>.png ; names: kubejs/assets/kubejs/lang/*.json

StartupEvents.registry('item', event => {
  // Receivers, springs, firing pins, bolts - every firearm at the TaCZ Gun Smith Table needs these.
  event.create('weapon_parts')
    .maxStackSize(16)
    .rarity('uncommon')
    .tooltip(Text.translate('item.kubejs.weapon_parts.tooltip').gray())

  // Circuit boards for optics, lasers and the Gun Smith Table itself.
  event.create('military_electronics')
    .maxStackSize(16)
    .rarity('rare')
    .tooltip(Text.translate('item.kubejs.military_electronics.tooltip').gray())
})
