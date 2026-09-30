// GERADO por pack/tools/gen_quests.py - não edite à mão.
// FTB Quests: KillTask só aceita um tipo de entidade. As tarefas de abate das missões usam minecraft:zombie;
// aqui somamos +1 nelas quando o jogador mata QUALQUER outro zumbi (husk, drowned, Zombies+, mutantes...).
// Usa a integração KubeJS do FTB XMod Compat (binding FTBQuests). addProgress ignora tarefas de missões
// ainda bloqueadas (dependências) e as já completas.
const ZC_QUEST_KILL_TASKS = [
  '0B2BF1B67BCAD741', // primeiro
  '2FA1EA638ACAAFAE', // m07
  '65338F60038653C0', // m16
  '6DD13B931CB531EB', // m17
  '491C4B91EA39CC5D', // r05
  '2422170FB3D4254D', // r10
  '562CEFFBE7E3D707', // r12
]

EntityEvents.death(event => {
  const entity = event.entity
  const type = String(entity.type)
  if (type == 'minecraft:zombie') return // o próprio KillTask já conta
  if (type.indexOf('zombie') < 0 && type != 'minecraft:husk' && type != 'minecraft:drowned') return
  if (type == 'zc_player:turned_player') return // corpo de jogador não conta
  const src = event.source
  const player = src ? src.player : null
  if (!player) return
  try {
    const data = FTBQuests.getServerDataFromPlayer(player)
    if (!data) return
    ZC_QUEST_KILL_TASKS.forEach(id => {
      if (!data.isCompleted(id)) data.addProgress(id, 1)
    })
  } catch (err) {
    console.warn('[zc_quests] kill bridge: ' + err)
  }
})
