import { Api } from '../api.js';

let _chart, _map, _markers;

export async function renderDashboard(app) {
  app.innerHTML = `
    <h2 style="margin:0 0 1rem; color:var(--c-primary);">Dashboard provincial</h2>
    <div class="toolbar">
      <select id="f-distrito">
        <option value="">Todos os distritos</option>
        <option>Bilene</option><option>Chibuto</option><option>Chicualacuala</option>
        <option>Chigubo</option><option>Chókwè</option><option>Chongoene</option>
        <option>Guijá</option><option>Limpopo</option><option>Mabalane</option>
        <option>Mandlakazi</option><option>Massangena</option><option>Massingir</option>
        <option>Xai-Xai</option>
      </select>
      <button class="btn btn-primary" id="btn-refresh">Aplicar filtro</button>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="label">Fontes dispersas</div><div class="value" id="kpi-fontes">…</div></div>
      <div class="kpi success"><div class="label">SAA operacionais</div><div class="value" id="kpi-saa-op">…</div></div>
      <div class="kpi"><div class="label">SAA totais</div><div class="value" id="kpi-saa">…</div></div>
      <div class="kpi"><div class="label">% Operacionais</div><div class="value" id="kpi-pct">…</div></div>
      <div class="kpi"><div class="label">Famílias beneficiárias</div><div class="value" id="kpi-fami">…</div></div>
      <div class="kpi"><div class="label">Pessoas beneficiárias</div><div class="value" id="kpi-pess">…</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Fontes por tipo</h3>
        <canvas id="ch-tipos" height="220"></canvas>
      </div>
      <div class="card">
        <h3>Mapa de pontos</h3>
        <div id="mapa"></div>
      </div>
    </div>`;

  document.getElementById('btn-refresh').onclick = loadAll;
  document.getElementById('f-distrito').onchange = loadAll;
  await loadAll();
}

async function loadAll() {
  const distrito = document.getElementById('f-distrito').value;
  const [k, m] = await Promise.all([
    Api.dashboards.kpis({ distrito }),
    Api.dashboards.mapa({ distrito })
  ]);
  document.getElementById('kpi-fontes').textContent = k.totalFontes;
  document.getElementById('kpi-saa-op').textContent = k.operacionais;
  document.getElementById('kpi-saa').textContent = k.totalSAA;
  document.getElementById('kpi-pct').textContent = k.percentOperacionais + '%';
  document.getElementById('kpi-fami').textContent = k.beneficiariosFamilias.toLocaleString('pt-PT');
  document.getElementById('kpi-pess').textContent = k.beneficiariosPessoas.toLocaleString('pt-PT');

  const labels = Object.keys(k.fontesPorTipo);
  const data = labels.map(l => k.fontesPorTipo[l]);
  if (_chart) _chart.destroy();
  _chart = new Chart(document.getElementById('ch-tipos'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: ['#1F4E79','#2E75B6','#5B9BD5','#9DC3E6','#BDD7EE','#DEEBF7'] }] },
    options: { plugins: { legend: { position: 'right' } } }
  });

  if (!_map) {
    _map = L.map('mapa').setView([-24.5, 33.2], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(_map);
    _markers = L.layerGroup().addTo(_map);
  }
  _markers.clearLayers();
  m.points.forEach(p => {
    const color = p.tipo === 'saa' ? '#1F4E79' : '#16A34A';
    const marker = L.circleMarker([p.lat, p.lon], { radius: 6, color, weight: 2, fillOpacity: 0.7 });
    marker.bindPopup(`<strong>${p.label || p.codigo}</strong><br>${p.tipo.toUpperCase()} · ${p.sub || ''}<br>${p.codigo}`);
    _markers.addLayer(marker);
  });
}
