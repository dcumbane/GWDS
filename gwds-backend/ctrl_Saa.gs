var SaaController = (function() {

  function list(c) {
    var rows = SaaRepo.list({ distrito: c.params.distrito, q: c.params.q });
    return { items: rows, total: rows.length };
  }
  function get(c) {
    var s = SaaRepo.byCodigo(c.params.codigo);
    if (!s) _throw(404, 'SAA não encontrado', c.params.codigo);
    return s.data;
  }
  function create(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR', 'TEC_CADASTRO']);
    var s = c.body || {};
    if (!ValidacaoService.codigo(s.codigo)) _throw(422, 'Código inválido', 'RN-02');
    var v = ValidacaoService.unidade(s.provincia, s.distrito, s.posto_adm, s.localidade);
    if (!v.ok) _throw(422, 'Unidade administrativa desconhecida', JSON.stringify(v.sugestoes));
    if (!ValidacaoService.wgs84(s.x_wgs84, s.y_wgs84)) _throw(422, 'Coordenadas fora da faixa', 'RN-03');
    if (SaaRepo.byCodigo(s.codigo)) _throw(409, 'Código duplicado', s.codigo);
    var utm = GeoService.wgs84ToUtm(s.x_wgs84, s.y_wgs84);
    s.x_utm = utm.x; s.y_utm = utm.y;
    s.criado_em = new Date().toISOString();
    s.criado_por = c.user.email;
    s.activo = true;
    SaaRepo.create(s);
    AuditoriaService.track(c.user, 'CREATE', 'SAA', s.codigo, {});
    return { codigo: s.codigo };
  }
  function update(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR', 'TEC_CADASTRO']);
    var codigo = c.params.codigo || (c.body && c.body.codigo);
    var current = SaaRepo.byCodigo(codigo);
    if (!current) _throw(404, 'SAA não encontrado', codigo);
    var patch = c.body || {};
    patch.alterado_em = new Date().toISOString();
    patch.alterado_por = c.user.email;
    var updated = SaaRepo.update(codigo, patch);
    AuditoriaService.track(c.user, 'UPDATE', 'SAA', codigo, patch);
    return { ok: true, data: updated };
  }
  function softDelete(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR']);
    var ok = SaaRepo.softDelete(c.params.codigo, c.user.email);
    if (!ok) _throw(404, 'SAA não encontrado', c.params.codigo);
    AuditoriaService.track(c.user, 'DELETE', 'SAA', c.params.codigo, {});
    return { ok: true };
  }
  return { list: list, get: get, create: create, update: update, softDelete: softDelete };
})();
