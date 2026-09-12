/* Winziger statischer Dev-Server ohne Abhängigkeiten.
   Start: npm run dev  ->  http://localhost:5173 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = normalize(decoded).replace(/^([/\\])+/, "");

  // Kein Ausbrechen aus dem Projektordner.
  if (relative.split(sep).includes("..")) return null;

  let target = join(ROOT, relative);
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, "index.html");
  } catch {
    return null;
  }

  try {
    return { path: target, body: await readFile(target) };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url || "/");

  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404 - nicht gefunden");
    return;
  }

  res.writeHead(200, {
    "content-type": MIME[extname(file.path)] ?? "application/octet-stream",
    // Während der Entwicklung will niemand Caching-Rätsel lösen.
    "cache-control": "no-store",
  });
  res.end(file.body);
}).listen(PORT, () => {
  console.log(`Wizard Scorer läuft auf http://localhost:${PORT}`);
});
