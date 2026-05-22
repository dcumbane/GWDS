import { Exportar } from '../export.js';

export async function renderRelatorios(app) {
  app.innerHTML = `
    <div class="card">
      <h2>Relatórios</h2>
      <p>Gera relatórios em PDF ou Excel da entidade escolhida, respeitando os filtros opcionais.</p>
      <form id="form-rel">
        <div class="field">
          <label>Entidade</label>
          <select name="entidade">
            <option value="fonte">Fontes Dispersas</option>
            <option value="saa">SAA</option>
            <option value="monitoria">Monitorias</option>
          </select>
        </div>
        <div class="field"><label>Distrito (opcional)</label><input name="distrito"></div>
        <div class="field"><label>Ano (opcional, só para Fontes)</label><input name="ano"></div>
        <div class="field full" style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary" id="b-pdf">Gerar PDF</button>
          <button class="btn btn-secondary" id="b-xlsx">Gerar Excel</button>
        </div>
      </form>
      <div id="msg"></div>
    </div>`;

  const click = async (formato) => {
    const fd = new FormData(document.getElementById('form-rel'));
    const ent = fd.get('entidade');
    const filtros = { distrito: fd.get('distrito'), ano: fd.get('ano') };
    try { await Exportar[formato](ent, filtros); }
    catch (e) { document.getElementById('msg').innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
  };
  document.getElementById('b-pdf').onclick  = (e) => { e.preventDefault(); click('pdf'); };
  document.getElementById('b-xlsx').onclick = (e) => { e.preventDefault(); click('xlsx'); };
}
