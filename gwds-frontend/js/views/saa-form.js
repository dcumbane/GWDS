import { Api } from '../api.js';
import { wgs84ToUtm } from '../geo.js';

export async function renderSaaForm(app) {
  app.innerHTML = `
    <div class="card">
      <h2>Cadastrar novo SAA</h2>
      <form id="form">
        <div class="field"><label>Província <span class="req">*</span></label><input name="provincia" value="Gaza" required></div>
        <div class="field"><label>Distrito <span class="req">*</span></label><input name="distrito" required></div>
        <div class="field"><label>Posto Administrativo <span class="req">*</span></label><input name="posto_adm" required></div>
        <div class="field"><label>Localidade <span class="req">*</span></label><input name="localidade" required></div>
        <div class="field"><label>Código <span class="req">*</span></label><input name="codigo" pattern="\\d{6}/\\d{4}/\\d{4}" required></div>
        <div class="field"><label>Nome do centro</label><input name="nomecentro"></div>
        <div class="field"><label>Bairros abrangidos</label><input name="bairros"></div>
        <div class="field"><label>Ano de construção</label><input type="number" name="ano_const"></div>
        <div class="field"><label>Propriedade</label>
          <select name="propried"><option value="">--</option><option>Do_estado</option><option>Privada</option><option>Comunitária</option><option>Mista</option></select>
        </div>
        <div class="field"><label>N.º captações</label><input type="number" name="n_capt"></div>
        <div class="field"><label>N.º reservatórios</label><input type="number" name="n_armaz"></div>
        <div class="field"><label>Tipo de rede</label>
          <select name="tipo_rede"><option value="">--</option><option>Ramificada</option><option>Malhada</option><option>Mista</option></select>
        </div>
        <div class="field"><label>Material adução</label><input name="mat_adut"></div>
        <div class="field"><label>Comprimento adução (m)</label><input type="number" name="l_adut_m"></div>
        <div class="field"><label>Material rede</label><input name="mat_rede"></div>
        <div class="field"><label>Comprimento rede (m)</label><input type="number" name="l_rede_m"></div>
        <div class="field"><label>Tipo energia</label><input name="tipo_energ"></div>
        <div class="field"><label>Tipo captação 1</label><input name="tipocap_c1"></div>
        <div class="field"><label>Longitude WGS84 <span class="req">*</span></label><input type="number" step="0.0000001" name="x_wgs84" required id="lon"></div>
        <div class="field"><label>Latitude WGS84 <span class="req">*</span></label><input type="number" step="0.0000001" name="y_wgs84" required id="lat"></div>
        <div class="field"><label>X UTM</label><input name="x_utm" readonly></div>
        <div class="field"><label>Y UTM</label><input name="y_utm" readonly></div>
        <div class="field full" style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary" type="submit">Gravar</button>
          <a class="btn btn-secondary" href="#/saa">Cancelar</a>
        </div>
      </form>
      <div id="msg"></div>
    </div>`;
  const lon = document.getElementById('lon'), lat = document.getElementById('lat');
  const updateUtm = () => {
    const u = wgs84ToUtm(lon.value, lat.value);
    document.querySelector('[name=x_utm]').value = u.x;
    document.querySelector('[name=y_utm]').value = u.y;
  };
  lon.oninput = updateUtm; lat.oninput = updateUtm;

  document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    const msg = document.getElementById('msg'); msg.innerHTML = '<div class="loading">A submeter…</div>';
    try {
      const r = await Api.saa.create(body);
      msg.innerHTML = `<div class="alert alert-success">SAA registado com código <strong>${r.codigo}</strong>.</div>`;
      e.target.reset();
    } catch (err) {
      msg.innerHTML = `<div class="alert alert-error"><strong>${err.payload?.title || 'Erro'}</strong>: ${err.message}</div>`;
    }
  };
}
