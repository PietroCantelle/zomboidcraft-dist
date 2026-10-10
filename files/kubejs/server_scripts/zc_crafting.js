// ZomboidCraft - harder, grounded crafting (KubeJS 6, Forge 1.20.1).
// Idea: nothing metal is "hand-made from raw ingots". Metal gear needs PLATES:
//   - early game: Immersive Engineering Engineer's Hammer + ingot in the crafting grid  (immersiveengineering:plate_iron)
//   - mid game:   Create Mechanical Press                                               (create:iron_sheet)
//   Both items are in the tag #forge:plates/iron, so any of them works.
// Firearms need loot-only military salvage (kubejs:weapon_parts / kubejs:military_electronics).
// Every item ID used here was checked against the jars of this pack (see docs/MODLIST.md).

const IRON_PLATE = '#forge:plates/iron'
const GOLD_PLATE = '#forge:plates/gold'
const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
  'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']

ServerEvents.recipes(event => {
  // ------------------------------------------------------------------ 1. metal tools and weapons
  // (armor: see zc_armor.js - since 0.2.4 every armor recipe is loot-only or late mechanical crafting)
  const GEAR = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe']
  GEAR.forEach(g => {
    event.replaceInput({ output: `minecraft:iron_${g}` }, 'minecraft:iron_ingot', IRON_PLATE)
    event.replaceInput({ output: `minecraft:golden_${g}` }, 'minecraft:gold_ingot', GOLD_PLATE)
  })
  // Diamond gear: the diamond is the edge, the body is still a plate + proper handle.
  GEAR.forEach(g => {
    event.replaceInput({ output: `minecraft:diamond_${g}` }, 'minecraft:stick', IRON_PLATE)
  })

  // Other vanilla metal items that a survivor would not bend by hand.
  const PLATED = ['minecraft:shield', 'minecraft:bucket', 'minecraft:shears', 'minecraft:hopper',
    'minecraft:cauldron', 'minecraft:iron_door', 'minecraft:iron_trapdoor', 'minecraft:minecart',
    'minecraft:crossbow', 'minecraft:flint_and_steel', 'minecraft:compass', 'minecraft:lantern',
    'minecraft:chain', 'minecraft:heavy_weighted_pressure_plate', 'minecraft:blast_furnace',
    'minecraft:smithing_table', 'minecraft:stonecutter', 'minecraft:piston', 'minecraft:tripwire_hook']
  PLATED.forEach(id => event.replaceInput({ output: id }, 'minecraft:iron_ingot', IRON_PLATE))
  // Anvil: 3 iron blocks + 4 plates (instead of 3 blocks + 4 ingots)
  event.replaceInput({ id: 'minecraft:anvil' }, 'minecraft:iron_ingot', IRON_PLATE)

  // Vehicles: body panels and engines need plates, engines need Create precision parts.
  event.replaceInput({ mod: 'car' }, 'minecraft:iron_ingot', IRON_PLATE)
  event.replaceInput({ mod: 'immersive_aircraft' }, 'minecraft:iron_ingot', IRON_PLATE)
  ;['car:engine_3_cylinder', 'car:engine_6_cylinder', 'car:engine_truck'].forEach(id =>
    event.replaceInput({ output: id }, 'minecraft:redstone', 'create:precision_mechanism'))

  // ------------------------------------------------------------------ 2. storage & basics
  // Chest: 8 planks are not enough - it needs nails (iron nuggets).
  event.remove({ id: 'minecraft:chest' })
  event.shaped('minecraft:chest', ['PPP', 'PNP', 'PPP'], {
    P: '#minecraft:planks',
    N: '#forge:nuggets/iron'
  }).id('zomboidcraft:chest_with_nails')
  event.remove({ id: 'minecraft:barrel' })
  event.shaped('minecraft:barrel', ['PSP', 'PNP', 'PSP'], {
    P: '#minecraft:planks',
    S: '#minecraft:wooden_slabs',
    N: '#forge:nuggets/iron'
  }).id('zomboidcraft:barrel_with_nails')

  // Torches: half the output of vanilla (2 instead of 4), light is precious.
  event.remove({ id: 'minecraft:torch' })
  event.shaped('2x minecraft:torch', ['C', 'S'], {
    C: '#minecraft:coals',
    S: '#forge:rods/wooden'
  }).id('zomboidcraft:torch')

  // Beds: wool mattress + canvas cover (Farmer's Delight) + wooden frame.
  COLORS.forEach(c => {
    event.remove({ id: `minecraft:${c}_bed` })
    event.shaped(`minecraft:${c}_bed`, ['WWW', 'CCC', 'PSP'], {
      W: `minecraft:${c}_wool`,
      C: 'farmersdelight:canvas',
      P: '#minecraft:planks',
      S: '#forge:rods/wooden'
    }).id(`zomboidcraft:${c}_bed`)
  })

  // Rails and minecarts: rails need plates too.
  event.replaceInput({ id: 'minecraft:rail' }, 'minecraft:iron_ingot', IRON_PLATE)
  event.replaceInput({ id: 'minecraft:powered_rail' }, 'minecraft:gold_ingot', GOLD_PLATE)

  // Atlas (Map Atlases): the mod's recipe is book + a "sticky" item (#map_atlases:sticky_crafting_items =
  // slime ball / honey bottle) + a filled map. Slimes are denied above y=30 by In Control, so the sticky
  // item becomes string: the survivor ties the maps into the book. The filled map is NOT listed in
  // "ingredients" - the recipe class (MapAtlasCreateRecipe) looks for it in the grid by itself, exactly
  // like the mod's own craft_atlas.json.
  event.remove({ id: 'map_atlases:craft_atlas' })
  event.custom({
    type: 'map_atlases:crafting_atlas',
    ingredients: [
      { item: 'minecraft:string' },
      { item: 'minecraft:book' }
    ]
  }).id('zomboidcraft:craft_atlas')

  // ------------------------------------------------------------------ 3. firearms (TaCZ)
  // Gun Smith Table: wood + plates + military electronics + a Create precision mechanism.
  event.remove({ id: 'tacz:gun_smith_table' })
  event.shaped('tacz:gun_smith_table', ['LLL', 'PEP', 'PMP'], {
    L: '#minecraft:logs',
    P: IRON_PLATE,
    E: 'kubejs:military_electronics',
    M: 'create:precision_mechanism'
  }).id('zomboidcraft:gun_smith_table')
  event.replaceInput({ id: 'tacz:ammo_workbench' }, 'minecraft:iron_ingot', IRON_PLATE)
  event.replaceInput({ id: 'tacz:attachment_workbench' }, 'minecraft:iron_ingot', IRON_PLATE)

  // Every Gun Smith Table recipe (TaCZ default pack + addon gun packs): add salvage cost and
  // halve ammo output. Done by rewriting the JSON (TaCZ ships a KubeJS schema, so r.json is available).
  let guns = 0, ammo = 0, att = 0, melee = 0, lrRemoved = 0
  let todo = []
  event.forEachRecipe({ type: 'tacz:gun_smith_table_crafting' }, r => {
    let j = JSON.parse(String(r.json.toString()))
    if (!j.result || !j.materials) return
    let kind = String(j.result.type)
    if (kind == 'gun') {
      j.materials.push({ item: { item: 'kubejs:weapon_parts' }, count: 2 })
      guns++
    } else if (kind == 'attachment') {
      let id = String(j.result.id)
      if (/scope|sight|laser/.test(id)) j.materials.push({ item: { item: 'kubejs:military_electronics' }, count: 1 })
      else j.materials.push({ item: { item: 'kubejs:weapon_parts' }, count: 1 })
      att++
    } else if (kind == 'ammo') {
      if (j.result.count && j.result.count > 1) j.result.count = Math.max(1, Math.floor(j.result.count / 2))
      ammo++
    } else if (kind == 'custom' && j.result.group) {
      // 0.3.9 - LesRaisins Tactical (lrtactical) + DeltaForce Melee Pack: TaCZ cold weapons.
      // Only the MELEE weapons stay; their recipes get very expensive (loot-only salvage + plates instead of ingots).
      // Everything else of lrtactical (grenades, molotov, C4, medkits, flash shield) loses its recipe.
      let group = String(j.result.group)
      if (group != 'lrtactical:melee') {
        r.remove()
        lrRemoved++
        return
      }
      j.materials.forEach(mat => {
        if (mat.item && mat.item.tag == 'forge:ingots/iron') { mat.item = { tag: 'forge:plates/iron' }; mat.count = (mat.count || 1) * 2 }
      })
      j.materials.push({ item: { item: 'kubejs:weapon_parts' }, count: 3 })
      j.materials.push({ item: { tag: 'forge:leather' }, count: 2 })
      melee++
    } else {
      return
    }
    todo.push({ recipe: r, json: j, id: 'zomboidcraft:tacz/' + String(r.getId()).replace(':', '/') })
  })
  // apply after iterating (don't mutate the recipe list while walking it)
  todo.forEach(t => {
    t.recipe.remove()
    event.custom(t.json).id(t.id)
  })
  console.info(`[ZC] TaCZ recipes rewritten: guns=${guns} attachments=${att} ammo=${ammo} melee=${melee} (lrtactical non-melee removed: ${lrRemoved})`)
  // lrtactical's own workbench (Smithing Table LRT): plates instead of ingots
  event.replaceInput({ id: 'lrtactical:smith_table' }, 'minecraft:iron_ingot', IRON_PLATE)

  // ------------------------------------------------------------------ 4. 0.3.9: more ways to make the basics
  // Lona (Farmer's Delight canvas) used to need straw only (knife + wheat/grass). Three alternatives:
  event.shaped('farmersdelight:canvas', ['SS', 'SS'], { S: 'notreepunching:plant_string' }).id('zomboidcraft:canvas_from_plant_string')
  event.shapeless('2x farmersdelight:canvas', ['#minecraft:wool', '#minecraft:wool', '#forge:string']).id('zomboidcraft:canvas_from_wool')
  event.shapeless('2x farmersdelight:canvas', ['#forge:leather', '#forge:leather', '#forge:string']).id('zomboidcraft:canvas_from_leather')
  // Palha without a Farmer's Delight knife: thresh wheat by hand, or shred a dead bush.
  event.shapeless('2x farmersdelight:straw', ['minecraft:wheat', 'minecraft:wheat', 'minecraft:wheat']).id('zomboidcraft:straw_from_wheat')
  event.shapeless('2x farmersdelight:straw', ['minecraft:dead_bush']).id('zomboidcraft:straw_from_dead_bush')
  // Papel de palha, barbante de fibra, corda de barbante.
  event.shaped('2x minecraft:paper', ['SSS'], { S: 'farmersdelight:straw' }).id('zomboidcraft:paper_from_straw')
  event.shapeless('2x minecraft:string', ['notreepunching:plant_string', 'notreepunching:plant_string', 'notreepunching:plant_string']).id('zomboidcraft:string_from_plant_string')
  event.shaped('2x farmersdelight:rope', ['S', 'S', 'S'], { S: '#forge:string' }).id('zomboidcraft:rope_from_string')

  // ------------------------------------------------------------------ 5. 0.4.0: planks in any layout, Nether substitutes
  // No Tree Punching only makes planks with the tool ABOVE the log (1x2 shaped) and 6 sticks with tool + log side by
  // side (mirrored too), so "log next to axe" always gave sticks. Now: log + axe/saw anywhere in the grid = planks
  // (2 with a weak saw = any axe, 4 with a saw); the log -> sticks shortcut moves to the knife (log + knife = 4 sticks).
  // The per-wood pairs come from the vanilla log -> planks recipes that NTP later replaces at runtime.
  let planksDone = 0
  event.forEachRecipe({ type: 'minecraft:crafting_shapeless', output: '#minecraft:planks' }, r => {
    let j = r.json
    if (!j.has('ingredients') || j.get('ingredients').size() !== 1) return
    let ing = j.get('ingredients').get(0)
    let res = j.get('result')
    let out = res.isJsonObject() ? res.get('item').getAsString() : res.getAsString()
    let count = res.isJsonObject() && res.has('count') ? res.get('count').getAsInt() : 4
    if (count < 4) return // keep the odd 1:1 recipes (stripped bark, etc.) alone
    let name = out.replace(':', '_')
    event.custom({ type: 'notreepunching:tool_damaging_shapeless', recipe: { type: 'minecraft:crafting_shapeless',
      ingredients: [ing, { tag: 'notreepunching:weak_saws' }], result: { item: out, count: 2 } } }).id('zomboidcraft:planks_axe/' + name)
    event.custom({ type: 'notreepunching:tool_damaging_shapeless', recipe: { type: 'minecraft:crafting_shapeless',
      ingredients: [ing, { tag: 'notreepunching:saws' }], result: { item: out, count: 4 } } }).id('zomboidcraft:planks_saw/' + name)
    planksDone++
  })
  console.info('[ZC] planks-anywhere recipes: ' + planksDone + ' woods')
  event.remove({ id: 'notreepunching:sticks_from_logs_with_flint_axe' })
  event.remove({ id: 'notreepunching:sticks_from_logs_with_saw' })
  event.custom({ type: 'notreepunching:tool_damaging_shapeless', recipe: { type: 'minecraft:crafting_shapeless',
    ingredients: [{ tag: 'minecraft:logs' }, { tag: 'notreepunching:knives' }], result: { item: 'minecraft:stick', count: 4 } } }).id('zomboidcraft:sticks_from_log_knife')

  // The Nether is sealed (the wall), so the base Nether materials get overworld recipes...
  event.shapeless('minecraft:quartz', ['minecraft:amethyst_shard', 'minecraft:amethyst_shard']).id('zomboidcraft:quartz_from_amethyst')
  event.shapeless('2x minecraft:glowstone_dust', ['minecraft:glow_ink_sac', '#forge:dusts/redstone']).id('zomboidcraft:glowstone_from_glow_ink')
  event.shapeless('2x minecraft:blaze_powder', ['minecraft:gunpowder', 'minecraft:gunpowder', '#forge:dusts/redstone', 'minecraft:coal']).id('zomboidcraft:blaze_powder_from_gunpowder')
  event.shaped('minecraft:blaze_rod', ['P', 'P', 'S'], { P: 'minecraft:blaze_powder', S: '#forge:rods/wooden' }).id('zomboidcraft:blaze_rod_from_powder')
  event.shapeless('minecraft:nether_wart', ['minecraft:red_mushroom', 'minecraft:red_mushroom', 'minecraft:bone_meal']).id('zomboidcraft:nether_wart_from_mushroom')
  event.shaped('4x minecraft:netherrack', ['CC', 'CP'], { C: '#forge:cobblestone', P: 'minecraft:blaze_powder' }).id('zomboidcraft:netherrack_from_cobble')
  event.shapeless('minecraft:magma_cream', ['minecraft:slime_ball', 'minecraft:blaze_powder']).id('zomboidcraft:magma_cream_overworld')
  // ...and the recipes the players actually hit (TaCZ melee packs, Create) take the overworld item directly.
  ;['lrtactical', 'delta_wt', 'tacz'].forEach(mod => {
    event.replaceInput({ mod: mod }, '#forge:gems/quartz', 'minecraft:amethyst_shard')
    event.replaceInput({ mod: mod }, '#forge:dusts/glowstone', 'minecraft:glow_ink_sac')
    event.replaceInput({ mod: mod }, 'minecraft:blaze_powder', 'minecraft:gunpowder')
    event.replaceInput({ mod: mod }, '#forge:rods/blaze', 'minecraft:lightning_rod')
    event.replaceInput({ mod: mod }, 'minecraft:magma_cream', 'minecraft:slime_ball')
    event.replaceInput({ mod: mod }, 'minecraft:nether_wart', 'minecraft:red_mushroom')
    event.replaceInput({ mod: mod }, 'minecraft:dragon_breath', 'minecraft:honey_bottle')
  })
  event.replaceInput({ id: 'create:crafting/materials/rose_quartz' }, '#forge:gems/quartz', 'minecraft:amethyst_shard')
  event.replaceInput({ id: 'create:crafting/kinetics/empty_blaze_burner' }, '#forge:netherrack', 'minecraft:bricks')
  event.shapeless('create:blaze_burner', ['create:empty_blaze_burner', '#forge:storage_blocks/coal', 'minecraft:blaze_powder', 'minecraft:blaze_powder']).id('zomboidcraft:blaze_burner_overworld')
  event.replaceInput({ id: 'securitycraft:keycard_lv3' }, '#forge:ingots/nether_brick', 'minecraft:brick')
  event.replaceInput({ id: 'immersive_aircraft:nether_engine' }, 'minecraft:netherite_ingot', '#forge:ingots/iron')
  event.replaceInput({ id: 'immersive_aircraft:nether_engine' }, 'minecraft:nether_brick', 'minecraft:brick')
})
