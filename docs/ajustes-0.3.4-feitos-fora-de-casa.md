# Pack 0.3.4: ajustes feitos direto no repositório de distribuição

Estes ajustes foram feitos no clone `zomboidcraft-dist` de outro PC, sem o projeto-fonte de casa.
Antes de gerar a próxima versão em casa, rode `git pull` aqui e leve estas mudanças para as fontes
(os capítulos SNBT e o `zc_story_quests.js` dizem que são gerados por `pack/tools/gen_quests.py`;
se o gerador rodar sem elas, as correções somem).

Este arquivo fica fora de `files/`, então o launcher não baixa.

## 1. Diário sem spoiler
- Todas as quests que dependem de outra ganharam `hide_until_deps_complete: true` (117 quests).
- Só a primeira quest do prólogo aparece de início. Capítulos sem quest visível somem da lista.
- Fonte a mudar em casa: o gerador dos capítulos (padrão para toda quest com dependência).

## 2. Mais pedras soltas
- O gerador do No Tree Punching só põe pedra se houver rocha natural 8 blocos abaixo. Nas ruas da cidade há porões e túneis, então quase nada nascia.
- Novo feature `zomboidcraft:street_loose_rocks` (8 tentativas por chunk) em `kubejs/data/zomboidcraft/worldgen` e `forge/biome_modifier`. Só vale para chunks novos.
- Tag `notreepunching:loose_rock_placeable_on` ganhou calçada portuguesa, paralelepípedo e caminho de terra.
- `zc_loot.js`: cavar terra ou grama com a mão dá pedra solta em 15% (era 5%); cascalho 12%; areia 8% (arenito). Isso vale no mundo que já existe.

## 3. Quests corrigidas para combinar com a história e com o mapa
Textos (capítulos SNBT):
- Prólogo: item 6 do bilhete (rádio 98.3), pedras, fibra, água, fogueira, linha, GPS, nota velha do zc_skills removida.
- Ato I: subtítulo sem "sete dias", cópia do mural vem da Cida, machado e faca de sílex contam como arma.
- Ato II: enxada de ouro (Flan), mapa da Joana para quem chega depois, CFTV no baú da Galeria.
- Ato III: fala do Dente preso, fala da torneira movida para "A ETA", aviso de que o Sincronismo precisa de 2 pessoas online.
- Ato IV: coletes, portas do arsenal, Casa dos Sampaio reescrita (a casa não existe no mapa), pendrive por jogador.
- Ato V: falas da Helena viraram bilhetes (ela não aparece em pessoa), túnel "O Túnel de Serviço", galões, amostra e aliança do Paciente Zero.
- Ato VI: subtítulo, citação do pai removida antes da hora, Protocolo Silêncio na Base Cerco, aviso da chave B, fala certa no Portão 1.
- Final Entrega, O Leitor, Irmã Graça, registros #04, #08, #12, #25, #36.
- "Encomenda do Bigode" agora depende de "O Galpão do Bigode".

Dados sobrescritos via KubeJS (mesmo caminho do jar, sem mexer no jar):
- `kubejs/data/zc_story/loot_modifiers/story_*.json`: documentos da história sem `unique` e com chance 1.0. Os baús de história são Lootr, então cada jogador acha os seus. O soro continua 10%. Manual do VBTP adicionado à Base Cerco.
- `kubejs/data/zc_bosses/loot_tables/bosses/{arauto,dente,escafandro,major}.json`: substitutos para drops que não existem (pilha_d, espingarda_serrada, cartucho_12, capacete_eod, pistola_9mm).
- `kubejs/assets/zc_story/lang/pt_br.json`: diário da Débora em Dia -8/-7 e caderno do Dente falando das duas chaves da Ferrugem.

## 4. Itens funcionando como a quest diz
- `kubejs/server_scripts/zc_quest_fixes.js`:
  - Receita de fogueira (acendedor + gravetos + toras). O NTP apagava a receita e travava "Temperatura corporal" e "Fundação" (fogão).
  - Injeção de Reversão usa antibiótico no lugar da lágrima de ghast (Nether fechado).
  - Linha, pochete, trapo e kit de sutura aceitam barbante vegetal.
  - Chave do arsenal abre as portas de ferro dentro do Batalhão.
- `zc_loot.js`: baús do Batalhão, Base Cerco e Portão 1 contam como militares e podem ter colete.
- `kubejs/assets/notreepunching/lang/pt_br.json`: nomes em português dos itens do NTP, iguais aos das quests.

