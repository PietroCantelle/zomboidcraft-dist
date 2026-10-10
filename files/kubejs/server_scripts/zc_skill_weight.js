// ZomboidCraft - skills with real weight, part 2 (server). Part 1: startup_scripts/zc_skill_weight.js
//
// PARKOUR (ParCool): every move starts locked and is unlocked by the Agilidade (nimble) skill and its perks:
//   Agilidade 1                         vault (hop over low walls)       (Agilidade starts at 0)
//   Agilidade 2                         hang on ledges, climb up, hang from bars
//   Pes ageis (perk)                    fast run, slide
//   Rolamento (perk)                    breakfall roll
//   Escalador (perk)                    wall jump, pole climb, slide down walls
//   Esquiva (perk)                      dodge
//   Parkour (perk)                      wall run, horizontal wall run, long jump (cat leap), charge jump,
//                                       flip, dive, skydive
//   Nadador (Condicionamento perk)      fast swim
//   always: zipline (needs its items); never: ParCool crawl and hide-in-block
//   (zc_player has its own crawl). Uses ParCool 3.4's per-player Limitation API (it syncs to the client by itself);
//   ParCool 4 can't be used: it needs Shoulder Surfing 5, and tp_shooting (TaCZ third person) needs Shoulder Surfing 4.
//
// STAMINA (ParCool) by Condicionamento (fitness): max 60% at 0 ... 100% at 5 ... 140% at 10, Maratonista +25%;
//   recovery 70% at 0 ... 130% at 10. Sprinting with Condicionamento 0-2 also tires you (zc_survival fatigue).
// Per-level bonuses for skills that had none: Coleta +0.1 luck/level, Culinaria +0.25 saturation/level on cooked
//   food, Agricultura 3%/level extra crop, Catador (perk) extra scrap from trash bags.
// The skill screen texts are updated in kubejs/assets/zc_skills/lang (overrides the zc_skills jar).
// Rhino: no `const` inside functions that run more than once, hence `let`.
(function () {
  const Api = Java.loadClass('gg.zomboidcraft.skills.api.ZcSkillsApi')
  const Classify = Java.loadClass('gg.zomboidcraft.skills.xp.Classify')
  const UUID = Java.loadClass('java.util.UUID')
  const Modifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
  const Operation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation')
  const Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes')
  let SurvivalAPI = null
  try { SurvivalAPI = Java.loadClass('gg.zomboidcraft.survival.api.SurvivalAPI') } catch (e) { }
  let ParCoolAttr = null, Limitation = null, LimitationID = null
  try {
    ParCoolAttr = Java.loadClass('com.alrex.parcool.api.Attributes')
    Limitation = Java.loadClass('com.alrex.parcool.api.unstable.Limitation')
    LimitationID = Java.loadClass('com.alrex.parcool.api.unstable.Limitation$ID')
  } catch (e) { console.warn('[ZC] skill weight: ParCool not found: ' + e) }

  // our move names -> ParCool 3.4 action classes (com.alrex.parcool.common.action.impl.*)
  const MOVES = {
    vault: ['Vault'], hang_on: ['ClingToCliff'], climb_up: ['ClimbUp'], hang_down: ['HangDown', 'JumpFromBar'],
    fast_run: ['FastRun', 'QuickTurn'], slide: ['Slide'], breakfall: ['BreakfallReady', 'Roll', 'Tap'],
    wall_jump: ['WallJump'], pole_climb: ['ClimbPoles'], slide_down: ['WallSlide'], dodge: ['Dodge'],
    wall_run: ['VerticalWallRun'], horizontal_wall_run: ['HorizontalWallRun'], long_jump: ['CatLeap'],
    charge_jump: ['ChargeJump'], trick_jump: ['Flipping'], dive: ['Dive'], skydive: ['SkyDive'],
    fast_swim: ['FastSwim'], ride_zipline: ['RideZipline'], crawl: ['Crawl'], hide_in_block: ['HideInBlock']
  }
  const ACTION_CLASS = {}
  const STATE = 'zc_parkour_unlocked'
  const IDS = {
    stamina: UUID.fromString('5f1e0c1a-7a1b-4e8e-9a51-2c0f0b7d0a01'),
    recovery: UUID.fromString('5f1e0c1a-7a1b-4e8e-9a51-2c0f0b7d0a02'),
    luck: UUID.fromString('5f1e0c1a-7a1b-4e8e-9a51-2c0f0b7d0a03')
  }

  function level(p, id) { try { return Api.getLevel(p, id) } catch (e) { return 3 } }
  function perk(p, id) { try { return Api.hasPerk(p, id) } catch (e) { return false } }

  function allowedMoves(p) {
    let out = ['ride_zipline']
    let nimble = level(p, 'nimble')
    if (nimble >= 1) out.push('vault')
    if (nimble >= 2) out.push('hang_on', 'climb_up', 'hang_down')
    if (perk(p, 'pes_ageis')) out.push('fast_run', 'slide')
    if (perk(p, 'rolamento')) out.push('breakfall')
    if (perk(p, 'escalador')) out.push('wall_jump', 'pole_climb', 'slide_down')
    if (perk(p, 'esquiva')) out.push('dodge')
    if (perk(p, 'parkour')) out.push('wall_run', 'horizontal_wall_run', 'long_jump', 'charge_jump', 'trick_jump', 'dive', 'skydive')
    if (perk(p, 'nadador')) out.push('fast_swim')
    return out
  }

  function syncParkour(p, force) {
    if (!Limitation) return
    let want = allowedMoves(p).sort()
    let had = String(p.persistentData.getString(STATE) || '')
    let key = want.join(',')
    if (!force && had === key) return
    let before = had ? had.split(',') : []
    let lim = Limitation.get(p, new LimitationID('zomboidcraft', 'skills')).enable()
    Object.keys(MOVES).forEach(move => MOVES[move].forEach(cls => {
      if (!ACTION_CLASS[cls]) ACTION_CLASS[cls] = Java.loadClass('com.alrex.parcool.common.action.impl.' + cls)
      lim.permit(ACTION_CLASS[cls], want.indexOf(move) >= 0)
    }))
    lim.apply()
    lim.save()
    p.persistentData.putString(STATE, key)
    // tell the player what they just learned (not on the first sync after login)
    if (had) {
      let fresh = want.filter(a => before.indexOf(a) < 0 && a !== 'ride_zipline')
      if (fresh.length > 0) {
        let names = Text.of('')
        fresh.forEach((a, i) => { if (i > 0) names.append(', '); names.append(Text.translate('zc.parkour.' + a).yellow()) })
        p.tell(Text.translate('zc.parkour.learned', names).gold())
      }
    }
  }

  function setModifier(p, attribute, id, label, amount) {
    let inst = p.getAttribute(attribute)
    if (!inst) return
    let old = inst.getModifier(id)
    if (old && Math.abs(old.getAmount() - amount) < 1e-6) return
    if (old) inst.removeModifier(id)
    if (amount !== 0) inst.addTransientModifier(new Modifier(id, label, amount, Operation.MULTIPLY_BASE))
  }
  function setAddModifier(p, attribute, id, label, amount) {
    let inst = p.getAttribute(attribute)
    if (!inst) return
    let old = inst.getModifier(id)
    if (old && Math.abs(old.getAmount() - amount) < 1e-6) return
    if (old) inst.removeModifier(id)
    if (amount !== 0) inst.addTransientModifier(new Modifier(id, label, amount, Operation.ADDITION))
  }

  function refresh(p) {
    let fit = level(p, 'fitness')
    if (ParCoolAttr) {
      let stamina = -0.4 + 0.08 * fit + (perk(p, 'maratonista') ? 0.25 : 0)
      setModifier(p, ParCoolAttr.MAX_STAMINA.get(), IDS.stamina, 'zc fitness stamina', stamina)
      setModifier(p, ParCoolAttr.STAMINA_RECOVERY.get(), IDS.recovery, 'zc fitness recovery', -0.3 + 0.06 * fit)
    }
    setAddModifier(p, Attributes.LUCK, IDS.luck, 'zc foraging luck', 0.1 * level(p, 'foraging'))
    // out of shape: sprinting tires you
    if (SurvivalAPI && fit < 3 && p.isSprinting() && !p.isCreative()) {
      let f = SurvivalAPI.getFatigue(p)
      SurvivalAPI.setFatigue(p, Math.min(100, f + 0.4 * (3 - fit) / 3))
    }
  }

  let tick = 0
  ServerEvents.tick(event => {
    tick++
    if (tick % 20 !== 0) return
    event.server.players.forEach(p => {
      try {
        refresh(p)
        if (tick % 40 === 0) syncParkour(p, false)
      } catch (e) { console.error('[ZC] skill weight: ' + e) }
    })
  })
  PlayerEvents.loggedIn(event => {
    try { syncParkour(event.player, true) } catch (e) { console.error('[ZC] skill weight: ' + e) }
  })

  // ---------------------------------------------------------------- Culinaria: cooked food fills you up more
  ItemEvents.foodEaten(event => {
    let p = event.player
    if (!p || !Classify.cookedFood(event.item)) return
    let bonus = 0.25 * level(p, 'cooking')
    if (bonus <= 0) return
    let food = p.getFoodData()
    food.setSaturation(Math.min(food.getFoodLevel(), food.getSaturationLevel() + bonus))
  })

  // ---------------------------------------------------------------- Agricultura: chance of an extra crop
  // Catador: trash bags give a second piece of scrap more often
  const SCRAP = ['zc_survival:rag', 'zc_survival:empty_bottle', 'minecraft:string', 'minecraft:paper', 'minecraft:iron_nugget', 'minecraft:glass_bottle']
  BlockEvents.broken(event => {
    let p = event.player
    if (!p || p.isCreative()) return
    let block = event.block
    if (String(block.id) === 'zc_world:trash_bags') {
      if (perk(p, 'catador') && Math.random() < 0.35) block.popItem(Item.of(SCRAP[Math.floor(Math.random() * SCRAP.length)]))
      return
    }
    let farming = level(p, 'farming')
    if (farming <= 0 || Math.random() >= 0.03 * farming) return
    if (!Classify.matureCrop(block.blockState)) return
    let drops = block.getDrops(p, p.getMainHandItem())
    let n = drops.length != null ? drops.length : drops.size()
    for (let i = 0; i < n; i++) {
      let st = drops.length != null ? drops[i] : drops.get(i)
      if (!String(st.id).includes('seed')) { block.popItem(Item.of(st.id)); break }
    }
  })

  // ---------------------------------------------------------------- ParCool's tutorial book: never handed out, no recipe
  ServerEvents.recipes(event => {
    event.remove({ output: 'parcool:parcool_guide' })
  })
})()
