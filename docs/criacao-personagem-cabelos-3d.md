# Criação de personagem: novas opções + cabelos 3D (feito fora de casa)

Feito neste PC, sem os fontes do `zc_player`. Ao voltar para casa, **portar para o projeto fonte**,
senão o próximo build do `zc_player` apaga tudo isto.

## 1. `zc_player.jar` (só recursos, nenhum .class mudou)

Opções **adicionadas no fim** de cada lista (os índices salvos dos personagens antigos não mudam):

| Campo | Novas opções |
|---|---|
| hair (2D) | pixie, franja_lateral, chanel_franja, longo_franja, repicado, cacheado_medio, ondas_longas, undercut, mullet |
| hair (3D) | afro_3d, rabo_alto_3d, coque_3d, coque_duplo_3d, longo_3d, cacheado_longo_3d, chiquinhas_3d, meio_preso_3d, tranca_3d, moicano_3d, topete_3d |
| eyes | brilhante, cilios, felino, caido, sereno, profundo |
| mouth | sorriso_largo, sorriso_de_lado, triste, fina, batom, surpresa |
| brows | retas, curtas, cortada, angulosas, preocupadas, cheias, delineadas |

Arquivos alterados dentro do jar:
- `zc_player_appearance.json` (entradas novas em `options.hair/eyes/mouth/brows`)
- `assets/zc_player/lang/pt_br.json` e `en_us.json` (`appearance.zc_player.<campo>.<id>`)
- `assets/zc_player/textures/appearance/{hair,eyes,mouth,brows}/*.png` (novos)

Os PNGs e as entradas do JSON são gerados por `tools/gen2d.js` (Node; ver `C:\Users\T-GAMER\Documents\Projetos\zc_hair\tools`).
As opções `*_3d` só têm no jar a "base" 2D (camada interna, curtinha); o volume vem do `zc_hair`.

**O servidor precisa do jar novo também**: `Appearance.validate()` usa a contagem de opções do JSON, então
um servidor com o jar antigo recusa personagem com cabelo de índice >= 19.

## 2. Mod novo `zc_hair` (cliente)

Fonte: `C:\Users\T-GAMER\Documents\Projetos\zc_hair` (Forge MDK 1.20.1-47.4.0; compila contra
`libs/zc_player-0.2.0.jar` e `libs/zc_clothing-1.0.jar`, copiar os jars para `libs/` antes de `gradlew build`).

- `HairLayer`: camada no `PlayerRenderer` (default e slim). Lê a opção de cabelo do personagem
  (`ClientAppearance.appearanceFor` → `AppearanceOptions.options("hair")`) e, se existir
  `assets/zc_hair/hair/<id>.json`, desenha o modelo preso à cabeça, tingido com `SkinCompositor.colorFor(a, "hair")`.
  Funciona também no preview da tela de criação.
- **Versão baixa**: se há item no slot de cabeça (capacete) ou chapéu do zc_clothing (`ZcClothingApi.getWorn(p, "hat")`),
  usa o modelo `low` (só o que fica abaixo da aba do chapéu, y < 28 no Blockbench), então nada atravessa o chapéu.
- `HairModels`: reload listener que monta os `ModelPart` a partir dos JSON. Adicionar um cabelo 3D novo =
  JSON + entrada no `zc_player_appearance.json` com o mesmo id; não precisa recompilar.

### Modelos (Blockbench MCP)
Projetos em `zc_hair/blockbench/*.bbmodel` (formato Modded Entity, grupos `full` e `low`, origem 0,24,0 = pivô da cabeça).
O JSON exportado já vem convertido para o espaço do `ModelPart` (x espelhado, y invertido),
mesma conversão que o exportador "Java Class" do Blockbench usa. Texturas cinza (`straight`, `curly`, `braid`)
calibradas para o tom 160 = cor pura, igual ao compositor 2D.

## 3. 3D Skin Layers
`skinlayers3d-forge-1.11.3-mc1.20.1.jar` (Modrinth, só cliente). Ele lê skins `DynamicTexture`, então funciona
com as skins compostas do zc_player; cabelos 2D e chapéus pintados na camada externa ganham volume.

## Não testado em jogo
Não há instância do Minecraft neste PC. Conferir na primeira abertura: orientação dos modelos 3D (frente/trás,
lado da franja), troca para a versão baixa ao vestir chapéu, e o visual com 3D Skin Layers.
Corpos/zumbis do jogador (`CorpseRenderer`, `TurnedPlayerRenderer`) ainda mostram só a base 2D.
