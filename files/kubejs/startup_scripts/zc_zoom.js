// ZomboidCraft (v0.3.5) - zoom: segure X para aproximar a visao; a rodinha do mouse ajusta o zoom enquanto segura.
// Tecla registrada como "Zoom" (categoria ZomboidCraft) em Opcoes > Controles, pode ser trocada pelo jogador.
// So mexe no FOV da camera (nao no da mao) e volta suave ao soltar. Lado do cliente apenas.
if (Platform.isClientEnvironment()) {
  var ZcKeyMapping = Java.loadClass('net.minecraft.client.KeyMapping')
  var ZcZoomMc = Java.loadClass('net.minecraft.client.Minecraft')
  var ZC_KEY_X = 88 // GLFW_KEY_X
  var ZC_ZOOM_MIN = 0.1 // 10x
  var ZC_ZOOM_MAX = 0.6
  var zcZoomKey = new ZcKeyMapping('key.zomboidcraft.zoom', ZC_KEY_X, 'key.categories.zomboidcraft')
  var zcZoomTarget = 0.3 // fator do FOV com a tecla segurada (~3x)
  var zcZoomNow = 1.0

  ForgeModEvents.onEvent('net.minecraftforge.client.event.RegisterKeyMappingsEvent', event => {
    event.register(zcZoomKey)
  })

  function zcZoomHeld() {
    return ZcZoomMc.getInstance().screen == null && zcZoomKey.isDown()
  }

  ForgeEvents.onEvent('net.minecraftforge.client.event.ViewportEvent$ComputeFov', event => {
    try {
      if (!event.usedConfiguredFov()) return
      var want = zcZoomHeld() ? zcZoomTarget : 1.0
      zcZoomNow += (want - zcZoomNow) * 0.25
      if (Math.abs(zcZoomNow - want) < 0.002) zcZoomNow = want
      if (zcZoomNow < 0.999) event.setFOV(event.getFOV() * zcZoomNow)
    } catch (e) {
      console.error('[ZomboidCraft] zoom fov failed: ' + e)
    }
  })

  // rodinha durante o zoom: aproxima/afasta em vez de trocar o item da hotbar
  ForgeEvents.onEvent('net.minecraftforge.client.event.InputEvent$MouseScrollingEvent', event => {
    try {
      if (!zcZoomHeld()) return
      var delta = event.getScrollDelta()
      zcZoomTarget = Math.min(ZC_ZOOM_MAX, Math.max(ZC_ZOOM_MIN, zcZoomTarget * (delta > 0 ? 0.85 : 1 / 0.85)))
      event.setCanceled(true)
    } catch (e) {
      console.error('[ZomboidCraft] zoom scroll failed: ' + e)
    }
  })
}
