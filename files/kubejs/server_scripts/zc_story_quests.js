// GERADO por pack/tools/gen_quests.py - não edite à mão.
// ZomboidCraft 0.3.0 - ponte história -> FTB Quests.
// A história (zc_story, zc_bosses, zc_world) deixa TAGS no jogador; as tarefas "custom" das missões são completadas
// aqui (addProgress da integração KubeJS do FTB XMod Compat) quando o jogador tem QUALQUER tag da lista da tarefa.
// A cada 2 s, para cada jogador online:
//   - local: ZcLocations.at(nível, pos) do zc_world -> tag zc_quests_visited_<local>;
//   - inventário: itens-chave do zc_story -> tag zc_quests_had_<item> (fica mesmo depois de usar o item);
//   - bosses: zc_boss_<id>_defeated vale só para quem tem a tag (zc_bosses 0.3.4: vitória por jogador, esquadrões);
//     nada é lembrado no mundo (as marcas zcq_zc_boss_* antigas do persistentData são ignoradas);
//   - tarefas: as que casam e ainda não estão completas recebem addProgress(id, 1) (max = 1).
// Comandos (op): /zcquests selftest | /zcquests poll | /zcquests check (o próprio jogador) | /zcquests tags.

const ZCQ_HOOKS = [ // [task id, quest key, [any of these tags], optional task?]
  ["3E0A0D64F33063BB", "janela", ["zc_player_corpse_searched"], true],
  ["18A398AED45135F9", "m02", ["zc_story_heard_livre", "zc_story_radio_livre_found", "zc_story_heard_livre_d4"]],
  ["065D91FBF915CDCA", "m03_colegio", ["zc_quests_visited_safezone_colegio"]],
  ["313ECD692140B1B2", "m03_colegio", ["zc_story_m03_tiao", "zc_story_met_tiao"]],
  ["33178383E0B82BB3", "m03_colegio", ["zc_note_note_cida_mural"], true],
  ["7E9D14BF914975BD", "m03", ["zc_story_m03_cida", "zc_story_met_cida"]],
  ["29AD18C0D2B0A103", "m04", ["zc_story_met_joana_done", "zc_story_m04_met", "zc_story_met_joana"]],
  ["6B60B5BD279B70BE", "m04", ["zc_story_m04_done"]],
  ["537AAAB4096593AC", "m04_torre", ["zc_note_mapa_anotado"]],
  ["2688A66C89CB7657", "m07_arauto", ["zc_quests_visited_galeria"]],
  ["69FDDB5318AD8415", "m07_arauto", ["zc_boss_arauto_defeated"]],
  ["66BB645A22B7D95C", "m07_arauto", ["zc_note_tape_cftv_fila"], true],
  ["4C2F5DE979380F88", "m08_ute", ["zc_quests_visited_ute"]],
  ["6FE543350ADF9DD0", "m08_ute", ["zc_note_note_dente_manual"], true],
  ["252ABF53D5C6BC5E", "m08_ute", ["zc_note_note_bigode_ledger"], true],
  ["04C45F79144F9863", "m10", ["zc_quests_had_disjuntor_52_3", "zc_story_disjuntor_installed", "zc_story_grid_restored"]],
  ["4A4D65F05483E3D8", "m10", ["zc_quests_had_fusivel_industrial", "zc_story_ute_ready", "zc_story_grid_restored"]],
  ["6BB9FF8991FEA31C", "m09_dente", ["zc_boss_dente_defeated"]],
  ["604992A133D4AA98", "m09a", ["zc_story_dente_killed", "zc_dente_killed"]],
  ["25B4D6380BCB205D", "m09b", ["zc_story_dente_spared", "zc_story_dente_ally", "zc_dente_spared"]],
  ["3665120B9DD65A13", "m09b", ["zc_story_dente_taught", "zc_story_met_dente_done"], true],
  ["147949D985788FB9", "m11", ["zc_story_ute_ready", "zc_story_grid_restored"]],
  ["149B8FEDFB37CE88", "m11", ["zc_quests_visited_subestacao"]],
  ["5A5CB89057B8EB25", "m11", ["zc_story_disjuntor_installed", "zc_story_grid_restored"]],
  ["6A84CB57B9E8C5E7", "m11", ["zc_story_grid_restored"]],
  ["0E36F5670F470AC6", "m12_rede", ["zc_story_m12_cida"]],
  ["4056CEC2E4E19A6E", "m12_rede", ["zc_story_heard_livre_lights"], true],
  ["21EBE5C8CD10DDA8", "m13_eta", ["zc_quests_visited_eta"]],
  ["2855E8648B9B0913", "m13_eta", ["zc_story_water_restored"]],
  ["78455D2618DA7B81", "m13_eta", ["zc_story_m13_cida"]],
  ["7012D937D9E5A7FC", "m14_escudo", ["zc_boss_escudo_defeated"]],
  ["29129478F01F4614", "m14_escudo", ["zc_story_door_chave_arsenal_opened", "zc_quests_had_chave_arsenal"]],
  ["185D332E24E9F28C", "m14_escudo", ["zc_note_note_brandao"], true],
  ["35BB013ECEC719D4", "m14_escudo", ["zc_quests_had_radio_militar"], true],
  ["55D488964B1557C4", "m15_guara", ["zc_quests_visited_base_cerco"]],
  ["61DF814E1BA06B89", "m15_guara", ["zc_note_note_triagem_folheto"], true],
  ["4942BFF311E4A08C", "m15_guara", ["zc_note_manual_vbtp"], true],
  ["48662E6DED9A59B5", "m16_pendrive", ["zc_quests_visited_campus_veridia"]],
  ["4C0F792FC8292A8A", "m16_pendrive", ["zc_note_pendrive_rafael", "zc_note_note_rafael_planta"]],
  ["781589E2436A3CA0", "m16_pendrive", ["zc_note_note_helena_garagem"], true],
  ["061653228A415CB0", "m17_inchado", ["zc_quests_visited_hospital"]],
  ["7A0B118862B77966", "m17_inchado", ["zc_boss_inchado_defeated"]],
  ["15E7E12743D21EF4", "m17_inchado", ["zc_quests_had_chave_tunel_servico", "zc_story_door_chave_tunel_servico_opened", "zc_quests_visited_tunel_servico", "zc_quests_visited_unidade4"]],
  ["69C2243AB32D5B48", "m17_inchado", ["zc_note_note_p114"], true],
  ["56A81E89DEA7AF53", "m18", ["zc_story_door_chave_tunel_servico_opened", "zc_quests_visited_tunel_servico", "zc_quests_visited_unidade4"]],
  ["16CAFDBEA3107A8F", "m18", ["zc_note_tape_caio_8"], true],
  ["3FC137814CE1ABC5", "m18_b1", ["zc_quests_visited_unidade4"]],
  ["77632EDDB4DA5302", "m18_b1", ["zc_story_lab_1_access", "zc_story_frag_1_downloaded"]],
  ["7CCA2E56657E9564", "m18_b1", ["zc_story_frag_1_downloaded", "zc_story_fragment_1_found"]],
  ["33BCF4E3651ACD37", "m18_b1", ["zc_note_tape_caio_4"], true],
  ["12737CE7AC924FD5", "m19", ["zc_boss_major_defeated"]],
  ["2606729031B21DC9", "m19", ["zc_quests_had_cartao_lidia", "zc_story_keys_turned"]],
  ["07C63A956CFD02A0", "m19", ["zc_story_frag_2_downloaded", "zc_story_fragment_2_found"]],
  ["0DE623F035248E24", "m19", ["zc_note_note_l8"], true],
  ["7409B0FBC792A4FD", "m20", ["zc_boss_paciente_zero_defeated"]],
  ["20834D2BD7BFED84", "m20", ["zc_story_frag_3_downloaded", "zc_story_fragment_3_found"]],
  ["4A4DB79C074F9ABC", "m20", ["zc_story_formula_found", "zc_story_helena_recipe"]],
  ["1D920478FB9DD27E", "m20", ["zc_story_intercom_used"], true],
  ["78BAD7BC4578F748", "m21", ["zc_note_formula_rimidax", "zc_story_formula_read"]],
  ["2A17AAB8C15A2F15", "m22_coronel", ["zc_story_met_coronel", "zc_story_coronel_contact"]],
  ["586B14657CB863A6", "m22_coronel", ["zc_story_m22_joana"]],
  ["3898A6C7DF401241", "m22_coronel", ["zc_story_m22_silencio"], true],
  ["0C0898EC002FD749", "m22_transmissao", ["zc_story_formula_broadcast"]],
  ["5820E3135070E3B7", "m23", ["zc_quests_visited_portao1"]],
  ["5EFA815BF4374B2F", "m23", ["zc_boss_escafandro_defeated"]],
  ["306CF89520C2085A", "m23", ["zc_quests_had_chave_portao_a", "zc_story_keys_turned"]],
  ["6415C2F79D795AB4", "m23", ["zc_quests_had_chave_portao_b", "zc_story_keys_turned", "zc_story_cofre_open"]],
  ["16A9C2C74F34AB54", "m23", ["zc_note_diario_tavares"], true],
  ["1BF4B47FF48490C6", "m24_chaves", ["zc_story_keys_turned"]],
  ["20E9F6C1C32642CE", "m24_codigo", ["zc_story_code_accepted", "zc_story_siege_started"]],
  ["310D01C0EE6585DF", "m24_noite1", ["zc_story_siege_night_1", "zc_story_siege_night_2", "zc_story_siege_night_3", "zc_story_gate_open"]],
  ["64C59E9E0155BCE0", "m24_noite2", ["zc_story_siege_night_2", "zc_story_siege_night_3", "zc_story_gate_open"]],
  ["37324DCDD3B81607", "m24_noite3", ["zc_story_siege_night_3", "zc_story_gate_open"]],
  ["3421E83C3B027771", "m24", ["zc_story_gate_open", "zc_story_ended"]],
  ["51D9D0377817DB1F", "fin_voto", ["zc_story_voted", "zc_story_ended"]],
  ["4BB37682A5F7C4C3", "fin_transmissao", ["zc_story_ending_transmissao"]],
  ["154105C6BC6403EC", "fin_entrega", ["zc_story_ending_entrega"]],
  ["526B202D6EA06FED", "fin_os_poucos", ["zc_story_ending_os_poucos"]],
  ["43B17F82C2293EEE", "fin_os_poucos", ["zc_story_escaped"], true],
  ["60E07904A543BA88", "fin_silencio", ["zc_story_ending_silencio"]],
  ["5973AA7CC396F96C", "fin_silencio", ["zc_story_silencio_warning"], true],
  ["422E22494E3C9786", "fin_fim", ["zc_story_ended"]],
  ["40D1EAEA2440196E", "r07", ["zc_story_met_neide"]],
  ["41155B977A5AC281", "sz_colegio_trabalho", ["zc_story_job_r01_agua_done", "zc_story_job_r02_colheita_done", "zc_story_job_r03_lenha_done", "zc_story_job_r06_remedios_done", "zc_story_job_r05_ronda_done", "zc_story_job_r12_limpeza_done"]],
  ["377B9ABD282EB1C1", "sz_colegio_trabalho", ["zc_story_traded_colegio"], true],
  ["218BF3E26269C24F", "sz_colegio_conhecido", ["zc_story_rep_colegio_conhecido"]],
  ["4C256BDD9969C210", "sz_colegio_confiavel", ["zc_story_rep_colegio_confiavel"]],
  ["06ECE60913F1484B", "sz_colegio_familia", ["zc_story_rep_colegio_familia"]],
  ["5F694F8F0F146774", "sz_colegio_defesa", ["zc_story_defended_colegio", "zc_story_defended_galpao", "zc_story_defended_matriz"]],
  ["7AAF2584B908E1F0", "sz_galpao", ["zc_quests_visited_safezone_galpao"]],
  ["0A399C3FC867FB1C", "sz_galpao", ["zc_story_met_bigode_done", "zc_story_met_bigode"]],
  ["325620ABB36144F9", "sz_galpao", ["zc_story_traded_galpao"]],
  ["3580BDA948F38902", "sz_galpao_trabalho", ["zc_story_job_r08_encomenda_done", "zc_story_job_r08b_eletronicos_done", "zc_story_job_r11_combustivel_done", "zc_story_job_r13_carga_done"]],
  ["1E03702A477D4174", "sz_galpao_conhecido", ["zc_story_rep_galpao_conhecido"]],
  ["5C8F3EB90644BECB", "sz_galpao_confiavel", ["zc_story_rep_galpao_confiavel"]],
  ["7AA0BE3B6E74F8FA", "sz_matriz_troca", ["zc_story_traded_matriz"]],
  ["2CD19C4099EE2E8F", "sz_matriz_troca", ["zc_story_job_r09_revezamento_done", "zc_story_job_r10_rua_morta_done", "zc_story_job_r14_pilhas_done"]],
  ["44B5070DF2636AD2", "sz_matriz_conhecido", ["zc_story_rep_matriz_conhecido"]],
  ["355502F9D270328E", "sz_matriz_confiavel", ["zc_story_rep_matriz_confiavel"]],
  ["65B07E824860C714", "s15", ["zc_note_note_triagem_lote"], true],
  ["081C719615F71072", "s01", ["zc_story_cida_library"]],
  ["3576A2990FF06431", "s02", ["zc_note_note_pena"]],
  ["06D83E259435FBB0", "s02", ["zc_story_met_neide"]],
  ["1E9065436F10934A", "s05", ["zc_note_grafite_rodoviaria"]],
  ["19424DC54A67875D", "s05", ["zc_story_met_civilian"]],
  ["5EBCF962AFE8494D", "s06", ["zc_note_note_bo_2217"]],
  ["058151872A826DBE", "s06", ["zc_note_note_fridge"]],
  ["317EF4BEF727AE62", "s07", ["zc_note_note_bigode_ledger"]],
  ["0E7161B996A35742", "s07", ["zc_story_s07_silence", "zc_story_s07_exposed", "zc_story_bigode_exposed", "zc_story_dente_ally", "zc_story_m09b_done"]],
  ["68F024990D3A239D", "s08", ["zc_note_note_irma_graca"]],
  ["65685DB03A5EDE9C", "s08", ["zc_note_note_p114"]],
  ["3B7EEE990448A39C", "s10", ["zc_quests_visited_presidio"]],
  ["24D31AFBEBA1F4BF", "s10", ["zc_note_note_corvo_2"]],
  ["4B2549E45D403F63", "s11", ["zc_note_foto_casamento"]],
  ["30A95BFCE1858154", "s11", ["zc_story_lab_3_access"], true],
  ["7EEEBE75051B0D3E", "s12", ["zc_note_tape_caio_6"]],
  ["0942CF1E9CF94C75", "s12", ["zc_note_tape_caio_7"]],
  ["02A09B34CA6708EE", "s13", ["zc_note_note_debora"]],
  ["1D22A08C4C7328B9", "s13", ["zc_note_note_zulmira_2"]],
  ["31B9D7B76A4A52C5", "s14", ["zc_story_heard_numeros"]],
  ["0AD337FE9F2821B9", "s14", ["zc_note_radio_numeros"]],
  ["5B2C5CA93918512D", "note_fridge", ["zc_note_note_fridge"]],
  ["167AF4643688DB08", "note_zulmira_1", ["zc_note_note_zulmira_1"]],
  ["314C21D73FC014CA", "note_zulmira_2", ["zc_note_note_zulmira_2"]],
  ["63DDFD00AC159109", "note_debora", ["zc_note_note_debora"]],
  ["4FFA8030906E8D17", "note_bo_2217", ["zc_note_note_bo_2217"]],
  ["2A27A085367A6B7A", "note_poster_meningite", ["zc_note_note_poster_meningite"]],
  ["1100FF4BFE664223", "note_triagem_folheto", ["zc_note_note_triagem_folheto"]],
  ["4847AE42A264A539", "tape_caio_1", ["zc_note_tape_caio_1"]],
  ["1F2D0E5B97409275", "tape_caio_2", ["zc_note_tape_caio_2"]],
  ["5F70430835FC2EB1", "tape_caio_3", ["zc_note_tape_caio_3"]],
  ["175824E409624F6F", "tape_caio_4", ["zc_note_tape_caio_4"]],
  ["62A94F24462C001A", "tape_caio_5", ["zc_note_tape_caio_5"]],
  ["3EB511B483D81996", "tape_caio_6", ["zc_note_tape_caio_6"]],
  ["2473EC914D13BFA2", "tape_caio_7", ["zc_note_tape_caio_7"]],
  ["52C41EA75FC15BFE", "tape_caio_8", ["zc_note_tape_caio_8"]],
  ["7BDC47F7C8D88E7C", "tape_caio_9", ["zc_note_tape_caio_9"]],
  ["7E6C7954ACCCA6A4", "tape_caio_10", ["zc_note_tape_caio_10"]],
  ["4E52E0E1BA95BD75", "note_brandao", ["zc_note_note_brandao"]],
  ["5C90A2FA173ACD54", "tape_lidia_1", ["zc_note_tape_lidia_1"]],
  ["68427BAA0F548A73", "note_lidia", ["zc_note_note_lidia"]],
  ["601CDA1F94D375A5", "note_pena", ["zc_note_note_pena"]],
  ["2222B57C056C5703", "note_bigode_ledger", ["zc_note_note_bigode_ledger"]],
  ["3BCF953291ABD561", "note_prado", ["zc_note_note_prado"]],
  ["03B14D8B83688BD3", "note_silencio", ["zc_note_note_silencio"]],
  ["3AEC9A1A6AE48422", "note_rafael_planta", ["zc_note_note_rafael_planta"]],
  ["12A50713FCDCA3E0", "note_helena_garagem", ["zc_note_note_helena_garagem"]],
  ["3FF8F3DEF95E47D1", "radio_numeros", ["zc_note_radio_numeros"]],
  ["331CC12C1C403F2B", "grafite_rodoviaria", ["zc_note_grafite_rodoviaria"]],
  ["45A8CCFC0B1521FD", "note_p114", ["zc_note_note_p114"]],
  ["3CE18C9FC54BBE61", "note_irma_graca", ["zc_note_note_irma_graca"]],
  ["1D1AD015E8209CD3", "note_lista", ["zc_note_note_lista"]],
  ["452322C1B2142F22", "note_cedula", ["zc_note_note_cedula"]],
  ["3BFE78E48B897CB3", "note_dente_manual", ["zc_note_note_dente_manual"]],
  ["4BC39779AE7E9892", "note_cida_mural", ["zc_note_note_cida_mural"]],
  ["681BBC1B48B60F1D", "note_torre", ["zc_note_note_torre"]],
  ["01D2FAB9BCD823C6", "note_helena_final", ["zc_note_note_helena_final"]],
  ["7651891A6A445429", "radio_joana_21", ["zc_note_radio_joana_21"]],
  ["508F3408A6C00035", "note_corvo_2", ["zc_note_note_corvo_2"]],
  ["76612DAFA8B267D7", "note_l8", ["zc_note_note_l8"]],
]
const ZCQ_QUESTS = [ // [quest id, key, [dependency ids], 'all'|'one', optional quest?]
  ["0B35663FB4B1087A", "lembrar", [], "all", false],
  ["1B72477A19EBE0FF", "ntp_pedra", ["0B35663FB4B1087A"], "all", false],
  ["36041C4F2AD3CFF0", "ntp_lasca", ["1B72477A19EBE0FF"], "all", false],
  ["2AFE46F2E9B5E268", "ntp_faca", ["36041C4F2AD3CFF0"], "all", false],
  ["0AD458CFE4198318", "ntp_fibra", ["2AFE46F2E9B5E268"], "all", false],
  ["7D6A3E2213C4A524", "ntp_gravetos", ["0AD458CFE4198318"], "all", false],
  ["4DED20677FF9DBF6", "ntp_machado", ["7D6A3E2213C4A524"], "all", false],
  ["28B49AA33B789149", "ntp_toras", ["4DED20677FF9DBF6"], "all", false],
  ["6E1F04D8556CD7B4", "ntp_tabuas", ["28B49AA33B789149"], "all", false],
  ["28F3C8C1757E3254", "ntp_bancada", ["6E1F04D8556CD7B4"], "all", false],
  ["12DB359C77C6ADB6", "ntp_acendedor", ["28F3C8C1757E3254"], "all", false],
  ["6BF299D8A142F308", "ntp_fogueira", ["12DB359C77C6ADB6"], "all", false],
  ["4DE9EEBA3667A845", "sede", ["0B35663FB4B1087A"], "all", false],
  ["08A5F8CA9B8866CF", "ferver", ["4DE9EEBA3667A845"], "all", false],
  ["3CF0FFC55BD76EFB", "latas", ["0B35663FB4B1087A"], "all", false],
  ["6C71BA1E71C09E9F", "temperatura", ["08A5F8CA9B8866CF"], "all", false],
  ["0F8C1C38F0D4808D", "roupas", ["3CF0FFC55BD76EFB"], "all", false],
  ["56F5C4BAF649E87A", "costura", ["0F8C1C38F0D4808D"], "all", false],
  ["2A0E1C87E69C2915", "mochila", ["56F5C4BAF649E87A"], "all", false],
  ["4ADD9D7A514F3471", "pochete", ["2A0E1C87E69C2915"], "all", false],
  ["2B0049BFD44569DE", "curativos", ["0F8C1C38F0D4808D"], "all", false],
  ["3FD95D7CA6A0651A", "ferimentos", ["2B0049BFD44569DE"], "all", false],
  ["337BF1AEEFC5432C", "knox", ["3FD95D7CA6A0651A"], "all", false],
  ["498745CEE37C4EAA", "janela", ["337BF1AEEFC5432C"], "all", false],
  ["45577CCED3C69D92", "habilidades", ["3FD95D7CA6A0651A"], "all", false],
  ["287AC4008176B886", "rastejar", ["45577CCED3C69D92"], "all", false],
  ["0356B17C04CE392C", "atlas", ["3CF0FFC55BD76EFB"], "all", false],
  ["23FD6584127878D6", "voz", ["0356B17C04CE392C"], "all", false],
  ["7982E7275FBC77D8", "primeiro", ["0B35663FB4B1087A"], "all", false],
  ["10C415C71BE96AEF", "m01", ["4DE9EEBA3667A845", "7982E7275FBC77D8"], "all", false],
  ["182D3B889390841A", "m02", ["10C415C71BE96AEF", "23FD6584127878D6"], "all", false],
  ["5755773C2812E88D", "m03_colegio", ["182D3B889390841A"], "all", false],
  ["2F5928A6CC48A2FB", "m03", ["5755773C2812E88D"], "all", false],
  ["46CFA91DF41CA224", "m04", ["2F5928A6CC48A2FB"], "all", false],
  ["590E3D690731F9C8", "m04_torre", ["46CFA91DF41CA224"], "all", false],
  ["4728AEAACAC9E3B7", "m05", ["2F5928A6CC48A2FB"], "all", false],
  ["6E121DE44D61FE4E", "m06", ["4728AEAACAC9E3B7"], "all", false],
  ["057ECA1AB47B10EE", "m07", ["46CFA91DF41CA224"], "all", false],
  ["69DDA5E6275BA04E", "m07_arauto", ["057ECA1AB47B10EE"], "all", false],
  ["5A3ADF3FD43853AE", "m08", ["69DDA5E6275BA04E"], "all", false],
  ["46532C9EBDEEDD45", "m08_ute", ["5A3ADF3FD43853AE"], "all", false],
  ["29A7509C57BEC8D4", "m10", ["46532C9EBDEEDD45"], "all", false],
  ["53317F5316D7CB51", "m09_dente", ["46532C9EBDEEDD45"], "all", false],
  ["0FF7982D3CB5255E", "m09a", ["53317F5316D7CB51"], "all", true],
  ["196ED0FED80412A1", "m09b", ["53317F5316D7CB51"], "all", true],
  ["737EDB245F2A7E39", "m11", ["29A7509C57BEC8D4", "53317F5316D7CB51"], "all", false],
  ["751A2E985FDDD2F1", "m12", ["737EDB245F2A7E39"], "all", false],
  ["6CFF551CC674B3DF", "m12_rede", ["737EDB245F2A7E39"], "all", false],
  ["24D695EA2FDBC08A", "m13", ["751A2E985FDDD2F1"], "all", false],
  ["575AAC5C7195BF52", "m13_eta", ["24D695EA2FDBC08A"], "all", false],
  ["69E789C22DC868F3", "m14", ["751A2E985FDDD2F1"], "all", false],
  ["781649AD2E61E9A0", "m14_escudo", ["69E789C22DC868F3"], "all", false],
  ["67EAE6AFE1F56700", "m15", ["781649AD2E61E9A0"], "all", false],
  ["5C087BB4BE44246A", "m15_guara", ["67EAE6AFE1F56700"], "all", false],
  ["2AA8F751178D9592", "m16", ["575AAC5C7195BF52", "67EAE6AFE1F56700"], "all", false],
  ["700A4BB948C9CC35", "m16_pendrive", ["2AA8F751178D9592"], "all", false],
  ["34829CCC4C633000", "m17", ["2AA8F751178D9592"], "all", false],
  ["1B66F017ABD3BE31", "m17_inchado", ["34829CCC4C633000"], "all", false],
  ["0C4BD8AD40BD1593", "m18", ["1B66F017ABD3BE31"], "all", false],
  ["515C2FDBCB80366C", "m18_b1", ["0C4BD8AD40BD1593"], "all", false],
  ["70F74A858BDB2181", "m19", ["515C2FDBCB80366C"], "all", false],
  ["06A034B0A8F904CA", "m20", ["70F74A858BDB2181"], "all", false],
  ["2FF8DEA8B43B57C4", "m21", ["06A034B0A8F904CA"], "all", false],
  ["09352AB67C1BF92B", "m22", ["2FF8DEA8B43B57C4", "67EAE6AFE1F56700"], "all", false],
  ["2717F8176C95299F", "m22_coronel", ["09352AB67C1BF92B"], "all", false],
  ["65F79ECC9D677376", "m22_transmissao", ["2717F8176C95299F"], "all", true],
  ["755A49A546576576", "m23", ["2717F8176C95299F"], "all", false],
  ["47E3E081D3C7B013", "m24_chaves", ["755A49A546576576"], "all", false],
  ["42ABDEFF3FCC8F9F", "m24_codigo", ["47E3E081D3C7B013"], "all", false],
  ["0D644D8D610584C6", "m24_noite1", ["42ABDEFF3FCC8F9F"], "all", false],
  ["5E4DE1CC865D0F34", "m24_noite2", ["0D644D8D610584C6"], "all", false],
  ["59123D32F8B67BD0", "m24_noite3", ["5E4DE1CC865D0F34"], "all", false],
  ["484C67B32FA9F528", "m24", ["59123D32F8B67BD0"], "all", false],
  ["5B54687436D6495A", "fin_voto", ["484C67B32FA9F528"], "all", false],
  ["5506AEB55F2F3174", "fin_transmissao", ["5B54687436D6495A"], "all", true],
  ["7E4197F08B3C0EC9", "fin_entrega", ["5B54687436D6495A"], "all", true],
  ["2DC104C768867D88", "fin_os_poucos", ["5B54687436D6495A"], "all", true],
  ["06942BDC0AE7CD97", "fin_silencio", ["0B35663FB4B1087A"], "all", true],
  ["0F901F7EA1341237", "fin_fim", ["5B54687436D6495A", "06942BDC0AE7CD97"], "one", false],
  ["5710E3DD28FD36C4", "r01", ["2F5928A6CC48A2FB"], "all", false],
  ["7E7345799EDB047F", "r02", ["6E121DE44D61FE4E"], "all", false],
  ["1C160AE2404532EC", "r03", ["2F5928A6CC48A2FB"], "all", false],
  ["1B1446C395194BA9", "r04", ["24D695EA2FDBC08A"], "all", false],
  ["6C1A7312D8FE602B", "r05", ["2F5928A6CC48A2FB"], "all", false],
  ["27AA2EE65D0A0F1D", "r06", ["2F5928A6CC48A2FB"], "all", false],
  ["6A84D90048712C15", "r08", ["36396B5F2474FE87"], "all", false],
  ["3F9773E67ED9524B", "r09", ["46CFA91DF41CA224"], "all", false],
  ["0FAA433C2F8B03E6", "r10", ["46CFA91DF41CA224"], "all", false],
  ["74CCC52F9E6167EF", "r11", ["751A2E985FDDD2F1"], "all", false],
  ["190391A4D302681F", "r12", ["057ECA1AB47B10EE"], "all", false],
  ["5192A5B0BC94D463", "r07", ["2F5928A6CC48A2FB"], "all", false],
  ["11058138529C45A8", "sz_colegio_trabalho", ["2F5928A6CC48A2FB"], "all", false],
  ["648424B9E7E4BE37", "sz_colegio_conhecido", ["11058138529C45A8"], "all", false],
  ["4A80E6798CB34D16", "sz_colegio_confiavel", ["648424B9E7E4BE37"], "all", true],
  ["049C764C2631DC26", "sz_colegio_familia", ["4A80E6798CB34D16"], "all", true],
  ["214C1AFC1A30EFA6", "sz_colegio_defesa", ["2F5928A6CC48A2FB"], "all", true],
  ["36396B5F2474FE87", "sz_galpao", ["2F5928A6CC48A2FB"], "all", false],
  ["1C77CF04AB68EEF4", "sz_galpao_trabalho", ["36396B5F2474FE87"], "all", false],
  ["1B057FD01462F46C", "sz_galpao_conhecido", ["1C77CF04AB68EEF4"], "all", true],
  ["35AB6B20D9B9EC2F", "sz_galpao_confiavel", ["1B057FD01462F46C"], "all", true],
  ["7A2FF93B2430BDC3", "sz_matriz_troca", ["46CFA91DF41CA224"], "all", false],
  ["174700288494D3C2", "sz_matriz_conhecido", ["7A2FF93B2430BDC3"], "all", false],
  ["2B72BD62B5EA98EE", "sz_matriz_confiavel", ["174700288494D3C2"], "all", true],
  ["499825CA76D33820", "s03", ["182D3B889390841A"], "all", false],
  ["7BADE17E3437523E", "s04", ["182D3B889390841A"], "all", false],
  ["46E5CDAD91799E3C", "s09", ["2F5928A6CC48A2FB"], "all", false],
  ["2EB709D7D65F86F7", "s15", ["46E5CDAD91799E3C"], "all", false],
  ["5DAFF7B7C34F1DA8", "s01", ["2F5928A6CC48A2FB"], "all", false],
  ["2BBD99F5A450492F", "s02", ["46532C9EBDEEDD45"], "all", false],
  ["436FDFA3C3660DDB", "s05", ["46CFA91DF41CA224"], "all", false],
  ["379E73DF3800DE79", "s06", ["69E789C22DC868F3"], "all", false],
  ["6128268768FCEA0C", "s07", ["46532C9EBDEEDD45"], "all", false],
  ["0FE53A7DAFDF7177", "s08", ["34829CCC4C633000"], "all", false],
  ["1F0533432293CDFD", "s10", ["46532C9EBDEEDD45"], "all", false],
  ["5AE32383E058A39F", "s11", ["2AA8F751178D9592"], "all", false],
  ["2E73FEB9536925C2", "s12", ["70F74A858BDB2181"], "all", false],
  ["70F79AC351BFBA52", "s13", ["2F5928A6CC48A2FB"], "all", false],
  ["6C2B0828C84C65A2", "s14", ["46CFA91DF41CA224"], "all", false],
  ["79EE8BF73FDDB800", "note_fridge", ["0B35663FB4B1087A"], "all", true],
  ["4D41D0CEE0C74E54", "note_zulmira_1", ["10C415C71BE96AEF"], "all", true],
  ["7A75F968E22D6DCA", "note_zulmira_2", ["10C415C71BE96AEF"], "all", true],
  ["233D7EB8A557F406", "note_debora", ["182D3B889390841A"], "all", true],
  ["48904F45CB233B92", "note_bo_2217", ["69E789C22DC868F3"], "all", true],
  ["165A93376FDB2796", "note_poster_meningite", ["0B35663FB4B1087A"], "all", true],
  ["5A0439693B587AC1", "note_triagem_folheto", ["46E5CDAD91799E3C"], "all", true],
  ["42D2DC2A1020EAC4", "tape_caio_1", ["34829CCC4C633000"], "all", true],
  ["6E10BA1D4F894A45", "tape_caio_2", ["0C4BD8AD40BD1593"], "all", true],
  ["60FCC81240186325", "tape_caio_3", ["2AA8F751178D9592"], "all", true],
  ["02815ED846FC30B7", "tape_caio_4", ["0C4BD8AD40BD1593"], "all", true],
  ["71EBADB0AF0A0601", "tape_caio_5", ["34829CCC4C633000"], "all", true],
  ["5BBE92EAF70F695B", "tape_caio_6", ["2FF8DEA8B43B57C4"], "all", true],
  ["1CC0E95123D3D025", "tape_caio_7", ["2FF8DEA8B43B57C4"], "all", true],
  ["4F44E3C3022037F7", "tape_caio_8", ["0C4BD8AD40BD1593"], "all", true],
  ["2B38301A31F3284A", "tape_caio_9", ["2FF8DEA8B43B57C4"], "all", true],
  ["70C9627D0A843187", "tape_caio_10", ["09352AB67C1BF92B"], "all", true],
  ["1AA4929FCD265F81", "note_brandao", ["69E789C22DC868F3"], "all", true],
  ["66C05E10B184F858", "tape_lidia_1", ["0C4BD8AD40BD1593"], "all", true],
  ["79151498A5ABC82B", "note_lidia", ["2FF8DEA8B43B57C4"], "all", true],
  ["6FEB804256BBEFD1", "note_pena", ["5A3ADF3FD43853AE"], "all", true],
  ["18F588AE5212B9D9", "note_bigode_ledger", ["5A3ADF3FD43853AE"], "all", true],
  ["0C814DB64C776894", "note_prado", ["09352AB67C1BF92B"], "all", true],
  ["508F1CEC33D780C6", "note_silencio", ["09352AB67C1BF92B"], "all", true],
  ["509E268075FB0D1B", "note_rafael_planta", ["2AA8F751178D9592"], "all", true],
  ["59F45DAF92AB4E52", "note_helena_garagem", ["2AA8F751178D9592"], "all", true],
  ["58EED1E14DD7D480", "radio_numeros", ["34829CCC4C633000"], "all", true],
  ["0B00A0B8E8B65153", "grafite_rodoviaria", ["057ECA1AB47B10EE"], "all", true],
  ["2AF87E2B451FC27F", "note_p114", ["34829CCC4C633000"], "all", true],
  ["19130E1C741E604D", "note_irma_graca", ["34829CCC4C633000"], "all", true],
  ["2ECC6F04DBB1D274", "note_lista", ["0B35663FB4B1087A"], "all", true],
  ["61ACE79AEBE40294", "note_cedula", ["0B35663FB4B1087A"], "all", true],
  ["7F93195CC83C28E4", "note_dente_manual", ["5A3ADF3FD43853AE"], "all", true],
  ["4068A932E529C727", "note_cida_mural", ["2F5928A6CC48A2FB"], "all", true],
  ["7D9B49DA6996128C", "note_torre", ["46E5CDAD91799E3C"], "all", true],
  ["44E450312509AD73", "note_helena_final", ["09352AB67C1BF92B"], "all", true],
  ["456BC3FBBEA4CDF3", "radio_joana_21", ["751A2E985FDDD2F1"], "all", true],
  ["362F5E68023605E6", "note_corvo_2", ["5A3ADF3FD43853AE"], "all", true],
  ["02B493FB91B1437E", "note_l8", ["2FF8DEA8B43B57C4"], "all", true],
]
const ZCQ_LOCATIONS = [
  "base_cerco", "batalhao", "bombeiros", "campus_veridia", "eta", "galeria",
  "hospital", "portao1", "presidio", "safezone_colegio", "safezone_galpao", "safezone_matriz",
  "subestacao", "tunel_servico", "unidade4", "ute",
]
const ZCQ_TRACKED = [
  "disjuntor_52_3", "fusivel_industrial", "cracha_galeria", "megafone_arauto", "chave_arsenal", "plaqueta_brandao",
  "manual_vbtp", "radio_militar", "radio_portatil", "chave_tunel_servico", "cracha_seguranca_hospital", "cartao_acesso_veridia",
  "cartao_lidia", "amostra_primaria", "alianca_rafael", "chave_portao_a", "chave_portao_b", "mapa_anotado",
  "chave_casa_sampaio", "pano_branco", "fragmento_codigo_1", "fragmento_codigo_2", "fragmento_codigo_3", "formula_rimidax",
]
const ZCQ_BOSSES = [
  "arauto", "dente", "escudo", "inchado", "major", "paciente_zero",
  "escafandro",
]
const ZCQ_PRODUCIBLE = [
  "zc_boss_arauto_defeated", "zc_boss_dente_defeated", "zc_boss_escafandro_defeated", "zc_boss_escudo_defeated",
  "zc_boss_inchado_defeated", "zc_boss_major_defeated", "zc_boss_paciente_zero_defeated", "zc_dente_killed",
  "zc_dente_spared", "zc_note_caderno_dente", "zc_note_diario_tavares", "zc_note_fita_tavares",
  "zc_note_formula_rimidax", "zc_note_foto_casamento", "zc_note_grafite_rodoviaria", "zc_note_manual_vbtp",
  "zc_note_mapa_anotado", "zc_note_note_bigode_ledger", "zc_note_note_bo_2217", "zc_note_note_brandao",
  "zc_note_note_cedula", "zc_note_note_cida_mural", "zc_note_note_corvo_2", "zc_note_note_debora",
  "zc_note_note_dente_manual", "zc_note_note_fridge", "zc_note_note_helena_final", "zc_note_note_helena_garagem",
  "zc_note_note_irma_graca", "zc_note_note_l8", "zc_note_note_lembrar", "zc_note_note_lidia",
  "zc_note_note_lista", "zc_note_note_p114", "zc_note_note_pena", "zc_note_note_poster_meningite",
  "zc_note_note_prado", "zc_note_note_rafael_planta", "zc_note_note_silencio", "zc_note_note_torre",
  "zc_note_note_triagem_folheto", "zc_note_note_triagem_lote", "zc_note_note_zulmira_1", "zc_note_note_zulmira_2",
  "zc_note_pendrive_rafael", "zc_note_radio_capacete", "zc_note_radio_joana_21", "zc_note_radio_numeros",
  "zc_note_tape_caio_1", "zc_note_tape_caio_10", "zc_note_tape_caio_2", "zc_note_tape_caio_3",
  "zc_note_tape_caio_4", "zc_note_tape_caio_5", "zc_note_tape_caio_6", "zc_note_tape_caio_7",
  "zc_note_tape_caio_8", "zc_note_tape_caio_9", "zc_note_tape_cftv_fila", "zc_note_tape_lidia_1",
  "zc_player_corpse_buried", "zc_player_corpse_searched", "zc_quests_had_alianca_rafael", "zc_quests_had_amostra_primaria",
  "zc_quests_had_cartao_acesso_veridia", "zc_quests_had_cartao_lidia", "zc_quests_had_chave_arsenal", "zc_quests_had_chave_casa_sampaio",
  "zc_quests_had_chave_portao_a", "zc_quests_had_chave_portao_b", "zc_quests_had_chave_tunel_servico", "zc_quests_had_cracha_galeria",
  "zc_quests_had_cracha_seguranca_hospital", "zc_quests_had_disjuntor_52_3", "zc_quests_had_formula_rimidax", "zc_quests_had_fragmento_codigo_1",
  "zc_quests_had_fragmento_codigo_2", "zc_quests_had_fragmento_codigo_3", "zc_quests_had_fusivel_industrial", "zc_quests_had_manual_vbtp",
  "zc_quests_had_mapa_anotado", "zc_quests_had_megafone_arauto", "zc_quests_had_pano_branco", "zc_quests_had_plaqueta_brandao",
  "zc_quests_had_radio_militar", "zc_quests_had_radio_portatil", "zc_quests_visited_base_cerco", "zc_quests_visited_batalhao",
  "zc_quests_visited_bombeiros", "zc_quests_visited_campus_veridia", "zc_quests_visited_eta", "zc_quests_visited_galeria",
  "zc_quests_visited_hospital", "zc_quests_visited_portao1", "zc_quests_visited_presidio", "zc_quests_visited_safezone_colegio",
  "zc_quests_visited_safezone_galpao", "zc_quests_visited_safezone_matriz", "zc_quests_visited_subestacao", "zc_quests_visited_tunel_servico",
  "zc_quests_visited_unidade4", "zc_quests_visited_ute", "zc_story_act5", "zc_story_bigode_exposed",
  "zc_story_broadcast_helper", "zc_story_cida_library", "zc_story_code_accepted", "zc_story_cofre_open",
  "zc_story_colegio_reached", "zc_story_coronel_contact", "zc_story_coronel_listens", "zc_story_defended_colegio",
  "zc_story_defended_galpao", "zc_story_defended_matriz", "zc_story_dente_ally", "zc_story_dente_killed",
  "zc_story_dente_killed_seen", "zc_story_dente_prisoner", "zc_story_dente_spared", "zc_story_dente_taught",
  "zc_story_disjuntor_installed", "zc_story_door_cartao_acesso_veridia_opened", "zc_story_door_chave_arsenal_opened", "zc_story_door_chave_tunel_servico_opened",
  "zc_story_ended", "zc_story_ending_entrega", "zc_story_ending_os_poucos", "zc_story_ending_seen",
  "zc_story_ending_silencio", "zc_story_ending_transmissao", "zc_story_ending_vote", "zc_story_escaped",
  "zc_story_formula_broadcast", "zc_story_formula_found", "zc_story_formula_read", "zc_story_frag_1",
  "zc_story_frag_1_downloaded", "zc_story_frag_2", "zc_story_frag_2_downloaded", "zc_story_frag_3",
  "zc_story_frag_3_downloaded", "zc_story_fragment_1_found", "zc_story_fragment_2_found", "zc_story_fragment_3_found",
  "zc_story_gate_open", "zc_story_grid_off", "zc_story_grid_restored", "zc_story_heard_cerco",
  "zc_story_heard_cerco_open", "zc_story_heard_cerco_prado", "zc_story_heard_livre", "zc_story_heard_livre_cida",
  "zc_story_heard_livre_d21", "zc_story_heard_livre_d4", "zc_story_heard_livre_lights", "zc_story_heard_livre_numbers",
  "zc_story_heard_livre_open", "zc_story_heard_numeros", "zc_story_heard_sae", "zc_story_helena_recipe",
  "zc_story_intercom_used", "zc_story_intro_seen", "zc_story_joana_down", "zc_story_job_r01_agua_done",
  "zc_story_job_r02_colheita_done", "zc_story_job_r03_lenha_done", "zc_story_job_r05_ronda_done", "zc_story_job_r06_remedios_done",
  "zc_story_job_r08_encomenda_done", "zc_story_job_r08b_eletronicos_done", "zc_story_job_r09_revezamento_done", "zc_story_job_r10_rua_morta_done",
  "zc_story_job_r11_combustivel_done", "zc_story_job_r12_limpeza_done", "zc_story_job_r13_carga_done", "zc_story_job_r14_pilhas_done",
  "zc_story_keys_turned", "zc_story_lab_1_access", "zc_story_lab_2_access", "zc_story_lab_3_access",
  "zc_story_m03_cida", "zc_story_m03_tiao", "zc_story_m04_done", "zc_story_m04_met",
  "zc_story_m09b_done", "zc_story_m12_cida", "zc_story_m13_cida", "zc_story_m22_joana",
  "zc_story_m22_silencio", "zc_story_met_bigode", "zc_story_met_bigode_done", "zc_story_met_cida",
  "zc_story_met_civilian", "zc_story_met_coronel", "zc_story_met_dente", "zc_story_met_dente_done",
  "zc_story_met_guard", "zc_story_met_helena", "zc_story_met_helena_done", "zc_story_met_joana",
  "zc_story_met_joana_done", "zc_story_met_neide", "zc_story_met_tiao", "zc_story_met_trader",
  "zc_story_radio_livre_found", "zc_story_rep_colegio_confiavel", "zc_story_rep_colegio_conhecido", "zc_story_rep_colegio_desconhecido",
  "zc_story_rep_colegio_familia", "zc_story_rep_colegio_hostil", "zc_story_rep_colegio_tolerado", "zc_story_rep_galpao_confiavel",
  "zc_story_rep_galpao_conhecido", "zc_story_rep_galpao_desconhecido", "zc_story_rep_galpao_familia", "zc_story_rep_galpao_hostil",
  "zc_story_rep_galpao_tolerado", "zc_story_rep_matriz_confiavel", "zc_story_rep_matriz_conhecido", "zc_story_rep_matriz_desconhecido",
  "zc_story_rep_matriz_familia", "zc_story_rep_matriz_hostil", "zc_story_rep_matriz_tolerado", "zc_story_s07_exposed",
  "zc_story_s07_silence", "zc_story_safezone_colegio_fallen", "zc_story_safezone_galpao_fallen", "zc_story_safezone_matriz_fallen",
  "zc_story_siege_active", "zc_story_siege_night", "zc_story_siege_night_1", "zc_story_siege_night_2",
  "zc_story_siege_night_3", "zc_story_siege_started", "zc_story_silencio_warning", "zc_story_soro_used",
  "zc_story_traded_colegio", "zc_story_traded_galpao", "zc_story_traded_matriz", "zc_story_ute_ready",
  "zc_story_voted", "zc_story_water_off", "zc_story_water_restored",
]
const ZCQ_ITEMS = [
  "binocularsmod:binoculars", "car:battery", "car:big_wheel", "car:bio_diesel_bucket",
  "car:canister", "car:engine_3_cylinder", "car:engine_piston", "car:engine_truck",
  "car:generator", "car:repair_kit", "car:small_tank", "car:wheel",
  "car:wrench", "comforts:sleeping_bag_brown", "create:fluid_pipe", "create:mechanical_pump",
  "farmersdelight:cabbage", "farmersdelight:cabbage_seeds", "farmersdelight:canvas", "farmersdelight:onion",
  "farmersdelight:rice", "farmersdelight:stove", "farmersdelight:tomato", "farmersdelight:tomato_seeds",
  "farmersdelight:vegetable_soup", "flashlightmod:battery", "flashlightmod:flashlight", "immersiveengineering:capacitor_lv",
  "immersiveengineering:coil_mv", "immersiveengineering:connector_lv", "immersiveengineering:drill", "immersiveengineering:drillhead_iron",
  "immersiveengineering:floodlight", "immersiveengineering:hammer", "immersiveengineering:light_bulb", "immersiveengineering:manual",
  "immersiveengineering:plate_steel", "immersiveengineering:wirecoil_copper", "immersiveengineering:wirecutter", "kubejs:military_electronics",
  "kubejs:weapon_parts", "map_atlases:atlas", "marbledsarsenal:black_plate_carrier_heavy", "marbledsarsenal:black_plate_carrier_light",
  "marbledsarsenal:olive_plate_carrier_heavy", "marbledsarsenal:olive_plate_carrier_light", "marbledsarsenal:riot_armor_chestplate", "marbledsarsenal:riot_armor_helmet",
  "marbledsarsenal:swat_armor_chestplate", "marbledsmelees:barbed_baseball_bat", "marbledsmelees:baseball_bat", "marbledsmelees:bone_saw",
  "marbledsmelees:crowbar", "marbledsmelees:fire_axe", "marbledsmelees:katana", "marbledsmelees:machete",
  "marbledsmelees:modern_axe", "marbledsmelees:pipe_wrench", "marbledsmelees:police_baton", "marbledsmelees:sledgehammer",
  "marbledsmelees:steel_baseball_bat", "marbledsmelees:stop_sign", "marbledsmelees:tanto", "marbledsmelees:tomahawk",
  "mcore:steel_axe", "mcore:steel_sword", "minecraft:beetroot", "minecraft:bell",
  "minecraft:black_dye", "minecraft:bone", "minecraft:book", "minecraft:bread",
  "minecraft:cake", "minecraft:campfire", "minecraft:candle", "minecraft:carrot",
  "minecraft:cauldron", "minecraft:chest", "minecraft:clock", "minecraft:cobblestone",
  "minecraft:cobweb", "minecraft:cocoa_beans", "minecraft:compass", "minecraft:crafting_table",
  "minecraft:elytra", "minecraft:emerald", "minecraft:feather", "minecraft:filled_map",
  "minecraft:goat_horn", "minecraft:gold_ingot", "minecraft:gold_nugget", "minecraft:iron_axe",
  "minecraft:iron_bars", "minecraft:iron_block", "minecraft:iron_door", "minecraft:iron_helmet",
  "minecraft:iron_ingot", "minecraft:iron_nugget", "minecraft:iron_sword", "minecraft:lantern",
  "minecraft:lead", "minecraft:lightning_rod", "minecraft:map", "minecraft:music_disc_11",
  "minecraft:name_tag", "minecraft:netherite_helmet", "minecraft:note_block", "minecraft:oak_door",
  "minecraft:oak_log", "minecraft:oak_planks", "minecraft:oak_sign", "minecraft:paper",
  "minecraft:potato", "minecraft:pumpkin_seeds", "minecraft:red_bed", "minecraft:red_candle",
  "minecraft:redstone_lamp", "minecraft:redstone_torch", "minecraft:rotten_flesh", "minecraft:shield",
  "minecraft:slime_ball", "minecraft:spyglass", "minecraft:stick", "minecraft:stone_axe",
  "minecraft:stone_button", "minecraft:stone_sword", "minecraft:string", "minecraft:tnt",
  "minecraft:water_bucket", "minecraft:wheat", "minecraft:wheat_seeds", "minecraft:white_banner",
  "minecraft:wither_skeleton_skull", "minecraft:wooden_axe", "minecraft:wooden_hoe", "minecraft:wooden_sword",
  "minecraft:writable_book", "minecraft:written_book", "notreepunching:andesite_loose_rock", "notreepunching:diorite_loose_rock",
  "notreepunching:fire_starter", "notreepunching:flint_axe", "notreepunching:flint_knife", "notreepunching:flint_shard",
  "notreepunching:granite_loose_rock", "notreepunching:plant_fiber", "notreepunching:plant_string", "notreepunching:red_sandstone_loose_rock",
  "notreepunching:sandstone_loose_rock", "notreepunching:stone_loose_rock", "securitycraft:keycard_lv1", "sophisticatedbackpacks:backpack",
  "walkietalkie:diamond_walkietalkie", "walkietalkie:golden_walkietalkie", "walkietalkie:iron_walkietalkie", "walkietalkie:netherite_walkietalkie",
  "walkietalkie:stone_walkietalkie", "walkietalkie:wooden_walkietalkie", "zc_clothing:fabric", "zc_clothing:needle",
  "zc_clothing:nurse_dress", "zc_clothing:thermal_pants", "zc_clothing:thermal_shirt", "zc_clothing:thread",
  "zc_clothing:tshirt_old", "zc_clothing:wool_beanie", "zc_clothing:wool_gloves", "zc_clothing:wool_socks",
  "zc_player:fanny_pack", "zc_player:reversal_injection", "zc_story:amostra_primaria", "zc_story:caderno_dente",
  "zc_story:cartao_acesso_veridia", "zc_story:cartao_lidia", "zc_story:chave_arsenal", "zc_story:chave_portao_a",
  "zc_story:chave_portao_b", "zc_story:chave_tunel_servico", "zc_story:diario_tavares", "zc_story:disjuntor_52_3",
  "zc_story:formula_rimidax", "zc_story:foto_casamento", "zc_story:fragmento_codigo_1", "zc_story:fragmento_codigo_2",
  "zc_story:fragmento_codigo_3", "zc_story:fusivel_industrial", "zc_story:grafite_rodoviaria", "zc_story:manual_vbtp",
  "zc_story:mapa_anotado", "zc_story:note_bigode_ledger", "zc_story:note_bo_2217", "zc_story:note_brandao",
  "zc_story:note_cedula", "zc_story:note_cida_mural", "zc_story:note_corvo_2", "zc_story:note_debora",
  "zc_story:note_dente_manual", "zc_story:note_fridge", "zc_story:note_helena_final", "zc_story:note_helena_garagem",
  "zc_story:note_irma_graca", "zc_story:note_l8", "zc_story:note_lidia", "zc_story:note_lista",
  "zc_story:note_p114", "zc_story:note_pena", "zc_story:note_poster_meningite", "zc_story:note_prado",
  "zc_story:note_rafael_planta", "zc_story:note_silencio", "zc_story:note_torre", "zc_story:note_triagem_folheto",
  "zc_story:note_triagem_lote", "zc_story:note_zulmira_1", "zc_story:note_zulmira_2", "zc_story:pendrive_rafael",
  "zc_story:pilha_aa", "zc_story:radio_joana_21", "zc_story:radio_militar", "zc_story:radio_numeros",
  "zc_story:radio_portatil", "zc_story:tape_caio_1", "zc_story:tape_caio_10", "zc_story:tape_caio_2",
  "zc_story:tape_caio_3", "zc_story:tape_caio_4", "zc_story:tape_caio_5", "zc_story:tape_caio_6",
  "zc_story:tape_caio_7", "zc_story:tape_caio_8", "zc_story:tape_caio_9", "zc_story:tape_cftv_fila",
  "zc_story:tape_lidia_1", "zc_survival:antibiotics", "zc_survival:bandage", "zc_survival:boiled_water_bottle",
  "zc_survival:canned_beans", "zc_survival:canned_peaches", "zc_survival:canned_soup", "zc_survival:disinfectant",
  "zc_survival:empty_bottle", "zc_survival:painkillers", "zc_survival:rag", "zc_survival:splint",
  "zc_survival:sterile_bandage", "zc_survival:suture_kit", "zc_survival:water_bottle", "zc_world:barbed_wire",
  "zc_world:quarantine_concrete", "zc_world:quarantine_gate",
]

