// ZomboidCraft v0.3.4 - generic NPC skins that match the NPC's name.
// zc_story picks a generic survivor's name and skin from two independent rolls, so "Dona Rosa" could get a
// man's skin and "Sandra" (guard) always got one: the 4 guard skins are all male.
// When a generic survivor enters the world (spawn or chunk load) we check its name; if the skin is of the
// other gender we swap it for one that matches (same pick every time for the same name).
// Female guard skins: kubejs/assets/zc_story/textures/entity/survivor/guard_f1..3.png.
// Named story NPCs (Cida, Tião, Joana, Bigode, Dente, Helena) keep their own skins.

const ZCN_FEMALE_NAMES = [
  // guards
  'Sandra', 'Keila', 'Cláudia', 'Priscila',
  // civilians
  'Dona Neide', 'Lu', 'Marlene', 'Fátima', 'Dona Rosa', 'Irene', 'Bia', 'Cleide', 'Vera'
]
const ZCN_SKINS = {
  civilian: { f: ['civilian_2', 'civilian_4', 'civilian_6', 'civilian_8'], m: ['civilian_1', 'civilian_3', 'civilian_5', 'civilian_7'] },
  guard: { f: ['guard_f1', 'guard_f2', 'guard_f3'], m: ['guard_1', 'guard_2', 'guard_3', 'guard_4'] }
}

function zcnHash(s) {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function zcnFix(entity) {
  if (!entity || entity.removed) return
  const tag = new (Java.loadClass('net.minecraft.nbt.CompoundTag'))()
  entity.saveWithoutId(tag)
  const skin = String(tag.getString('skin'))
  const kind = skin.startsWith('guard_') ? 'guard' : skin.startsWith('civilian_') ? 'civilian' : null
  if (!kind || !entity.customName) return
  const name = String(entity.customName.getString())
  const female = ZCN_FEMALE_NAMES.indexOf(name) >= 0
  const pool = ZCN_SKINS[kind][female ? 'f' : 'm']
  if (pool.indexOf(skin) >= 0) return
  let pick = pool[zcnHash(name) % pool.length]
  if (kind == 'civilian' && female && name.startsWith('Dona ')) pick = 'civilian_8' // the grey-haired lady
  tag.putString('skin', pick)
  entity.load(tag)
}

EntityEvents.spawned('zc_story:survivor', event => {
  const entity = event.entity
  // the spawner may finish setup() right after adding the entity: check on the next tick
  event.level.server.scheduleInTicks(2, () => {
    try { zcnFix(entity) } catch (e) { console.warn('[zc_npc_skins] ' + e) }
  })
})
