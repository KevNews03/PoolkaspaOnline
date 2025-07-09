import dotenv from 'dotenv';
import net from 'net';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '../.env' });

const PORT = Number(process.env.STRATUM_PORT);

// MongoDB setup (une connexion persistante)
const dbUser = encodeURIComponent(process.env.DB_USER);
const dbPass = encodeURIComponent(process.env.DB_PASS);
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const mongoUri = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=${dbName}`;
const mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function startStratum() {
  await mongoClient.connect();
  const sharesCol = mongoClient.db(dbName).collection('shares');

  const server = net.createServer(socket => {
    socket.setEncoding('utf8');
    // Acknowledge new connection
    socket.write(JSON.stringify({ result: ['OK'], error: null, id: 1 }) + '\n');

    socket.on('data', async data => {
      try {
        const req = JSON.parse(data);
        let response;

        switch (req.method) {
          case 'mining.subscribe':
            response = { id: req.id, result: ['subscription_id'], error: null };
            break;

          case 'mining.authorize':
            response = { id: req.id, result: true, error: null };
            break;

          case 'mining.submit':
            const [wallet, jobId, nonce] = req.params;
            // Enregistre la share
            await sharesCol.insertOne({
              address: wallet,
              jobId,
              nonce,
              timestamp: new Date()
            });
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

  server.listen(PORT, () => {
    console.log(`🎰 Stratum server listening on port ${PORT}`);
  });
}

startStratum().catch(err => {
  console.error('❌ Stratum startup error:', err);
  process.exit(1);
});
