var MonitoriaController = (function() {

  function list(c) {
    var rows = MonitoriaRepo.list({
      saa: c.params.saa, estado: c.params.estado, desde: c.params.desde, ate: c.params.ate
    });
    return { items: rows, total: rows.length };
  }
  function bySaa(c) {
    return { items: MonitoriaRepo.list({ saa: c.params.codigo }) };
  }
  function create(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR', 'TEC_MONITORIA', 'TEC_CADASTRO']);
    var m = c.body || {};

    if (!m.saa_codigo) _throw(422, 'saa_codigo obrigatório', '');
    var saa = SaaRepo.byCodigo(m.saa_codigo);
    if (!saa) _throw(404, 'SAA não encontrado', m.saa_codigo);
    if (!m.data_monitoria) _throw(422, 'data_monitoria obrigatória', '');

    // RN-08
    if (saa.data.ano_const) {
      var ano = Number(String(m.data_monitoria).substring(0, 4));
      if (ano < Number(saa.data.ano_const)) _throw(422, 'Data anterior ao ano de construção do SAA', 'RN-08');
    }
    if (!ValidacaoService.estadoSaa(m.estado)) _throw(422, 'Estado inválido', 'RN-04');
    if (!ValidacaoService.qualidade(m)) _throw(422, 'Parâmetros de qualidade inválidos', 'RN-05');
    if (m.cond_us_cm !== undefined && Number(m.cond_us_cm) < 0) _throw(422, 'cond_us_cm negativo', '');

    // RN-09: receita só com tipo_fact diferente de Sem_facturação
    if (Number(m.rec_m_mzn) > 0 && String(m.tipo_fact).toLowerCase().indexOf('sem') === 0) {
      _throw(422, 'Receita registada sem tipo de facturação compatível', 'RN-09');
    }

    m.id = Utilities.getUuid();
    m.registado_por = c.user.email;
    MonitoriaRepo.create(m);
    AuditoriaService.track(c.user, 'CREATE', 'Monitorias', m.id, { saa: m.saa_codigo, estado: m.estado });
    return { id: m.id };
  }
  return { list: list, bySaa: bySaa, create: create };
})();
