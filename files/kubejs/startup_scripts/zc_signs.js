// ZomboidCraft - 3D establishment signs (KubeJS 6 / Forge 1.20.1). GENERATED - edit scratch gen/make_signs.js, not this file.
// One block per establishment: kubejs:sign_<id>, horizontal facing ("cardinal"), no collision, model in
// kubejs/assets/kubejs/models/block/sign_<id>.json (child of a sign_style_* model built in Blockbench).
// Lost Cities parts in kubejs/data/zc_world/lostcities/parts/ place them where the old wooden signs were.
const SIGN_STYLES = {
  letreiro: { sound: 'wood', light: 0 },
  luminoso: { sound: 'metal', light: 0.7 },
  oficial: { sound: 'metal', light: 0 },
  aviso: { sound: 'metal', light: 0 },
  pendurada: { sound: 'wood', light: 0 }
}
const SIGNS = [
  ['lava_jato', 'letreiro'],
  ['bar_sinuca', 'luminoso'],
  ['boate', 'luminoso'],
  ['bingo', 'luminoso'],
  ['karaoke', 'luminoso'],
  ['motel', 'luminoso'],
  ['motel_entrada', 'pendurada'],
  ['academia', 'letreiro'],
  ['atacadista', 'letreiro'],
  ['borracharia', 'letreiro'],
  ['distribuidora', 'letreiro'],
  ['galeria', 'letreiro'],
  ['lanhouse', 'letreiro'],
  ['loterica', 'letreiro'],
  ['material', 'letreiro'],
  ['salao', 'letreiro'],
  ['barbearia', 'pendurada'],
  ['funilaria', 'letreiro'],
  ['bombeiros', 'oficial'],
  ['delegacia', 'oficial'],
  ['terminal', 'oficial'],
  ['lanchonete_terminal', 'pendurada'],
  ['ubs', 'oficial'],
  ['correios', 'oficial'],
  ['creche', 'oficial'],
  ['ginasio', 'oficial'],
  ['triagem', 'oficial'],
  ['associacao', 'oficial'],
  ['matriz', 'letreiro'],
  ['assembleia', 'letreiro'],
  ['centro_empresarial', 'oficial'],
  ['edificio', 'oficial'],
  ['shopping', 'letreiro'],
  ['pastel', 'pendurada'],
  ['burger', 'pendurada'],
  ['acai', 'pendurada'],
  ['prato_feito', 'pendurada'],
  ['metro', 'oficial'],
  ['escola', 'oficial'],
  ['igreja_abrigo', 'letreiro'],
  ['quarentena', 'aviso'],
  ['descontaminacao', 'aviso'],
  ['area_isolada', 'aviso'],
  ['bloqueio', 'aviso'],
  ['batalhao', 'oficial'],
  ['hospital', 'oficial'],
  ['galeria_itavera', 'letreiro'],
  ['eta', 'oficial'],
  ['subestacao', 'oficial'],
  ['bombeiros_quartel', 'oficial'],
  ['presidio', 'oficial'],
  ['campus_veridia', 'oficial'],
  ['ute', 'oficial'],
  ['unidade4', 'aviso'],
  ['portao1', 'aviso'],
  ['base_cerco', 'oficial'],
  ['tunel_servico', 'aviso'],
  ['safezone_colegio', 'oficial'],
  ['refugio_colegio', 'aviso'],
  ['safezone_galpao', 'letreiro'],
  ['safezone_matriz', 'letreiro'],
  ['posto_comando', 'oficial'],
  ['torre_controle', 'oficial'],
  ['biociencias', 'oficial'],
  ['brinquedos', 'pendurada'],
  ['caca_pesca', 'pendurada'],
  ['cafe', 'pendurada'],
  ['calcados', 'pendurada'],
  ['casa_lar', 'pendurada'],
  ['eletronicos', 'pendurada'],
  ['esportes', 'pendurada'],
  ['farmacia_galeria', 'pendurada'],
  ['ferragens', 'pendurada'],
  ['lanchonete_galeria', 'pendurada'],
  ['livraria', 'pendurada'],
  ['mercadinho', 'pendurada'],
  ['modas', 'pendurada'],
  ['otica', 'pendurada'],
  ['perfumaria', 'pendurada'],
  ['presentes', 'pendurada']
]
StartupEvents.registry('block', event => {
  SIGNS.forEach(([id, style]) => {
    const st = SIGN_STYLES[style]
    const b = event.create('sign_' + id, 'cardinal')
      .model('kubejs:block/sign_' + id)
      .noCollision()
      .notSolid()
      .defaultCutout()
      .hardness(0.8)
      .resistance(1)
      .soundType(st.sound)
      .tagBlock('minecraft:mineable/axe')
      .noValidSpawns(true)
      .box(0, 0, 8, 16, 16, 16, true)
    if (st.light > 0) b.lightLevel(st.light)
  })
})
