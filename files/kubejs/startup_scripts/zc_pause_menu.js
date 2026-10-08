// ZomboidCraft (v0.3.5) - menu de pausa (ESC) so com: Voltar ao jogo, Opcoes e Sair.
// Tira todo o resto (Conquistas, Estatisticas, Abrir para LAN, Denuncias de jogador, botoes de outros mods)
// e empilha os tres no meio da tela, todos com a mesma largura. O layout do FancyMenu
// (config/fancymenu/customization/zomboidcraft_pause_screen.txt) tambem esconde os botoes vanilla conhecidos.
// "Sair" e o botao vanilla: "Salvar e sair para o titulo" no mundo local, "Desconectar" no servidor.
// Tudo em try/catch: uma excecao escapando de um handler do ForgeEvents derruba o jogo.
// 0.3.6: funcoes do bloco cliente viraram 'var nome = function' - declaracoes dentro de if nao existiam na hora dos eventos
if (Platform.isClientEnvironment()) {
  var ZcPauseScreen = Java.loadClass('net.minecraft.client.gui.screens.PauseScreen')
  var ZcAbstractWidget = Java.loadClass('net.minecraft.client.gui.components.AbstractWidget')
  var ZcTranslatable = Java.loadClass('net.minecraft.network.chat.contents.TranslatableContents')
  // ordem de cima para baixo
  var ZC_PAUSE_KEEP = ['menu.returnToGame', 'menu.options', 'menu.returnToMenu', 'menu.disconnect']

  var zcPauseKey = function(widget) {
    var contents = widget.getMessage().getContents()
    return contents instanceof ZcTranslatable ? String(contents.getKey()) : ''
  }

  var zcPauseMenu = function(event) {
    var screen = event.getScreen()
    if (!(screen instanceof ZcPauseScreen) || !screen.showsPauseMenu()) return
    var kept = []
    var drop = []
    event.getListenersList().forEach(l => {
      if (!(l instanceof ZcAbstractWidget)) return
      var order = ZC_PAUSE_KEEP.indexOf(zcPauseKey(l))
      if (order >= 0) kept.push([order, l])
      else drop.push(l)
    })
    drop.forEach(l => event.removeListener(l))
    kept.sort((a, b) => a[0] - b[0])
    var width = 204
    var x = Math.floor(screen.width / 2 - width / 2)
    var y = Math.floor(screen.height / 2 - (kept.length * 24 - 4) / 2)
    kept.forEach(k => {
      k[1].setWidth(width)
      k[1].setX(x)
      k[1].setY(y)
      y += 24
    })
  }

  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Init$Post', event => {
    try { zcPauseMenu(event) } catch (e) { console.error('[ZomboidCraft] pause menu cleanup failed: ' + e) }
  })
}
