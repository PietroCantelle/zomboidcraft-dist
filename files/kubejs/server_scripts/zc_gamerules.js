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
})
