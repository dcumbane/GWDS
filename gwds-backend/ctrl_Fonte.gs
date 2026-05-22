var FonteController = (function() {

  function list(c) {
    var filtros = {
      distrito: c.params.distrito,
      ano: c.params.ano,
      tipo: c.params.tipo,
      q: c.params.q
    };
    var rows = FonteRepo.list(filtros);
    return { items: rows, total: rows.length };
  }

  function get(c) {
    var codigo = c.params.codigo;
    var f = FonteRepo.byCodigo(codigo);
    if (!f) _throw(404, 'Fonte não encontrada', codigo);
    return f.data;
  }

  function create(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR', 'TEC_CADASTRO']);
    var f = c.body || {};

    // Regras
    if (!ValidacaoService.codigo(f.codigo)) _throw(422, 'Código inválido', 'RN-02: padrão DDDDDD/NNNN/AAAA esperado.');
    var v = ValidacaoService.unidade(f.provincia, f.distrito, f.posto_adm, f.localidade);
    if (!v.ok) _throw(422, 'Unidade administrativa não consta em AKVO Cascade', JSON.stringify(v.sugestoes));
    if (!ValidacaoService.wgs84(f.x_wgs84, f.y_wgs84)) _throw(422, 'Coordenadas fora da faixa moçambicana', 'RN-03.');
    if (FonteRepo.byCodigo(f.codigo)) _throw(409, 'Código duplicado', f.codigo);

    // Conversão UTM
    var utm = GeoService.wgs84ToUtm(f.x_wgs84, f.y_wgs84);
    f.x_utm = utm.x; f.y_utm = utm.y;

    // Upload de foto, se vier base64
    if (f.foto_base64) {
      f.foto_fonte = _uploadFoto(f.codigo, f.foto_base64);
      delete f.foto_base64;
    }

    // Auditoria
    f.criado_em = new Date().toISOString();
    f.criado_por = c.user.email;
    f.activo = true;

    FonteRepo.create(f);
    AuditoriaService.track(c.user, 'CREATE', 'Fontes_Dispersas', f.codigo, { tipo: f.tipo_fonte });
    return { codigo: f.codigo, criado_em: f.criado_em };
  }

  function update(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR', 'TEC_CADASTRO']);
    var codigo = c.params.codigo || (c.body && c.body.codigo);
    if (!codigo) _throw(400, 'Código obrigatório', 'parâmetro codigo');
    var current = FonteRepo.byCodigo(codigo);
    if (!current) _throw(404, 'Fonte não encontrada', codigo);
    var patch = c.body || {};
    patch.alterado_em = new Date().toISOString();
    patch.alterado_por = c.user.email;
    var updated = FonteRepo.update(codigo, patch);
    AuditoriaService.track(c.user, 'UPDATE', 'Fontes_Dispersas', codigo, patch);
    return { ok: true, data: updated };
  }

  function softDelete(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR']);
    var codigo = c.params.codigo;
    if (!codigo) _throw(400, 'Código obrigatório', 'parâmetro codigo');
    var ok = FonteRepo.softDelete(codigo, c.user.email);
    if (!ok) _throw(404, 'Fonte não encontrada', codigo);
    AuditoriaService.track(c.user, 'DELETE', 'Fontes_Dispersas', codigo, {});
    return { ok: true };
  }

  function _uploadFoto(codigo, base64) {
    var folder = getFotosFolder_();
    var parts = base64.split(',');
    var payload = parts.length === 2 ? parts[1] : parts[0];
    var mime = (parts[0].match(/data:(.*?);base64/) || [])[1] || 'image/jpeg';
    var blob = Utilities.newBlob(Utilities.base64Decode(payload), mime, codigo.replace(/[\/]/g, '_') + '.jpg');
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  }

  return { list: list, get: get, create: create, update: update, softDelete: softDelete };
})();
