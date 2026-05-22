var ExportController = (function() {
  function run(c) {
    var entidade = c.params.entidade || 'fonte';
    var rows;
    if (entidade === 'fonte') rows = FonteRepo.list({ distrito: c.params.distrito, ano: c.params.ano, tipo: c.params.tipo });
    else if (entidade === 'saa') rows = SaaRepo.list({ distrito: c.params.distrito });
    else if (entidade === 'monitoria') rows = MonitoriaRepo.list({ saa: c.params.saa });
    else _throw(400, 'Entidade desconhecida', entidade);
    var headers = BaseRepo.headersOf(entidade === 'fonte' ? 'Fontes_Dispersas' : entidade === 'saa' ? 'SAA' : 'Monitorias');
    return { rows: rows, headers: headers };
  }
  return { run: run };
})();
