var LogRepo = (function() {
  var SHEET = 'Log_Auditoria';
  function log(entry) {
    BaseRepo.insert(SHEET, {
      id: Utilities.getUuid(),
      utilizador: entry.utilizador || '',
      operacao: entry.operacao || '',
      entidade: entry.entidade || '',
      entidade_id: entry.entidade_id || '',
      data_hora: new Date().toISOString(),
      ip: entry.ip || '',
      detalhes: entry.detalhes ? (typeof entry.detalhes === 'string' ? entry.detalhes : JSON.stringify(entry.detalhes)) : ''
    });
  }
  function all(filtros) {
    filtros = filtros || {};
    var rows = BaseRepo.all(SHEET, { includeInactive: true });
    if (filtros.utilizador) rows = rows.filter(function(r){ return String(r.utilizador) === String(filtros.utilizador); });
    return rows;
  }
  return { log: log, all: all };
})();
