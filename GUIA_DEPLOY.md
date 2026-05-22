# Guia de deploy do GWDS

Passos para ligar a SPA (já a correr em `http://localhost:8000`) ao backend Apps Script + Google Sheets.

---

## Parte A. Criar a Folha de Cálculo de produção

1. Aceder a https://sheets.google.com com a conta Google (de preferência institucional).
2. **+ Em branco** para criar nova Folha.
3. Renomear no topo para `GWDS-Producao`.

## Parte B. Abrir o editor do Apps Script

4. Menu **Extensões → Apps Script**. Abre-se uma nova aba.
5. Renomear o projecto Apps Script para `GWDS-Backend`.

## Parte C. Carregar os 22 ficheiros do backend

6. Seleccionar o `Code.gs` que já existe no painel esquerdo.
7. Substituir o conteúdo pelo de `gwds-backend/Code.gs`. Ctrl+S.
8. Para cada ficheiro restante:
   - **+ ao lado de "Ficheiros" → Script**
   - Nome igual ao do disco, sem `.gs`
   - Colar o conteúdo. Ctrl+S.

Lista (20 ficheiros): Setup, ctrl_Admin, ctrl_Auth, ctrl_Dashboard, ctrl_Export, ctrl_Fonte, ctrl_Monitoria, ctrl_Saa, repo_Base, repo_Cascade, repo_Fonte, repo_Log, repo_Monitoria, repo_Saa, repo_Utilizador, srv_Auditoria, srv_Auth, srv_Export, srv_Geo, srv_Validacao.

## Parte D. Configurar o `appsscript.json`

9. Ícone de engrenagem (⚙) no menu lateral esquerdo do editor.
10. Marcar **Mostrar ficheiro de manifesto appsscript.json no editor**.
11. Voltar ao editor (ícone `<>`). Aparece `appsscript.json` na lista.
12. Substituir o conteúdo pelo de `gwds-backend/appsscript.json`. Ctrl+S.

## Parte E. Correr `setup()`

13. Abrir `Setup.gs`.
14. Confirmar que o seletor de função tem `setup`.
15. **▶ Executar**.
16. **Rever permissões → escolher conta → Avançadas → Aceder a GWDS-Backend (não seguro) → Permitir.**
17. Aparece o popup *"GWDS configurado com sucesso"* na Folha de Cálculo. As 6 abas estão criadas e o seu e-mail está como `ADMINISTRADOR`.

## Parte F. Publicar como Web App

18. **Implementar → Nova implementação** (canto superior direito).
19. Engrenagem ao lado de "Selecionar tipo" → **Aplicação Web**.
20. Preencher:
    - **Descrição:** GWDS v1.0
    - **Executar como:** Eu
    - **Quem tem acesso:** Qualquer pessoa com Conta Google
21. **Implementar** (pode pedir nova autorização — aceitar).
22. **Copiar o URL da aplicação Web** (termina em `/exec`).

## Parte G. Ligar o front-end ao back-end

23. Abrir `gwds-frontend/js/config.js`.
24. Substituir `'COLOCAR_AQUI_O_URL_DA_WEB_APP'` pelo URL copiado.
25. Guardar (Ctrl+S).
26. Voltar ao navegador (`http://localhost:8000`) e **F5**.

A SPA mostra o Dashboard com KPIs a zero. Está pronta a receber dados.

---

## Parte H. Carregar a AKVO Cascade

A validação de unidades administrativas (RN-01) precisa da tabela AKVO Cascade.

1. Na Folha `GWDS-Producao`, abrir a aba `AKVO_Cascade`.
2. Abrir noutro separador o ficheiro `ShapeFile vs Cascade - Corrigido.XLSX`.
3. Copiar a aba **4. Cascade (NAO MUDA!)** completa (Ctrl+A, Ctrl+C).
4. Colar a partir da linha 2 da aba `AKVO_Cascade` do GWDS-Producao, preservando a ordem das colunas (`provincia`, `distrito`, `posto`, `localidade`). A coluna `id` pode ficar vazia, o sistema usa a chave composta.

Em alternativa, no painel **Admin** da SPA (visível apenas a ADMINISTRADOR) há a opção de carregar a Cascade via upload de ficheiro.

---

## Parte I. Importar dados existentes (opcional, para testes)

Pode carregar de uma só vez os dados reais que veio com o TFC, copiando das XLSX para as respectivas abas:

| XLSX original                                  | Aba de destino                |
|------------------------------------------------|-------------------------------|
| `Fontes Dispersas_Levantamento.xlsx`           | `Fontes_Dispersas`            |
| `SAA_Limpos.xlsx`                              | `SAA`                         |
| `SAA_-_monitorias_-Limpos.xlsx`                | `Monitorias` (com `saa_codigo` preenchido) |

Notas:
- O sistema valida só na criação via API. Se colar directamente na folha, os dados ficam disponíveis para listagem e dashboards sem validação.
- Adicione `activo = TRUE` na última coluna de cada linha colada (`Fontes_Dispersas` e `SAA`).

---

## Resolução de problemas

**"Acesso não autorizado"** ao tentar usar a SPA: o seu e-mail não está na aba `Utilizadores`. Adicione a linha à mão (`email`, `nome`, `perfil=ADMINISTRADOR`, `activo=TRUE`).

**Erro 403 "Permissão insuficiente"**: o seu perfil não tem direito à operação. Verifique a coluna `perfil` na aba `Utilizadores`.

**Coordenadas fora da faixa**: a verificação WGS84 (RN-03) exige longitude entre 30 e 41 e latitude entre -27 e -10 (faixa moçambicana). Se os seus dados são noutro intervalo, ajuste em `srv_Validacao.gs`.

**A SPA mostra "Configuração pendente"**: o `API_BASE` em `js/config.js` ainda não foi substituído.

**A SPA mostra "É preciso abrir com um servidor local"**: está a abrir com `file://`. Use o `start-windows.bat` ou Live Server.

---

## Publicação final no GitHub Pages

Quando o sistema estiver validado localmente:

```bash
cd gwds-frontend/
git init
git add .
git commit -m "GWDS v1.0"

# Criar repositório no github.com (público) e copiar o URL
git remote add origin https://github.com/dionisiocumbane/gwds-frontend.git
git branch -M main
git push -u origin main
```

No GitHub: **Settings → Pages → Branch: main / root → Save**. Em 1 a 2 minutos o URL público fica activo: `https://dionisiocumbane.github.io/gwds-frontend/`.

Lembre-se de **não cometer o `config.js` com o URL real** se quiser que o repositório fique público sem expor o URL. Em alternativa, manter o `config.js` no repositório (o URL não é segredo, é uma chave de roteamento; a segurança está no OAuth) — esta é a abordagem mais simples para o TFC.
