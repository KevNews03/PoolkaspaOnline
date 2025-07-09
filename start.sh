#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Kaspa Pool — start.sh
# Démarre le backend et le Stratum en arrière-plan, avec logs dans logs/
# -----------------------------------------------------------------------------

# Crée le dossier de logs s’il n’existe pas
mkdir -p logs

echo "→ Démarrage du backend..."
cd backend
# npm start lance "node -r dotenv/config server.js"
nohup npm start > ../logs/backend.log 2>&1 &
cd ..

echo "→ Démarrage du Stratum..."
cd stratum
# npm start lance "node -r dotenv/config stratum.js"
nohup npm start > ../logs/stratum.log 2>&1 &
cd ..

echo "✅ Kaspa Pool démarrée !"
echo "  • Logs backend : logs/backend.log"
echo "  • Logs stratum : logs/stratum.log"
