// ZomboidCraft (v0.3.5) - "adaptacao": a primeira hora de jogo de cada jogador e mais branda.
// Quem entra pela primeira vez ainda nao sabe ler sede, cansaco e temperatura, e ja levava lentidao/cansaco
// logo de cara. Durante a adaptacao (GRACE_TICKS de tempo jogado, estatistica minecraft:play_time do mundo):
//   - sede nao cai abaixo de THIRST_FLOOR (fraqueza comeca em 15, lentidao em 5)
//   - cansaco nao passa de FATIGUE_CAP (cansaco de mineracao + lentidao comecam em 85)
//   - temperatura corporal fica no estagio 1 de frio/calor (o aviso aparece, mas a penalidade do estagio 2+ nao)
//   - dano de sangramento, infeccao de ferida, intoxicacao e frio/calor cai pela metade (startup_scripts/zc_grace_damage.js)
// Nao e imortalidade: zumbi, queda, Knox e sangramento sem tratar ainda matam. Depois da hora tudo volta ao padrao.
// Limites de temperatura iguais aos padroes de zc_survival-server.toml (coldStage2 35.8, hotStage2 38.4).
const SurvivalData = Java.loadClass('gg.zomboidcraft.survival.data.SurvivalData')
const SurvivalAPI = Java.loadClass('gg.zomboidcraft.survival.api.SurvivalAPI')

const GRACE_TICKS = 72000 // 1 hora jogada
const THIRST_FLOOR = 20
const FATIGUE_CAP = 80
const TEMP_MIN = 35.9
const TEMP_MAX = 38.3
const GRACE_TAG = 'zc_grace'

function zcGraceTick(player) {
  var data = player.persistentData
  if (data.getBoolean('zcGraceDone')) return
  if (player.stats.playTime >= GRACE_TICKS) {
    data.putBoolean('zcGraceDone', true)
    player.removeTag(GRACE_TAG)
    player.tell(Text.translate('message.zomboidcraft.grace.end').gold())
    return
  }
  if (!player.tags.contains(GRACE_TAG)) player.addTag(GRACE_TAG)
  if (!data.getBoolean('zcGraceStarted')) {
    data.putBoolean('zcGraceStarted', true)
    player.tell(Text.translate('message.zomboidcraft.grace.start').yellow())
  }
  if (player.isCreative() || player.isSpectator()) return

  var needs = SurvivalData.needs(player)
  if (!needs) return
  if (needs.thirst < THIRST_FLOOR) SurvivalAPI.addThirst(player, THIRST_FLOOR - needs.thirst)
  if (needs.fatigue > FATIGUE_CAP) SurvivalAPI.setFatigue(player, FATIGUE_CAP)
  if (needs.bodyTemp < TEMP_MIN) needs.bodyTemp = TEMP_MIN
  else if (needs.bodyTemp > TEMP_MAX) needs.bodyTemp = TEMP_MAX
}

PlayerEvents.tick(event => {
  const player = event.player
  if (player.age % 20 != 0) return
  try {
    zcGraceTick(player)
  } catch (e) {
    console.error('[ZomboidCraft] grace tick failed: ' + e)
  }
})
