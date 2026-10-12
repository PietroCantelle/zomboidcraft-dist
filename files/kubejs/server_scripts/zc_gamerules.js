// ZomboidCraft - default gamerules, applied ONCE per world (first server start).
// announceAdvancements=false: no "X alcançou o progresso [...]" spam in chat.
// Admins can change it later with /gamerule; the flag below stops this script from overriding them.

ServerEvents.loaded(event => {
  const server = event.server
  const data = server.persistentData
  if (!data.getBoolean('zcDefaultGamerules')) {
    server.runCommandSilent('gamerule announceAdvancements false')
    data.putBoolean('zcDefaultGamerules', true)
    console.info('[ZomboidCraft] default gamerules applied (announceAdvancements=false)')
  }
  // 0.2.5 (also applied once to worlds created before it): THE UNDEAD REVAMPED mutations must not burn in the sun
  // (like our zombies - zc_world) and its Hunter must not eat dropped food. Gamerules of that mod: sunray, hunternibling.
  if (!data.getBoolean('zcDefaultGamerules025')) {
    server.runCommandSilent('gamerule sunray false')
    server.runCommandSilent('gamerule hunternibling false')
    data.putBoolean('zcDefaultGamerules025', true)
    console.info('[ZomboidCraft] 0.2.5 gamerules applied (sunray=false, hunternibling=false)')
  }
  // 0.3.6: F3 without coordinates / block info (reducedDebugInfo) - the GPS item is the only way to know where you are.
  if (!data.getBoolean('zcDefaultGamerules036')) {
    server.runCommandSilent('gamerule reducedDebugInfo true')
    data.putBoolean('zcDefaultGamerules036', true)
    console.info('[ZomboidCraft] 0.3.6 gamerules applied (reducedDebugInfo=true)')
  }
  // 0.3.6: no "[Admin: ...]" echoes of tp / gamemode / time set... in the chat of other operators (logAdminCommands)
  if (!data.getBoolean('zcDefaultGamerules036b')) {
    server.runCommandSilent('gamerule logAdminCommands false')
    data.putBoolean('zcDefaultGamerules036b', true)
    console.info('[ZomboidCraft] 0.3.6 gamerules applied (logAdminCommands=false)')
  }
})
