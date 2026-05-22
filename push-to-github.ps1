# ========================================================================
# Script de push para GitHub - Gaza Water Data System
# Execute uma vez no PowerShell, dentro da pasta GWDS, para subir o projecto.
# ========================================================================

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  GWDS - Publicacao no GitHub" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se git esta instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Git nao esta instalado." -ForegroundColor Red
    Write-Host "Instale a partir de https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Confirmar pasta correcta
if (-not (Test-Path "gwds-frontend") -or -not (Test-Path "gwds-backend")) {
    Write-Host "ERRO: Este script deve ser executado dentro da pasta GWDS." -ForegroundColor Red
    Write-Host "Pasta actual: $PWD" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Apagar .git anterior se existir (do sandbox)
if (Test-Path ".git") {
    Write-Host "A remover .git anterior (do sandbox)..." -ForegroundColor Yellow
    Remove-Item ".git" -Recurse -Force
}

# Configuracoes git
Write-Host "A configurar identidade git local..."
git config user.email "dcumbane@estudantes.unisced.edu.mz"
git config user.name "Dionisio Pita Cumbane"

# Inicializar
Write-Host "A inicializar repositorio..."
git init -b main | Out-Null
git add .
Write-Host ""
Write-Host "Ficheiros prontos para commit:" -ForegroundColor Green
git status --short
Write-Host ""

# Commit
git commit -m "GWDS v1.0 - sistema de recolha de dados de agua para a DPOPHRH Gaza" | Out-Null
Write-Host "Commit criado." -ForegroundColor Green

# Remote
git remote add origin https://github.com/dcumbane/GWDS.git
Write-Host "Remote configurado: https://github.com/dcumbane/GWDS.git" -ForegroundColor Green

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Pronto para push." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximo passo: executar 'git push -u origin main'" -ForegroundColor Yellow
Write-Host "(Sera pedido login GitHub na primeira vez)"
Write-Host ""
$resp = Read-Host "Quer executar o push agora? (s/N)"
if ($resp -eq 's' -or $resp -eq 'S') {
    git push -u origin main
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "  Push concluido!" -ForegroundColor Green
    Write-Host "  Aceda a https://github.com/dcumbane/GWDS" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
}
Read-Host "Pressione Enter para fechar"
