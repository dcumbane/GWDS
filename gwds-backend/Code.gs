/**
 * Gaza Water Data System (GWDS)
 * Web App entrypoint. Encaminha pedidos JSON para os controllers.
 *
 * URLs:
 *   GET  https://script.google.com/.../exec?_path=auth/me
 *   POST https://script.google.com/.../exec?_path=fontes      (body JSON)
 *
 * Padrão de erro: Problem Details (RFC 7807).
 */

var SPREADSHEET_ID = ''; // Preenchido pelo Setup.gs após primeira execução
var FOTOS_FOLDER_ID = ''; // Pasta do Drive para fotografias

function doGet(e)  { return _route(e, 'GET'); }
function doPost(e) { return _route(e, 'POST'); }

function _route(e, method) {
  try {
    var path = ((e && e.parameter && e.parameter._path) || '').replace(/^\//, '');
    var body = _parseBody(e);
    var ctx = { user: AuthService.requireUser(e), params: (e && e.parameter) || {}, body: body, method: method };

    var routes = {
      // Autenticação
      'auth/me':                  function(c){ return AuthController.me(c); },

      // Fontes
      'fontes':                   function(c){ return c.method === 'POST' ? FonteController.create(c) : FonteController.list(c); },
      'fontes/get':               function(c){ return FonteController.get(c); },
      'fontes/update':            function(c){ return FonteController.update(c); },
      'fontes/delete':            function(c){ return FonteController.softDelete(c); },

      // SAA
      'saa':                      function(c){ return c.method === 'POST' ? SaaController.create(c) : SaaController.list(c); },
      'saa/get':                  function(c){ return SaaController.get(c); },
      'saa/update':               function(c){ return SaaController.update(c); },
      'saa/delete':               function(c){ return SaaController.softDelete(c); },

      // Monitorias
      'monitorias':               function(c){ return c.method === 'POST' ? MonitoriaController.create(c) : MonitoriaController.list(c); },
      'monitorias/by-saa':        function(c){ return MonitoriaController.bySaa(c); },

      // Dashboards
      'dashboards/kpis':          function(c){ return DashboardController.kpis(c); },
      'dashboards/serie':         function(c){ return DashboardController.serie(c); },
      'dashboards/mapa':          function(c){ return DashboardController.mapa(c); },

      // Cascade
      'cascade/all':              function(c){ return AdminController.cascadeAll(c); },
      'cascade/validar':          function(c){ return AdminController.cascadeValidar(c); },

      // Admin
      'admin/users':              function(c){ return c.method === 'POST' ? AdminController.userUpsert(c) : AdminController.users(c); },
      'admin/cascade/upload':     function(c){ return AdminController.uploadCascade(c); },

      // Export
      'export':                   function(c){ return ExportController.run(c); }
    };

    var fn = routes[path];
    if (!fn) return _err(404, 'Rota não encontrada', path);
    var result = fn(ctx);
    return _json(result);
  } catch (err) {
    var st = err && err.status ? err.status : 500;
    var tt = err && err.title  ? err.title  : 'Erro interno';
    var dt = (err && err.message) || String(err);
    return _err(st, tt, dt);
  }
}

function _parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents); } catch (x) { return {}; }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _err(status, title, detail) {
  return ContentService.createTextOutput(JSON.stringify({
    type: 'about:blank', title: title, status: status, detail: detail
  })).setMimeType(ContentService.MimeType.JSON);
}

function _throw(status, title, detail) {
  var e = new Error(detail || title);
  e.status = status; e.title = title; throw e;
}
