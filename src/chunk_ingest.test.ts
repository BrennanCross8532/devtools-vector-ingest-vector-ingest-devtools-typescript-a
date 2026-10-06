import assert from "node:assert/strict";
import { chunkText, ingestDocument } from "./chunk_ingest.js";

const chunks = chunkText("one two three four five", 2);
assert.deepEqual(chunks, ["one two", "three four", "five"]);

let persistentWriteAttempted = false;
const verificationClient = {
  embeddings: async (input: string[]) => input.map(() => [0.1, 0.2]),
  createCollection: async () => { persistentWriteAttempted = true; },
  upsert: async () => { persistentWriteAttempted = true; },
} as any;
const verification = await ingestDocument(
  { collection: "verification", documentId: "doc", title: "Title", content: "one two", source: "https://example.com" },
  verificationClient,
  { persist: false },
);
assert.equal(persistentWriteAttempted, false);
assert.equal(verification.persisted, false);
console.log("chunk decision: 2-word boundaries are deterministic");
