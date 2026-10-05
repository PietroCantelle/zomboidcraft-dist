# ZomboidCraft

**ZomboidCraft** is a private, non-commercial zombie-survival modpack for **Minecraft: Java Edition** (Forge 1.20.1), inspired by Project Zomboid. It is played by a small group of friends on one private server.

This repository hosts the **distribution files** of the modpack, which our launcher and installer download:

| File | What it is |
|---|---|
| `zomboidcraft-manifest.json` | Pack version and the list of files (path, size, SHA-1, download URLs). |
| `files/` | Our own pack files: our mods (`zc_*.jar`), configs, scripts. Third-party mods are **not** hosted here; they are downloaded from their official source (CurseForge CDN). |
| `news.json` | News shown inside the launcher. |

## ZomboidCraft Launcher

The **ZomboidCraft Launcher** is a small Windows desktop app for the members of our group. It:

1. **Signs the player in with their own Microsoft account** (Microsoft → Xbox Live → XSTS → Minecraft services `login_with_xbox`) to obtain their Minecraft profile and access token. **Every player must own Minecraft: Java Edition.** There is no offline/cracked mode.
2. Downloads and verifies the modpack files listed in `zomboidcraft-manifest.json` (only files that changed).
3. Installs Java 17 and Minecraft Forge 1.20.1 if needed, and starts the game.

**Privacy:** the Microsoft/Minecraft tokens are stored **only on the player's own PC**, encrypted with Windows DPAPI. The launcher does not send account data to any server other than Microsoft's and Mojang's official endpoints. It has no ads, no telemetry and no payments.

Azure application: **ZomboidCraft Launcher** — client ID `1ac6ecad-5f3c-46b4-ab1c-dd5f2d9d2cbb` (public client, scopes `XboxLive.signin` and `offline_access`).

Minecraft is a trademark of Mojang Studios / Microsoft. ZomboidCraft is a fan project and is not affiliated with or endorsed by Mojang or Microsoft.

---

## Português

**ZomboidCraft** é um modpack privado e sem fins lucrativos de sobrevivência zumbi para **Minecraft: Java Edition** (Forge 1.20.1), inspirado em Project Zomboid, jogado por um grupo pequeno de amigos num servidor privado.

Este repositório guarda os **arquivos de distribuição** do pack, baixados pelo nosso launcher e pelo instalador: o manifesto (versão + lista de arquivos com hash), os nossos próprios mods e configs (`files/`) e as notícias do launcher (`news.json`). Mods de terceiros não ficam aqui: são baixados direto da fonte oficial (CurseForge).

O **ZomboidCraft Launcher** faz login com a **conta Microsoft do próprio jogador** (é preciso ter o Minecraft: Java Edition original), baixa só os arquivos do pack que mudaram, instala Java e Forge e abre o jogo. Os tokens ficam só no PC do jogador, criptografados. Sem anúncios, sem telemetria, sem pagamentos.

Minecraft é marca registrada da Mojang Studios / Microsoft. O ZomboidCraft é um projeto de fã, sem vínculo com a Mojang ou a Microsoft.
