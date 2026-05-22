import { Api } from '../api.js';
import { Auth } from '../auth.js';

export async function renderAdmin(app) {
  if (!Auth.hasPerfil('ADMINISTRADOR')) {
    app.innerHTML = '<div class="alert alert-error">Acesso restrito a Administradores.</div>'; return;
  }
  app.innerHTML = `
    <div class="card">
      <h2>Utilizadores</h2>
      <form id="f-user">
        <div class="field"><label>E-mail</label><input name="email" required></div>
        <div class="field"><label>Nome</label><input name="nome"></div>
        <div class="field"><label>Perfil</label>
          <select name="perfil">
            <option>ADMINISTRADOR</option><option>TEC_CADASTRO</option>
            <option>TEC_MONITORIA</option><option>GESTOR</option>
          </select>
        </div>
        <div class="field"><button class="btn btn-primary" type="submit">Adicionar / actualizar</button></div>
      </form>
      <div id="msg"></div>
      <h3>Utilizadores cadastrados</h3>
      <div id="lista-users"></div>
    </div>

    <div class="card">
      <h2>Tabela AKVO Cascade</h2>
      <p>Carregue um ficheiro CSV ou Excel com as colunas <code>provincia, distrito, posto, localidade</code>.
      A tabela activa será substituída.</p>
      <div class="field"><input type="file" id="cascade-file" accept=".csv,.xlsx"></div>
      <button class="btn btn-primary" id="b-upload">Carregar e substituir</button>
      <div id="cascade-msg"></div>
    </div>`;

  const refresh = async () => {
    const { items } = await Api.admin.users();
    document.getElementById('lista-users').innerHTML = `
      <table><thead><tr><th>E-mail</th><th>Nome</th><th>Perfil</th><th>Activo</th></tr></thead>
      <tbody>${items.map(u => `<tr><td>${u.email}</td><td>${u.nome || ''}</td><td>${u.perfil}</td><td>${u.activo}</td></tr>`).join('')}</tbody></table>`;
  };
  await refresh();

  document.getElementById('f-user').onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try { await Api.admin.upsert(body); document.getElementById('msg').innerHTML = '<div class="alert alert-success">Gravado.</div>'; await refresh(); }
    catch (err) { document.getElementById('msg').innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  };

  document.getElementById('b-upload').onclick = async () => {
    const file = document.getElementById('cascade-file').files[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    let rows = [];
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    } else {
      const text = new TextDecoder().decode(buf);
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const headers = lines.shift().split(',').map(h => h.trim());
      rows = lines.map(l => { const parts = l.split(','); const o = {}; headers.forEach((h,i) => o[h] = (parts[i]||'').trim()); return o; });
    }
    try {
      const r = await Api.cascade.upload(rows);
      document.getElementById('cascade-msg').innerHTML = `<div class="alert alert-success">${r.linhasGravadas} linhas carregadas.</div>`;
    } catch (err) {
      document.getElementById('cascade-msg').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  };
}
