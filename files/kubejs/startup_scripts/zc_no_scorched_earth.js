// ZomboidCraft 0.2.5 - remove Zombie Extreme's radioactive "Scorched Earth" biome from the overworld.
//
// Zombie Extreme injects it in ServerAboutToStartEvent: it rebuilds the overworld MultiNoiseBiomeSource with two extra
// climate points (+ a surface rule for its radiation block). Biome Replacer (`zombie_extreme:scorched_earth > null`, what DeceasedCraft uses) runs earlier
// (world stem creation), so it cannot catch it - verified in the test server: `/locate biome zombie_extreme:scorched_earth`
// still found one 263 blocks from spawn. This handler runs when the overworld ServerLevel is created (after the injection,
// before any chunk is generated) and rebuilds the biome source without those points. The surface rule stays but is only
// active inside that biome, so it never fires. Chunks generated before 0.2.5 keep what they have.
// Uses Zombie Extreme's own access transformer (MultiNoiseBiomeSource.parameters() public, ChunkGenerator.biomeSource
// public and non-final).
// Everything is inside try/catch: an exception escaping a ForgeEvents handler crashes the server tick loop.
// (Rhino: plain `var`s in a named function - `const` inside try blocks of an arrow handler fails with "redeclaration of var".)
function zcRemoveScorchedEarth(lvl) {
  var srv = lvl.getServer()
  if (!srv || lvl != srv.overworld()) return
  var MultiNoise = Java.loadClass('net.minecraft.world.level.biome.MultiNoiseBiomeSource')
  var ParamList = Java.loadClass('net.minecraft.world.level.biome.Climate$ParameterList')
  var JList = Java.loadClass('java.util.ArrayList')
  var gen = lvl.getChunkSource().getGenerator()
  var src = gen.getBiomeSource()
  if (!(src instanceof MultiNoise)) return
  var kept = new JList()
  var removed = 0
  var it = src.parameters().values().iterator()
  while (it.hasNext()) {
    var pair = it.next()
    var key = pair.getSecond().unwrapKey()
    if (key.isPresent() && String(key.get().location()) == 'zombie_extreme:scorched_earth') removed++
    else kept.add(pair)
  }
  if (removed == 0) { console.info('[zc] Scorched Earth not present in the overworld biome source'); return }
  gen.biomeSource = MultiNoise.createFromList(new ParamList(kept))
  console.info('[zc] removed ' + removed + ' Scorched Earth climate point(s) from the overworld biome source')
}

ForgeEvents.onEvent('net.minecraftforge.event.level.LevelEvent$Load', event => {
  try {
    if (event.getLevel().isClientSide() || !Platform.isLoaded('zombie_extreme')) return
    zcRemoveScorchedEarth(event.getLevel())
  } catch (e) {
    console.error('[zc] could not remove Scorched Earth: ' + e)
  }
})
