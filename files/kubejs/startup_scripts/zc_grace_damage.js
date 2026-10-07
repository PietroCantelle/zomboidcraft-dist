// ZomboidCraft (v0.3.5) - metade do dano dos efeitos do zc_survival durante a "adaptacao" (primeira hora jogada).
// O jogador fica com a tag zc_grace enquanto a adaptacao dura (server_scripts/zc_grace.js). Knox fica de fora.
// Fica no startup porque so o ForgeEvents deixa mudar o valor do dano (EntityEvents.hurt so cancela).
// Tudo em try/catch: uma excecao escapando de um handler do ForgeEvents derruba o tick do servidor.
const ZC_GRACE_HALVED = {
  'zc_survival.bleeding': true,
  'zc_survival.infection': true,
  'zc_survival.food_poisoning': true,
  'zc_survival.dehydration': true,
  'zc_survival.hypothermia': true,
  'zc_survival.hyperthermia': true
}

function zcGraceHurt(event) {
  var entity = event.getEntity()
  if (!entity.isPlayer() || !entity.getTags().contains('zc_grace')) return
  if (!ZC_GRACE_HALVED[String(event.getSource().getMsgId())]) return
  event.setAmount(event.getAmount() * 0.5)
}

ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', event => {
  try {
    zcGraceHurt(event)
  } catch (e) {
    console.error('[ZomboidCraft] grace damage failed: ' + e)
  }
})

// Esconde o efeito "Sem minimapa" do Xaero (o zc_player usa ele para travar o minimapa sem GPS) na tela do inventario.
// O zc_player ja pede para o Forge nao desenhar o efeito, mas ele ainda aparecia. Aqui ele sai do mapa de efeitos
// do jogador local so enquanto a tela e desenhada e volta logo depois; o minimapa continua travado sem GPS.
if (Platform.isClientEnvironment()) {
  var ZC_HIDDEN_EFFECTS = ['xaerominimap:no_minimap', 'xaerominimap:no_waypoints',
    'xaerominimap:no_minimap_harmful', 'xaerominimap:no_waypoints_harmful']
  var ZcMinecraft = Java.loadClass('net.minecraft.client.Minecraft')
  var ZcForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
  var zcStashed = []

  function zcHideMapEffects() {
    zcStashed = []
    var player = ZcMinecraft.getInstance().player
    if (!player) return
    var map = player.getActiveEffectsMap()
    var it = map.entrySet().iterator()
    while (it.hasNext()) {
      var entry = it.next()
      var key = ZcForgeRegistries.MOB_EFFECTS.getKey(entry.getKey())
      if (key && ZC_HIDDEN_EFFECTS.indexOf(String(key)) >= 0) {
        zcStashed.push([entry.getKey(), entry.getValue()])
        it.remove()
      }
    }
  }

  function zcRestoreMapEffects() {
    var player = ZcMinecraft.getInstance().player
    if (player && zcStashed.length) {
      var map = player.getActiveEffectsMap()
      for (var i = 0; i < zcStashed.length; i++) {
        if (!map.containsKey(zcStashed[i][0])) map.put(zcStashed[i][0], zcStashed[i][1])
      }
    }
    zcStashed = []
  }

  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Render$Pre', event => {
    try { zcHideMapEffects() } catch (e) { zcStashed = []; console.error('[ZomboidCraft] hide map effects failed: ' + e) }
  })
  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Render$Post', event => {
    try { zcRestoreMapEffects() } catch (e) { console.error('[ZomboidCraft] restore map effects failed: ' + e) }
  })
}
