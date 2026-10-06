import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const documentRequest = z.object({ collection: z.string().min(1), documentId: z.string().min(1), title: z.string().min(1), content: z.string().min(1), source: z.string().url() });
export type DocumentRequest = z.infer<typeof documentRequest>;

export function chunkText(text: string, size = 240): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size).join(" "));
  return chunks;
}

export async function ingestDocument(raw: unknown, client: InfraiClient, options: { persist?: boolean } = {}) {
  const input = documentRequest.parse(raw);
  const chunks = chunkText(input.content);
  const embeddings = await client.embeddings(chunks);
  if (options.persist === false) {
    return { documentId: input.documentId, collection: input.collection, chunks: chunks.length, persisted: false };
  }
  await client.createCollection(input.collection, embeddings[0]?.length ?? 0);
  const vectors = embeddings.map((embedding, index) => ({ id: `${input.documentId}-${index}`, embedding, metadata: { title: input.title, source: input.source, chunk: index, text: chunks[index] } }));
  await client.upsert(input.collection, vectors);
  return { documentId: input.documentId, collection: input.collection, chunks: chunks.length };
}
