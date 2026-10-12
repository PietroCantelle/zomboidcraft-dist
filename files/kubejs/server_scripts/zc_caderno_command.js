// ZomboidCraft 0.3.8 - /caderno: opens the Caderno de Sobrevivência (zc_hair:caderno, Patchouli) for the player who runs it.
// The FTB Library sidebar button "caderno" (kubejs/assets/kubejs/sidebar_buttons.json, right next to the FTB Quests
// button in the inventory) runs this command, so the notebook is one click away without taking a hotbar slot.
// Permission level 0: anybody. Wrapped in a function: KubeJS shares one global scope between script files.
(function () {
  const BOOK = 'zc_hair:caderno'
  const Patchouli = Java.loadClass('vazkii.patchouli.api.PatchouliAPI')
  const RL = Java.loadClass('net.minecraft.resources.ResourceLocation')

  ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event
    event.register(Commands.literal('caderno').executes(ctx => {
      let player = ctx.source.playerOrException
      try {
        Patchouli.get().openBookGUI(player, new RL(BOOK))
      } catch (e) {
        console.error('[ZC] /caderno: could not open the notebook: ' + e)
        return 0
      }
      return 1
    }))
  })
})()
