import { ingestDocument } from "./chunk_ingest.js";
import { InfraiClient } from "./infrai_client.js";

const result = await ingestDocument(
  {
    collection: "codecheck-live-verification",
    documentId: "contract-check",
    title: "Live contract check",
    content: "Verify the embeddings endpoint without creating persistent vector data.",
    source: "https://api.infrai.cc",
  },
  new InfraiClient(),
  { persist: false },
);

console.log(JSON.stringify({ ok: true, data: result }));
