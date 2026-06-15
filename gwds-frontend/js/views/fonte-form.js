import { Api } from '../api.js';
import { wgs84ToUtm } from '../geo.js';

export async function renderFonteForm(app) {
  app.innerHTML = `
    <div class="card">
      <h2>Cadastrar nova Fonte Dispersa</h2>
      <form id="form">
        <div class="field"><label>Província <span class="req">*</span></label><input name="provincia" value="Gaza" required></div>
        <div class="field"><label>Distrito <span class="req">*</span></label><input name="distrito" required></div>
        <div class="field"><label>Posto Administrativo <span class="req">*</span></label><input name="posto_adm" required></div>
        <div class="field"><label>Localidade <span class="req">*</span></label><input name="localidade" required></div>
        <div class="field"><label>Aldeia / Bairro</label><input name="aldei_bair"></div>
        <div class="field"><label>Código <span class="req">*</span></label><input name="codigo" placeholder="090201/0001/2026" pattern="\\d{6}/\\d{4}/\\d{4}" required></div>
        <div class="field"><label>Nome do lugar</label><input name="nome_lugar"></div>
        <div class="field"><label>Tipo de fonte <span class="req">*</span></label>
          <select name="tipo_fonte" required>
            <option value="">--</option>
            <option>Furo_Mecânico</option><option>Furo_Manual</option>
            <option>Poço</option><option>Fontanário</option><option>Nascente</option>
          </select>
        </div>
        <div class="field"><label>Ano de construção</label><input type="number" name="ano_const" min="1900" max="2100"></div>
        <div class="field"><label>Empreiteiro</label><input name="nome_empre"></div>
        <div class="field"><label>Fiscal</label><input name="nome_fisc"></div>
        <div class="field"><label>Financiador</label><input name="nome_finan"></div>
        <div class="field"><label>Custo (MZN)</label><input type="number" step="0.01" name="custo_mzn"></div>

        <div class="field"><label>Tipo de bomba</label>
          <select name="tipo_bomba"><option value="">--</option><option>Manual</option><option>Eléctrica</option><option>Solar</option></select>
        </div>
        <div class="field"><label>Marca da bomba</label><input name="marc_bomba"></div>
        <div class="field"><label>Profundidade do furo (m)</label><input type="number" step="0.01" name="prof_fp_m"></div>
        <div class="field"><label>Diâmetro do furo (cm)</label><input type="number" step="0.01" name="diam_fp_cm"></div>
        <div class="field"><label>Caudal (m³/h)</label><input type="number" step="0.01" name="q_fp_m3h"></div>
        <div class="field"><label>Tipo de energia</label>
          <select name="tipo_energ"><option value="">--</option><option>Manual</option><option>EDM</option><option>Solar</option><option>Gerador</option><option>Não_aplicável</option></select>
        </div>

        <div class="field"><label>Longitude WGS84 <span class="req">*</span></label><input type="number" step="any" name="x_wgs84" required id="lon"></div>
        <div class="field"><label>Latitude WGS84 <span class="req">*</span></label><input type="number" step="any" name="y_wgs84" required id="lat"></div>
        <div class="field"><label>X UTM</label><input name="x_utm" readonly></div>
        <div class="field"><label>Y UTM</label><input name="y_utm" readonly></div>
        <div class="field full"><label>Observações</label><textarea name="obs_lev"></textarea></div>
        <div class="field full"><label>Fotografia (JPG/PNG)</label><input type="file" id="foto" accept="image/*"></div>

        <div class="field full" style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary" type="submit">Gravar</button>
          <a class="btn btn-secondary" href="#/fontes">Cancelar</a>
        </div>
      </form>
      <div id="msg"></div>
    </div>`;

  const lon = document.getElementById('lon'), lat = document.getElementById('lat');
  const updateUtm = () => {
    const utm = wgs84ToUtm(lon.value, lat.value);
    document.querySelector('[name=x_utm]').value = utm.x;
    document.querySelector('[name=y_utm]').value = utm.y;
  };
  lon.oninput = updateUtm; lat.oninput = updateUtm;

  document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    const file = document.getElementById('foto').files[0];
    if (file) {
      body.foto_base64 = await new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(file); });
    }
    const msg = document.getElementById('msg'); msg.innerHTML = '<div class="loading">A submeter…</div>';
    try {
      const r = await Api.fontes.create(body);
      msg.innerHTML = `<div class="alert alert-success">Fonte registada com código <strong>${r.codigo}</strong>.</div>`;
      e.target.reset();
    } catch (err) {
      let extra = '';
      if (err.status === 422 && err.payload?.title?.includes('AKVO')) {
        try { const sug = JSON.parse(err.payload.detail); extra = '<br>Sugestões: ' + sug.map(s => `${s.provincia}/${s.distrito}/${s.posto}/${s.localidade}`).join(' · '); } catch {}
      }
      msg.innerHTML = `<div class="alert alert-error"><strong>${err.payload?.title || 'Erro'}</strong>: ${err.message}${extra}</div>`;
    }
  };
}