## Pendências que precisam do código Java (não dá daqui)
- Helena não é colocada como NPC em nenhum lugar; o diálogo `helena.json` nunca aparece.
- Rota de aliança com o Dente (`dente_ally`) não acontece: só existe o Dente chefe e o Dente preso.
- Casa dos Sampaio e o cofre com data não existem no mapa; `chave_casa_sampaio`, `chave_ute` e `chaves_presidio` não abrem nada.
- Chave B do Portão 1: agora também cai do Escafandro (o cofre ainda entrega a dele uma vez só). Se todas se perderem: `/zcstory gate keys` (admin).
- Sincronismo e Duas Chaves exigem 2 jogadores online. Modo solo: `allowSamePlayerSync = true` e `syncWindowTicks = 200` em `serverconfig/zc_story-server.toml` do mundo.
- Dona Neide usa o diálogo genérico `civilian` (pergunta pelo "Lucas", não pelo Mateus).
- Bombeiros existe no mapa mas nenhuma quest usa.
- Baús genéricos (armários e geladeiras do refurbished_furniture) não são Lootr: quem abre primeiro leva.

## 5. Interface: menu inicial, EMI e inventário (07/10/2026)
- `config/fancymenu/customization/zomboidcraft_title_screen.txt`: botão "Mods" do Forge escondido (`is_hidden = true` em `forge_titlescreen_mods_button`). As imagens `btn_mods*.png` continuam no pack, só não são usadas.
- `kubejs/client_scripts/zc_emi_gamemode.js`: EMI (lista de itens/receitas ao lado do inventário) só fica ligado no criativo. No survival ele é desligado a cada tick (`EmiConfig.enabled`), igual à tecla de esconder o EMI. O JEI não desenha lista própria porque o EMI substitui as listas dele (jemi).
- `mods/zc_player.jar`: entrada nova `resourcepacks/zc_ui/assets/minecraft/textures/gui/container/inventory.png` (inventário do survival no estilo da hotbar: fundo quase preto, slots pretos, faixa de perigo em cima, manchas de ferrugem, filete vermelho). Adicionada direto no jar com `zip`; **copiar para a fonte do zc_player em casa** antes de recompilar, senão some. Cópia da textura em `docs/assets/zc_ui_inventory.png` (prévia 3x em `zc_ui_inventory_preview3x.png`); gerador em `docs/tools/gen_inv.js` (Node, usa `png.js`, parte do `inventory.png` vanilla + Default Dark Mode, rodar na pasta onde estão `vanilla/...` e `zcui/ddm/...`).
- O pack do KubeJS (`kubejs/assets`) fica ABAIXO do Default Dark Mode na ordem de resource packs, por isso a textura precisou ir no `zc_ui` (que é o último, de maior prioridade).
- Tela "New update available" ao abrir o jogo é o auto-updater do Distant Horizons. `config/DistantHorizons.toml` já tem `enableAutoUpdater = false`, mas esse arquivo tem política `once` no manifesto (o launcher só baixa se não existir). Quem já tinha o arquivo antigo precisa clicar em "Don't show again" uma vez, ou a política desse arquivo tem que virar `always` no gerador do manifesto.

