// ZomboidCraft (v0.3.4) - "Viciado em café": traço negativo do zc_player (tag de entidade zc_trait_viciado_em_cafe,
// que o mod põe no jogador com o traço). Ideia: uma atividade de tempos em tempos, não um castigo.
//
//  - Ao ganhar o traço: recebe 2 cafés (uma vez só).
//  - 1 dia de jogo (20 min) sem café: aviso "daria tudo por um café".
//  - 1 dia e um quarto sem café: dor de cabeça leve - a cada ~4 min, Fadiga de mineração I por 30 s
//    (às vezes Fraqueza I por 20 s) e um aviso. Não escala, não tira vida, não dá enjoo.
//  - Beber café (kubejs:coffee ou os cafés do Herbal Brews): tira a dor, zera o relógio e dá Pressa I
//    (4 min para viciados, 2 min para qualquer um).
//
// Itens: kubejs:ground_coffee (pó) e kubejs:coffee (startup_scripts/zc_coffee_items.js). Receitas e loot no fim.

const COFFEE_TAG = 'zc_trait_viciado_em_cafe'
const COFFEE_ITEMS = ['kubejs:coffee', 'herbalbrews:coffee', 'herbalbrews:milk_coffee']
const DAY = 24000
const CRAVE_AFTER = DAY            // aviso
const HEADACHE_AFTER = DAY + 6000  // dor de cabeça
const PULSE_EVERY = 4800           // 4 min entre dores
const CHECK_EVERY = 100            // 5 s

const isCoffeeAddict = player => player.tags.contains(COFFEE_TAG)

PlayerEvents.tick(event => {
  const player = event.player
  if (player.level.isClientSide()) return
  const now = player.level.gameTime
  if (now % CHECK_EVERY !== 0) return
  if (!isCoffeeAddict(player)) return

  const data = player.persistentData
  if (!data.getBoolean('zc_coffee_init')) {
    data.putBoolean('zc_coffee_init', true)
    data.putLong('zc_coffee_last', now)
    player.give('2x kubejs:coffee')
    player.tell(Text.of('Viciado em café: você guardou 2 cafés. Um por dia segura a dor de cabeça.').gold())
    return
  }

  const since = now - data.getLong('zc_coffee_last')
  if (since >= CRAVE_AFTER && !data.getBoolean('zc_coffee_craving')) {
    data.putBoolean('zc_coffee_craving', true)
    player.tell(Text.of('Você daria tudo por um café…').yellow())
  }
  if (since >= HEADACHE_AFTER && (since - HEADACHE_AFTER) % PULSE_EVERY < CHECK_EVERY) {
    player.potionEffects.add('minecraft:mining_fatigue', 600, 0, false, true)
    if (Math.random() < 0.4) player.potionEffects.add('minecraft:weakness', 400, 0, false, true)
    player.setStatusMessage(Text.of('Sua cabeça lateja… você precisa de um café.').red())
  }
})

ItemEvents.foodEaten(event => {
  const player = event.player
  if (!player || player.level.isClientSide()) return
  if (!COFFEE_ITEMS.includes(event.item.id)) return
  const addict = isCoffeeAddict(player)
  player.potionEffects.add('minecraft:haste', addict ? 4800 : 2400, 0, false, true)
  if (!addict) return
  const data = player.persistentData
  data.putLong('zc_coffee_last', player.level.gameTime)
  data.putBoolean('zc_coffee_craving', false)
  data.putBoolean('zc_coffee_init', true)
  player.removeEffect('minecraft:mining_fatigue')
  player.removeEffect('minecraft:weakness')
  player.tell(Text.of('Ahh… agora sim. A cabeça parou de latejar.').gold())
})

ServerEvents.recipes(event => {
  // Grãos de café (Herbal Brews: planta selvagem / cultivada) -> pó de café
  event.shapeless('2x kubejs:ground_coffee', ['herbalbrews:coffee_beans'])
  // Pó de café + garrafa de água (vanilla ou do zc_survival) -> café
  const WATER = Ingredient.of([
    Item.of('minecraft:potion', '{Potion:"minecraft:water"}').strongNBT(),
    'zc_survival:water_bottle',
    'zc_survival:boiled_water_bottle',
    'zc_survival:glass_water_bottle',
    'zc_survival:glass_boiled_water_bottle',
  ])
  event.shapeless('kubejs:coffee', ['kubejs:ground_coffee', WATER])
})

LootJS.modifiers(event => {
  // Pó de café em qualquer baú (casas, lojas, escritórios...). Um café pronto, mais raro.
  event.addLootTypeModifier(LootType.CHEST)
    .randomChance(0.08)
    .addLoot(LootEntry.of('kubejs:ground_coffee').limitCount([1, 2]))
  event.addLootTypeModifier(LootType.CHEST)
    .randomChance(0.03)
    .addLoot('kubejs:coffee')
})
