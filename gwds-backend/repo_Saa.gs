var SaaRepo = (function() {
  var SHEET = 'SAA';
  function list(filtros) {
    var rows = BaseRepo.all(SHEET);
    filtros = filtros || {};
    if (filtros.distrito) rows = rows.filter(function(r){ return String(r.distrito).toLowerCase() === String(filtros.distrito).toLowerCase(); });
    if (filtros.q) {
      var q = String(filtros.q).toLowerCase();
      rows = rows.filter(function(r){ return JSON.stringify(r).toLowerCase().indexOf(q) >= 0; });
    }
    return rows;
  }
  function byCodigo(codigo) {
    var f = BaseRepo.findOne(SHEET, function(x){ return String(x.codigo) === String(codigo); });
    return f ? { row: f.row, data: f.data } : null;
  }
  function create(saa) { BaseRepo.insert(SHEET, saa); return saa.codigo; }
  function update(codigo, patch) {
    var f = byCodigo(codigo);
    if (!f) return null;
    return BaseRepo.updateRow(SHEET, f.row, patch);
  }
  function softDelete(codigo, by) {
    return BaseRepo.softDelete(SHEET, function(x){ return String(x.codigo) === String(codigo); }, by);
  }
  return { list: list, byCodigo: byCodigo, create: create, update: update, softDelete: softDelete };
})();
