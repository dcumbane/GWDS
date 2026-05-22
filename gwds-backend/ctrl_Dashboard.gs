var DashboardController = (function() {

  function kpis(c) {
    var fontes = FonteRepo.list({ distrito: c.params.distrito });
    var saa = SaaRepo.list({ distrito: c.params.distrito });
    var mon = MonitoriaRepo.list({});

    // Estado mais recente por SAA
    var ultimoEstado = {};
    mon.sort(function(a,b){ return String(a.data_monitoria) < String(b.data_monitoria) ? -1 : 1; });
    mon.forEach(function(m){ ultimoEstado[m.saa_codigo] = m.estado; });
    var operacionais = 0;
    saa.forEach(function(s){ if (ultimoEstado[s.codigo] === 'Operacional') operacionais++; });
    var percentOp = saa.length > 0 ? Math.round(operacionais / saa.length * 100) : 0;

    // Fontes por tipo
    var porTipo = {};
    fontes.forEach(function(f){
      var t = f.tipo_fonte || 'Desconhecido';
      porTipo[t] = (porTipo[t] || 0) + 1;
    });

    // Beneficiários
    var benFamilias = 0, benPessoas = 0;
    var lastMon = {};
    mon.forEach(function(m){ lastMon[m.saa_codigo] = m; });
    Object.keys(lastMon).forEach(function(k){
      benFamilias += Number(lastMon[k].n_ben_fami) || 0;
      benPessoas  += Number(lastMon[k].n_ben_pess) || 0;
    });

    return {
      totalFontes: fontes.length,
      totalSAA: saa.length,
      operacionais: operacionais,
      percentOperacionais: percentOp,
      beneficiariosFamilias: benFamilias,
      beneficiariosPessoas: benPessoas,
      fontesPorTipo: porTipo,
      ultimaActualizacao: new Date().toISOString()
    };
  }

  function serie(c) {
    var mon = MonitoriaRepo.list({});
    var byMonth = {};
    mon.forEach(function(m){
      var ym = String(m.data_monitoria).substring(0, 7);
      if (!byMonth[ym]) byMonth[ym] = { ligDom: 0, fonts: 0 };
      byMonth[ym].ligDom += Number(m.n_ligdom) || 0;
      byMonth[ym].fonts += 1;
    });
    var labels = Object.keys(byMonth).sort();
    return {
      labels: labels,
      series: [
        { name: 'Ligações domiciliárias', data: labels.map(function(l){ return byMonth[l].ligDom; }) }
      ]
    };
  }

  function mapa(c) {
    var rows = [].concat(
      FonteRepo.list({ distrito: c.params.distrito }).map(function(f){
        return { tipo: 'fonte', codigo: f.codigo, lat: Number(f.y_wgs84), lon: Number(f.x_wgs84), label: f.nome_lugar, sub: f.tipo_fonte };
      }),
      SaaRepo.list({ distrito: c.params.distrito }).map(function(s){
        return { tipo: 'saa', codigo: s.codigo, lat: Number(s.y_wgs84), lon: Number(s.x_wgs84), label: s.nomecentro, sub: 'SAA' };
      })
    );
    return { points: rows.filter(function(p){ return p.lat && p.lon; }) };
  }

  return { kpis: kpis, serie: serie, mapa: mapa };
})();
