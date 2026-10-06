import { createServer } from "node:http";
import { ingestDocument } from "./chunk_ingest.js";
import { InfraiClient } from "./infrai_client.js";

const client = new InfraiClient();
const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/ingest") { res.writeHead(404).end(); return; }
  try {
    const body = await new Promise<string>((resolve, reject) => { let data = ""; req.on("data", (chunk) => { data += chunk; }); req.on("end", () => resolve(data)); req.on("error", reject); });
    const result = await ingestDocument(JSON.parse(body), client);
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, data: result }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ ok: false, error: { message } }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("devtools ingest listening"));
