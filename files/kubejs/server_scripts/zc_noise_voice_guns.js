// ZomboidCraft (v0.3.4) - medidor de barulho do zc_survival: voz e tiros.
//
// 1) VOZ (Simple Voice Chat). O zc_survival já transforma o microfone em barulho (plugin ZcVoicePlugin ->
//    VoiceBridge -> NoiseTracker, fonte VOICE), mas por padrão só decodifica a voz de quem está a até
//    listenerRange blocos de um monstro hostil (config `onlyNearHostiles = true` em
//    serverconfig/zc_survival-noise-server.toml). Por isso o medidor "não reagia" à voz na maior parte do tempo.
//    Aqui a opção é desligada no mundo ao iniciar o servidor (grava no arquivo do mundo, uma vez só):
//    a voz sempre conta e o medidor sempre reage.
//
// 2) TIROS (TaCZ). Nenhum tiro gerava barulho. Agora cada disparo vira barulho no NoiseTracker (fonte COMBAT):
//    100 (máximo da escala, 0-100) sem silenciador; SUPPRESSED com silenciador no cano
//    (acessório MUZZLE com a propriedade "silence" do TaCZ; nome com "silenc"/"suppress" também vale).
//    Barulho máximo = raio máximo do config (maxRadius): zumbis por perto vêm atrás, como no Zomboid.

const SUPPRESSED = 30

const NoiseConfig = Java.loadClass('gg.zomboidcraft.survival.noise.NoiseConfig')
const NoiseTracker = Java.loadClass('gg.zomboidcraft.survival.noise.NoiseTracker')
const NoiseSource = Java.loadClass('gg.zomboidcraft.survival.noise.NoiseSource')
const ServerPlayer = Java.loadClass('net.minecraft.server.level.ServerPlayer')
const IGun = Java.loadClass('com.tacz.guns.api.item.IGun')
const AttachmentType = Java.loadClass('com.tacz.guns.api.item.attachment.AttachmentType')
const DefaultAssets = Java.loadClass('com.tacz.guns.api.DefaultAssets')
const TimelessAPI = Java.loadClass('com.tacz.guns.api.TimelessAPI')

// --- voz: desliga "só perto de hostis" no config do mundo -------------------------------------------
let voiceFixed = false
function voiceAlwaysCounts() {
  if (voiceFixed) return
  try {
    const opt = NoiseConfig.VOICE_ONLY_NEAR_HOSTILES
    if (opt.get()) {
      opt.set(false)
      opt.clearCache()
      opt.save()
      console.info('[zc_noise] voz: onlyNearHostiles desligado (medidor de barulho reage sempre à voz)')
    }
    voiceFixed = true
  } catch (e) {
    console.warn('[zc_noise] nao consegui ajustar o config de voz: ' + e)
  }
}
ServerEvents.loaded(event => voiceAlwaysCounts())
PlayerEvents.loggedIn(event => voiceAlwaysCounts())

// --- tiros ------------------------------------------------------------------------------------------
function hasSilencer(stack) {
  const gun = IGun.getIGunOrNull(stack)
  if (!gun) return false
  const id = gun.getAttachmentId(stack, AttachmentType.MUZZLE)
  if (!id || DefaultAssets.isEmptyAttachmentId(id)) return false
  try {
    const index = TimelessAPI.getCommonAttachmentIndex(id)
    if (index.isPresent()) {
      const modifiers = index.get().getData().getModifier()
      if (modifiers && modifiers.containsKey('silence')) return true
    }
  } catch (e) { /* pacote sem dados: cai no nome */ }
  const name = String(id)
  return name.includes('silenc') || name.includes('suppress')
}

let gunErrorLogged = false
TimelessGunEvents.gunFire(event => {
  try {
    if (!event.logicalSide.isServer()) return
    const shooter = event.shooter
    if (!(shooter instanceof ServerPlayer)) return
    const loudness = hasSilencer(event.gunItemStack) ? SUPPRESSED : 100
    NoiseTracker.add(shooter, loudness, NoiseSource.COMBAT, shooter.blockPosition())
  } catch (e) {
    if (!gunErrorLogged) {
      gunErrorLogged = true
      console.error('[zc_noise] erro no barulho do tiro: ' + e)
    }
  }
})
