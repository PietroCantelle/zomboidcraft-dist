// ZomboidCraft (v0.3.4) - mostra os "moodles" do zc_survival (sede, fome, frio, dor, molhado...)
// tambem dentro do inventario do survival, numa coluna a esquerda da janela. Passar o mouse
// em cima mostra o nome do estado e como resolver. Script de startup porque ForgeEvents so
// existe aqui; so roda no cliente. No criativo nao desenha (igual ao HUD do mod).
// Usa os nomes SRG do 1.20.1 (m_280163_ = blit, m_280246_ = setColor, m_280677_ = renderTooltip).

// wrapped in a function: Rhino rejects top-level const inside an if block ("redeclaration of var")
function zcMoodlesInventoryInit() {
  const PLATE = 20, ICON = 16, SPACING = 22, GAP = 26
  // mesmas cores do HUD (MoodleHud.LEVEL_COLORS), por nivel 1..4
  const LEVEL_COLORS = [0, 0x9C9460, 0xA87A3C, 0x9A442F, 0x6E1E1B]
  const LEVEL_TEXT = ['#AAAAAA', '#D8D0A0', '#E0A860', '#E06040', '#FF4040']

  // como resolver, em linhas curtas (o tooltip nao quebra linha sozinho)
  const HINTS = {
    thirst: ['Beba agua: garrafa, refrigerante ou agua fervida.', 'Agua suja ou de rio: ferva antes de beber.'],
    hunger: ['Coma alguma coisa: enlatados, comida cozida, frutas.'],
    cold: ['Vista roupas quentes e fique perto de uma fogueira.', 'Saia da chuva e seque a roupa.'],
    hot: ['Tire roupas pesadas, procure sombra e beba agua.'],
    tired: ['Durma numa cama ou saco de dormir.'],
    bleeding: ['Use trapo ou bandagem no ferimento:', 'segure o item, abra o Painel de saude (tecla H) e clique na parte do corpo.'],
    pain: ['Analgesicos aliviam a dor.', 'Trate os ferimentos (bandagem, tala, sutura) e descanse.'],
    unwell: ['Ferimento infeccionado ou doenca.', 'Desinfete o ferimento, tome antibioticos e descanse.'],
    sick: ['Tome remedio para gripe, fique quente e seco e durma.'],
    wet: ['Saia da chuva ou da agua e seque perto de uma fogueira.'],
    miasma: ['Saia do esgoto e respire ar puro.', 'Mascara com filtro segura parte do fedor.'],
  }

  let classes = null
  let failed = false
  function load() {
    if (classes || failed) return classes
    try {
      classes = {
        InventoryScreen: Java.loadClass('net.minecraft.client.gui.screens.inventory.InventoryScreen'),
        Moodle: Java.loadClass('gg.zomboidcraft.survival.client.Moodle'),
        MoodleHud: Java.loadClass('gg.zomboidcraft.survival.client.MoodleHud'),
        ClientSurvivalState: Java.loadClass('gg.zomboidcraft.survival.network.ClientSurvivalState'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Optional: Java.loadClass('java.util.Optional'),
      }
    } catch (e) {
      failed = true
      console.error('[zc_moodles_inventory] nao carregou as classes: ' + e)
    }
    return classes
  }

  let errorLogged = false
  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Render$Post', event => {
    const c = load()
    if (!c) return
    const screen = event.getScreen()
    if (!(screen instanceof c.InventoryScreen)) return
    try {
      const mc = screen.getMinecraft()
      const player = mc.f_91074_
      if (!player || player.m_7500_() || player.m_5833_()) return // isCreative / isSpectator (SRG)
      if (!c.ClientSurvivalState.hasData()) return
      const payload = c.ClientSurvivalState.get()
      const g = event.getGuiGraphics()
      const mouseX = event.getMouseX(), mouseY = event.getMouseY()
      const x = screen.getGuiLeft() - GAP
      let y = screen.getGuiTop() + 4
      let hovered = null, hoveredLevel = 0

      const moodles = c.Moodle.VALUES
      for (let i = 0; i < moodles.length; i++) {
        const m = moodles[i]
        const level = m.level(payload, player)
        if (level <= 0) continue
        const lv = Math.min(level, 4)
        const col = LEVEL_COLORS[lv]
        g.m_280246_(((col >> 16) & 255) / 255.0, ((col >> 8) & 255) / 255.0, (col & 255) / 255.0, 0.92)
        g.m_280163_(c.MoodleHud.PLATE, x, y, 0.0, 0.0, PLATE, PLATE, PLATE, PLATE)
        g.m_280246_(1.0, 1.0, 1.0, 1.0)
        g.m_280163_(m.icon, x + 2, y + 2, 0.0, 0.0, ICON, ICON, ICON, ICON)
        if (mouseX >= x && mouseX < x + PLATE && mouseY >= y && mouseY < y + PLATE) {
          hovered = m
          hoveredLevel = lv
        }
        y += SPACING
      }

      if (hovered) {
        const lines = new c.ArrayList()
        lines.add(Text.translatable(hovered.labelKey(hoveredLevel)).color(LEVEL_TEXT[hoveredLevel]).bold(true))
        const hint = HINTS[hovered.id] || []
        if (hint.length > 0) lines.add(Text.of('Como resolver:').color('#FFD27A'))
        hint.forEach(line => lines.add(Text.of(line).color('#C8C8C8')))
        g.m_280677_(mc.f_91062_, lines, c.Optional.empty(), mouseX, mouseY)
      }
    } catch (e) {
      if (!errorLogged) {
        errorLogged = true
        console.error('[zc_moodles_inventory] erro ao desenhar: ' + e)
      }
    }
  })
}
if (Platform.isClientEnvironment()) zcMoodlesInventoryInit()
