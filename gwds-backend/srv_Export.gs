/**
 * Conversão de listas para CSV pronto a ser oferecido ao utilizador
 * a partir do front-end (o front-end converte em PDF/XLSX via jsPDF/SheetJS).
 */
var ExportService = (function() {
  function toCsv(rows, headers) {
    if (!rows || rows.length === 0) return headers.join(',') + '\n';
    var out = [headers.join(',')];
    rows.forEach(function(r) {
      out.push(headers.map(function(h) {
        var v = r[h];
        if (v === null || v === undefined) v = '';
        var s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? '"' + s + '"' : s;
      }).join(','));
    });
    return out.join('\n');
  }
  return { toCsv: toCsv };
})();
