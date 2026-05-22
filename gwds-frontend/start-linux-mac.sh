#!/usr/bin/env bash
# Gaza Water Data System - Servidor local (Linux/macOS)
cd "$(dirname "$0")"
echo
echo "GWDS - servidor local"
echo "Servindo em http://localhost:8000"
echo "Para PARAR o servidor: Ctrl+C"
echo
( sleep 1 && (command -v xdg-open >/dev/null && xdg-open http://localhost:8000 ) || (command -v open >/dev/null && open http://localhost:8000 ) ) &
python3 -m http.server 8000
