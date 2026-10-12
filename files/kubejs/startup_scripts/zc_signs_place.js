// ZomboidCraft - puts the 3D signs on the map (KubeJS 6 / Forge 1.20.1). GENERATED - edit scratch gen/make_signs.js.
//
// The story locations (batalhão, presídio, safezones, Unidade 4, galeria...) are built by zc_world's Java code, which
// writes plain wooden wall signs. We cannot change that code from the pack, so: every time a chunk loads, a few ticks
// later we look at its block entities, and every wall sign whose first line(s) match the table below becomes the
// matching kubejs:sign_* block, keeping the facing. Already-generated chunks get fixed too, the first time they load
// after this script exists. Lost Cities buildings are covered by the part overrides, but their texts are in the
// table as well so old chunks catch up. Player-written signs with the same first line would be swapped too - unlikely.
const SIGN_TABLE = [
  ["CORPO DE BOMBEIROS", "QUARTEL", "bombeiros_quartel"],
  ["LANCHONETE", "DO TERMINAL", "lanchonete_terminal"],
  ["HOSPITAL", "SAO LUCAS", "hospital"],
  ["GALERIA", "ITAVERA", "galeria_itavera"],
  ["PERIGO", "ALTA TENSAO", "subestacao"],
  ["CACA & PESCA SERRANO", null, "caca_pesca"],
  ["CORPO DE BOMBEIROS", null, "bombeiros"],
  ["REFUGIO DO COLEGIO", null, "refugio_colegio"],
  ["PRESIDIO REGIONAL", null, "presidio"],
  ["TORRE DE CONTROLE", null, "torre_controle"],
  ["TUNEL DE SERVICO", null, "tunel_servico"],
  ["COLEGIO ESTADUAL", null, "safezone_colegio"],
  ["POSTO DE COMANDO", null, "posto_comando"],
  ["TERMINAL URBANO", null, "terminal"],
  ["DESCONTAMINACAO", null, "descontaminacao"],
  ["ACESSO NIVEL 4", null, "unidade4"],
  ["DISTRIBUIDORA", null, "distribuidora"],
  ["14A DELEGACIA", null, "delegacia"],
  ["BASE AVANCADA", null, "base_cerco"],
  ["IGREJA MATRIZ", null, "safezone_matriz"],
  ["AREA ISOLADA", null, "area_isolada"],
  ["14O BATALHAO", null, "batalhao"],
  ["SAAE ITAVERA", null, "eta"],
  ["BORRACHARIA", null, "borracharia"],
  ["MATERIAL DE", null, "material"],
  ["PRATO FEITO", null, "prato_feito"],
  ["JESUS SALVA", null, "igreja_abrigo"],
  ["UTE ITAVERA", null, "ute"],
  ["BIOCIENCIAS", null, "biociencias"],
  ["ELETRONICOS", null, "eletronicos"],
  ["ASSOCIACAO", null, "associacao"],
  ["QUARENTENA", null, "quarentena"],
  ["BRINQUEDOS", null, "brinquedos"],
  ["CASA & LAR", null, "casa_lar"],
  ["LANCHONETE", null, "lanchonete_galeria"],
  ["MERCADINHO", null, "mercadinho"],
  ["PERFUMARIA", null, "perfumaria"],
  ["LAVA JATO", null, "lava_jato"],
  ["BAR DO ZE", null, "bar_sinuca"],
  ["ATACAREJO", null, "atacadista"],
  ["LAN HOUSE", null, "lanhouse"],
  ["BARBEARIA", null, "barbearia"],
  ["FUNILARIA", null, "funilaria"],
  ["MATRIZ DE", null, "matriz"],
  ["FERRAGENS", null, "ferragens"],
  ["PRESENTES", null, "presentes"],
  ["ACADEMIA", null, "academia"],
  ["LOTERICA", null, "loterica"],
  ["CORREIOS", null, "correios"],
  ["EDIFICIO", null, "edificio"],
  ["SHOPPING", null, "shopping"],
  ["PORTAO 1", null, "portao1"],
  ["CALCADOS", null, "calcados"],
  ["ESPORTES", null, "esportes"],
  ["FARMACIA", null, "farmacia_galeria"],
  ["LIVRARIA", null, "livraria"],
  ["KARAOKE", null, "karaoke"],
  ["ENTRADA", null, "motel_entrada"],
  ["GALERIA", null, "galeria"],
  ["GINASIO", null, "ginasio"],
  ["TRIAGEM", null, "triagem"],
  ["VERIDIA", null, "campus_veridia"],
  ["CRECHE", null, "creche"],
  ["IGREJA", null, "assembleia"],
  ["CENTRO", null, "centro_empresarial"],
  ["PASTEL", null, "pastel"],
  ["BURGER", null, "burger"],
  ["GALPAO", null, "safezone_galpao"],
  ["BOATE", null, "boate"],
  ["BINGO", null, "bingo"],
  ["MOTEL", null, "motel"],
  ["SALAO", null, "salao"],
  ["METRO", null, "metro"],
  ["AULAS", null, "escola"],
  ["MODAS", null, "modas"],
  ["OTICA", null, "otica"],
  ["ACAI", null, "acai"],
  ["PARE", null, "bloqueio"],
  ["CAFE", null, "cafe"],
  ["UBS", null, "ubs"]
]
const SWAP_DELAY_TICKS = 4

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()

function matchSign(l1, l2) {
  for (const t of SIGN_TABLE) {
    if (!l1.startsWith(t[0])) continue
    if (t[1] && !l2.startsWith(t[1])) continue
    return t[2]
  }
  return null
}

function swapChunkSigns(level, cx, cz) {
  const chunk = level.chunkSource.getChunkNow(cx, cz)
  if (!chunk) return
  const todo = []
  chunk.blockEntities.forEach((pos, be) => {
    const cls = String(be.getClass().getName())
    if (!cls.endsWith('.SignBlockEntity')) return
    const b = level.getBlock(pos)
    if (!String(b.id).endsWith('_wall_sign')) return
    const text = be.frontText
    const l1 = norm(text.getMessage(0, false).getString())
    const l2 = norm(text.getMessage(1, false).getString())
    const id = matchSign(l1, l2)
    if (id) todo.push([b, id, String(b.properties.get('facing') || 'north')])
  })
  todo.forEach(([b, id, facing]) => {
    b.set('kubejs:sign_' + id, { facing: facing })
  })
  if (todo.length) console.info('[ZC] signs placed in chunk ' + cx + ',' + cz + ': ' + todo.map(t => t[1]).join(', '))
}

ForgeEvents.onEvent('net.minecraftforge.event.level.ChunkEvent$Load', event => {
  let level = event.getLevel()
  if (!level || level.isClientSide()) return
  // during worldgen the event may carry a WorldGenRegion; we want the real ServerLevel
  if (String(level.getClass().getName()) !== 'net.minecraft.server.level.ServerLevel') {
    if (typeof level.getLevel !== 'function') return
    level = level.getLevel()
  }
  const pos = event.getChunk().getPos()
  const cx = pos.x, cz = pos.z
  const sl = level
  sl.getServer().scheduleInTicks(SWAP_DELAY_TICKS, () => swapChunkSigns(sl, cx, cz))
})
