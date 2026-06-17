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
    .replace(/export\s+function\s+/g, "function ");
}

const css = await readFile(resolve(rootDir, "src/styles.css"), "utf8");
const sources = [
  "src/domain.js",
  "src/identityReportTemplates.js",
  "src/scoring.js",
  "src/storage.js",
  "src/promptEngine.js",
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
${scripts.join("\n")}
    </script>
  </body>
</html>
`;

await writeFile(outputPath, html, "utf8");
