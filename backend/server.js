import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express from 'express';
import { MongoClient } from 'mongodb';
import { rpc, getNetworkStats, processPayments } from './payer.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup MongoDB connection
const dbUser = encodeURIComponent(process.env.DB_USER);
const dbPass = encodeURIComponent(process.env.DB_PASS);
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=${dbName}`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Start the payment loop
    setInterval(processPayments, Number(process.env.PAYMENT_INTERVAL) * 1000);

    // Status endpoint
    app.get('/api/status', async (req, res) => {
      const netStats = await getNetworkStats();
      // TODO: aggregate pool stats and miner counts
      res.json({
        poolHashrate: 0,
        networkHashrate: netStats.networkHashrate,
        miners: 0,
        uptime: Math.floor(process.uptime()),
      });
    });

    app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Backend startup error:', err);
    process.exit(1);
  }
}

main();
