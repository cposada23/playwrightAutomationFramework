import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export type RuntimeConfig = {
  app: { baseURL: string };
  api: { baseURL: string };
  graphql: { endpoint: string };
  auth: { loginEndpoint: string; username: string; password: string };
  postgres: { connectionString: string };
  mongo: { uri: string; dbName: string };
};

export function loadRuntimeConfig(env: string): RuntimeConfig {
  const cfgPath = path.resolve(process.cwd(), `config/${env}.json`);
  if (!fs.existsSync(cfgPath)) {
    throw new Error(`Config not found for env '${env}' at ${cfgPath}`);
  }
  const json = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));

  // Allow overrides from environment variables
  const appBaseURL = process.env.BASE_URL || json.app?.baseURL || "";
  const apiBaseURL = process.env.API_URL || json.api?.baseURL || "";
  const gqlEndpoint = process.env.GRAPHQL_URL || json.graphql?.endpoint || "";

  const loginEndpoint = process.env.AUTH_LOGIN_ENDPOINT || json.auth?.loginEndpoint || "";
  const username = process.env.AUTH_USERNAME || json.auth?.username || "";
  const password = process.env.AUTH_PASSWORD || json.auth?.password || "";

  const pg = process.env.PG_CONNECTION_STRING || json.postgres?.connectionString || "";
  const mongoUri = process.env.MONGODB_URI || json.mongo?.uri || "";
  const mongoDbName = process.env.MONGODB_DB_NAME || json.mongo?.dbName || "";

  return {
    app: { baseURL: appBaseURL },
    api: { baseURL: apiBaseURL },
    graphql: { endpoint: gqlEndpoint },
    auth: { loginEndpoint, username, password },
    postgres: { connectionString: pg },
    mongo: { uri: mongoUri, dbName: mongoDbName }
  } as RuntimeConfig;
}
