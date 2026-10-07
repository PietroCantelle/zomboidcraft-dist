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

## 5. Chave B, skins de NPC e Alex's Mobs
- `kubejs/data/zc_bosses/loot_tables/bosses/escafandro.json`: o Escafandro larga a chave B junto com a A. Cada esquadrão que vence sai com o par; o cofre da torre continua dando outra chave B e o Protocolo Silêncio. Texto de "O Escafandro" ajustado.
- `kubejs/server_scripts/zc_npc_skins.js`: o zc_story sorteia nome e skin de NPC genérico separadamente (`NpcDefs.generic`). O script troca a skin quando o gênero não bate com o nome. Na fonte do zc_story o certo é sortear a skin a partir do gênero do nome.
- `kubejs/assets/zc_story/textures/entity/survivor/guard_f1..3.png`: guardas mulheres (Sandra, Keila, Cláudia, Priscila não tinham skin feminina). Copiar para a fonte do zc_story.
- `config/alexsmobs.toml`: spawn 0 para 29 bichos fantasiosos. `kubejs/server_scripts/zc_no_fantasy_mobs.js` remove os que já existem no mundo.
