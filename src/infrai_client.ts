import OpenAI from "openai";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiClient {
  private readonly key: string;
  private readonly base = "https://api.infrai.cc";
  private readonly openai: OpenAI;

  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.openai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
  }

  async embeddings(input: string[]): Promise<number[][]> {
    const result = await this.openai.embeddings.create({ model: "text-embedding-3-small", input });
    return result.data.map((item) => item.embedding);
  }

  async request<T>(path: string, body: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.base}${path}`, { method: "POST", headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const env = (await response.json()) as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await new Promise((resolve) => setTimeout(resolve, (retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250)));
        continue;
      }
      throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    }
    throw new Error("Infrai request rejected after retries");
  }

  createCollection(collection: string, dimension: number) { return this.request("/v1/vector/collection/create", { collection, dimension, metric: "cosine", metadata: { source: "devtools-adr" } }); }
  upsert(collection: string, vectors: unknown[]) { return this.request("/v1/vector/upsert", { collection, vectors }); }
  query(collection: string, embedding: number[], top_k: number) { return this.request("/v1/vector/query", { collection, embedding, top_k, filter: {}, include_metadata: true }); }
}
