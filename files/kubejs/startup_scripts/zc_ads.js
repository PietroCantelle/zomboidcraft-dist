// ZomboidCraft - cartazes de propaganda (KubeJS 6 / Forge 1.20.1). GERADO por pack/tools/gen_ads.py - nao edite.
// Um bloco por cartaz: kubejs:ad_<id>, 'cardinal' (facing = lado de fora, como as placas), sem colisao, placa fina
// encostada na parede. O zc_world usa nas estacoes do Metro de Itavera (Pal: 'kubejs:ad_<id>|minecraft:air').
const ADS = ["guarana_itavera", "cerveja_bambu", "sabao_brilha", "telmais", "farmacia_popular", "banco_itavera", "loteria_sorte", "mercado_bom_preco", "forro_itavera", "metro_mapa", "saude_fique_em_casa", "vacina", "quarentena_aviso", "procurado_dente"]
StartupEvents.registry('block', event => {
  ADS.forEach(id => {
    event.create('ad_' + id, 'cardinal')
      .model('kubejs:block/ad_' + id)
      .noCollision()
      .notSolid()
      .defaultCutout()
      .hardness(0.3)
      .resistance(0.5)
      .soundType('wool')
      .tagBlock('minecraft:mineable/axe')
      .noValidSpawns(true)
      .box(0, 0, 15, 16, 16, 16, true)
  })
})
