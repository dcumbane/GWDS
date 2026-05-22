import { Api } from '../api.js';
import { Exportar } from '../export.js';
import { Auth } from '../auth.js';

export async function renderFontes(app) {
  app.innerHTML = `
    <h2 style="margin:0 0 1rem; color:var(--c-primary);">Fontes Dispersas</h2>
    <div class="toolbar">
      <input id="f-q" placeholder="Pesquisar por código, nome ou aldeia…">
      <select id="f-tipo">
        <option value="">Todos os tipos</option>
        <option>Furo_Mecânico</option><option>Furo_Manual</option>
        <option>Poço</option><option>Fontanário</option><option>Nascente</option>
      </select>
      <button class="btn btn-primary" id="b-filter">Filtrar</button>
      ${Auth.hasPerfil('ADMINISTRADOR','TEC_CADASTRO') ? `<a class="btn btn-primary" href="#/fontes/nova">+ Nova fonte</a>` : ''}
      <button class="btn btn-secondary" id="b-pdf">PDF</button>
      <button class="btn btn-secondary" id="b-xlsx">Excel</button>
    </div>
    <div id="lista"></div>`;

  const load = async () => {
    const lista = document.getElementById('lista');
    lista.innerHTML = '<div class="loading">A carregar…</div>';
    const filtros = { q: document.getElementById('f-q').value, tipo: document.getElementById('f-tipo').value };
    const { items, total } = await Api.fontes.list(filtros);
    if (items.length === 0) { lista.innerHTML = '<div class="alert alert-info">Sem fontes para os critérios indicados.</div>'; return; }
    lista.innerHTML = `<p style="color:var(--c-muted);">${total} resultado(s)</p>
      <table>
        <thead><tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Distrito</th><th>Ano</th><th>Coordenadas</th></tr></thead>
        <tbody>${items.map(f => `
          <tr>
            <td><strong>${f.codigo || ''}</strong></td>
            <td>${f.nome_lugar || ''}</td>
            <td>${f.tipo_fonte || ''}</td>
            <td>${f.distrito || ''}</td>
            <td>${f.ano_const || ''}</td>
            <td>${f.x_wgs84 || ''} , ${f.y_wgs84 || ''}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  };
  document.getElementById('b-filter').onclick = load;
  document.getElementById('b-pdf').onclick = () => Exportar.pdf('fonte', { tipo: document.getElementById('f-tipo').value });
  document.getElementById('b-xlsx').onclick = () => Exportar.xlsx('fonte', { tipo: document.getElementById('f-tipo').value });
  await load();
}
