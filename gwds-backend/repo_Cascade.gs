var CascadeRepo = (function() {
  var SHEET = 'AKVO_Cascade';
  var _cache = null;
  function all() {
    if (_cache) return _cache;
    _cache = BaseRepo.all(SHEET, { includeInactive: true });
    return _cache;
  }
  function invalidate() { _cache = null; }

  function _norm(s) { return String(s || '').trim().toLowerCase(); }

  function exists(prov, dist, posto, loc) {
    var key = [_norm(prov), _norm(dist), _norm(posto), _norm(loc)].join('|');
    return all().some(function(r){
      return [_norm(r.provincia), _norm(r.distrito), _norm(r.posto), _norm(r.localidade)].join('|') === key;
    });
  }

  /** Sugestões aproximadas. Distância de Levenshtein normalizada por comprimento. */
  function fuzzyMatch(prov, dist, posto, loc, n) {
    var target = [_norm(prov), _norm(dist), _norm(posto), _norm(loc)].join('|');
    var rows = all().map(function(r) {
      var k = [_norm(r.provincia), _norm(r.distrito), _norm(r.posto), _norm(r.localidade)].join('|');
      return { row: r, score: _lev(target, k) / Math.max(target.length, k.length, 1) };
    });
    rows.sort(function(a,b){ return a.score - b.score; });
    return rows.slice(0, n || 3).map(function(x){ return x.row; });
  }

  function _lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var v0 = new Array(b.length + 1), v1 = new Array(b.length + 1);
    for (var i = 0; i <= b.length; i++) v0[i] = i;
    for (var i = 0; i < a.length; i++) {
      v1[0] = i + 1;
      for (var j = 0; j < b.length; j++) {
        var cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      for (var k = 0; k <= b.length; k++) v0[k] = v1[k];
    }
    return v1[b.length];
  }

  function replaceAll(rows) {
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName(SHEET);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    if (rows.length === 0) return 0;
    var headers = BaseRepo.headersOf(SHEET);
    var matrix = rows.map(function(r, i) {
      return headers.map(function(h) {
        if (h === 'id') return r.id || (i + 1);
        return r[h] || '';
      });
    });
    sh.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
    invalidate();
    return matrix.length;
  }

  return { all: all, exists: exists, fuzzyMatch: fuzzyMatch, replaceAll: replaceAll, invalidate: invalidate };
})();
