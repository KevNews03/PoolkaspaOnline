import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '../.env' });

// RPC setup
const rpcUrl = `http://${process.env.KASPAD_RPC_HOST}:${process.env.KASPAD_RPC_PORT}/rpc`;
const auth   = Buffer.from(`${process.env.KASPAD_RPC_USER}:${process.env.KASPAD_RPC_PASS}`).toString('base64');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` };

// MongoDB URI
const dbUser = encodeURIComponent(process.env.DB_USER);
const dbPass = encodeURIComponent(process.env.DB_PASS);
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const mongoUri = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=${dbName}`;

// Helper RPC call
async function rpc(method, params = []) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  return result;
}

export async function getNetworkStats() {
  return rpc('getNetworkInfo');
}

export async function processPayments() {
  const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);
  const sharesCol   = db.collection('shares');
  const paymentsCol = db.collection('payments');

  // 1) Récupère et agrège les parts par adresse
  const agg = await sharesCol.aggregate([
    { $group: { _id: '$address', count: { $sum: 1 } } }
  ]).toArray();

  if (agg.length === 0) {
    await client.close();
    return; // Pas de shares à payer
  }

  // 2) Calcule la commission
  const totalShares = agg.reduce((sum, r) => sum + r.count, 0);
  const feePercent  = parseFloat(process.env.FEE_PERCENT);
  const commission  = totalShares * (feePercent / 100);

  // 3) Envoie la commission à l'adresse du pool
  await rpc('sendToAddress', [process.env.POOL_ADDRESS, commission]);

  // 4) Payer chaque mineur
  const threshold = parseFloat(process.env.PAYMENT_THRESHOLD);
  for (const { _id: address, count } of agg) {
    const payout = count * (1 - feePercent / 100);
    if (payout < threshold) continue;
    await rpc('sendToAddress', [address, payout]);
    await paymentsCol.insertOne({ address, amount: payout, date: new Date() });
  }

  // 5) Vide la collection de shares pour repartir à zéro
  await sharesCol.deleteMany({});

  await client.close();
}
