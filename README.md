# PoolkaspaOnline
---

# 💎 Pool Kaspa Online - Serveur de Minage Kaspa Complet

> PoolKaspaOnline est une pool de minage Kaspa complète, prête à être déployée sur un serveur Ubuntu. Elle intègre un backend Stratum, un système de paiements automatiques, une base MongoDB, une interface web (dashboard) et une interaction directe avec le nœud `kaspad`.

---

## 🧾 Sommaire

- [🚀 Fonctionnalités](#-fonctionnalités)
- [📦 Prérequis](#-prérequis)
- [🛠 Installation complète](#-installation-complète)
  - [1️⃣ Installer les dépendances système](#1️⃣-installer-les-dépendances-système)
  - [2️⃣ Installer et lancer kaspad](#2️⃣-installer-et-lancer-kaspad)
  - [3️⃣ Cloner et configurer PoolKaspaOnline](#3️⃣-cloner-et-configurer-poolkaspaonline)
  - [4️⃣ Configurer le fichier .env](#4️⃣-configurer-le-fichier-env)
  - [5️⃣ Lancer la pool avec PM2](#5️⃣-lancer-la-pool-avec-pm2)
- [🌐 Accès au dashboard](#-accès-au-dashboard)
- [📤 Paiements automatiques](#-paiements-automatiques)
- [🔒 Sécuriser le VPS](#-sécuriser-le-vps)
- [🧪 Testé sur](#-testé-sur)
- [🧑‍💻 Auteur](#-auteur)
- [📜 Licence](#-licence)

---

## 🚀 Fonctionnalités

- ⛏ Stratum Kaspa natif compatible GhostDAG / KHeavyHash
- 💸 Paiements automatiques toutes les heures
- 📈 Dashboard web (port 8080)
- 🧠 Base MongoDB pour suivi des hashrates, parts, et paiements
- 🔐 Commission automatique 0.5% vers :  
  `kaspa:qzs8yf55y0mu9z5djf45muu20ztrfzj2udn050xlqxqxaqd0tstwqtezzvu6n`

---

## 📦 Prérequis

- ✅ Ubuntu 22.04 LTS
- 💡 Accès root
- 🌐 Port 3333 (stratum) et 8080 (dashboard) ouverts
- 🧠 Minimum 2 vCPU et 4 Go RAM recommandés

---

## 🛠 Installation complète

### 1️⃣ Installer les dépendances système

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential nano

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2
sudo npm install -g pm2

# Installer MongoDB
sudo apt install -y mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb


---

2️⃣ Installer et lancer kaspad

# Télécharger Rusty Kaspa (version stable)
git clone https://github.com/kaspanet/rusty-kaspa.git
cd rusty-kaspa
cargo build --release

# Copier l’exécutable dans /usr/local/bin
sudo cp target/release/kaspad /usr/local/bin/

# Lancer kaspad avec index UTXO
kaspad --utxoindex > kaspad.log 2>&1 &


---

3️⃣ Cloner et configurer PoolKaspaOnline

cd ~
git clone https://github.com/KevNews03/PoolkaspaOnline.git
cd PoolkaspaOnline

# Installer les dépendances
npm install


---

4️⃣ Configurer le fichier .env

Créer le fichier .env :

cp .env.example .env
nano .env

Contenu recommandé :

# Connexion à MongoDB
MONGO_URI=mongodb://localhost:27017/kaspapool

# Wallet Kaspa de la pool (réception + fees)
POOL_WALLET=kaspa:qzs8yf55y0mu9z5djf45muu20ztrfzj2udn050xlqxqxaqd0tstwqtezzvu6n

# Détails du noeud kaspad local
KASPAD_HOST=127.0.0.1
KASPAD_PORT=16110

# Ports de la pool
STRATUM_PORT=3333
HTTP_PORT=8080

# Commissions (0.5% = 0.5)
POOL_FEE=0.5

# Paiement minimum (KAS)
MIN_PAYOUT=1

# Intervalle des paiements (minutes)
PAYOUT_INTERVAL=60


---

5️⃣ Lancer la pool avec PM2

# Démarrer tous les services backend
pm2 start ecosystem.config.js

# Sauvegarder les services pour redémarrage automatique
pm2 save
pm2 startup


---

🌐 Accès au dashboard

Ouvre ton navigateur sur :

http://<IP_DU_SERVEUR>:8080

Tu verras :

Hashrate global de la pool

Nombre de mineurs actifs

Stats par wallet (accès via /wallet/<adresse_kaspa>)

Infos réseau et pool



---

📤 Paiements automatiques

Déclenchés toutes les PAYOUT_INTERVAL minutes

Minimum 1 KAS (modifiable via .env)

Effectués directement depuis POOL_WALLET via kaspad



---

🔒 Sécuriser le VPS

Active un pare-feu simple :

sudo ufw allow 22/tcp     # SSH
sudo ufw allow 3333/tcp   # Stratum
sudo ufw allow 8080/tcp   # Dashboard
sudo ufw enable


---

🧪 Testé sur

Environnement	Version

Ubuntu	22.04 LTS
Node.js	18.x
MongoDB	6.x
Kaspad	Rusty v0.13+
PM2	5.x



---

🧑‍💻 Auteur

Kevin Guillot
📌 GitHub : KevNews03


---

📜 Licence

Ce projet est open-source, sous licence MIT.
Crédit obligatoire pour toute utilisation commerciale.


---