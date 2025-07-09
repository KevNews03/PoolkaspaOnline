import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import net from 'net';

const PORT = Number(process.env.STRATUM_PORT);

// Crée un serveur TCP Stratum
const server = net.createServer(socket => {
  socket.setEncoding('utf8');
  // Accusé de réception initial
  socket.write(JSON.stringify({ result: ['OK'], error: null, id: 1 }) + '\n');

  socket.on('data', data => {
    try {
      const req = JSON.parse(data);
      let response;

      switch (req.method) {
        case 'mining.subscribe':
          // Envoie l'abonnement (simulé)
          response = { id: req.id, result: ['subscription_id'], error: null };
          break;

        case 'mining.authorize':
          // Autorise toujours
          response = { id: req.id, result: true, error: null };
          break;

        case 'mining.submit':
          const [wallet, jobId, nonce] = req.params;
          // TODO: enregistrer la share (wallet, jobId, nonce)
          response = { id: req.id, result: true, error: null };
          break;

        default:
          response = { id: req.id, result: null, error: 'Unknown method' };
      }

      socket.write(JSON.stringify(response) + '\n');
    } catch (err) {
      socket.write(JSON.stringify({ result: null, error: err.message, id: null }) + '\n');
    }
  });
});

server.listen(PORT, () => console.log(`🎰 Stratum server listening on port ${PORT}`));
