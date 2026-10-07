// ZomboidCraft v0.3.5 - abandoned survivor camps (Simply Tents + Comforts) scattered over the map.
// When a chunk is generated for the first time, there is a small chance of a camp in it: one tent on natural
// ground (grass, dirt, sand, gravel), sometimes with a sleeping bag and a dead campfire next to it.
// In the city the ground is asphalt, so camps land in parks, empty lots, the outskirts and the countryside.
// Story locations (zc_world ZcLocations) are skipped. Only NEW chunks get camps: explored areas don't change.
// Startup script: needs a game/server restart, /reload does not pick it up.

const ZCC_CHANCE = 0.035
const ZCC_TENTS = ['tent', 'tent', 'tent', 'zip_tent', 'zip_tent', 'wall_tent', 'duo_tent', 'duo_zip_tent', 'roof_tent', 'small_tipi_tent']
const ZCC_COLORS = ['green', 'brown', 'gray', 'blue', 'orange', 'red', 'black', 'light_gray']
const ZCC_GROUND = ['minecraft:grass_block', 'minecraft:dirt', 'minecraft:coarse_dirt', 'minecraft:podzol', 'minecraft:sand',
  'minecraft:red_sand', 'minecraft:gravel', 'minecraft:rooted_dirt', 'minecraft:dirt_path']

let zccClasses = null
function zccLoad() {
  if (zccClasses) return zccClasses
  zccClasses = {
    BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
    Heightmap: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'),
    Direction: Java.loadClass('net.minecraft.core.Direction'),
    ForgeRegistries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
    ResourceLocation: Java.loadClass('net.minecraft.resources.ResourceLocation'),
    ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
    BedPart: Java.loadClass('net.minecraft.world.level.block.state.properties.BedPart'),
    Props: Java.loadClass('net.minecraft.world.level.block.state.properties.BlockStateProperties')
  }
  try { zccClasses.Locations = Java.loadClass('gg.zomboidcraft.world.api.ZcLocations') } catch (e) { zccClasses.Locations = null }
  return zccClasses
}

function zccBlock(id) {
  const C = zccLoad()
  return C.ForgeRegistries.BLOCKS.getValue(new C.ResourceLocation(id))
}

function zccPick(list) { return list[Math.floor(Math.random() * list.length)] }

function zccCamp(level, chunkX, chunkZ) {
  const C = zccLoad()
  const x = (chunkX << 4) + 4 + Math.floor(Math.random() * 8)
  const z = (chunkZ << 4) + 4 + Math.floor(Math.random() * 8)
  const y = level.getHeight(C.Heightmap.MOTION_BLOCKING_NO_LEAVES, x, z)
  const pos = new C.BlockPos(x, y, z)
  const below = level.getBlockState(pos.below())
  if (ZCC_GROUND.indexOf(String(C.ForgeRegistries.BLOCKS.getKey(below.getBlock()))) < 0) return
  if (!level.getBlockState(pos).isAir() || level.getFluidState(pos.below()).isEmpty() == false) return
  if (C.Locations && C.Locations.at(level, pos).isPresent()) return

  const tentBlock = zccBlock('simplytents:' + zccPick(ZCC_TENTS))
  if (!tentBlock || String(C.ForgeRegistries.BLOCKS.getKey(tentBlock)) == 'minecraft:air') return
  if (tentBlock.isTentSpaceClear && !tentBlock.isTentSpaceClear(level, pos, C.Direction.NORTH)) return
  const state = tentBlock.defaultBlockState()
  level.setBlock(pos, state, 3)
  // the mod builds the tent (core block + roof/collision blocks) in setPlacedBy; no entity = faces north
  tentBlock.setPlacedBy(level, pos, level.getBlockState(pos), null, new C.ItemStack(tentBlock.asItem()))

  // a sleeping bag and a dead campfire beside the tent, sometimes
  const side = pos.east(3)
  const sideY = level.getHeight(C.Heightmap.MOTION_BLOCKING_NO_LEAVES, side.getX(), side.getZ())
  if (Math.abs(sideY - y) > 1) return
  const ground = new C.BlockPos(side.getX(), sideY, side.getZ())
  if (Math.random() < 0.6) {
    const bag = zccBlock('comforts:sleeping_bag_' + zccPick(ZCC_COLORS))
    const head = ground.south()
    if (bag && level.getBlockState(ground).isAir() && level.getBlockState(head).isAir() && level.getBlockState(head.below()).isSolid()) {
      const foot = bag.defaultBlockState().setValue(C.Props.HORIZONTAL_FACING, C.Direction.SOUTH).setValue(C.Props.BED_PART, C.BedPart.FOOT)
      level.setBlock(ground, foot, 3)
      level.setBlock(head, foot.setValue(C.Props.BED_PART, C.BedPart.HEAD), 3)
    }
  }
  const fire = ground.east(2)
  if (Math.random() < 0.5 && level.getBlockState(fire).isAir() && level.getBlockState(fire.below()).isSolid()) {
    level.setBlock(fire, zccBlock('minecraft:campfire').defaultBlockState().setValue(C.Props.LIT, false), 3)
  }
}

// Any exception here would crash world generation, so the whole handler is guarded.
// (Rhino note: on a KubeJS level, "dimension" and "isClientSide" are properties, not callable methods.)
ForgeEvents.onEvent('net.minecraftforge.event.level.ChunkEvent$Load', event => {
  try {
    if (!event.isNewChunk()) return
    if (Math.random() >= ZCC_CHANCE) return
    const level = event.getLevel()
    const ServerLevel = Java.loadClass('net.minecraft.server.level.ServerLevel')
    if (!(level instanceof ServerLevel)) return
    const server = level.getServer()
    const overworld = server.getLevel(Java.loadClass('net.minecraft.world.level.Level').OVERWORLD)
    if (!overworld || !overworld.equals(level)) return
    const pos = event.getChunk().getPos()
    const cx = pos.x, cz = pos.z
    // never place blocks while the chunk is still being loaded: do it on the next server tick
    const TickTask = Java.loadClass('net.minecraft.server.TickTask')
    server.tell(new TickTask(server.getTickCount() + 1, () => {
      try { zccCamp(level, cx, cz) } catch (e) { console.warn('[zc_camps] ' + e) }
    }))
  } catch (e) {
    console.warn('[zc_camps] chunk handler: ' + e)
  }
})
