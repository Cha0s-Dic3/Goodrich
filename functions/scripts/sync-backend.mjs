import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const functionsDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(functionsDir, "..");

const srcServerDir = path.join(projectRoot, "server");
const outBackendDir = path.join(functionsDir, "backend");

await rm(outBackendDir, { recursive: true, force: true });
await mkdir(outBackendDir, { recursive: true });

await cp(path.join(srcServerDir, "index.js"), path.join(outBackendDir, "index.js"));
await cp(path.join(srcServerDir, "data"), path.join(outBackendDir, "data"), { recursive: true });

