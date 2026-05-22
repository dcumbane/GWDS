var AdminController = (function() {

  function users(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR']);
    return { items: UtilizadorRepo.all() };
  }
  function userUpsert(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR']);
    var res = UtilizadorRepo.upsert(c.body || {}, c.user.email);
    AuditoriaService.track(c.user, res === 'created' ? 'CREATE' : 'UPDATE', 'Utilizadores', (c.body && c.body.email) || '', c.body);
    return { ok: true, op: res };
  }

  function cascadeAll(c) {
    return { items: CascadeRepo.all() };
  }
  function cascadeValidar(c) {
    var v = ValidacaoService.unidade(c.params.provincia, c.params.distrito, c.params.posto, c.params.localidade);
    return v;
  }

  function uploadCascade(c) {
    AuthService.requirePerfil(c.user, ['ADMINISTRADOR']);
    var rows = (c.body && c.body.rows) || [];
    var count = CascadeRepo.replaceAll(rows);
    AuditoriaService.track(c.user, 'UPDATE', 'AKVO_Cascade', 'all', { rows: count });
    return { ok: true, linhasGravadas: count };
  }

  return { users: users, userUpsert: userUpsert, cascadeAll: cascadeAll, cascadeValidar: cascadeValidar, uploadCascade: uploadCascade };
})();
