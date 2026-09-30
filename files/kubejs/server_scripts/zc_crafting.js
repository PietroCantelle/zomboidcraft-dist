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
  // ------------------------------------------------------------------ 1. metal tools, weapons, armor
  const GEAR = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe', 'helmet', 'chestplate', 'leggings', 'boots']
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
  let guns = 0, ammo = 0, att = 0
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
  console.info(`[ZC] TaCZ recipes rewritten: guns=${guns} attachments=${att} ammo=${ammo}`)
})
