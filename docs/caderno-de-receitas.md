# Caderno de Sobrevivência e anotações de receitas

Receita no survival não aparece mais no inventário: o EMI só fica ligado no criativo
(`client_scripts/zc_emi_gamemode.js`) e o livro verde do vanilla foi removido (`startup_scripts/zc_no_recipe_book.js`).

## Como funciona no jogo
- Todo sobrevivente começa com o **Livro de sobrevivência** (`kubejs:survival_journal`), um livro do Patchouli com cara de
  caderno usado (papel amarelado, mancha de caneca, bordas sujas). Clique direito abre.
- **Anotações amassadas** (`kubejs:recipe_note`) aparecem em baús (casas, lojas, escolas, escritórios, hospital, polícia,
  militar, story: 22% + 6%; outros baús: 7%). Na primeira olhada a anotação "decide" uma receita (prefere uma que o jogador
  ainda não tem).
- Clique direito na anotação: a receita vai para o caderno (a anotação é gasta) e o caderno abre na página dela, com a grade
  da bancada/fogueira/fornalha desenhada com os itens de verdade e um rabisco do sobrevivente na página ao lado.
- Anotação repetida (receita já guardada) não some: fica com o nome da receita para trocar com outros jogadores, ou copiar
  na bancada: anotação + papel + tinta preta (ou bolsa de tinta / carvão vegetal) = 2 anotações.
- As páginas ficam trancadas por conquistas invisíveis `zc_recipes:learned/<item>` (sem aviso no chat). Categorias e
  páginas são `secret`: o que não foi descoberto nem aparece (nada de cadeado). Sem barra de progresso (ela invadia a lombada).
- A textura só tem sujeira nas bordas e uma marca de caneca no canto de baixo da página direita, onde o Patchouli não
  desenha nada (antes as manchas ficavam embaixo das grades e dos botões).

## Arquivos
- `kubejs/startup_scripts/zc_recipe_notes.js` - itens.
- `kubejs/server_scripts/zc_recipe_notes.js` - usar anotação, livro inicial, cópia, loot.
- `kubejs/server_scripts/zc_recipe_notes_list.js` - **gerado**.
- `kubejs/assets/zc_hair/patchouli_books/caderno/en_us/...` - categorias e páginas, **geradas** (texto = chaves de lang).
- `kubejs/data/zc_recipes/advancements/learned/*.json` - **geradas**.
- `kubejs/assets/zc_recipes/lang/*.json` - textos (nomes, categorias, rabiscos por categoria).
- `kubejs/assets/zc_recipes/textures/gui/caderno*.png` - textura de livro usado (`docs/tools/age_book.js`).
- `book.json` vai **dentro do `zc_hair.jar`** (`data/zc_hair/patchouli_books/caderno/book.json`): o Patchouli só acha
  livros dentro de jar de mod, na pasta do id do próprio mod. Por isso o livro se chama `zc_hair:caderno`.

## Mudar a lista de receitas
Editar `LIST` em `docs/tools/gen_recipe_book.js` e rodar:
`node docs/tools/gen_recipe_book.js <pasta com os jars dos mods> files/mods <pasta com o 1.20.1.jar>`
(com `ZC_HAIR` apontando para o projeto do zc_hair se não estiver em `..\zc_hair`), depois recompilar o `zc_hair`.
O servidor confere no log: `[ZC] recipe notes: 56/56 recipes usable` (lista as que sumirem).

## Testado em jogo (instância local, Forge 47.4.23, mods do manifest + arquivos do repo)
56/56 receitas válidas; anotação guarda e abre a página certa; anotação repetida fica na mão; caderno abre;
inventário sem livro verde; cabelo 3D renderiza e troca para a versão baixa com boné.