let ZCQ_POLL_TICKS = 40
const ZCQ_FALLBACK_RADIUS = 40
let ZCQ_WORLD = {}          // tags valid for everybody (none since 0.3.4: boss victories are per player)
let zcqLocApi = undefined   // gg.zomboidcraft.world.api.ZcLocations or null
let zcqLocMode = ''         // 'at' | 'all' | ''
let zcqLastError = ''

function zcqWarn(msg) {
  if (msg != zcqLastError) console.warn('[zc_story_quests] ' + msg)
  zcqLastError = msg
}

function zcqLocations() {
  if (zcqLocApi !== undefined) return zcqLocApi
  zcqLocApi = null
  if (!Platform.isLoaded('zc_world')) return null
  try {
    zcqLocApi = Java.loadClass('gg.zomboidcraft.world.api.ZcLocations')
    zcqLocMode = 'at'
  } catch (e) {
    zcqWarn('ZcLocations indisponível: ' + e)
    zcqLocApi = null
  }
  return zcqLocApi
}

// Boss victories are per player (zc_bosses squads, 0.3.4): the world remembers nothing. Old worlds may still carry
// zcq_zc_boss_*_defeated marks in persistentData; they are ignored on purpose.
function zcqLoadWorld(server) {
  ZCQ_WORLD = {}
}

