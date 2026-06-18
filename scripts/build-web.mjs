import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist");

function runNode(script, ...args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [resolve(rootDir, script), ...args], {
      cwd: rootDir,
      stdio: "inherit"
    });
    child.on("exit", (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${script} exited with ${code}`));
    });
  });
}

await runNode("scripts/generate-env-config.mjs", "env-config.js");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const entries = [
  "index.html",
  "env-config.js",
  "manifest.webmanifest",
  "service-worker.js",
  "src",
  "icons"
];

for (const entry of entries) {
  await cp(resolve(rootDir, entry), resolve(distDir, entry), { recursive: true });
}

console.log(`Built DeepFlow web app to ${distDir}`);
