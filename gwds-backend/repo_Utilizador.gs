var UtilizadorRepo = (function() {
  var SHEET = 'Utilizadores';
  function byEmail(email) {
    if (!email) return null;
    var found = BaseRepo.findOne(SHEET, function(u) {
      return String(u.email).toLowerCase() === String(email).toLowerCase() && u.activo !== false;
    });
    return found ? found.data : null;
  }
  function all() { return BaseRepo.all(SHEET); }
  function upsert(u, by) {
    var found = BaseRepo.findOne(SHEET, function(x){ return String(x.email).toLowerCase() === String(u.email).toLowerCase(); });
    if (found) {
      BaseRepo.updateRow(SHEET, found.row, {
        nome: u.nome || found.data.nome,
        perfil: u.perfil || found.data.perfil,
        activo: u.activo !== undefined ? u.activo : true
      });
      return 'updated';
    }
    BaseRepo.insert(SHEET, {
      email: u.email, nome: u.nome || u.email.split('@')[0],
      perfil: u.perfil || 'TEC_CADASTRO', activo: true,
      criado_em: new Date().toISOString(), criado_por: by || ''
    });
    return 'created';
  }
  return { byEmail: byEmail, all: all, upsert: upsert };
})();
