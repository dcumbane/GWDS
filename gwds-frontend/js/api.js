/**
 * Camada de comunicação com a Web App do Apps Script.
 *
 * Por causa do redirect interno do Apps Script de script.google.com
 * para script.googleusercontent.com, fetch() cross-origin falha por
 * ausência de header Access-Control-Allow-Origin. A solução padrão
 * é JSONP: injectar uma <script> que carrega "exec?_callback=fn".
 * O Apps Script devolve um script "fn({...})" e o navegador executa-o.
 *
 * Vantagens: funciona sempre, sem proxy, sem alterações de domínio.
 * Limites: o "body" vai por query string, com tecto à volta de 8 KB
 * em navegadores modernos. Para fotografias grandes, ver upload abaixo.
 */

let _seq = 0;

function jsonp(path, payload) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.API_BASE || CONFIG.API_BASE.indexOf('AKfycb') === -1) {
      return reject(new Error('API_BASE não configurado em js/config.js'));
    }
    const cbName = '__gwds_cb_' + (++_seq) + '_' + Date.now();
    const url = new URL(CONFIG.API_BASE);
    url.searchParams.set('_path', path);
    url.searchParams.set('_callback', cbName);
    if (payload) url.searchParams.set('_payload', JSON.stringify(payload));

    const script = document.createElement('script');
    let done = false;
    const cleanup = () => {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const timer = setTimeout(() => {
      if (done) return;
      done = true; cleanup();
      reject(new Error('Tempo esgotado (30 s) ao contactar a Web App. Confirme o URL em config.js.'));
    }, 30000);

    window[cbName] = (data) => {
      done = true; clearTimeout(timer); cleanup();
      if (data && data.status >= 400) {
        const err = new Error(data.detail || data.title || 'Erro');
        err.status = data.status; err.payload = data;
        reject(err);
      } else {
        resolve(data);
      }
    };
    script.onerror = () => {
      if (done) return;
      done = true; clearTimeout(timer); cleanup();
      reject(new Error('Falha de rede ao carregar a Web App.'));
    };
    script.src = url.toString();
    document.head.appendChild(script);
  });
}

/**
 * Upload de fotografia via formulário oculto + iframe.
 * Necessário porque base64 grande não cabe em querystring.
 */
function formUpload(path, payload) {
  return new Promise((resolve, reject) => {
    const iframeName = '__gwds_iframe_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = CONFIG.API_BASE + '?_path=' + encodeURIComponent(path);
    form.target = iframeName;
    form.enctype = 'application/x-www-form-urlencoded';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);
    document.body.appendChild(form);

    iframe.onload = () => {
      try {
        const text = iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerText;
        const data = JSON.parse(text);
        document.body.removeChild(iframe);
        document.body.removeChild(form);
        if (data && data.status >= 400) {
          const err = new Error(data.detail || data.title || 'Erro');
          err.status = data.status; err.payload = data; reject(err);
        } else resolve(data);
      } catch (e) {
        document.body.removeChild(iframe);
        document.body.removeChild(form);
        reject(new Error('Resposta inválida do servidor.'));
      }
    };
    form.submit();
  });
}

async function call(path, payload, opts) {
  opts = opts || {};
  if (opts.upload) return formUpload(path, payload || {});
  return jsonp(path, payload);
}

export const Api = {
  me:     () => call('auth/me'),
  fontes: {
    list:   (filtros) => call('fontes/list', filtros || {}),
    get:    (codigo)  => call('fontes/get', { codigo }),
    create: (body)    => call('fontes/create', body, { upload: !!body.foto_base64 }),
    update: (codigo, body) => call('fontes/update', Object.assign({ codigo }, body)),
    remove: (codigo)  => call('fontes/delete', { codigo })
  },
  saa: {
    list:   (filtros) => call('saa/list', filtros || {}),
    get:    (codigo)  => call('saa/get', { codigo }),
    create: (body)    => call('saa/create', body),
    update: (codigo, body) => call('saa/update', Object.assign({ codigo }, body)),
    remove: (codigo)  => call('saa/delete', { codigo })
  },
  monitorias: {
    list:   (filtros) => call('monitorias/list', filtros || {}),
    bySaa:  (codigo)  => call('monitorias/by-saa', { codigo }),
    create: (body)    => call('monitorias/create', body)
  },
  dashboards: {
    kpis:  (filtros) => call('dashboards/kpis', filtros || {}),
    serie: (filtros) => call('dashboards/serie', filtros || {}),
    mapa:  (filtros) => call('dashboards/mapa', filtros || {})
  },
  cascade: {
    all:     () => call('cascade/all'),
    validar: (q) => call('cascade/validar', q),
    upload:  (rows) => call('admin/cascade/upload', { rows }, { upload: true })
  },
  admin: {
    users:   () => call('admin/users'),
    upsert:  (u) => call('admin/users/upsert', u)
  },
  export: (q) => call('export', q || {})
};

