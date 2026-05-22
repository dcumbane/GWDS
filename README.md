# Gaza Water Data System (GWDS)

Sistema web para recolha, análise e visualização de dados de infraestruturas de abastecimento de água da Direcção Provincial de Obras Públicas, Habitação e Recursos Hídricos de Gaza (DPOPHRH-Gaza).

Trabalho de Fim de Curso (TFC) de **Dionísio Pita Cumbane**, código **31230359**, Licenciatura em Engenharia Informática, Faculdade de Engenharia e Agricultura, UnISCED.

---

## Arquitectura, em três camadas

- **Apresentação** (`gwds-frontend/`): SPA estática em HTML/CSS/JavaScript, publicada no GitHub Pages. Sem build, sem framework. Carrega Chart.js, Leaflet, jsPDF e SheetJS via CDN.
- **Aplicação** (`gwds-backend/`): Web App em Google Apps Script (runtime V8). Expõe endpoints JSON sobre HTTPS, autentica via OAuth Google, aplica regras de negócio.
- **Persistência**: uma Folha de Cálculo do Google Sheets (6 folhas) e uma pasta do Google Drive para fotografias.


## ⚠️ Executar a SPA localmente

A SPA usa módulos JavaScript (ES6) que não funcionam quando se abre `index.html` directamente do disco. É preciso servir via HTTP local. Forma mais simples no Windows: **duplo-clique no `gwds-frontend/start-windows.bat`** (precisa de Python 3). Forma mais limpa para desenvolvimento: extensão **Live Server** do VS Code. Após o deploy no GitHub Pages, isto deixa de ser necessário.

---

## Passo 1: Criar a Folha de Cálculo

