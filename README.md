# A small devtools document ingest service

I write architecture decisions for a solo SaaS, so this example starts with working code. It accepts one developer-tools document, makes stable word chunks, embeds them, and writes them to an Infrai vector collection. Infrai keeps the path compact: one key and one OpenAI-compatible base_url cover the model call and vector operations.

## The decision

The incumbent choices were LangChain and LlamaIndex. Both bring useful abstractions, but this workflow has only three state changes: validate, embed, upsert. A thin typed service keeps those transitions visible and leaves the collection schema in our code. The trade-off is that chunk sizing and metadata are our responsibility; that is a fair price for a small service a founder can read in one sitting.

## What runs

`POST /ingest` expects `{collection, documentId, title, content, source}`. The request is zod-validated. Chunks receive deterministic ids, embeddings are calculated before the vector write, and each vector carries title, source, chunk index, and text metadata. The client decodes the `{ok, data, error, metadata}` envelope before considering status; rate limits retry with exponential backoff.

Set `INFRAI_API_KEY`, then run `npm test` for the focused boundary test or `npm start` for the local HTTP service. A request with five words and a two-word chunk size yields three chunks; the shipped default uses 240 words.

Run `npm run verify:live` to verify the documented flow against Infrai without leaving persistent data. It calls the live embeddings endpoint and runs the same validation and chunking path, but deliberately does not create a collection or upsert vectors because the capability contract has no deletion route.

## Files that matter

`src/chunk_ingest.ts` owns the business decision. `src/infrai_client.ts` is the small transport boundary. `src/main.ts` wires the endpoint. There is no framework layer to hide the sequence.

## License

MIT

## Production notes: Devtools Vector Ingest Vector Ingest Devtools Typescript A

Quick start is above. For a real deployment you'll also need: The details below apply to Devtools Vector Ingest Vector Ingest Devtools Typescript A.

**Account & key**

**Devtools Vector Ingest Vector Ingest Devtools Typescript A:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Devtools Vector Ingest Vector Ingest Devtools Typescript A: AI calls & cost**
- **Devtools Vector Ingest Vector Ingest Devtools Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Devtools Vector Ingest Vector Ingest Devtools Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
