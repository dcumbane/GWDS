/**
 * BaseRepo. Acesso genérico ao Google Sheets como base de dados.
 */
var BaseRepo = (function() {

  function _sheet(name) {
    var sh = getSpreadsheet_().getSheetByName(name);
    if (!sh) throw new Error('Folha não encontrada: ' + name);
    return sh;
  }

  function _headers(name) {
    var sh = _sheet(name);
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  }

  function _rowToObj(headers, row) {
    var o = {};
    for (var i = 0; i < headers.length; i++) o[headers[i]] = row[i];
    return o;
  }

  function _objToRow(headers, obj) {
    return headers.map(function(h) {
      var v = obj[h];
      if (v === undefined || v === null) return '';
      if (v instanceof Date) return v.toISOString();
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });
  }

  function all(name, opts) {
    opts = opts || {};
    var sh = _sheet(name);
    if (sh.getLastRow() < 2) return [];
    var headers = _headers(name);
    var values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
    var idxActivo = headers.indexOf('activo');
    return values
      .filter(function(r) { return opts.includeInactive || idxActivo < 0 || r[idxActivo] !== false; })
      .map(function(r) { return _rowToObj(headers, r); });
  }

  function findOne(name, predicate) {
    var rows = all(name, { includeInactive: true });
    for (var i = 0; i < rows.length; i++) if (predicate(rows[i])) return { row: i + 2, data: rows[i] };
    return null;
  }

  function insert(name, obj) {
    var sh = _sheet(name);
    var headers = _headers(name);
    sh.appendRow(_objToRow(headers, obj));
    return sh.getLastRow();
  }

  function updateRow(name, rowIndex, patch) {
    var sh = _sheet(name);
    var headers = _headers(name);
    var current = _rowToObj(headers, sh.getRange(rowIndex, 1, 1, headers.length).getValues()[0]);
    Object.keys(patch).forEach(function(k) { current[k] = patch[k]; });
    sh.getRange(rowIndex, 1, 1, headers.length).setValues([_objToRow(headers, current)]);
    return current;
  }

  function softDelete(name, predicate, by) {
    var found = findOne(name, predicate);
    if (!found) return false;
    var patch = { activo: false, alterado_em: new Date().toISOString(), alterado_por: by || '' };
    updateRow(name, found.row, patch);
    return true;
  }

  function headersOf(name) { return _headers(name); }

  return {
    all: all, findOne: findOne, insert: insert, updateRow: updateRow,
    softDelete: softDelete, headersOf: headersOf
  };
})();
