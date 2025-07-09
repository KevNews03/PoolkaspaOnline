#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Kaspa Pool — install.sh
# Installe Node.js 18.x LTS, MongoDB 6.0, Go 1.20, kaspad, et crée la base Mongo
# -----------------------------------------------------------------------------

# Variables de version
NODE_SETUP_URL="https://deb.nodesource.com/setup_18.x"
MONGO_REPO="deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse"
GO_VERSION="1.20.9"
GO_TARBALL="go${GO_VERSION}.linux-amd64.tar.gz"
KASPAD_REPO="https://github.com/kaspanet/kaspad.git"

echo "🔄 Mise à jour des paquets…"
apt update

echo "🔧 Installation des outils de base…"
apt install -y curl wget gnupg build-essential git

# ────────────────────────────────────────────────────────────────────────────────
echo "🟢 1) Installer Node.js 18.x LTS"
curl -fsSL $NODE_SETUP_URL | bash -
apt install -y nodejs

echo "🔍 Version Node.js : $(node -v)"

# ────────────────────────────────────────────────────────────────────────────────
echo "🟢 2) Installer MongoDB 6.0"
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "$MONGO_REPO" > /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
# Pince la version 6.0.x
apt install -y mongodb-org

echo "🔍 Version mongod : $(mongod --version | head -n1)"

echo "→ Activation et démarrage de MongoDB…"
systemctl enable mongod
systemctl start mongod

# ────────────────────────────────────────────────────────────────────────────────
echo "🟢 3) Installer Go ${GO_VERSION}"
cd /tmp
wget https://golang.org/dl/$GO_TARBALL
rm -rf /usr/local/go
tar -C /usr/local -xzf $GO_TARBALL
# Ajouter Go au PATH
cat > /etc/profile.d/go.sh <<'EOF'
export PATH=/usr/local/go/bin:$PATH
EOF
chmod +x /etc/profile.d/go.sh
# Charger immédiatement
export PATH=/usr/local/go/bin:$PATH

echo "🔍 Version go : $(go version)"

# ────────────────────────────────────────────────────────────────────────────────
echo "🟢 4) Compiler et installer kaspad"
git clone $KASPAD_REPO /tmp/kaspad
cd /tmp/kaspad
make install   # installe binaire dans /usr/local/bin
echo "→ kaspad installé dans /usr/local/bin"

echo "→ Création du service systemd kaspad…"
cat > /etc/systemd/system/kaspad.service <<'EOF'
[Unit]
Description=Kaspad daemon
After=network.target

[Service]
ExecStart=/usr/local/bin/kaspad
Restart=on-failure
User=root
WorkingDirectory=/root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kaspad
systemctl start kaspad

# ────────────────────────────────────────────────────────────────────────────────
echo "🟢 5) Créer la base MongoDB 'kaspa_pool' et l'utilisateur 'pool'"
mongo <<'EOF'
use kaspa_pool
if (db.getUser("pool") === null) {
  db.createUser({
    user:   "pool",
    pwd:    "Kevin03240",
    roles: [{ role: "readWrite", db: "kaspa_pool" }]
  });
  print("✅ Utilisateur 'pool' créé sur la base 'kaspa_pool'.");
} else {
  print("ℹ️  L'utilisateur 'pool' existe déjà.");
}
EOF

# ────────────────────────────────────────────────────────────────────────────────
echo "🟢 6) Préparer le projet Kaspa Pool"
cd $(dirname "$0")
cp .env.example .env

echo "→ Installation des dépendances backend & stratum…"
cd backend
npm install
cd ../stratum
npm install

echo "✅ Installation terminée !"
echo " → Vérifiez le .env, puis lancez la pool avec ./start.sh"