function zcqTagSet(player) {
  let out = {}
  player.getTags().forEach(t => { out[String(t)] = true })
  return out
}

function zcqLevel(player) {
  try { return player.serverLevel() } catch (e) { }
  return player.level
}

// Adds zc_quests_visited_* / zc_quests_had_* tags; records bosses. Returns the player's tag set (JS object).
function zcqTrack(server, player, tags) {
  // location
  let api = zcqLocations()
  if (api) {
    try {
      let level = zcqLevel(player)
      if (level.equals(server.overworld())) {
        let pos = player.blockPosition()
        let id = null
        if (zcqLocMode == 'at') {
          try {
            let opt = api.at(level, pos)
            if (opt.isPresent()) id = String(opt.get())
          } catch (e) {
            zcqWarn('ZcLocations.at falhou, usando all(): ' + e)
            zcqLocMode = 'all'
          }
        }
        if (zcqLocMode == 'all') {
          api.all(level).forEach((k, anchor) => {
            let dx = anchor.x - pos.x, dz = anchor.z - pos.z
            if (id == null && dx * dx + dz * dz <= ZCQ_FALLBACK_RADIUS * ZCQ_FALLBACK_RADIUS) id = String(k)
          })
        }
        if (id != null) {
          let tag = 'zc_quests_visited_' + id
          if (!tags[tag]) { player.addTag(tag); tags[tag] = true }
        }
      }
    } catch (e) {
      zcqWarn('local: ' + e)
    }
  }
  // key items
  try {
    let inv = player.inventory
    let n = inv.getContainerSize()
    for (let i = 0; i < n; i++) {
      let st = inv.getItem(i)
      if (st.isEmpty()) continue
      let id = String(st.id)
      if (id.indexOf('zc_story:') != 0) continue
      let path = id.substring(9)
      if (ZCQ_TRACKED.indexOf(path) < 0) continue
      let tag = 'zc_quests_had_' + path
      if (!tags[tag]) { player.addTag(tag); tags[tag] = true }
    }
  } catch (e) {
    zcqWarn('inventário: ' + e)
  }
  return tags
}

