# Parkour (ParCool) liberado por skills + skills com peso real

## ParCool
- Versão **3.4.3.3** (Modrinth, `ParCool-1.20.1-3.4.3.3.jar`, sha1 `55f8b8a9fd9e23cd0dccff56461a8ae88464caed`), lado **both**
  (o servidor precisa dele para a API de limitação). A 4.x não serve: exige Shoulder Surfing 5, e o `tp_shooting`
  (terceira pessoa do TaCZ) exige Shoulder Surfing 4.
- Livro de tutorial desligado: `kubejs/data/parcool/advancements/grant_parcool_guide.json` (critério impossível),
  `kubejs/data/parcool/loot_tables/grant_parcool_guide.json` (vazio) e a receita removida em `zc_skill_weight.js`.
- Todo movimento começa travado (API `com.alrex.parcool.api.unstable.Limitation`, id `zomboidcraft:skills`):

| Requisito | Movimentos |
|---|---|
| Agilidade 1 | pular mureta |
| Agilidade 2 | agarrar na borda, subir, pendurar em barras |
| Pés ágeis | corrida rápida, deslizar |
| Rolamento | rolamento na queda |
| Escalador | salto na parede, escalar postes, descer deslizando na parede |
| Esquiva | esquiva |
| Parkour | correr na parede (vertical e lateral), salto longo, salto carregado, salto acrobático, mergulho, queda controlada |
| Nadador (Condicionamento) | nado rápido |
| sempre | tirolesa · nunca: rastejar do ParCool (o zc_player tem o dele) e esconder em bloco |

Quando libera algo, o jogador recebe "Novo movimento de parkour: ...".

## Peso das skills (`startup_scripts/zc_skill_weight.js` + `server_scripts/zc_skill_weight.js`)
- **Força**: mineração −15%/−10%/−5% nos níveis 0/1/2, +2%/nível a partir do 4; dano corpo a corpo −10% no 0.
- **Skill da arma na mão** (lâmina curta/longa, contundente curto/longo): dano −20% no 0, −13% no 1, −7% no 2.
- **Carpintaria / Mecânica / Elétrica**: madeira / metal / máquinas quebram −10% no nível 0 até +25% no 10.
  Elétrica: −4% de dano de choque e raio por nível.
- **Mira (TaCZ)**: dispersão ×1,6 no 0, ×1,4, ×1,25, ×1,1, normal no 4, −3%/nível depois (×0,82 no 10);
  mira (ADS) 35% mais lenta no 0. Respiração controlada e Atirador de elite: −15% de dispersão cada (elite mira 10% mais rápido).
  O TaCZ recalcula ao sacar a arma.
- **Condicionamento**: estamina do parkour 60% no 0, 100% no 5, 140% no 10 (Maratonista +25%); recuperação 70%–130%;
  com nível 0–2 correr dá cansaço (zc_survival).
- **Culinária**: +0,25 de saciedade por nível em comida preparada. **Agricultura**: +3%/nível de colheita extra.
  **Coleta**: +0,1 de sorte por nível. **Catador**: sucata extra dos sacos de lixo.
- Textos da tela de skills atualizados em `kubejs/assets/zc_skills/lang/*.json` (sobrepõe o jar).

## Testado no jogo (instância local)
Bloqueio/liberação do parkour por nível e perk, aviso no chat, estamina (Condicionamento 2 → 1520 de 2000),
dispersão da AK-47 (base 4,5 → 7,2 com Mira 0, 3,69 com Mira 10), livro do ParCool não entregue, sem erros nos scripts.
Não testado: sensação de jogo dos movimentos, Culinária/Agricultura/Catador na prática.

## Sinais que continuam parados (precisariam de código nos mods)
Técnico de gerador, Alta tensão (rede da cidade), Conservas (validade), Esterilização (infecção), Médico de campo
(cirurgia), Execução silenciosa (abate sem ruído), Carregador rápido / Bancada de recarga / Recarga em movimento (TaCZ),
Mestre de obras (barricadas).