## 6. Adaptação na primeira hora e efeito do minimapa (07/10/2026)
- `kubejs/server_scripts/zc_grace.js`: na primeira hora jogada de cada jogador (estatística `play_time` do mundo) a sede não cai abaixo de 20, o cansaço não passa de 80 e a temperatura corporal fica no estágio 1 (aviso sem penalidade). Mensagem ao começar e ao terminar (`message.zomboidcraft.grace.*` no lang do KubeJS). Jogadores com mais de 1 hora no mundo já ficam no padrão.
- `kubejs/startup_scripts/zc_grace_damage.js`: enquanto o jogador tem a tag `zc_grace`, dano de sangramento, infecção, intoxicação, desidratação e frio/calor cai pela metade (Knox não). Startup script: precisa reiniciar o jogo, `/reload` não pega.
- O mesmo arquivo esconde o efeito "Sem minimapa"/"Sem waypoints" do Xaero na tela do inventário (sai do mapa de efeitos do jogador local só durante o desenho da tela). O travamento do minimapa sem GPS continua. Na fonte do zc_player o certo é descobrir por que o `isVisibleInInventory = false` do `XaeroMinimapCompat.hide` não bastou.
- `kubejs/server_scripts/zc_revive.js`: comando de admin `/revive [jogadores]` (nível 2; sem alvo = você mesmo). Zera o zc_survival com `SurvivalAPI.resetAll(p, false)` (inclui curar Knox), tira efeitos da categoria HARMFUL, enche vida/fome/saturação/ar, apaga fogo e zera a abstinência do Fumante (`PlayerData.setCounter(p, "nosmoke", 0)`).
- `kubejs/startup_scripts/zc_moodles_inventory.js`: os moodles do zc_survival (sede, fome, frio, calor, cansaço, sangramento, dor, mal-estar, gripe, molhado, esgoto) aparecem também no inventário do survival, numa coluna à esquerda da janela, com a mesma placa e cores do HUD. Passar o mouse mostra o nome do estado e "Como resolver". Feito por `ForgeEvents.onEvent('ScreenEvent$Render$Post')` lendo `ClientSurvivalState.get()` e `Moodle.level(...)`; usa nomes SRG (`m_280163_` blit, `m_280246_` setColor, `m_280677_` renderTooltip, `m_7500_` isCreative). Não desenha no criativo (como o HUD). Se um dia for para o Java do zc_survival, basta um handler de `ScreenEvent.Render.Post` para `InventoryScreen` com a mesma lógica; os textos de "como resolver" estão no script (só pt-BR).
- Menu de pausa (ESC) só com Voltar ao jogo, Opções e Sair: `kubejs/startup_scripts/zc_pause_menu.js` tira todos os outros botões da `PauseScreen` (inclusive os de outros mods e o de denúncia de jogador) e empilha os três no meio; `config/fancymenu/customization/zomboidcraft_pause_screen.txt` também esconde os botões vanilla conhecidos (`mc_pausescreen_*`). O texto de versão desse layout (e do título/carregamento) ainda diz 0.3.1.

## 6. Traço "Viciado em café" (07/10/2026) — precisa de 1 linha no Java do zc_player
A mecânica, os itens, as receitas e o loot já estão no KubeJS; só o traço em si (que aparece na aba "Traços"
da criação de personagem) é um enum em Java e tem que ser adicionado em casa:

- `gg/zomboidcraft/player/character/Trait.java`, junto dos negativos (depois de `FUMANTE`):
  `VICIADO_EM_CAFE("viciado_em_cafe", -2, null, List.of()),`
  (mesmo padrão de FUMANTE: custo -2 = dá 2 pontos, sem grupo exclusivo, sem StatEffect). Não precisa de nada em
  `TraitEffects`: o mod já põe a tag `zc_trait_viciado_em_cafe` no jogador, e o script lê essa tag.
- `assets/zc_player/lang/pt_br.json`:
  `"trait.zc_player.viciado_em_cafe": "Viciado em café",`
  `"trait.zc_player.viciado_em_cafe.desc": "Começa com 2 cafés. Um dia sem café traz dor de cabeça (fadiga leve de vez em quando) até tomar outro.",`
- `assets/zc_player/lang/en_us.json`:
  `"trait.zc_player.viciado_em_cafe": "Coffee addict",`
  `"trait.zc_player.viciado_em_cafe.desc": "Starts with 2 coffees. A day without coffee brings headaches (mild fatigue now and then) until the next cup.",`

O que já está no dist:
- `kubejs/startup_scripts/zc_coffee_items.js`: itens `kubejs:ground_coffee` (Pó de café) e `kubejs:coffee` (Café, bebida; nomes via displayName, sem mexer nos lang do kubejs). Texturas em `kubejs/assets/kubejs/textures/item/{coffee,ground_coffee}.png`.
- `kubejs/server_scripts/zc_coffee.js`: ao ganhar o traço recebe 2 cafés (uma vez); 1 dia sem café → aviso; 1¼ dia → a cada ~4 min Fadiga de mineração I 30 s (40% Fraqueza I 20 s) + aviso na action bar, sem escalar; beber café (kubejs:coffee, herbalbrews:coffee, herbalbrews:milk_coffee) zera o relógio, tira os efeitos e dá Pressa I (4 min viciado, 2 min qualquer um). Receitas: grãos de café (Herbal Brews) → 2 pó; pó + garrafa de água (vanilla ou zc_survival) → café. Loot: qualquer baú 8% pó (1-2), 3% café.
- Enquanto o enum não existir, o script fica inerte (ninguém tem a tag), mas os itens, receitas e loot já funcionam.
- Rastejar (C) levantava sozinho: o `CrawlManager.tick` do zc_player chama `stop` quando o jogador está correndo e cabe em pé, e Ctrl / duplo W / "correr: alternar" ligavam o sprint. `kubejs/startup_scripts/zc_crawl_fix.js` desliga o sprint enquanto deitado (cliente no fim do tick, servidor no começo). Na fonte em casa: tirar o "sprint levanta" do `CrawlManager.tick` e bloquear o sprint no cliente.
- Zoom: `kubejs/startup_scripts/zc_zoom.js` registra a tecla `key.zomboidcraft.zoom` (X, segurar; rodinha ajusta de ~1,7x a 10x) e muda o FOV no `ViewportEvent.ComputeFov`. O Toolbelt saiu do X e foi para o B em `config/defaultoptions/keybindings.txt` (só vale para instalação nova; quem já tem o jogo fica com os dois no X até trocar em Controles).