function zcqMatches(hook, tags) {
  let any = hook[2]
  for (let i = 0; i < any.length; i++) if (tags[any[i]] || ZCQ_WORLD[any[i]]) return true
  return false
}

// FTB Quests task objects by hex id (code string). Never turn ids into JS numbers: they are 63-bit longs.
let zcqTaskCache = null
let zcqTaskCacheTick = -1

function zcqTask(server, id) {
  let now = server.tickCount
  if (zcqTaskCache == null || zcqTaskCache[id] === undefined && now - zcqTaskCacheTick > 200 || now - zcqTaskCacheTick > 6000) {
    zcqTaskCache = {}
    zcqTaskCacheTick = now
    FTBQuests.getFile(server.overworld()).getAllTasks().forEach(t => { zcqTaskCache[String(t.getCodeString())] = t })
  }
  return zcqTaskCache[id] || null
}

// Returns the number of tasks completed now.
// FTB Quests only marks a task complete when its quest's dependencies are complete; progress added earlier (flexible
// mode) would sit at max without ever completing. So: wait for the dependencies, then set the progress (and repair a
// task stuck at max from an older run).
function zcqPoll(server, player) {
  if (typeof FTBQuests === 'undefined') return 0
  let tags = zcqTrack(server, player, zcqTagSet(player))
  let td = null
  let n = 0
  for (let i = 0; i < ZCQ_HOOKS.length; i++) {
    let h = ZCQ_HOOKS[i]
    if (!zcqMatches(h, tags)) continue
    try {
      if (td == null) {
        let data = FTBQuests.getServerDataFromPlayer(player)
        if (data == null) return n
        td = data.getData()
        if (td == null) return n
      }
      let task = zcqTask(server, h[0])
      if (task == null) { zcqWarn('tarefa ' + h[0] + ' (' + h[1] + ') não existe no FTB Quests'); continue }
      if (td.isCompleted(task)) continue
      if (!td.areDependenciesComplete(task.getQuest())) continue
      if (td.getProgress(task) >= task.getMaxProgress()) td.setProgress(task, 0)
      td.setProgress(task, task.getMaxProgress())
      if (td.isCompleted(task)) {
        n++
        console.info('[zc_story_quests] ' + player.username + ': ' + h[1] + ' / ' + h[0])
      }
    } catch (e) {
      zcqWarn('tarefa ' + h[0] + ' (' + h[1] + '): ' + e)
    }
  }
  return n
}

