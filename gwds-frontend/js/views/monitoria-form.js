import { Api } from '../api.js';

export async function renderMonitoriaForm(app) {
  app.innerHTML = `
    <div class="card">
      <h2>Registar Monitoria de SAA</h2>
      <form id="form">
        <div class="field"><label>Código do SAA <span class="req">*</span></label><input name="saa_codigo" required></div>
        <div class="field"><label>Data <span class="req">*</span></label><input type="date" name="data_monitoria" required></div>
        <div class="field"><label>Estado <span class="req">*</span></label>
          <select name="estado" required>
            <option value="">--</option>
            <option>Operacional</option><option>Parcialmente Operacional</option>
            <option>Avariado</option><option>Desactivado</option>
          </select>
        </div>
        <div class="field"><label>Condutividade (µS/cm)</label><input type="number" name="cond_us_cm" min="0"></div>
        <div class="field"><label>Sabor</label>
          <select name="sabor_agua"><option value="">--</option><option>Insípida</option><option>Salgada</option><option>Doce</option><option>Amarga</option></select>
        </div>
        <div class="field"><label>Cor</label>
          <select name="cor_agua"><option value="">--</option><option>Clara</option><option>Turva</option><option>Amarelada</option><option>Castanha</option></select>
        </div>
        <div class="field"><label>Cheiro</label>
          <select name="cheir_agua"><option value="">--</option><option>Sem_cheiro</option><option>Cloro</option><option>Esgoto</option><option>Outro</option></select>
        </div>
        <div class="field"><label>Tratamento</label><input name="trat_agua" placeholder="ex: Cloração, Filtração"></div>
        <div class="field"><label>Famílias beneficiárias</label><input type="number" name="n_ben_fami" min="0"></div>
        <div class="field"><label>Pessoas beneficiárias</label><input type="number" name="n_ben_pess" min="0"></div>
        <div class="field"><label>Modo de gestão</label>
          <select name="mod_gestao"><option value="">--</option><option>Pública</option><option>Privada</option><option>Comunitária</option><option>Mista</option></select>
        </div>
        <div class="field"><label>Responsável</label><input name="nom_respon"></div>
        <div class="field"><label>Sexo</label>
          <select name="sex_respon"><option value="">--</option><option>Masculino</option><option>Feminino</option></select>
        </div>
        <div class="field"><label>Telefone 1</label><input name="tl1_respon"></div>
        <div class="field"><label>Ligações domiciliárias</label><input type="number" name="n_ligdom" min="0"></div>
        <div class="field"><label>Torneiras de quintal</label><input type="number" name="n_torqui" min="0"></div>
        <div class="field"><label>Fontanários</label><input type="number" name="n_fontan" min="0"></div>
        <div class="field"><label>Ligações comerciais</label><input type="number" name="n_ligcom" min="0"></div>
        <div class="field"><label>Ligações industriais</label><input type="number" name="n_ligind" min="0"></div>
        <div class="field"><label>Tipo de facturação</label>
          <select name="tipo_fact"><option value="">--</option><option>Contador_(m3)</option><option>Bidão</option><option>Fixo</option><option>Sem_facturação</option></select>
        </div>
        <div class="field"><label>Preço m³ (MZN)</label><input type="number" step="0.01" name="pr_m3c_mzn"></div>
        <div class="field"><label>Facturação mensal (MZN)</label><input type="number" step="0.01" name="fat_m_mzn"></div>
        <div class="field"><label>Receita mensal (MZN)</label><input type="number" step="0.01" name="rec_m_mzn"></div>

        <div class="field full" style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary" type="submit">Gravar</button>
          <a class="btn btn-secondary" href="#/monitorias">Cancelar</a>
        </div>
      </form>
      <div id="msg"></div>
    </div>`;

  document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    const msg = document.getElementById('msg'); msg.innerHTML = '<div class="loading">A submeter…</div>';
    try {
      const r = await Api.monitorias.create(body);
      msg.innerHTML = `<div class="alert alert-success">Monitoria registada (id ${r.id}).</div>`;
      e.target.reset();
    } catch (err) {
      msg.innerHTML = `<div class="alert alert-error"><strong>${err.payload?.title || 'Erro'}</strong>: ${err.message}</div>`;
    }
  };
}
