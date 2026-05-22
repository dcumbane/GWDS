var MonitoriaRepo = (function() {
  var SHEET = 'Monitorias';
  function list(filtros) {
    var rows = BaseRepo.all(SHEET, { includeInactive: true });
    filtros = filtros || {};
    if (filtros.saa) rows = rows.filter(function(r){ return String(r.saa_codigo) === String(filtros.saa); });
    if (filtros.estado) rows = rows.filter(function(r){ return String(r.estado) === String(filtros.estado); });
    if (filtros.desde) rows = rows.filter(function(r){ return String(r.data_monitoria) >= String(filtros.desde); });
    if (filtros.ate) rows = rows.filter(function(r){ return String(r.data_monitoria) <= String(filtros.ate); });
    return rows;
  }
  function create(m) { BaseRepo.insert('Monitorias', m); return m.id; }
  return { list: list, create: create };
})();
