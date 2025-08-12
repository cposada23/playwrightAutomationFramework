import { MongoClient, Db } from "mongodb";
import { loadRuntimeConfig } from "@/utils/env";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDb(env: string): Promise<Db> {
  if (db) return db;
  const cfg = loadRuntimeConfig(env);
  client = new MongoClient(cfg.mongo.uri);
  await client.connect();
  db = client.db(cfg.mongo.dbName);
  return db;
}

export async function closeMongo() {
  await client?.close();
  client = null; db = null;
}
