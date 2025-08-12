import { APIRequestContext, request, APIResponse } from "@playwright/test";
import { loadRuntimeConfig } from "@/utils/env";

export class RestClient {
  private context!: APIRequestContext;
  private readonly baseURL: string;

  constructor(env: string) {
    const cfg = loadRuntimeConfig(env);
    this.baseURL = cfg.api.baseURL;
  }

  async init(extraHTTPHeaders?: Record<string, string>) {
    this.context = await request.newContext({ baseURL: this.baseURL, extraHTTPHeaders });
  }

  async get(url: string, params?: Record<string, string | number>): Promise<APIResponse> {
    const search = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return this.context.get(`${url}${search}`);
  }

  async post(url: string, data?: any): Promise<APIResponse> {
    return this.context.post(url, { data });
  }

  async put(url: string, data?: any): Promise<APIResponse> {
    return this.context.put(url, { data });
  }

  async delete(url: string): Promise<APIResponse> {
    return this.context.delete(url);
  }

  async dispose() {
    await this.context.dispose();
  }
}
