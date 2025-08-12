import { APIRequestContext, request } from "@playwright/test";
import { loadRuntimeConfig } from "@/utils/env";

export class GraphQLClient {
  private context!: APIRequestContext;
  private readonly endpoint: string;

  constructor(env: string) {
    const cfg = loadRuntimeConfig(env);
    this.endpoint = cfg.graphql.endpoint;
  }

  async init(extraHTTPHeaders?: Record<string, string>) {
    this.context = await request.newContext({ extraHTTPHeaders });
  }

  async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const res = await this.context.post(this.endpoint, { data: { query, variables } });
    if (!res.ok()) throw new Error(`GraphQL error: ${res.status()} ${await res.text()}`);
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return json.data as T;
  }

  async dispose() { await this.context.dispose(); }
}
