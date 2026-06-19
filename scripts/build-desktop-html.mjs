import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = process.argv[2];

if (!outputPath) {
  throw new Error("Usage: node scripts/build-desktop-html.mjs <output-index.html>");
}

function stripModules(source) {
  return source
    .replace(/import\s+[\s\S]*?from\s+".*?";\n/g, "")
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+async\s+function\s+/g, "async function ")
    .replace(/export\s+function\s+/g, "function ");
}

async function readLocalEnv() {
  try {
    const source = await readFile(resolve(rootDir, ".env.local"), "utf8");
    return Object.fromEntries(
      source
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const index = line.indexOf("=");
          if (index < 0) return [line, ""];
          return [line.slice(0, index), line.slice(index + 1)];
        })
    );
  } catch {
    return {};
  }
}

const localEnv = await readLocalEnv();
const browserEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || localEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
};

const css = await readFile(resolve(rootDir, "src/styles.css"), "utf8");
const sources = [
  "src/domain.js",
  "src/identityReportTemplates.js",
  "src/scoring.js",
  "src/storage.js",
  "src/learningPath.js",
  "src/growthEvidence.js",
  "src/investmentLearning.js",
  "src/investmentPromptEngine.js",
  "src/promptEngine.js",
  "src/cloudSync.js",
  "src/app.js"
];
const scripts = await Promise.all(
  sources.map(async (path) => `\n/* ${path} */\n${stripModules(await readFile(resolve(rootDir, path), "utf8"))}`)
);

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DeepFlow MVP</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="app"></div>
    <script>
window.DEEPFLOW_ENV = ${JSON.stringify(browserEnv, null, 2)};
${scripts.join("\n")}
    </script>
  </body>
</html>
`;

await writeFile(outputPath, html, "utf8");
