// ZomboidCraft - recipe notes (KubeJS 6 / Forge 1.20.1).
// EMI only shows recipes in creative (client_scripts/zc_emi_gamemode.js), so survivors learn recipes from paper:
// every survivor starts with the notebook (a Patchouli book); crumpled notes are loot and get stored in it.
// Logic and loot: server_scripts/zc_recipe_notes.js ; names: kubejs/assets/zc_recipes/lang/*.json

StartupEvents.registry('item', event => {
  // A torn page with ONE random essential recipe (prefers one the reader does not know yet).
  // Stack of 1: the recipe is written into the item NBT the first time someone looks at it.
  event.create('recipe_note')
    .maxStackSize(1)
    .tooltip(Text.translate('item.kubejs.recipe_note.tooltip').gray())

  // The survivor's notebook: opens the Patchouli book zc_recipes:caderno (pages unlock as notes are stored in it).
  event.create('survival_journal')
    .maxStackSize(1)
    .tooltip(Text.translate('item.kubejs.survival_journal.tooltip').gray())
})