ServerEvents.loaded(event => zcqLoadWorld(event.server))

ServerEvents.tick(event => {
  let server = event.server
  if (server.tickCount % ZCQ_POLL_TICKS != 0) return
  server.players.forEach(p => {
    try { zcqPoll(server, p) } catch (e) { zcqWarn('poll: ' + e) }
  })
})

// ------------------------------------------------------------------------------------------------ self test
function zcqSelftest(server) {
  let out = []
  let err = []
  let warn = []
  if (typeof FTBQuests === 'undefined') {
    err.push('binding FTBQuests ausente (FTB XMod Compat + KubeJS?)')
    return { out: out, err: err, warn: warn }
  }
  let file = FTBQuests.getFile(server.overworld())
  let tasks = {}
  let taskType = {}
  let quests = {}
  file.getAllTasks().forEach(t => {
    let id = String(t.getCodeString())
    tasks[id] = t
    taskType[id] = String(t.getType().getTypeId())
  })
  file.forAllQuests(q => { quests[String(q.getCodeString())] = q })
  out.push('arquivo FTB: ' + Object.keys(quests).length + ' missões, ' + Object.keys(tasks).length + ' tarefas')

  // 1. every hook -> an existing custom task (max progress 1) of the expected quest
  let questByKey = {}
  ZCQ_QUESTS.forEach(q => { questByKey[q[1]] = q })
  let hooked = {}
  ZCQ_HOOKS.forEach(h => {
    hooked[h[0]] = true
    let t = tasks[h[0]]
    if (!t) { err.push('tarefa ' + h[0] + ' (' + h[1] + ') não existe no arquivo carregado'); return }
    if (taskType[h[0]] != 'ftbquests:custom') err.push('tarefa ' + h[0] + ' (' + h[1] + ') é ' + taskType[h[0]] + ', esperado ftbquests:custom')
    if (Number(t.getMaxProgress()) != 1) err.push('tarefa ' + h[0] + ' max_progress ' + t.getMaxProgress())
    let q = questByKey[h[1]]
    if (!q) err.push('missão ' + h[1] + ' desconhecida')
    else if (String(t.getQuest().getCodeString()) != q[0]) err.push('tarefa ' + h[0] + ' está na missão ' + t.getQuest().getCodeString() + ', esperado ' + q[0])
  })
  // 2. no custom task without a hook (would be impossible)
  Object.keys(tasks).forEach(id => {
    if (taskType[id] == 'ftbquests:custom' && !hooked[id]) err.push('tarefa custom ' + id + ' sem gancho (impossível de completar)')
  })
  // 3. expected quests and dependencies are what FTB Quests loaded
  ZCQ_QUESTS.forEach(e => {
    let q = quests[e[0]]
    if (!q) { err.push('missão ' + e[1] + ' (' + e[0] + ') não carregada'); return }
    let deps = []
    q.streamDependencies().forEach(d => deps.push(String(d.getCodeString())))
    let want = e[2].slice().sort().join(',')
    let got = deps.sort().join(',')
    if (want != got) err.push('missão ' + e[1] + ': dependências carregadas [' + got + '] != esperadas [' + want + ']')
  })
  // 4. producers: every hook can be satisfied by a producible tag; runtime check of the producers we can see
  let prod = {}
  ZCQ_PRODUCIBLE.forEach(t => { prod[t] = true })
  let ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
  let ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
  let itemExists = id => ForgeRegistries.ITEMS.containsKey(new ResourceLocation(id))
  let entityExists = id => ForgeRegistries.ENTITY_TYPES.containsKey(new ResourceLocation(id))
  let present = null
  let api = zcqLocations()
  if (api) {
    present = {}
    try { api.all().forEach(id => { present[String(id)] = true }) } catch (e) { warn.push('ZcLocations.all(): ' + e) }
    out.push('zc_world: ' + Object.keys(present).length + ' locais neste mundo (modo ' + zcqLocMode + ')')
  } else {
    warn.push('zc_world/ZcLocations ausente: tarefas de "chegar em" não completam')
  }
  let tagOk = t => {
    if (!prod[t]) return 'não produzida'
    if (t.indexOf('zc_note_') == 0 && !itemExists('zc_story:' + t.substring(8))) return 'documento zc_story:' + t.substring(8) + ' não registrado'
    if (t.indexOf('zc_quests_had_') == 0 && !itemExists('zc_story:' + t.substring(14))) return 'item zc_story:' + t.substring(14) + ' não registrado'
    if (t.indexOf('zc_boss_') == 0) {
      let b = t.substring(8, t.length - 9)
      if (!entityExists('zc_bosses:' + b)) return 'boss zc_bosses:' + b + ' não registrado'
    }
    if (t.indexOf('zc_quests_visited_') == 0) {
      if (!present) return 'zc_world ausente'
      if (!present[t.substring(18)]) return 'local ' + t.substring(18) + ' não existe neste mundo'
    }
    return null
  }
  let tagProblem = {}
  ZCQ_HOOKS.forEach(h => {
    let okAny = false
    h[2].forEach(t => {
      let p = tagOk(t)
      if (p == null) okAny = true
      else tagProblem[t] = p
    })
    if (!okAny) (h[3] ? warn : err).push('tarefa ' + h[0] + ' (' + h[1] + ') não tem como completar: ' + h[2].map(t => t + ' [' + tagProblem[t] + ']').join(', '))
  })
  Object.keys(tagProblem).forEach(t => warn.push('tag ' + t + ': ' + tagProblem[t]))
  // 5. matcher sanity: everything matches the full producible set, nothing matches an empty set
  let all = {}
  ZCQ_PRODUCIBLE.forEach(t => { all[t] = true })
  let savedWorld = ZCQ_WORLD
  ZCQ_WORLD = {}
  let full = 0, none = 0
  ZCQ_HOOKS.forEach(h => { if (zcqMatches(h, all)) full++; if (zcqMatches(h, {})) none++ })
  ZCQ_WORLD = savedWorld
  if (full != ZCQ_HOOKS.length) err.push('matcher: só ' + full + '/' + ZCQ_HOOKS.length + ' ganchos casam com todas as tags')
  if (none != 0) err.push('matcher: ' + none + ' ganchos casam sem tag nenhuma')
  // 6. reachability over the LOADED quests (custom tasks need a satisfiable hook; other task types are player actions)
  let hookOk = {}
  let hookOpt = {}
  ZCQ_HOOKS.forEach(h => { hookOk[h[0]] = h[2].some(t => tagOk(t) == null); hookOpt[h[0]] = !!h[3] })
  let doable = {}
  Object.keys(quests).forEach(id => {
    let ok = true
    quests[id].getTasksAsList().forEach(t => {
      let tid = String(t.getCodeString())
      if (taskType[tid] == 'ftbquests:custom' && !hookOk[tid] && !hookOpt[tid]) ok = false
    })
    doable[id] = ok
  })
  let mode = {}
  ZCQ_QUESTS.forEach(e => { mode[e[0]] = e[3] })
  let done = {}
  let changed = true
  while (changed) {
    changed = false
    Object.keys(quests).forEach(id => {
      if (done[id] || !doable[id]) return
      let deps = []
      quests[id].streamDependencies().forEach(d => deps.push(String(d.getCodeString())))
      let ok = deps.length == 0 || (mode[id] == 'one' ? deps.some(d => done[d]) : deps.every(d => done[d]))
      if (ok) { done[id] = true; changed = true }
    })
  }
  let keyOf = {}
  ZCQ_QUESTS.forEach(e => { keyOf[e[0]] = e[1] })
  let unreached = Object.keys(quests).filter(id => !done[id])
  unreached.forEach(id => err.push('missão inalcançável: ' + (keyOf[id] || id)))
  out.push('alcançáveis: ' + (Object.keys(quests).length - unreached.length) + '/' + Object.keys(quests).length)
  // 7. items referenced by tasks, rewards and icons
  let missing = 0
  ZCQ_ITEMS.forEach(id => { if (!itemExists(id)) { missing++; warn.push('item não registrado: ' + id) } })
  out.push('itens referenciados: ' + ZCQ_ITEMS.length + ', ausentes: ' + missing)
  out.push('ganchos: ' + ZCQ_HOOKS.length + ', bosses: vitória por jogador (' + ZCQ_BOSSES.length + ' chefes)')
  return { out: out, err: err, warn: warn }
}