1. Aceder a [https://sheets.google.com](https://sheets.google.com) e criar uma nova Folha de Cálculo.
2. Renomeá-la para `GWDS-Producao` (ou outro nome à sua escolha).
3. No menu **Extensões > Apps Script**, abrir o editor do Apps Script.

## Passo 2: Carregar o backend no Apps Script

1. No editor do Apps Script, apagar o `Code.gs` predefinido.
2. Para cada ficheiro `.gs` de `gwds-backend/`, criar um ficheiro com o mesmo nome no editor e copiar o conteúdo.
3. No menu **Definições** (engrenagem) do projecto Apps Script, marcar **Mostrar ficheiro de manifesto appsscript.json**.
4. Copiar o conteúdo de `appsscript.json` para o ficheiro de manifesto do projecto.

(Em alternativa, com [clasp](https://github.com/google/clasp) instalado: `clasp clone <ID-do-script>` e depois `clasp push` a partir da pasta `gwds-backend/`.)

## Passo 3: Correr o setup

No editor do Apps Script, com o ficheiro `Setup.gs` aberto, escolher a função `setup` no seletor e clicar em **Executar**. Será pedida autorização para aceder ao Sheets e ao Drive. Depois desta execução existem:

- Seis folhas criadas com cabeçalhos: `Utilizadores`, `AKVO_Cascade`, `Fontes_Dispersas`, `SAA`, `Monitorias`, `Log_Auditoria`.
- Pasta `GWDS-Fotos` no Drive.
- O e-mail do operador é registado como `ADMINISTRADOR`.

## Passo 4: Carregar AKVO Cascade

Cole as linhas (provincia, distrito, posto, localidade) da folha `AKVO_Cascade`. Pode usar o ficheiro `ShapeFile vs Cascade - Corrigido.XLSX` que veio com os dados do TFC: copiar a folha `4. Cascade (NAO MUDA!)` para a folha `AKVO_Cascade` do GWDS-Producao (preservando a ordem das colunas).

## Passo 5: Publicar a Web App

1. No editor do Apps Script, **Implementar > Nova implementação**.
2. Tipo: **Aplicação Web**.
3. Executar como: **Eu**.
4. Quem tem acesso: **Qualquer pessoa com Conta Google** (ou **Apenas eu** durante o desenvolvimento).
5. Clique em **Implementar**. Copie o URL gerado.

## Passo 6: Configurar o front-end

1. Editar `gwds-frontend/js/config.js`.
2. Substituir `COLOCAR_AQUI_O_URL_DA_WEB_APP` pelo URL copiado no passo 5.

## Passo 7: Publicar no GitHub Pages

```bash
cd gwds-frontend/
git init
git add .
git commit -m "GWDS v1.0"
gh repo create dionisiocumbane/gwds-frontend --public --source=. --push
# No GitHub: Settings > Pages > Branch main / root > Save
```

URL público: `https://dionisiocumbane.github.io/gwds-frontend/`

---

## Estrutura de pastas

```
GWDS/
├── README.md                    Este ficheiro
├── gwds-backend/                Código Apps Script
│   ├── appsscript.json
│   ├── Code.gs                  Entrypoint doGet/doPost
│   ├── Setup.gs                 setup() inicial
│   ├── ctrl_*.gs                Controllers (Auth, Fonte, SAA, Monitoria, Dashboard, Admin, Export)
│   ├── srv_*.gs                 Services (Auth, Validação, Geo, Auditoria, Export)
│   └── repo_*.gs                Repositórios (Base, Fonte, SAA, Monitoria, Cascade, Utilizador, Log)
└── gwds-frontend/               SPA estática
    ├── index.html
    ├── styles/main.css
    └── js/
        ├── config.js            ← editar API_BASE aqui
        ├── main.js              Router por hash
        ├── api.js, auth.js, geo.js, export.js
        └── views/               login, dashboard, fontes, saa, monitorias, relatorios, admin
```

## Perfis de utilizador

| Perfil           | Permissões                                                              |
|------------------|--------------------------------------------------------------------------|
| ADMINISTRADOR    | Tudo, incluindo gestão de utilizadores e upload da AKVO Cascade.        |
| TEC_CADASTRO     | Criar e editar Fontes e SAA. Pode também criar Monitorias.              |
| TEC_MONITORIA    | Criar Monitorias.                                                       |
| GESTOR           | Apenas leitura. Acede a dashboards e exporta relatórios.                |

Para adicionar um utilizador novo: aceder ao menu **Admin** (visível só ao ADMINISTRADOR), preencher e-mail, nome e perfil. Em alternativa, adicionar a linha directamente na folha `Utilizadores`.

## Endpoints da API

| Método | Path                       | Descrição                                          |
|--------|----------------------------|-----------------------------------------------------|
| GET    | `auth/me`                  | Retorna o utilizador autenticado.                  |
| GET    | `fontes`                   | Lista fontes (`?distrito&ano&tipo&q`).             |
| POST   | `fontes`                   | Cria uma fonte dispersa.                            |
| GET    | `fontes/get?codigo=`       | Devolve uma fonte.                                  |
| POST   | `fontes/update?codigo=`    | Actualiza uma fonte.                                |
| POST   | `fontes/delete?codigo=`    | Soft delete.                                        |
| GET/POST | `saa`, `saa/*`           | Como acima, para SAA.                               |
| GET/POST | `monitorias`             | Lista e cria monitorias.                            |
| GET    | `dashboards/kpis`          | Indicadores agregados.                              |
| GET    | `dashboards/mapa`          | Pontos para o mapa.                                 |
| GET    | `cascade/all`              | Toda a tabela AKVO Cascade.                         |
| POST   | `admin/cascade/upload`     | Substitui a AKVO Cascade.                           |
| GET    | `admin/users`              | Lista utilizadores.                                 |
| POST   | `admin/users`              | Cria ou actualiza um utilizador.                    |
| GET    | `export?entidade=...`      | Devolve linhas e cabeçalhos para exportação.        |

## Regras de negócio implementadas

| ID    | Onde                                              |
|-------|---------------------------------------------------|
| RN-01 | `ValidacaoService.unidade` + Cascade              |
| RN-02 | `ValidacaoService.codigo` (regex)                 |
| RN-03 | `ValidacaoService.wgs84` e `GeoService.wgs84ToUtm`|
| RN-04 | `ValidacaoService.estadoSaa`                      |
| RN-05 | `ValidacaoService.qualidade`                      |
| RN-06 | `BaseRepo.softDelete`                             |
| RN-08 | `MonitoriaController.create` (verifica ano_const) |
| RN-09 | `MonitoriaController.create` (rec_m_mzn x tipo_fact)|
| RN-12 | Cabeçalho institucional nos exports do front-end  |

## Limitações conhecidas

- O Apps Script tem quotas diárias. Não recomendado para mais de 5 000 escritas por dia (suficiente para o uso da DPOPHRH-Gaza).
- A Web App de Apps Script não suporta CORS pré-flight para todos os métodos HTTP. Por isso usa-se POST com `?_path=...` para todas as escritas.
- O download de PDF e Excel é feito no cliente (jsPDF/SheetJS) para evitar exceder limites de tamanho de resposta do Apps Script.

## Licença

Código fonte sob licença MIT. Dados de produção sujeitos às políticas da DPOPHRH-Gaza.
