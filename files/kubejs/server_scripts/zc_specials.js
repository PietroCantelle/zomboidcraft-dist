// ZomboidCraft 0.2.5 - special infected from THE UNDEAD REVAMPED (undead_revamp2) and Zombie Extreme (zombie_extreme).
// (KubeJS 6, Forge 1.20.1)
//
// Who spawns where/when is In Control (config/incontrol/):
//   spawner.json - one rule per special, gated by the In Control number "zcday" (quarantine day) + caps near each player
//   spawn.json   - natural spawns of both mods denied, fantasy mobs denied, per-player caps, and WHERE each one may appear
//                  (Lost Cities incity/instreet/inbuilding/building + the story locations as areas)
//   areas.json   - the fixed story locations (default coordinates of docs/STORY_CONTRACT.md)
//
// This script keeps "zcday" = the quarantine day: zc_story's ZcStoryApi.getDay() (the same "Dia N" the radio/HUD use,
// admins can move it with /zcstory day set) or, without zc_story, overworld dayTime / 24000. It also sets In Control's own
// day counter (`incontrol days`) so `mindaycount` in spawn.json would mean the same thing.
// 0.3.4 time model: an in-game day lasts 6 real hours (zc_world clock, paused with nobody online) and the spawner.json
// thresholds are quarantine days as tuned in the 0.3.5 playtest (pack/tools/gen_incontrol.py).

const ZC_SPECIALS_SYNC_TICKS = 200   // every 10 s
let zcSpecialsDay = -1
let zcStoryApi = null
let zcStoryApiTried = false

function zcQuarantineDay(server) {
  if (!zcStoryApiTried) {
    zcStoryApiTried = true
    if (Platform.isLoaded('zc_story')) {
      try { zcStoryApi = Java.loadClass('gg.zomboidcraft.story.api.ZcStoryApi') } catch (e) { console.warn('[zc_specials] ZcStoryApi: ' + e) }
    }
  }
  if (zcStoryApi) {
    try { return Number(zcStoryApi.getDay()) } catch (e) { console.warn('[zc_specials] getDay: ' + e); zcStoryApi = null }
  }
  return Math.floor(Number(server.overworld().dayTime) / 24000)
}

function zcSyncDay(server, force) {
  let day = Math.max(0, zcQuarantineDay(server))
  if (!force && day == zcSpecialsDay) return
  zcSpecialsDay = day
  server.runCommandSilent(`incontrol setnumber zcday ${day}`)
  server.runCommandSilent(`incontrol days ${day}`)
  console.info(`[zc_specials] quarantine day ${day} -> In Control number zcday`)
}

ServerEvents.loaded(event => zcSyncDay(event.server, true))

ServerEvents.tick(event => {
  const server = event.server
  if (server.tickCount % ZC_SPECIALS_SYNC_TICKS != 0) return
  zcSyncDay(server, false)
})

// In Control re-reads its files on /incontrol reload; numbers survive (saved data), nothing to do here.

// ---- item side of both mods: off. Their gear runs on their own ores/biome/structures, which are disabled
// (kubejs/data/<mod>/forge/biome_modifier -> forge:none, structures without biomes, Scorched Earth removed by
// kubejs/startup_scripts/zc_no_scorched_earth.js). Armor of both mods is loot-only in zc_armor.js (= not obtainable).
// Mob drops stay (junk / trophies); recipes that turn them into fantasy gear are gone.
ServerEvents.recipes(event => {
  event.remove({ output: /^undead_revamp2:/ })
  event.remove({ output: /^zombie_extreme:/ })
})

// ---- Zombie Extreme radiation: no radiation in this story (no hazmat suit is obtainable either). Its biome is removed
// for new chunks (startup_scripts/zc_no_scorched_earth.js); this clears the effect if a player still walks into an old
// Scorched Earth chunk or touches one of its radiation blocks.
let zcRadiation = undefined
PlayerEvents.tick(event => {
  const player = event.player
  if (player.age % 40 != 0) return
  if (zcRadiation === undefined) {
    const ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    const ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    zcRadiation = ForgeRegistries.MOB_EFFECTS.getValue(new ResourceLocation('zombie_extreme', 'radiation_effect'))
  }
  if (zcRadiation && player.hasEffect(zcRadiation)) player.removeEffect(zcRadiation)
})