## 7. Chave B, skins de NPC e Alex's Mobs
- `kubejs/data/zc_bosses/loot_tables/bosses/escafandro.json`: o Escafandro larga a chave B junto com a A. Cada esquadrão que vence sai com o par; o cofre da torre continua dando outra chave B e o Protocolo Silêncio. Texto de "O Escafandro" ajustado.
- `kubejs/server_scripts/zc_npc_skins.js`: o zc_story sorteia nome e skin de NPC genérico separadamente (`NpcDefs.generic`). O script troca a skin quando o gênero não bate com o nome. Na fonte do zc_story o certo é sortear a skin a partir do gênero do nome.
- `kubejs/assets/zc_story/textures/entity/survivor/guard_f1..3.png`: guardas mulheres (Sandra, Keila, Cláudia, Priscila não tinham skin feminina). Copiar para a fonte do zc_story.
- `config/alexsmobs.toml`: spawn 0 para 29 bichos fantasiosos. `kubejs/server_scripts/zc_no_fantasy_mobs.js` remove os que já existem no mundo.

## 7. Medidor de barulho: voz e tiros (07/10/2026)
- `kubejs/server_scripts/zc_noise_voice_guns.js`.
- Voz: o zc_survival já liga o Simple Voice Chat ao barulho (ZcVoicePlugin → VoiceBridge → NoiseTracker VOICE), mas só decodifica quem está perto de um hostil (`[voice] onlyNearHostiles = true` em `serverconfig/zc_survival-noise-server.toml`). O script desliga essa opção no config do mundo ao iniciar o servidor (uma vez, via `ForgeConfigSpec` `set/clearCache/save`), então o medidor passa a reagir sempre à voz. Para fixar na fonte: mudar o default de `VOICE_ONLY_NEAR_HOSTILES` para `false` em `NoiseConfig`.
- Tiros: `TimelessGunEvents.gunFire` (evento KubeJS do TaCZ, lado servidor) → `NoiseTracker.add(player, 100, COMBAT, pos)`; com silenciador no cano (acessório MUZZLE cuja data tem `"silence"`, ou id com "silenc"/"suppress") usa 30. 100 é o topo da escala, logo raio = `maxRadius` do config. Para levar ao Java: handler de `GunFireEvent` (lado servidor) em `NoiseTracker` com a mesma lógica.

## 7. Mod novo zc_voice: infectado fala com voz de zumbi (07/10/2026)
- Fonte em `Documents/Projetos/zc_voice` deste PC (ForgeGradle, mesmo molde do zc_hair; `gradlew build` com JDK 17). Jar em `files/mods/zc_voice.jar`. **Levar a pasta para casa** (não está em nenhum git).
- Quem morre infectado: quando o zc_player renasce o jogador, ele vira espectador preso aos olhos do `zc_player:turned_player` com o rosto dele. O voice dele (Simple Voice Chat) deixa de sair normal: é decodificado, passa por pitch -28% + rosnado + aspereza + abafado e sai do infectado (canal de entidade, 32 blocos).
- Sai do corpo quando o infectado cai, quando acabam 10 min, segurando Shift 3 s, ou com `/zcvoice soltar [jogadores]` (admin). Volta para o lugar e o modo de jogo em que renasceu. Se cair/sair do jogo preso, é solto no próximo login.
- Config: `serverconfig/zc_voice-server.toml` (enabled, maxSeconds, releaseHoldSeconds, distance, pitch, growl).
- Ligação com o zc_player é por reflexão (`TurnedPlayerEntity.getOwner()`), sem dependência de compilação. Melhor, em casa: o zc_player expor um evento/API "jogador virou infectado" em vez do casamento por tempo (infectado nasce → dono renasce até 5 s depois).
- Altura da voz (zc_voice): tecla Alt esquerdo (`key.zc_voice.mode`, categoria ZomboidCraft) alterna Normal → Gritando → Sussurrando e mostra "Voz: ..." em cima da hotbar por 2 s. Normal = alcance do próprio Simple Voice Chat (32 neste pack); Gritando 64 e Sussurrando 8 (`shoutDistance` / `whisperDistance` no `zc_voice-server.toml`). Em grupo de voice, ou usando o sussurro do próprio Voice Chat, nada muda. Vale também para a voz de zumbi do infectado. Volta para Normal a cada entrada no mundo.

