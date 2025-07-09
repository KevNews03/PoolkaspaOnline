import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

// RPC configuration
const rpcUrl = `http://${process.env.KASPAD_RPC_HOST}:${process.env.KASPAD_RPC_PORT}/rpc`;
const auth = Buffer.from(`${process.env.KASPAD_RPC_USER}:${process.env.KASPAD_RPC_PASS}`).toString('base64');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${auth}`,
};

export async function rpc(method, params = []) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  return result;
}

export function getNetworkStats() {
  return rpc('getNetworkInfo');
}

export async function processPayments() {
  // Connect to MongoDB
  const user = encodeURIComponent(process.env.DB_USER);
  const pass = encodeURIComponent(process.env.DB_PASS);
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  const uri = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=${dbName}`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  // TODO: implement share aggregation, calculate balances
  // TODO: filter miners with balance >= PAYMENT_THRESHOLD
  // TODO: send payments via RPC subtracting FEE_PERCENT

  await client.close();
}
