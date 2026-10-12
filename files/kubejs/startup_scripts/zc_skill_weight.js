// ZomboidCraft - skills with real weight, part 1: events that must run on BOTH sides (client prediction + server).
// Part 2 (parkour unlocks, stamina, attributes, food, crops): server_scripts/zc_skill_weight.js
//
// Low level now hurts, high level helps (levels from zc_skills, 0-10; physical skills start at 2):
//   Strength      all mining -15% at 0 (-10% at 1, -5% at 2), +2%/level from 4 up; melee damage -10% at 0
//   Weapon skill  (the class of the weapon in hand) melee damage -20% at 0 (-13% at 1, -7% at 2)
//   Carpentry     wood (built blocks and logs) breaks -10% at 0 ... +25% at 10
//   Mechanics     metal blocks: same curve
//   Electrical    machines / redstone: same curve; shock and lightning -4% per level
//   Aiming        TaCZ guns: spread x1.6 at 0, x1.4, x1.25, x1.1, normal at 4, then -3%/level (x0.82 at 10);
//                 aiming down sights 35% slower at 0 ... normal from 4
//   Perks wired here: Respiracao controlada / Atirador de elite (-15% spread each, elite also aims faster)
// Everything in try/catch: an exception escaping a ForgeEvents handler crashes the game.
// Rhino: no `const` inside functions that run more than once, so plain `var`.
var ZcwApi = null, ZcwClassify = null, ZcwPlayer = null
try {
  ZcwApi = Java.loadClass('gg.zomboidcraft.skills.api.ZcSkillsApi')
  ZcwClassify = Java.loadClass('gg.zomboidcraft.skills.xp.Classify')
  ZcwPlayer = Java.loadClass('net.minecraft.world.entity.player.Player')
} catch (e) { console.warn('[ZC] skill weight: zc_skills not found, skill effects disabled: ' + e) }

function zcwLevel(p, id) { try { return ZcwApi.getLevel(p, id) } catch (e) { return 3 } }
function zcwPerk(p, id) { try { return ZcwApi.hasPerk(p, id) } catch (e) { return false } }
// 1 at level 0, 0.67 at 1, 0.33 at 2, 0 from 3 up
function zcwLow(l) { return Math.max(0, 3 - l) / 3 }
// trade curve: -10% at 0, normal at 3, +25% at 10
function zcwTrade(l) { return 0.9 + 0.035 * l }

if (ZcwApi) {
  ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerEvent$BreakSpeed', event => {
    try {
      var p = event.getEntity(), st = event.getState(), m = 1
      var str = zcwLevel(p, 'strength')
      m *= str < 3 ? 1 - 0.15 * zcwLow(str) : 1 + 0.02 * Math.max(0, str - 3)
      if (ZcwClassify.woodenBuilt(st) || ZcwClassify.log(st)) m *= zcwTrade(zcwLevel(p, 'carpentry'))
      else if (ZcwClassify.metalBlock(st)) m *= zcwTrade(zcwLevel(p, 'mechanics'))
      else if (ZcwClassify.electricalBlock(st)) m *= zcwTrade(zcwLevel(p, 'electrical'))
      if (m !== 1) event.setNewSpeed(event.getNewSpeed() * m)
    } catch (e) { }
  })

  ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', event => {
    try {
      var src = event.getSource(), who = src.getEntity(), m = 1
      // melee: the attacker hit with their own hand (not an arrow / bullet)
      if (who instanceof ZcwPlayer && src.getDirectEntity() === who) {
        var weapon = ZcwClassify.weapon(who)
        if (weapon) m *= 1 - 0.20 * zcwLow(zcwLevel(who, String(weapon.id)))
        m *= 1 - 0.10 * zcwLow(zcwLevel(who, 'strength'))
      }
      var victim = event.getEntity()
      if (victim instanceof ZcwPlayer) {
        var kind = String(src.getMsgId())
        if (kind === 'lightningBolt' || /shock|electr|tesla|wire/.test(kind)) m *= 1 - 0.04 * zcwLevel(victim, 'electrical')
      }
      if (m !== 1) event.setAmount(event.getAmount() * m)
    } catch (e) { }
  })
}

// ---------------------------------------------------------------- TaCZ guns: spread and aim time
if (ZcwApi && Platform.isLoaded('tacz')) {
  var ZcwGunProps = Java.loadClass('com.tacz.guns.api.GunProperties')
  var ZcwStack = Java.loadClass('net.minecraft.world.item.ItemStack')
  var ZcwFloat = Java.loadClass('java.lang.Float')
  var ZcwHashMap = Java.loadClass('java.util.HashMap')
  var ZcwHooks = Java.loadClass('net.minecraftforge.server.ServerLifecycleHooks')
  var ZcwSpread = [1.6, 1.4, 1.25, 1.1]
  var ZcwAds = [1.35, 1.25, 1.15, 1.05]

  // whose gun is this? the event only carries the item, and TaCZ evaluates it while the player is still
  // switching to it (it may not be in the main hand yet): look through every inventory slot.
  // (function expressions: Rhino does not hoist function declarations made inside an `if` block)
  var zcwOwns = function (p, gun, same) {
    var inv = p.getInventory()
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var s = inv.getItem(i)
      if (same ? ZcwStack.isSameItemSameTags(s, gun) : s === gun) return true
    }
    return false
  }
  var zcwHolder = function (gun) {
    var server = ZcwHooks.getCurrentServer()
    if (server && server.isSameThread()) {
      var found = null
      server.getPlayerList().getPlayers().forEach(p => { if (!found && zcwOwns(p, gun, false)) found = p })
      if (!found) server.getPlayerList().getPlayers().forEach(p => { if (!found && zcwOwns(p, gun, true)) found = p })
      return found
    }
    if (Platform.isClientEnvironment()) {
      var mc = Java.loadClass('net.minecraft.client.Minecraft').getInstance()
      return mc.player
    }
    return null
  }
  // getCache has a String and a GunProperty overload: Rhino needs the exact signature
  var zcwGet = function (cache, prop) { return cache['getCache(com.tacz.guns.api.GunProperty)'](prop) }
  var zcwScaleMap = function (cache, prop, f) {
    var map = zcwGet(cache, prop)
    if (!map) return
    var out = new ZcwHashMap()
    map.forEach((k, v) => out.put(k, ZcwFloat.valueOf(v * f)))
    cache.setCache(prop, out)
  }

  ForgeEvents.onEvent('com.tacz.guns.api.event.common.AttachmentPropertyEvent', event => {
    try {
      var p = zcwHolder(event.getGunItem())
      if (!p) return
      var cache = event.getCacheProperty()
      var aim = zcwLevel(p, 'aiming')
      var spread = aim < 4 ? ZcwSpread[aim] : 1 - 0.03 * (aim - 4)
      var ads = aim < 4 ? ZcwAds[aim] : 1
      if (zcwPerk(p, 'respiracao_controlada')) spread *= 0.85
      if (zcwPerk(p, 'atirador_de_elite')) { spread *= 0.85; ads *= 0.9 }
      // INACCURACY and AIM_INACCURACY are the same cached map (AIM is one of its keys): scale it once
      zcwScaleMap(cache, ZcwGunProps.INACCURACY, spread)
      var adsTime = zcwGet(cache, ZcwGunProps.ADS_TIME)
      if (adsTime != null) cache.setCache(ZcwGunProps.ADS_TIME, ZcwFloat.valueOf(adsTime * ads))
    } catch (e) { console.error('[ZC] skill weight: TaCZ property hook failed: ' + e) }
  })
}
