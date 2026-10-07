// ZomboidCraft (v0.3.5) - Tab e F3.
// Tab: no lugar da lista de nomes mostra so "N jogadores online" (mesmas condicoes da lista vanilla).
// F3: a tela de informacoes nunca aparece (overlay cancelado e renderDebug zerado); o F3 passa a abrir
// o menu de emotes do Emotecraft (key.emotecraft.fastchoose). Quem ainda tem a tecla antiga
// (- do pack ou B padrao do Emotecraft) e trocado para F3 uma vez ao abrir o jogo.
// Tudo em try/catch: uma excecao escapando de um handler do ForgeEvents derruba o jogo.
if (Platform.isClientEnvironment()) {
  var ZcTabMc = Java.loadClass('net.minecraft.client.Minecraft')
  var ZcTabComponent = Java.loadClass('net.minecraft.network.chat.Component')
  var ZcTabKeyMapping = Java.loadClass('net.minecraft.client.KeyMapping')
  var ZcTabInput = Java.loadClass('com.mojang.blaze3d.platform.InputConstants')
  var ZC_EMOTE_KEY = 'key.emotecraft.fastchoose'
  var ZC_EMOTE_OLD = ['key.keyboard.minus', 'key.keyboard.b', 'key.keyboard.unknown']
  var zcEmoteKeyChecked = false

  function zcTabCount(mc) {
    var conn = mc.getConnection()
    if (conn == null) return 0
    return conn.getListedOnlinePlayers().size()
  }

  function zcTabDraw(event) {
    var mc = ZcTabMc.getInstance()
    if (mc.player == null || !mc.options.keyPlayerList.isDown()) return
    var count = zcTabCount(mc)
    // vanilla nao abre a lista no singleplayer sozinho
    if (mc.isLocalServer() && count <= 1) return
    var text = ZcTabComponent.translatable(count == 1 ? 'hud.zomboidcraft.players_online.one' : 'hud.zomboidcraft.players_online', String(count))
    var g = event.getGuiGraphics()
    var font = mc.font
    var cx = Math.floor(event.getWindow().getGuiScaledWidth() / 2)
    var half = Math.floor(font.width(text) / 2) + 4
    g.fill(cx - half, 8, cx + half, 22, 0x80000000 | 0)
    g.drawCenteredString(font, text, cx, 11, 0xFFFFFF)
  }

  ForgeEvents.onEvent('net.minecraftforge.client.event.RenderGuiOverlayEvent$Pre', event => {
    try {
      var id = String(event.getOverlay().id())
      if (id == 'minecraft:debug_text') {
        ZcTabMc.getInstance().options.renderDebug = false
        event.setCanceled(true)
      } else if (id == 'minecraft:player_list') {
        event.setCanceled(true)
        zcTabDraw(event)
      }
    } catch (e) {
      console.error('[ZomboidCraft] tab/f3 overlay failed: ' + e)
    }
  })

  ForgeEvents.onEvent('net.minecraftforge.event.TickEvent$ClientTickEvent', event => {
    try {
      var mc = ZcTabMc.getInstance()
      // graficos do Shift+F3 / Alt+F3 dependem do renderDebug
      if (mc.options.renderDebug) mc.options.renderDebug = false
      if (zcEmoteKeyChecked) return
      zcEmoteKeyChecked = true
      var keys = mc.options.keyMappings
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i]
        if (String(k.getName()) != ZC_EMOTE_KEY) continue
        if (ZC_EMOTE_OLD.indexOf(String(k.saveString())) < 0) break
        mc.options.setKey(k, ZcTabInput.getKey('key.keyboard.f3'))
        ZcTabKeyMapping.resetMapping()
        mc.options.save()
        console.info('[ZomboidCraft] emote menu moved to F3')
        break
      }
    } catch (e) {
      console.error('[ZomboidCraft] tab/f3 tick failed: ' + e)
    }
  })
}