## 8. Botão das roupas/mochila (Curios) visível no inventário (07/10/2026)
- O botão que abre a aba do Curios (roupas do zc_clothing e mochila) usa o sprite de `assets/curios/textures/gui/inventory.png` em (50,0) 14x14 (normal) e (50,14) (hover). O Default Dark Mode Expansion troca esse sprite por um quadrado cinza-escuro (32,32,32), que some sobre o inventário escuro.
- Nova entrada em `mods/zc_player.jar`: `resourcepacks/zc_ui/assets/curios/textures/gui/inventory.png` = textura do DDM Expansion com os dois sprites redesenhados (moldura laranja da hotbar, fundo escuro, camiseta clara; hover avermelhado). **Copiar para a fonte do zc_player em casa.** Cópia em `docs/assets/zc_ui_curios_inventory.png`; gerador `docs/tools/gen_curios.js`.
- Alternativa sem textura: `config/curios-client.toml` tem `buttonXOffset/buttonYOffset/buttonCorner` para mover o botão.

## 9. Mod novo `zc_chat` (07/10/2026): balão de chat e sem ícone de voz sobre a cabeça
- Projeto Java `Documents/Projetos/zc_chat` (ForgeGradle, mesmo molde do zc_hair; compila offline com JDK 17: `JAVA_HOME=.../jdk-17.0.7.7-hotspot ./gradlew build --offline`). Jar em `mods/zc_chat-0.1.0.jar` (lado BOTH). **Levar a pasta do projeto para casa e adicionar ao manifesto** (`mods/zc_chat-0.1.0.jar`, side both).
- Servidor: `ServerChatEvent` (HIGHEST, receiveCanceled) cancela a mensagem (não vai para o chat global; fica no log do servidor como `[balao] <nome> texto`) e manda um pacote `zc_chat:main` com (uuid, texto) para os jogadores a até `range` blocos (config `zc_chat-common.toml`, padrão 48).
- Cliente: em `RenderNameTagEvent` desenha o balão sobre o nome (caixa escura com borda clara e "rabinho", texto quebrado em `wrapWidth` px, até `maxBubbles` empilhados). Dura `baseSeconds + secondsPerChar × tamanho` (5 s + 0,06 s/caractere, máx. 15 s). Só aparece a até 40 blocos.
- Simple Voice Chat: no `FMLClientSetupEvent` o mod põe `show_nametag_icons=false` no config do cliente (via reflexão em `VoicechatClient.CLIENT_CONFIG.showNametagIcons`), para todo mundo, inclusive instalações antigas; `config/voicechat/voicechat-client.properties` do pack também foi trocado para `false` (política once).
- Com isso o LocalizedChat (chat por proximidade) ficou redundante: o balão já é local. Pode ser removido do pack quando regerar o manifesto.
- Recuperação depois de morrer (zc_voice, `Recovery`): depois de QUALQUER morte o jogador renasce deitado (pose SLEEPING forçada, não o sono vanilla: não pula a noite e o dia não acorda) e fica 5 min (`[recovery] seconds = 300` no `zc_voice-server.toml`) sem andar, pular, atacar, usar ou quebrar nada, e sem poder levar dano ou ser alvo. Timer "Recuperando-se m:ss" no alto da tela. Lugar: o renascimento vanilla que o zc_player usa (última cama; sem cama, spawn do mundo); se renasceu numa cama, deita em cima dela. Só conta tempo online (sair do jogo guarda o resto). Quem morre infectado começa a recuperação quando sai do corpo do infectado. Admin: `/zcvoice levantar [jogadores]`. A pose é mandada para todos os clientes (pacote `LyingPose`), igual ao rastejar do zc_player.

