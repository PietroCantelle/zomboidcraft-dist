// ZomboidCraft (v0.2.4) - no enchanting in this world: hide enchanted books / enchanting table / eye of ender in JEI.
// EMI (the recipe viewer players see) is filtered by kubejs/assets/emi/index/stacks/zomboidcraft.json.
JEIEvents.hideItems(event => {
  event.hide('minecraft:enchanted_book')
  event.hide('minecraft:enchanting_table')
  event.hide('minecraft:ender_eye')
})

// v0.3.3 - Supplementaries bombs and cannon are off (config + kubejs/server_scripts/zc_extras.js).
JEIEvents.hideItems(event => {
  ;['bomb', 'bomb_blue', 'bomb_spiky', 'cannon', 'cannonball'].forEach(i => event.hide(`supplementaries:${i}`))
})