function zcqReport(src, lines) {
  lines.forEach(l => {
    console.info('[zc_story_quests] ' + l)
    try { src.sendSystemMessage(Text.of(l)) } catch (e) { }
  })
}

ServerEvents.commandRegistry(event => {
  let Commands = event.commands
  event.register(Commands.literal('zcquests')
    .requires(src => src.hasPermission(2))
    .then(Commands.literal('selftest').executes(ctx => {
      let r
      try { r = zcqSelftest(ctx.source.server) } catch (e) { r = { out: [], err: ['exceção: ' + e], warn: [] } }
      let lines = r.out.slice()
      r.warn.forEach(w => lines.push('AVISO: ' + w))
      r.err.forEach(e => lines.push('ERRO: ' + e))
      lines.push('zcquests selftest: ' + (r.err.length == 0 ? 'OK' : 'FALHOU') + ' (' + r.err.length + ' erros, ' + r.warn.length + ' avisos)')
      zcqReport(ctx.source, lines)
      return r.err.length == 0 ? 1 : 0
    }))
    .then(Commands.literal('poll').executes(ctx => {
      let server = ctx.source.server
      let n = 0
      server.players.forEach(p => { n += zcqPoll(server, p) })
      zcqReport(ctx.source, ['zcquests poll: ' + n + ' tarefas completadas agora'])
      return 1
    }))
    .then(Commands.literal('check').executes(ctx => {
      let p = ctx.source.player
      if (!p) { zcqReport(ctx.source, ['use como jogador']); return 0 }
      let server = ctx.source.server
      let tags = zcqTrack(server, p, zcqTagSet(p))
      let data = FTBQuests.getServerDataFromPlayer(p)
      let lines = []
      ZCQ_HOOKS.forEach(h => {
        if (zcqMatches(h, tags)) lines.push((data && data.isCompleted(h[0]) ? '[x] ' : '[ ] ') + h[1] + ' ' + h[0])
      })
      lines.push('zcquests check: ' + lines.length + ' tarefas com tag presente; /zcquests poll completa as liberadas')
      zcqReport(ctx.source, lines)
      return 1
    }))
    .then(Commands.literal('tags').executes(ctx => {
      let p = ctx.source.player
      if (!p) { zcqReport(ctx.source, ['use como jogador']); return 0 }
      let t = Object.keys(zcqTagSet(p)).filter(x => x.indexOf('zc_') == 0).sort()
      zcqReport(ctx.source, ['tags (' + t.length + '): ' + t.join(' ')])
      return 1
    })))
})
