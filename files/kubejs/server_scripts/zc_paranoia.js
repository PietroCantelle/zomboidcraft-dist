// ZomboidCraft (v0.3.4) - "Paranoia": traço negativo do zc_player (tag de entidade zc_trait_paranoia, posta pelo
// mod em quem escolheu o traço). De vez em quando o jogador ouve zumbis e passos por perto que não existem.
// Os sons são mandados só para esse jogador (pacote de som posicional), ninguém mais ouve.
//
//  - Intervalo entre "sustos": 4 a 8 min (×0,6 à noite). O primeiro vem entre 1 e 8 min depois de entrar.
//  - Tipos: gemido de zumbi a 6-14 blocos (40%); passos se aproximando (35%); zumbi andando e gemendo (17%);
//    pancadas numa porta de madeira (8%). Nada acontece no criativo, espectador ou dormindo.

const PARANOIA_TAG = 'zc_trait_paranoia'
const GAP_MIN = 4800          // 4 min
const GAP_MAX = 9600          // 8 min
const NIGHT_MULT = 0.6
const CHECK_TICKS = 20

const ClientboundSoundPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSoundPacket')
const BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
const SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
const ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
const Holder = Java.loadClass('net.minecraft.core.Holder')

const STEP_SOUNDS = ['minecraft:block.grass.step', 'minecraft:block.stone.step', 'minecraft:block.wood.step', 'minecraft:block.gravel.step']

const rnd = (a, b) => a + Math.random() * (b - a)
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

let soundErrorLogged = false
// Toca um som num ponto do mundo, mas só para este jogador.
function soundFor(player, id, x, y, z, volume, pitch) {
  const sound = BuiltInRegistries.SOUND_EVENT.get(new ResourceLocation(id))
  if (!sound) return
  try {
    const packet = new ClientboundSoundPacket(Holder.direct(sound), SoundSource.HOSTILE, x, y, z, volume, pitch, Math.floor(Math.random() * 2147483647))
    player.connection.send(packet)
  } catch (e) {
    if (!soundErrorLogged) {
      soundErrorLogged = true
      console.warn('[zc_paranoia] pacote de som falhou, usando playNotifySound: ' + e)
    }
    player.playNotifySound(sound, SoundSource.HOSTILE, volume, pitch)
  }
}

// Ponto aleatório a `dist` blocos do jogador, mais ou menos na mesma altura.
function spotNear(player, dist) {
  const ang = Math.random() * Math.PI * 2
  return { x: player.x + Math.cos(ang) * dist, y: player.y + rnd(-1, 1), z: player.z + Math.sin(ang) * dist }
}

function later(player, ticks, fn) {
  if (ticks <= 0) { fn(); return }
  player.server.scheduleInTicks(ticks, () => { if (player.isAlive()) fn() })
}

function scare(player) {
  const roll = Math.random()
  if (roll < 0.40) {
    // gemido de zumbi ali perto
    const s = spotNear(player, rnd(6, 14))
    soundFor(player, 'minecraft:entity.zombie.ambient', s.x, s.y, s.z, rnd(0.7, 1.0), rnd(0.85, 1.05))
  } else if (roll < 0.75) {
    // passos vindo na direção do jogador
    const origin = { x: player.x, y: player.y, z: player.z }
    const s = spotNear(player, rnd(8, 13))
    const step = pick(STEP_SOUNDS)
    const n = 4 + Math.floor(Math.random() * 4)
    for (let i = 0; i < n; i++) {
      const d = 1 - (i + 1) / (n + 2)   // cada passo mais perto
      later(player, i * 8, () => soundFor(player, step, origin.x + (s.x - origin.x) * d, s.y, origin.z + (s.z - origin.z) * d, rnd(0.35, 0.55), rnd(0.9, 1.1)))
    }
  } else if (roll < 0.92) {
    // zumbi arrastando os pés e gemendo
    const s = spotNear(player, rnd(7, 12))
    for (let i = 0; i < 5; i++) {
      later(player, i * 9, () => soundFor(player, 'minecraft:entity.zombie.step', s.x + rnd(-1, 1), s.y, s.z + rnd(-1, 1), rnd(0.4, 0.6), rnd(0.9, 1.1)))
    }
    later(player, 48, () => soundFor(player, 'minecraft:entity.zombie.ambient', s.x, s.y, s.z, rnd(0.6, 0.9), rnd(0.8, 1.0)))
  } else {
    // pancadas numa porta de madeira
    const s = spotNear(player, rnd(4, 8))
    for (let i = 0; i < 3; i++) {
      later(player, i * 12, () => soundFor(player, 'minecraft:entity.zombie.attack_wooden_door', s.x, s.y, s.z, rnd(0.5, 0.7), rnd(0.9, 1.1)))
    }
  }
}

PlayerEvents.tick(event => {
  const player = event.player
  if (player.level.isClientSide()) return
  const now = player.level.gameTime
  if (now % CHECK_TICKS !== 0) return
  if (!player.tags.contains(PARANOIA_TAG)) return
  if (player.isCreative() || player.isSpectator() || player.isSleeping()) return

  const data = player.persistentData
  const next = data.getLong('zc_paranoia_next')
  if (next === 0 || next > now + GAP_MAX * 2) {
    // primeira vez (ou relógio inválido): primeiro susto entre 1 e 8 min
    data.putLong('zc_paranoia_next', now + Math.floor(rnd(1200, GAP_MAX)))
    return
  }
  if (now < next) return

  scare(player)
  const mult = player.level.isNight() ? NIGHT_MULT : 1
  data.putLong('zc_paranoia_next', now + Math.floor(rnd(GAP_MIN, GAP_MAX) * mult))
})
