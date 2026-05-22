# GWDS Back-end

Web App em Google Apps Script (runtime V8). Expõe endpoints JSON.

## Como carregar no Apps Script

Opção A. **Manualmente**, copiando cada ficheiro `.gs` para o editor do Apps Script (criar com o mesmo nome).

Opção B. Com [clasp](https://github.com/google/clasp):
```bash
npm i -g @google/clasp
clasp login
clasp clone <SCRIPT_ID>           # ou clasp create
cp *.gs appsscript.json .clasp.json   # ajustar
clasp push
```

## Setup inicial

Correr a função `setup()` do ficheiro `Setup.gs` UMA VEZ.

## Convenções

- `repo_*` lê e grava no Sheets (camada de persistência).
- `srv_*` aplica regras de negócio.
- `ctrl_*` recebe o pedido e devolve JSON.
- `Code.gs` faz o roteamento.

## Erros

Todos os erros seguem o formato Problem Details (RFC 7807):
```json
{ "type": "about:blank", "title": "...", "status": 422, "detail": "..." }
```
