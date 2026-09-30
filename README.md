# zomboidcraft-dist

Arquivos de distribuição do modpack **ZomboidCraft** (lidos pelo ZomboidCraft Launcher). Não edite à mão, exceto `news.json`.

- `zomboidcraft-manifest.json` — versão do pack + lista de arquivos (caminho, tamanho, sha1, URLs). Gerado por `launcher/tools/publish-update.ps1`.
- `files/` — arquivos próprios do pack (mods `zc_*.jar`, resource pack `zc_zombies.zip`, `config/`, `kubejs/`). Mods de terceiros vêm direto do CDN do CurseForge.
- `news.json` — mural de notícias do launcher: lista de `{ "title", "date", "body", "tag": "ATUALIZAÇÃO|AVISO|EVENTO", "style": "note|radio", "url": "https://..." }`.
- Releases — instaladores do launcher (`ZomboidCraft-Setup-<versão>.exe` + `latest.yml`, usados pela atualização automática).
