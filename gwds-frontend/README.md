# GWDS Front-end

SPA estática do Gaza Water Data System.

## ⚠️ Importante: como executar localmente

A SPA usa **módulos JavaScript (ES6 imports)**, que os navegadores modernos só executam quando a página é servida por HTTP. Abrir `index.html` directamente do disco (URL `file:///...`) **não funciona** e o ecrã fica preso em "A carregar…".

### Três formas de iniciar a SPA

**Opção 1. Duplo-clique no `start-windows.bat`** (Windows com Python instalado).
Abre automaticamente o navegador em `http://localhost:8000`.

**Opção 2. Extensão Live Server do VS Code** (recomendado se desenvolve em VS Code).
1. Instale a extensão *Live Server* (Ritwick Dey).
2. Abra a pasta `gwds-frontend/` no VS Code.
3. Clique direito em `index.html` → *Open with Live Server*.

**Opção 3. Servidor Python na linha de comando.**
```bash
cd gwds-frontend/
python -m http.server 8000      # Windows
python3 -m http.server 8000     # Linux/macOS
```
Depois abra `http://localhost:8000`.

> Após o deploy no GitHub Pages, este passo não é necessário: o GitHub Pages é um servidor HTTP, e qualquer pessoa abre o URL público directamente no navegador.

## Configuração

Editar `js/config.js` e definir o URL da Web App publicada no Apps Script:

```js
export const CONFIG = {
  API_BASE: 'https://script.google.com/macros/s/AKfycb.../exec',
  // ...
};
```

## Estrutura

```
js/
├── config.js          Configuração (API_BASE)
├── main.js            Router por hash
├── api.js             Cliente HTTP
├── auth.js            Sessão de utilizador
├── geo.js             Conversão WGS84 ↔ UTM
├── export.js          jsPDF e SheetJS
└── views/             login, dashboard, fontes, saa, monitorias, relatorios, admin
```

## Dependências (via CDN, sem build)

- Chart.js 4.4
- Leaflet 1.9.4 + OpenStreetMap
- jsPDF 2.5 + AutoTable
- SheetJS (xlsx) 0.20

Funciona em Chrome, Edge e Firefox modernos (últimos 2 anos).
