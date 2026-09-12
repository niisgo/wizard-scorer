/* Erzeugt die App-Icons als PNG - ohne Abhängigkeiten, direkt aus Node.
   Start: npm run icons

   Motiv im Entwurf "Plakat": ein schweres, schmales W in Zinnober auf
   weissem Papier, eingefasst von einem dicken schwarzen Rahmen. Keine
   abgerundeten Ecken - der Rahmen gibt die Form vor.

   Gerendert wird mit vierfachem Supersampling gegen harte Kanten. */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const OUT = fileURLToPath(new URL("../icons/", import.meta.url));
const SAMPLES = 4;

/* --- Farben (identisch mit den Design-Tokens) ---------------------------- */

const PAPER = [255, 255, 255];
const INK = [17, 17, 17];
const ACC = [220, 59, 30];

/* --- Das W --------------------------------------------------------------- */

/* Die vier Stämme als Mittellinien im Einheitsquadrat des Schriftfelds.
   Anders als bei einer Antiqua sind hier alle Striche gleich schwer und
   die Enden glatt geschnitten - so baut eine fette Grotesk ihr W.
   `h` ist die halbe waagerecht gemessene Strichstärke. */
const APEX_Y = 0.12;
const WEIGHT = 0.105;
const STEMS = [
  { a: [0.09, 0], b: [0.3, 1], h: WEIGHT },
  { a: [0.3, 1], b: [0.5, APEX_Y], h: WEIGHT },
  { a: [0.5, APEX_Y], b: [0.7, 1], h: WEIGHT },
  { a: [0.7, 1], b: [0.91, 0], h: WEIGHT },
];

const [S1, S2, S3, S4] = STEMS;

/* Der Umriss, im Uhrzeigersinn oben links beginnend. Die Kerben entstehen
   dort, wo sich zwei Stammkanten schneiden. */
const OUTLINE = [
  [edgeX(S1, -1, 0), 0],
  [edgeX(S1, 1, 0), 0],
  meet(S1, 1, S2, -1), // Kerbe im linken V
  [edgeX(S2, -1, APEX_Y), APEX_Y],
  [edgeX(S3, 1, APEX_Y), APEX_Y], // glatt geschnittene Spitze in der Mitte
  meet(S3, 1, S4, -1), // Kerbe im rechten V
  [edgeX(S4, -1, 0), 0],
  [edgeX(S4, 1, 0), 0],
  [edgeX(S4, 1, 1), 1],
  [edgeX(S3, -1, 1), 1],
  meet(S3, -1, S2, 1), // Tal zwischen den beiden V
  [edgeX(S2, 1, 1), 1],
  [edgeX(S1, -1, 1), 1],
];

/** x-Wert einer Stammkante (-1 links, +1 rechts) auf Höhe y. */
function edgeX(stem, side, y) {
  const t = (y - stem.a[1]) / (stem.b[1] - stem.a[1]);
  return stem.a[0] + t * (stem.b[0] - stem.a[0]) + side * stem.h;
}

/** Schnittpunkt zweier Stammkanten. */
function meet(stemA, sideA, stemB, sideB) {
  const slope = (stem) => (stem.b[0] - stem.a[0]) / (stem.b[1] - stem.a[1]);
  const mA = slope(stemA);
  const mB = slope(stemB);
  const cA = stemA.a[0] - mA * stemA.a[1] + sideA * stemA.h;
  const cB = stemB.a[0] - mB * stemB.a[1] + sideB * stemB.h;
  const y = (cB - cA) / (mA - mB);
  return [mA * y + cA, y];
}

function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const LETTER = { x0: 0.24, x1: 0.76, y0: 0.26, y1: 0.74 };
const FRAME_STROKE = 0.04;

/**
 * Farbe an einem Punkt der Inhaltsfläche (0..1), oder null für Papier.
 */
function markAt(x, y) {
  if (
    x < FRAME_STROKE ||
    x > 1 - FRAME_STROKE ||
    y < FRAME_STROKE ||
    y > 1 - FRAME_STROKE
  ) {
    return INK;
  }

  // In das Einheitsquadrat des Buchstabens umrechnen.
  const lx = (x - LETTER.x0) / (LETTER.x1 - LETTER.x0);
  const ly = (y - LETTER.y0) / (LETTER.y1 - LETTER.y0);
  if (lx < -0.2 || lx > 1.2 || ly < -0.2 || ly > 1.2) return null;

  return inPolygon(lx, ly, OUTLINE) ? ACC : null;
}

/* --- Zeichnen ------------------------------------------------------------ */

/**
 * @param {number} size Kantenlänge in Pixeln
 * @param {number} padding Rand um die Zeichnung (Anteil der Kante)
 */
function render(size, padding) {
  const pixels = Buffer.alloc(size * size * 4);
  const step = 1 / SAMPLES;
  const total = SAMPLES * SAMPLES;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = ((px + (sx + 0.5) * step) / size - padding) / (1 - 2 * padding);
          const y = ((py + (sy + 0.5) * step) / size - padding) / (1 - 2 * padding);
          const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
          const color = (inside ? markAt(x, y) : null) ?? PAPER;

          r += color[0];
          g += color[1];
          b += color[2];
        }
      }

      const offset = (py * size + px) * 4;
      pixels[offset] = Math.round(r / total);
      pixels[offset + 1] = Math.round(g / total);
      pixels[offset + 2] = Math.round(b / total);
      pixels[offset + 3] = 255;
    }
  }

  return encodePng(size, size, pixels);
}

/* --- PNG ----------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  // Jede Zeile bekommt ein Filter-Byte (0 = kein Filter) vorangestellt.
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // Bittiefe
  header[9] = 6; // Farbtyp: RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --- Ausgabe ------------------------------------------------------------- */

const targets = [
  { file: "icon-192.png", size: 192, padding: 0 },
  { file: "icon-512.png", size: 512, padding: 0 },
  // Maskierbare Icons werden von Android beschnitten - Inhalt weit nach innen.
  { file: "icon-maskable-512.png", size: 512, padding: 0.17 },
  { file: "apple-touch-icon.png", size: 180, padding: 0 },
];

mkdirSync(OUT, { recursive: true });
for (const target of targets) {
  const png = render(target.size, target.padding);
  writeFileSync(join(OUT, target.file), png);
  console.log(`${target.file} – ${(png.length / 1024).toFixed(1)} kB`);
}
