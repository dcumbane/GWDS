import { Api } from '../api.js';
import { Exportar } from '../export.js';
import { Auth } from '../auth.js';

const tagEstado = (e) => {
  const c = e === 'Operacional' ? 'operacional' : e === 'Parcialmente Operacional' ? 'parcial' : 'avariado';
  return `<span class="tag ${c}">${e || ''}</span>`;
};

export async function renderMonitorias(app) {
  app.innerHTML = `
    <h2 style="margin:0 0 1rem; color:var(--c-primary);">Monitorias de SAA</h2>
    <div class="toolbar">
      <input id="f-saa" placeholder="Código do SAA">
      <select id="f-estado">
        <option value="">Qualquer estado</option>
        <option>Operacional</option><option>Parcialmente Operacional</option>
        <option>Avariado</option><option>Desactivado</option>
      </select>
      <button class="btn btn-primary" id="b-filter">Filtrar</button>
      ${Auth.hasPerfil('ADMINISTRADOR','TEC_MONITORIA','TEC_CADASTRO') ? `<a class="btn btn-primary" href="#/monitorias/nova">+ Nova monitoria</a>` : ''}
      <button class="btn btn-secondary" id="b-pdf">PDF</button>
      <button class="btn btn-secondary" id="b-xlsx">Excel</button>
    </div>
    <div id="lista"></div>`;

  const load = async () => {
    const lista = document.getElementById('lista');
    lista.innerHTML = '<div class="loading">A carregar…</div>';
    const { items, total } = await Api.monitorias.list({
      saa: document.getElementById('f-saa').value,
      estado: document.getElementById('f-estado').value
    });
    if (items.length === 0) { lista.innerHTML = '<div class="alert alert-info">Sem monitorias.</div>'; return; }
    lista.innerHTML = `<p style="color:var(--c-muted);">${total} resultado(s)</p>
      <table>
        <thead><tr><th>Data</th><th>SAA</th><th>Estado</th><th>Lig. Dom.</th><th>Famílias</th><th>Receita (MZN)</th><th>Responsável</th></tr></thead>
        <tbody>${items.map(m => `
          <tr>
            <td>${(m.data_monitoria || '').substring(0,10)}</td>
            <td><strong>${m.saa_codigo || ''}</strong></td>
            <td>${tagEstado(m.estado)}</td>
            <td>${m.n_ligdom || 0}</td>
            <td>${m.n_ben_fami || 0}</td>
            <td>${m.rec_m_mzn ? Number(m.rec_m_mzn).toLocaleString('pt-PT') : ''}</td>
            <td>${m.nom_respon || ''}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  };
  document.getElementById('b-filter').onclick = load;
  document.getElementById('b-pdf').onclick = () => Exportar.pdf('monitoria');
  document.getElementById('b-xlsx').onclick = () => Exportar.xlsx('monitoria');
  await load();
}
