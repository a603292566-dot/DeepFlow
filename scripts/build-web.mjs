import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const entries = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "src",
  "icons"
];

for (const entry of entries) {
  await cp(resolve(rootDir, entry), resolve(distDir, entry), { recursive: true });
}

console.log(`Built DeepFlow web app to ${distDir}`);
