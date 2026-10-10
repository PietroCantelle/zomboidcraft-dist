// ZomboidCraft 0.3.3 - decoration / fun mods (Supplementaries, Macaw's, Rubber Duck, Plushie Mod, Emotecraft).
// (KubeJS 6, Forge 1.20.1)
// Supplementaries' bombs and cannon are switched off in config/supplementaries-common.toml (tools.bomb / functional.cannon).
// This is the belt-and-braces part: if a later update turns them back on, they still have no recipe.
// Regex outputs never fail when the item does not exist.
ServerEvents.recipes(event => {
  event.remove({ output: /^supplementaries:(bomb|bomb_blue|bomb_spiky|cannon|cannonball)$/ })
})
