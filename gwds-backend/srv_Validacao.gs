/**
 * Validações de domínio (cascata AKVO, regras de negócio).
 */
var ValidacaoService = (function() {
  function unidade(prov, dist, posto, loc) {
    if (CascadeRepo.exists(prov, dist, posto, loc)) return { ok: true };
    return { ok: false, sugestoes: CascadeRepo.fuzzyMatch(prov, dist, posto, loc, 3) };
  }

  // RN-02: codigo no padrão DDDDDD/NNNN/AAAA
  function codigo(c) {
    return /^\d{6}\/\d{4}\/\d{4}$/.test(String(c || ''));
  }

  // RN-03: WGS84 dentro da faixa moçambicana
  function wgs84(x, y) {
    var lon = Number(x), lat = Number(y);
    return lon >= 30 && lon <= 41 && lat >= -27 && lat <= -10;
  }

  // RN-04
  var ESTADOS_SAA = ['Operacional', 'Parcialmente Operacional', 'Avariado', 'Desactivado'];
  function estadoSaa(e) { return ESTADOS_SAA.indexOf(e) >= 0; }

  // RN-05
  function qualidade(m) {
    var d = {
      sabor: ['Insípida','Salgada','Doce','Amarga'],
      cor: ['Clara','Turva','Amarelada','Castanha'],
      cheiro: ['Sem_cheiro','Cloro','Esgoto','Outro']
    };
    if (m.sabor_agua && d.sabor.indexOf(m.sabor_agua) < 0) return false;
    if (m.cor_agua && d.cor.indexOf(m.cor_agua) < 0) return false;
    if (m.cheir_agua && d.cheiro.indexOf(m.cheir_agua) < 0) return false;
    return true;
  }

  return { unidade: unidade, codigo: codigo, wgs84: wgs84, estadoSaa: estadoSaa, qualidade: qualidade };
})();
