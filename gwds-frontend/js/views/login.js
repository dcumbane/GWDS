import { CONFIG } from '../config.js';
export function renderLogin(app) {
  app.innerHTML = `
    <div class="card login-box">
      <h2>Bem-vindo ao Gaza Water Data System</h2>
      <p>Sistema de recolha, análise e visualização de dados de infraestruturas
      de abastecimento de água da ${CONFIG.ORGANIZATION}.</p>
      <p>O acesso é feito com a sua conta Google institucional.</p>
      <a class="btn btn-google" href="${CONFIG.API_BASE}?_path=auth/me" target="_blank">
        Entrar com Google
      </a>
      <p style="margin-top:1.5rem; color: var(--c-muted); font-size: 0.85rem;">
        Após autorizar o acesso, regresse a esta página e clique em
        <a href="#/dashboard">Dashboard</a>.
      </p>
    </div>`;
}
