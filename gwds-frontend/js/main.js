import { Auth } from './auth.js';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderFontes } from './views/fontes.js';
import { renderFonteForm } from './views/fonte-form.js';
import { renderSaa } from './views/saa.js';
import { renderSaaForm } from './views/saa-form.js';
import { renderMonitorias } from './views/monitorias.js';
import { renderMonitoriaForm } from './views/monitoria-form.js';
import { renderRelatorios } from './views/relatorios.js';
import { renderAdmin } from './views/admin.js';
import { CONFIG } from './config.js';

const routes = {
  '/login':            renderLogin,
  '/dashboard':        renderDashboard,
  '/fontes':           renderFontes,
  '/fontes/nova':      renderFonteForm,
  '/saa':              renderSaa,
  '/saa/novo':         renderSaaForm,
  '/monitorias':       renderMonitorias,
  '/monitorias/nova':  renderMonitoriaForm,
  '/relatorios':       renderRelatorios,
  '/admin':            renderAdmin
};

function setNav(active) {
  const nav = document.getElementById('nav');
  const links = [
    ['#/dashboard', 'Dashboard'],
    ['#/fontes',    'Fontes'],
    ['#/saa',       'SAA'],
    ['#/monitorias','Monitorias'],
    ['#/relatorios','Relatórios']
  ];
  if (Auth.hasPerfil('ADMINISTRADOR')) links.push(['#/admin', 'Admin']);
  nav.innerHTML = links.map(([h, t]) =>
    `<a href="${h}" class="${active === h.substring(1) ? 'active' : ''}">${t}</a>`).join('');
  nav.classList.remove('hidden');
}

function setUserBar() {
  const ub = document.getElementById('userbar');
  const u = Auth.current();
  if (!u) { ub.innerHTML = ''; return; }
  ub.innerHTML = `
    <span>${u.nome || u.email}</span>
    <span class="badge">${u.perfil}</span>
    <button class="btn btn-secondary" id="btn-logout">Sair</button>`;
  document.getElementById('btn-logout').onclick = () => { Auth.logout(); };
}

async function router() {
  const app = document.getElementById('app');
  const hash = window.location.hash.substring(1) || '/dashboard';

  if (CONFIG.API_BASE === 'COLOCAR_AQUI_O_URL_DA_WEB_APP') {
    app.innerHTML = `
      <div class="alert alert-info">
        <strong>Configuração pendente.</strong><br>
        Edite <code>js/config.js</code> e coloque, em <code>API_BASE</code>, o URL da Web App
        publicada no Apps Script. Sem isso, o front-end não pode comunicar com o backend.
      </div>`;
    return;
  }

  // Login first
  if (!Auth.current()) {
    try { await Auth.load(); }
    catch { window.location.hash = '#/login'; renderLogin(app); return; }
  }

  const route = routes[hash] || renderDashboard;
  setNav(hash);
  setUserBar();
  app.innerHTML = '<div class="loading">A carregar…</div>';
  try { await route(app); }
  catch (e) {
    app.innerHTML = `<div class="alert alert-error"><strong>Erro:</strong> ${e.message}</div>`;
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
