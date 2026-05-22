import { Api } from '../api.js';
import { Exportar } from '../export.js';
import { Auth } from '../auth.js';

export async function renderSaa(app) {
  app.innerHTML = `
    <h2 style="margin:0 0 1rem; color:var(--c-primary);">Sistemas de Abastecimento de Água (SAA)</h2>
    <div class="toolbar">
      <input id="f-q" placeholder="Pesquisar…">
      <button class="btn btn-primary" id="b-filter">Filtrar</button>
      ${Auth.hasPerfil('ADMINISTRADOR','TEC_CADASTRO') ? `<a class="btn btn-primary" href="#/saa/novo">+ Novo SAA</a>` : ''}
      <button class="btn btn-secondary" id="b-pdf">PDF</button>
      <button class="btn btn-secondary" id="b-xlsx">Excel</button>
    </div>
    <div id="lista"></div>`;

  const load = async () => {
    const lista = document.getElementById('lista');
    lista.innerHTML = '<div class="loading">A carregar…</div>';
    const { items, total } = await Api.saa.list({ q: document.getElementById('f-q').value });
    if (items.length === 0) { lista.innerHTML = '<div class="alert alert-info">Sem SAA registados.</div>'; return; }
    lista.innerHTML = `<p style="color:var(--c-muted);">${total} resultado(s)</p>
      <table>
        <thead><tr><th>Código</th><th>Centro</th><th>Distrito</th><th>Tipo de rede</th><th>Captações</th><th>Reservatórios</th></tr></thead>
        <tbody>${items.map(s => `
          <tr>
            <td><strong>${s.codigo || ''}</strong></td><td>${s.nomecentro || ''}</td>
            <td>${s.distrito || ''}</td><td>${s.tipo_rede || ''}</td>
            <td>${s.n_capt || ''}</td><td>${s.n_armaz || ''}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  };
  document.getElementById('b-filter').onclick = load;
  document.getElementById('b-pdf').onclick = () => Exportar.pdf('saa');
  document.getElementById('b-xlsx').onclick = () => Exportar.xlsx('saa');
  await load();
}
