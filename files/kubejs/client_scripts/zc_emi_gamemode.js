// ZomboidCraft (v0.3.4) - EMI (lista de itens e receitas ao lado do inventario) so aparece no criativo.
// No survival/aventura/espectador o EMI fica desligado, igual a apertar a tecla de esconder o EMI;
// ao entrar no criativo ele volta sozinho. O JEI nao desenha nada: o EMI substitui as listas dele (jemi).
const EmiConfig = Java.loadClass('dev.emi.emi.config.EmiConfig')

ClientEvents.tick(event => {
  const player = event.player
  if (!player) return
  const wanted = player.isCreative()
  if (EmiConfig.enabled !== wanted) EmiConfig.enabled = wanted
})
