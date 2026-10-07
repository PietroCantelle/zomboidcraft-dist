// ZomboidCraft (v0.3.5) - /revive [jogadores]: comando de admin (nivel 2) que deixa o jogador estavel de novo.
// Sem alvo: o proprio admin. Faz:
//   - zc_survival: sede 100, cansaco 0, temperatura 37, seco, sem ferimentos/fraturas/infeccao de ferida,
//     sem resfriado/intoxicacao/fedor do esgoto e SEM Knox (SurvivalAPI.resetAll com keepKnox = false)
//   - tira todos os efeitos ruins (categoria HARMFUL: lentidao, cansaco, fraqueza, nausea, veneno...);
//     os bons (regeneracao, resistencia...) ficam
//   - vida maxima, fome e saturacao cheias, apaga fogo, ar cheio, sem congelamento
//   - Fumante: zera o tempo sem fumar (a abstinencia some)
//   - zc_voice: termina os 5 min deitado depois de morrer
const SurvivalAPI = Java.loadClass('gg.zomboidcraft.survival.api.SurvivalAPI')
const MobEffectCategory = Java.loadClass('net.minecraft.world.effect.MobEffectCategory')

function zcRevive(player) {
  SurvivalAPI.resetAll(player, false)

  var bad = []
  player.getActiveEffects().forEach(inst => {
    if (inst.getEffect().getCategory() == MobEffectCategory.HARMFUL) bad.push(inst.getEffect())
  })
  bad.forEach(effect => player.removeEffect(effect))

  player.setHealth(player.getMaxHealth())
  player.getFoodData().setFoodLevel(20)
  player.getFoodData().setSaturation(20)
  player.clearFire()
  player.setAirSupply(player.getMaxAirSupply())
  player.setTicksFrozen(0)
  player.resetFallDistance()

  try {
    Java.loadClass('gg.zomboidcraft.player.data.PlayerData').setCounter(player, 'nosmoke', 0)
  } catch (e) {
    console.warn('[ZomboidCraft] /revive: could not reset smoker counter: ' + e)
  }
  // zc_voice: tira dos 5 min deitado depois de morrer
  try {
    Java.loadClass('gg.zomboidcraft.voice.Recovery').stop(player, 'message.zc_voice.recovery.admin')
  } catch (e) {
    console.warn('[ZomboidCraft] /revive: could not end zc_voice recovery: ' + e)
  }
  return bad.length
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  const run = (source, players) => {
    let n = 0
    players.forEach(p => {
      try {
        var removed = zcRevive(p)
        p.tell(Text.translate('message.zomboidcraft.revive.self').green())
        source.sendSuccess(() => Text.translate('message.zomboidcraft.revive.done', p.name, removed), true)
        n++
      } catch (e) {
        console.error('[ZomboidCraft] /revive failed for ' + p.username + ': ' + e)
        source.sendFailure(Text.of('/revive falhou para ' + p.username + ': ' + e))
      }
    })
    return n
  }

  event.register(Commands.literal('revive')
    .requires(src => src.hasPermission(2))
    .executes(ctx => run(ctx.source, [ctx.source.playerOrException]))
    .then(Commands.argument('targets', Arguments.PLAYERS.create(event))
      .executes(ctx => run(ctx.source, Arguments.PLAYERS.getResult(ctx, 'targets')))))
})
