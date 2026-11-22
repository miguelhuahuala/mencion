/** Lista los modelos que DataForSEO ofrece por motor (llamada gratuita). */
import "dotenv/config";
import { listModels } from "../src/lib/dataforseo";

async function main() {
  for (const engine of ["claude", "gemini", "perplexity"] as const) {
    const models = await listModels(engine);
    console.log(`\n${engine}:`);
    for (const m of models) console.log(`  ${m.model_name}${m.web_search_supported ? "  (web search)" : ""}${m.reasoning ? "  (reasoning)" : ""}`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
