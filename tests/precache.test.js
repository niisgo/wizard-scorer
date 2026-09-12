import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

/* Der Service Worker führt seine Dateiliste von Hand - es gibt keinen Build,
   der sie erzeugen könnte. Dieser Test sorgt dafür, dass eine neu angelegte
   Datei nicht stillschweigend aus dem Offline-Cache fällt. */

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CACHEABLE = /\.(js|css|png|svg|webmanifest|html|woff2)$/;
const SKIP = new Set(["node_modules", "tests", "tools", ".git", ".github", ".claude"]);

function listFiles(dir = ROOT) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listFiles(full));
    else if (CACHEABLE.test(entry.name)) {
      found.push(relative(ROOT, full).replaceAll("\\", "/"));
    }
  }
  return found;
}

const precached = new Set(
  [...readFileSync(join(ROOT, "sw.js"), "utf8").matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]),
);

test("jede auslieferbare Datei steht im Offline-Cache", () => {
  const missing = listFiles()
    .filter((file) => file !== "sw.js")
    .filter((file) => !precached.has(file));

  assert.deepEqual(missing, [], `Nicht im Service Worker gelistet: ${missing.join(", ")}`);
});

test("im Offline-Cache steht keine Datei, die es nicht gibt", () => {
  const known = new Set(listFiles());
  const ghosts = [...precached].filter((file) => file !== "" && !known.has(file));

  assert.deepEqual(ghosts, [], `Im Service Worker gelistet, aber nicht vorhanden: ${ghosts.join(", ")}`);
});