## 10. Tab só com a contagem e F3 abre os emotes (07/10/2026)
- `kubejs/startup_scripts/zc_tab_f3.js` (cliente). Tab: cancela o overlay `minecraft:player_list` e desenha só "N jogadores online" no alto da tela (lang `hud.zomboidcraft.players_online` / `.one` em `kubejs/assets/kubejs/lang`). Mesmas condições da lista vanilla (no singleplayer sozinho não aparece).
- F3: cancela o overlay `minecraft:debug_text` e zera `options.renderDebug` todo tick (some também os gráficos de Shift+F3/Alt+F3). O F3 vira a tecla do menu de emotes (`key.emotecraft.fastchoose`): `config/defaultoptions/keybindings.txt` passou de `-` para `f3`, e o script troca para F3 no primeiro tick quem ainda está no `-` do pack, no B padrão do Emotecraft ou sem tecla (quem escolheu outra tecla fica com a dela).
- Combinações F3+tecla (F3+B, F3+G...) não abrem mais na prática: o F3 abre o menu de emotes ao apertar, e com tela aberta o vanilla ignora as combinações.

## 10. Traço "Paranoia" (07/10/2026) — precisa de 1 linha no Java do zc_player
Mesmo esquema do "Viciado em café": a mecânica está no KubeJS lendo a tag `zc_trait_paranoia`; o traço em si é enum.
- `gg/zomboidcraft/player/character/Trait.java`, entre os negativos: `PARANOIA("paranoia", -2, null, List.of()),`
- `assets/zc_player/lang/pt_br.json`:
  `"trait.zc_player.paranoia": "Paranoia",`
  `"trait.zc_player.paranoia.desc": "De vez em quando ouve zumbis e passos por perto que não existem. Só você ouve.",`
- `assets/zc_player/lang/en_us.json`:
  `"trait.zc_player.paranoia": "Paranoid",`
  `"trait.zc_player.paranoia.desc": "Now and then hears zombies and footsteps nearby that aren't there. Only you hear them.",`
- `kubejs/server_scripts/zc_paranoia.js`: a cada 4-8 min (×0,6 à noite) manda um `ClientboundSoundPacket` só para o jogador, num ponto a 4-14 blocos: gemido de zumbi (40%), passos se aproximando (35%), zumbi arrastando os pés + gemido (17%), pancadas em porta (8%). Nada no criativo/espectador/dormindo. Constantes no topo do script.

## 0.3.5. Mapa, interiores, mods novos e acampamentos
- **Interiores** (`kubejs/data/zc_world/lostcities/parts/`, 812 partes): paredes internas subiam só até 1 bloco abaixo do teto (camada 5 de cada andar vazia); agora vão até o teto. Móveis e objetos de bancada que olhavam para a parede foram virados (o gerador usa o mesmo `facing` para o mesmo caractere em lugares diferentes). Corrigir no gerador de assets em casa: paredes internas com altura total e `facing` por posição.
- **Camas**: 84 sacos de dormir do Comforts em 56 andares de apartamento; camas comuns de UBS/UPA/hospital genérico viraram `hospitals:hospital_bed`.
- **Placas da outra sessão**: 108 dessas partes também têm as placas `kubejs:sign_*` (scripts `zc_signs*.js`, ainda não publicados). O commit leva a versão sem placas; a pasta de trabalho tem a versão com placas, para entrar junto com os scripts das placas.
- **Densidade** (`citystyles/`, `worldstyles/`): chance de prédio por bairro (Centro 0,36→0,78, Favela 0,38→0,82, etc.), menos praças, prédios genéricos sem uso adicionados, mais prédios de vários lotes.
- **Terreno**: `config/lostcities/profiles/zomboidcraft.json` (cópia do perfil, que o zc_world respeita) com `groundLevel 71` e níveis de cidade mais espaçados (82/90/98...), para não subir blocos de 3×3 chunks por 6 blocos. Só vale para chunks novos.
- **Distant Horizons**: `distantGeneratorMode = PRE_EXISTING_ONLY` (no modo FEATURES ele gerava a cidade em threads próprias e o Lost Cities não aguenta: buracos e chunks altos no LOD). Política do arquivo no manifesto agora `always`. Apagar `<mundo>/data/DistantHorizons*.sqlite` no servidor e nos clientes para refazer o LOD.
- **Mods novos**: Hospitals (móveis de hospital), Macaw's Furniture, Dramatic Doors, Chipped, Simply Tents. `zc_hospitals.js` remove as receitas de kits médicos, pílulas, seringas e bolsas de sangue; a farmácia do mod não gera mais (`data/hospitals/worldgen/structure/pharmacy.json`).
- **Acampamentos** (`startup_scripts/zc_camps.js`): 3,5% dos chunks novos ganham uma tenda do Simply Tents em chão natural, às vezes com saco de dormir e fogueira apagada. Pula os lugares da história.
- **Lugares da história** (hospital, batalhão, bombeiros, UTE etc.): são montados pelo Java do zc_world (`*Builder`), sem templates. Aumentar e decorar exige mexer na fonte em casa (por exemplo, o `Blueprint` carregar salas de arquivos `.nbt`). Os mods novos já trazem os blocos para isso.

