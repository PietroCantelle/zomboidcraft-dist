// ZomboidCraft (v0.3.4) - Café. Par do traço negativo "Viciado em café" (zc_player, enum Trait VICIADO_EM_CAFE,
// id "viciado_em_cafe"); a mecânica fica em server_scripts/zc_coffee.js.
// Nomes definidos aqui (displayName) para não mexer nos lang do kubejs. Texturas: kubejs/assets/kubejs/textures/item/.

StartupEvents.registry('item', event => {
  // Pó de café: achado em baú (qualquer baú, ~8%) ou feito com grãos de café do Herbal Brews.
  event.create('ground_coffee')
    .displayName(Text.of('Pó de café'))
    .maxStackSize(16)
    .tooltip(Text.of('Pó de café + garrafa de água = café. Viciados em café precisam disso.').gray())

  // Café: bebida. Quem é viciado fica sem dor de cabeça por um dia; todo mundo ganha um pique (Pressa).
  event.create('coffee')
    .displayName(Text.of('Café'))
    .maxStackSize(16)
    .useAnimation('drink')
    .useDuration(stack => 32)
    .food(food => food.hunger(1).saturation(0.2).alwaysEdible())
    .tooltip(Text.of('Segure o clique direito para beber. Acorda qualquer um; viciados em café precisam de um por dia.').gray())
})
