// ZomboidCraft (v0.3.5) - deitar/rastejar (tecla C do zc_player) nao levanta mais sozinho.
// O CrawlManager do zc_player levanta o jogador quando ele esta correndo (sprint) e ha espaco para ficar de pe.
// Com Ctrl segurado, dois toques no W ou "correr: alternar" ligado, o cliente voltava a marcar sprint e o
// personagem levantava no meio do rastejo. Aqui o sprint e desligado enquanto o jogador esta deitado:
//   - no cliente, no fim do tick do jogador (antes do pacote de sprint ir para o servidor)
//   - no servidor, no comeco do tick (antes do CrawlManager olhar)
// Para levantar continua sendo a tecla C.
// Tudo em try/catch: uma excecao escapando de um handler do ForgeEvents derruba o tick.
var ZcPose = Java.loadClass('net.minecraft.world.entity.Pose')
var ZcCrawlManager = null
try {
  ZcCrawlManager = Java.loadClass('gg.zomboidcraft.player.movement.CrawlManager')
} catch (e) {
  console.warn('[ZomboidCraft] CrawlManager not found, crawl fix disabled: ' + e)
}

function zcCrawlTick(event) {
  var player = event.player
  if (!player.isSprinting()) return
  var phase = String(event.phase)
  if (player.level.isClientSide()) {
    if (phase == 'END' && player.getForcedPose() == ZcPose.SWIMMING && !player.isInWater()) player.setSprinting(false)
  } else if (phase == 'START' && ZcCrawlManager && ZcCrawlManager.isCrawling(player)) {
    player.setSprinting(false)
  }
}

ForgeEvents.onEvent('net.minecraftforge.event.TickEvent$PlayerTickEvent', event => {
  try { zcCrawlTick(event) } catch (e) { console.error('[ZomboidCraft] crawl fix failed: ' + e) }
})
