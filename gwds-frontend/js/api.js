import { CONFIG } from './config.js';

async function request(method, path, body, params) {
  const url = new URL(CONFIG.API_BASE);
  url.searchParams.set('_path', path);
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v); });

  const opts = { method, redirect: 'follow' };
  if (body) {
    // Apps Script aceita JSON via raw body em doPost; para evitar pré-flight CORS, usamos text/plain.
    opts.body = JSON.stringify(body);
    opts.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok || (data && data.status >= 400)) {
    const err = new Error(data?.detail || data?.title || `HTTP ${res.status}`);
    err.status = data?.status || res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const Api = {
  me:     () => request('GET',  'auth/me'),
  fontes: {
    list:   (filtros) => request('GET',  'fontes', null, filtros),
    get:    (codigo)  => request('GET',  'fontes/get', null, { codigo }),
    create: (body)    => request('POST', 'fontes', body),
    update: (codigo, body) => request('POST', 'fontes/update', body, { codigo }),
    remove: (codigo)  => request('POST', 'fontes/delete', null, { codigo })
  },
  saa: {
    list:   (filtros) => request('GET',  'saa', null, filtros),
    get:    (codigo)  => request('GET',  'saa/get', null, { codigo }),
    create: (body)    => request('POST', 'saa', body),
    update: (codigo, body) => request('POST', 'saa/update', body, { codigo }),
    remove: (codigo)  => request('POST', 'saa/delete', null, { codigo })
  },
  monitorias: {
    list:   (filtros) => request('GET',  'monitorias', null, filtros),
    bySaa:  (codigo)  => request('GET',  'monitorias/by-saa', null, { codigo }),
    create: (body)    => request('POST', 'monitorias', body)
  },
  dashboards: {
    kpis:  (filtros) => request('GET', 'dashboards/kpis', null, filtros),
    serie: (filtros) => request('GET', 'dashboards/serie', null, filtros),
    mapa:  (filtros) => request('GET', 'dashboards/mapa', null, filtros)
  },
  cascade: {
    all:     () => request('GET',  'cascade/all'),
    validar: (q) => request('GET', 'cascade/validar', null, q),
    upload:  (rows) => request('POST', 'admin/cascade/upload', { rows })
  },
  admin: {
    users:   () => request('GET',  'admin/users'),
    upsert:  (u) => request('POST', 'admin/users', u)
  },
  export: (q) => request('GET', 'export', null, q)
};
