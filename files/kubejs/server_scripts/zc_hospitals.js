// ZomboidCraft v0.3.5 - "Hospitals" mod (hospitals:*) is here for its furniture and building blocks only.
// Its healing items would bypass zc_survival's medicine (bandages, sutures, antibiotics, Knox), so they
// cannot be crafted. The mod's own pharmacy structure is disabled in
// kubejs/data/hospitals/worldgen/structure/pharmacy.json (empty biome list).

ServerEvents.recipes(event => {
  const NO_CRAFT = [
    'hospitals:small_medkit', 'hospitals:largemedkit', 'hospitals:creative_pill', 'hospitals:pill',
    'hospitals:bloodbagempty', 'hospitals:empty_syringe', 'hospitals:iv_kit', 'hospitals:blood_type_tester'
  ]
  NO_CRAFT.forEach(id => event.remove({ output: id }))
})
