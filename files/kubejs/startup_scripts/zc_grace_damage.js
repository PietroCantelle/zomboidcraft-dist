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

// (0.3.6) O bloco que escondia os efeitos "Sem minimapa" do Xaero durante a tela do inventario saiu daqui: as funcoes
// declaradas dentro do if nao existiam na hora do evento (erro a cada frame) e o zc_player ja faz isso em Java
// (XaeroMinimapCompat.stashForScreen), inclusive no servidor dedicado, onde o efeito fica sem nome de registro.
