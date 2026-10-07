// ZomboidCraft - sem o livro de receitas verde do vanilla (inventario, bancada, fornalha, defumador, alto-forno).
// Ele liberava as receitas sozinho conforme o jogador pegava os ingredientes; agora receita se aprende
// em papel (server_scripts/zc_recipe_notes.js). No criativo continua tendo o EMI.
// Antes da tela montar, fecha o livro (se o jogador o deixou aberto, a tela ficaria deslocada para o lado);
// depois de montar, tira o botao. Script de startup porque so o ForgeEvents enxerga os eventos de tela.
// Tudo em try/catch: uma excecao escapando de um handler do ForgeEvents derruba o jogo.
if (Platform.isClientEnvironment()) {
  var ZcRecipeUpdateListener = Java.loadClass('net.minecraft.client.gui.screens.recipebook.RecipeUpdateListener')
  var ZC_IMAGE_BUTTON = 'net.minecraft.client.gui.components.ImageButton'
  var ZcRecipeBookType = Java.loadClass('net.minecraft.world.inventory.RecipeBookType')
  var ZcMinecraft = Java.loadClass('net.minecraft.client.Minecraft')

  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Init$Pre', event => {
    try {
      if (!(event.getScreen() instanceof ZcRecipeUpdateListener)) return
      var player = ZcMinecraft.getInstance().player
      if (!player) return
      var book = player.getRecipeBook()
      var types = ZcRecipeBookType.values()
      for (var i = 0; i < types.length; i++) {
        if (book.isOpen(types[i])) book.setOpen(types[i], false)
      }
    } catch (e) { console.error('[ZomboidCraft] recipe book close failed: ' + e) }
  })

  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Init$Post', event => {
    try {
      if (!(event.getScreen() instanceof ZcRecipeUpdateListener)) return
      // the vanilla toggle is a plain ImageButton of 20x18 (mod buttons like Curios' are subclasses / other sizes)
      var drop = []
      event.getListenersList().forEach(l => {
        if (String(l.getClass().getName()) === ZC_IMAGE_BUTTON && l.getWidth() === 20 && l.getHeight() === 18) drop.push(l)
      })
      drop.forEach(l => event.removeListener(l))
    } catch (e) { console.error('[ZomboidCraft] recipe book button removal failed: ' + e) }
  })
}
