/**
 * Setup.gs
 *
 * Função única setup() que prepara a Folha de Cálculo de produção do GWDS.
 * Execute UMA VEZ no editor do Apps Script.
 *
 * O que faz:
 *  1. Abre a Folha pelo ID definido em GWDS_SPREADSHEET_ID
 *  2. Cria as 6 folhas necessárias com cabeçalhos correctos
 *  3. Cria a pasta "GWDS-Fotos" no Drive para as fotografias
 *  4. Adiciona o utilizador actual como ADMINISTRADOR na folha Utilizadores
 *  5. Grava o ID em Script Properties para uso pelos repositórios
 */

// ▼▼▼ ID da Folha de Cálculo do GWDS ▼▼▼
// Encontra-se no URL: https://docs.google.com/spreadsheets/d/[ID]/edit
var GWDS_SPREADSHEET_ID = "15NumvL8CmrjIO1aoHIp-vhlIwRceGVUtWpgbFTafIV4";

function setup() {
  var ss;
  if (GWDS_SPREADSHEET_ID && GWDS_SPREADSHEET_ID.length > 20) {
    ss = SpreadsheetApp.openById(GWDS_SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActive();
  }
  if (!ss)
    throw new Error(
      "Defina GWDS_SPREADSHEET_ID no topo de Setup.gs com o ID da sua Folha.",
    );

  // 1. Guardar ID em Script Properties
  var props = PropertiesService.getScriptProperties();
  props.setProperty("SPREADSHEET_ID", ss.getId());

  // 2. Folhas e cabeçalhos
  var schemas = {
    Utilizadores: [
      "email",
      "nome",
      "perfil",
      "activo",
      "criado_em",
      "criado_por",
    ],

    AKVO_Cascade: ["id", "provincia", "distrito", "posto", "localidade"],

    Fontes_Dispersas: [
      "provincia",
      "distrito",
      "posto_adm",
      "localidade",
      "aldei_bair",
      "cod_exist",
      "cod_resp",
      "cod_n_resp",
      "codigo",
      "nome_lugar",
      "tipo_fonte",
      "foto_fonte",
      "ano_const",
      "nome_empre",
      "nome_fisc",
      "nome_finan",
      "custo_mzn",
      "prof_fp_m",
      "diam_fp_cm",
      "q_fp_m3h",
      "tipo_bomba",
      "marc_bomba",
      "pot_eb_w",
      "tipo_energ",
      "pot_ie_w",
      "exist_bat",
      "prof_eb_m",
      "obs_lev",
      "x_wgs84",
      "y_wgs84",
      "x_utm",
      "y_utm",
      "pa_lev",
      "pa_val",
      "pa_val_ov",
      "codigo_ok",
      "locun_ok",
      "locun_dis",
      "loc_out",
      "aldbai_out",
      "Foto",
      "criado_em",
      "criado_por",
      "alterado_em",
      "alterado_por",
      "activo",
    ],

    SAA: [
      "provincia",
      "distrito",
      "posto_adm",
      "localidade",
      "aldei_bair",
      "codigo",
      "nomecentro",
      "bairros",
      "tipo_energ",
      "pot_ie_w",
      "ano_const",
      "propried",
      "nome_empre",
      "nome_fisc",
      "nome_finan",
      "custo_mzn",
      "n_capt",
      "n_armaz",
      "mat_adut",
      "l_adut_m",
      "tipo_rede",
      "tipo_lig",
      "mat_rede",
      "l_rede_m",
      "x_wgs84",
      "y_wgs84",
      "x_utm",
      "y_utm",
      "tipocap_c1",
      "pr_fp_m_c1",
      "aldbai_out",
      "criado_em",
      "criado_por",
      "alterado_em",
      "alterado_por",
      "activo",
    ],

    Monitorias: [
      "id",
      "saa_codigo",
      "data_monitoria",
      "estado",
      "cond_us_cm",
      "sabor_agua",
      "cor_agua",
      "cheir_agua",
      "trat_agua",
      "n_ben_fami",
      "n_ben_pess",
      "mod_gestao",
      "nom_respon",
      "sex_respon",
      "tl1_respon",
      "tl2_respon",
      "n_ligdom",
      "n_torqui",
      "n_fontan",
      "n_ligcom",
      "n_ligind",
      "tipo_fact",
      "vol_bid_l",
      "pr_bid_mzn",
      "pr_fix_mzn",
      "pr_m3c_mzn",
      "fat_m_mzn",
      "rec_m_mzn",
      "registado_por",
    ],

    Log_Auditoria: [
      "id",
      "utilizador",
      "operacao",
      "entidade",
      "entidade_id",
      "data_hora",
      "ip",
      "detalhes",
    ],
  };

  Object.keys(schemas).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    var headers = schemas[name];
    var range = sh.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range
      .setFontWeight("bold")
      .setBackground("#1F4E79")
      .setFontColor("#FFFFFF");
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, headers.length);
  });

  // 3. Pasta Drive
  var folderName = "GWDS-Fotos";
  var existing = DriveApp.getFoldersByName(folderName);
  var folderId;
  if (existing.hasNext()) folderId = existing.next().getId();
  else folderId = DriveApp.createFolder(folderName).getId();
  props.setProperty("FOTOS_FOLDER_ID", folderId);

  // 4. Inserir o e-mail actual como ADMINISTRADOR
  var email = Session.getActiveUser().getEmail();
  if (email) {
    var uSheet = ss.getSheetByName("Utilizadores");
    var data = uSheet.getDataRange().getValues();
    var exists = data.slice(1).some(function (r) {
      return String(r[0]).toLowerCase() === email.toLowerCase();
    });
    if (!exists) {
      uSheet.appendRow([
        email,
        email.split("@")[0],
        "ADMINISTRADOR",
        true,
        new Date().toISOString(),
        email,
      ]);
    }
  }

  // 5. Mensagem final no log (não há UI em modo standalone)
  Logger.log("GWDS configurado com sucesso.");
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("Pasta de fotografias: " + folderName + " (" + folderId + ")");
  Logger.log("Administrador: " + email);
  Logger.log("Folhas criadas: " + Object.keys(schemas).join(", "));
  Logger.log(
    "Próximo passo: Implementar > Nova implementação > Tipo: Aplicação Web.",
  );
}

/** Helper para outros .gs obterem a Spreadsheet activa. */
function getSpreadsheet_() {
  var id =
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) {
    if (GWDS_SPREADSHEET_ID && GWDS_SPREADSHEET_ID.length > 20) {
      return SpreadsheetApp.openById(GWDS_SPREADSHEET_ID);
    }
    throw new Error("Corra setup() primeiro.");
  }
  return SpreadsheetApp.openById(id);
}

function getFotosFolder_() {
  var id =
    PropertiesService.getScriptProperties().getProperty("FOTOS_FOLDER_ID");
  if (!id)
    throw new Error("Pasta de fotografias não configurada. Corra setup().");
  return DriveApp.getFolderById(id);
}