## Mod novo `zc_airdrop` (07/10/2026): avião de suprimentos 2x por dia
- Projeto Java `Documents/Projetos/zc_airdrop` deste PC (ForgeGradle, mesmo molde do zc_chat; `JAVA_HOME=.../jdk-17.0.7.7-hotspot ./gradlew build --offline`). Jar em `mods/zc_airdrop-0.1.0.jar` (lado BOTH). **Levar a pasta para casa e pôr no manifesto** (`mods/zc_airdrop-0.1.0.jar`, side both).
- Horário: `serverconfig/zc_airdrop-server.toml` → `times = ["14:00", "21:00"]`, `timezone = "America/Sao_Paulo"`. Se o servidor estava desligado/vazio no horário, ainda solta até `lateMinutes` (60) depois; `needPlayers = true` espera ter alguém online. O último disparo fica salvo em `world/data/zc_airdrop.dat` (não repete após reiniciar).
- Ponto: sorteado entre `minDistance` 250 e `maxDistance` 2500 blocos do spawn do mundo, evitando água. O avião (cargueiro de 4 hélices, ~31 blocos) cruza o céu em linha reta a `planeY` 170 (ou 60 acima do chão), 3 blocos/tick, aparecendo e sumindo a 1100 blocos do ponto. Ele não é entidade: o servidor manda a rota (pacote `zc_airdrop:main`) e cada cliente desenha o modelo e toca o ronco.
- Som: `assets/zc_airdrop/sounds/plane_loop.ogg`, sintetizado (`tools/synth_plane.js`): 4 motores turboélice + rugido, loop de 4 s. Toca na categoria Geral (MASTER), volume pela distância até o avião (ouvido até `soundRange` 800 blocos, bem alto por baixo) e pitch com efeito Doppler.
- Caixa: quando o avião passa sobre o ponto, cai uma caixa com paraquedas gigante (entidade `zc_airdrop:airdrop_crate`, ~10 blocos de dossel listrado laranja/branco) a 0,15 bloco/tick. O chunk fica forçado só enquanto ela cai. No chão vira o bloco `zc_airdrop:airdrop_crate` (27 espaços), com fumaça de sinalização por 15 min; some 60 min depois do pouso ou quando é esvaziada. Quebrar na mão derruba o conteúdo.
- Loot: `data/zc_airdrop/loot_tables/chests/airdrop_military.json` (1 arma TaCZ, 2-3 munições, 2-4 remédios zc_survival, 2-4 enlatados/água). O nome contém "military", então o `zc_loot.js` (LootJS) soma peças de arma e roupas militares. Para mudar sem recompilar: `kubejs/data/zc_airdrop/loot_tables/chests/airdrop_military.json`.
- Comandos: `/airdrop agora [x z]` (op) e `/airdrop proximo` (todos).
- Modelos Blockbench: `blockbench/zc_airdrop_plane.bbmodel` e `blockbench/zc_airdrop_crate.bbmodel` (Entidade Modificada). Texturas geradas por `tools/paint_plane.js` e `tools/paint_crate.js`.
- Testado em servidor dev (07/10): `/airdrop agora` e o horário automático soltaram, a caixa caiu num chunk descarregado a 2400 blocos, virou bloco com a tabela de loot e o chunk foi liberado. Ainda não visto no cliente (modelo/som no jogo).
