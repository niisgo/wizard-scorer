/* Erzeugt die App-Icons als PNG - ohne Abhängigkeiten, direkt aus Node.
   Start: npm run icons

   Gezeichnet wird ein Zaubererhut auf violettem Verlauf: eine Form, die auch
   bei 48 Pixeln auf dem Homescreen noch erkennbar ist. Gerendert wird mit
   dreifachem Supersampling, damit die Kanten weich werden. */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const OUT = fileURLToPath(new URL("../icons/", import.meta.url));
const SAMPLES = 3;

/* --- Farben -------------------------------------------------------------- */

const BG_TOP = [155, 108, 255];
const BG_BOTTOM = [76, 29, 149];
const HAT = [250, 247, 255];
const HAT_SHADE = [214, 203, 240];
const STAR = [251, 191, 36];

/* --- Geometrie (normalisiert auf die Inhaltsfläche) ---------------------- */

const CONE = [
  [0.5, 0.135],
  [0.688, 0.688],
  [0.312, 0.688],
];
const BRIM = { cx: 0.5, cy: 0.702, rx: 0.325, ry: 0.088 };
const BADGE = { cx: 0.5, cy: 0.487, outer: 0.079, inner: 0.032 };

const starPoints = starPolygon(BADGE.cx, BADGE.cy, BADGE.outer, BADGE.inner, 5);

/* --- Zeichnen ------------------------------------------------------------ */

/**
 * Farbe eines Punktes in normalisierten Koordinaten (0..1 über die
 * Inhaltsfläche). Gibt null zurück, wenn dort nur der Hintergrund liegt.
 */
function hatColorAt(x, y) {
  if (pointInPolygon(x, y, starPoints)) return STAR;
  if (inEllipse(x, y, BRIM)) {
    // Untere Hälfte der Krempe etwas dunkler - das gibt der Form Tiefe.
    return y > BRIM.cy ? HAT_SHADE : HAT;
  }
  if (pointInPolygon(x, y, CONE)) return HAT;
  return null;
}

/**
 * @param {number} size Kantenlänge in Pixeln
 * @param {object} options
 * @param {number} options.padding Rand um die Zeichnung (Anteil der Kante)
 * @param {boolean} options.rounded abgerundete Ecken statt randlos
 */
function render(size, { padding, rounded }) {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;
  const step = 1 / SAMPLES;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = (px + (sx + 0.5) * step) / size;
          const y = (py + (sy + 0.5) * step) / size;

          if (rounded && !inRoundedSquare(x * size, y * size, size, radius)) continue;

          const background = mix(BG_TOP, BG_BOTTOM, (x * 0.35 + y * 0.65));
          const nx = (x - padding) / (1 - 2 * padding);
          const ny = (y - padding) / (1 - 2 * padding);
          const shape =
            nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1 ? hatColorAt(nx, ny) : null;
          const color = shape ?? background;

          r += color[0];
          g += color[1];
          b += color[2];
          a += 255;
        }
      }

      const total = SAMPLES * SAMPLES;
      const offset = (py * size + px) * 4;
      // Deckkraft aus der Abdeckung, Farbe aus dem Mittel der Treffer.
      const covered = a / 255;
      pixels[offset] = covered ? Math.round(r / covered) : 0;
      pixels[offset + 1] = covered ? Math.round(g / covered) : 0;
      pixels[offset + 2] = covered ? Math.round(b / covered) : 0;
      pixels[offset + 3] = Math.round(a / total);
    }
  }

  return encodePng(size, size, pixels);
}

/* --- Hilfsgeometrie ------------------------------------------------------ */

function starPolygon(cx, cy, outer, inner, spikes) {
  const points = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / spikes;
    const radius = i % 2 === 0 ? outer : inner;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
}

function pointInPolygon(x, y, points) {
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

function inEllipse(x, y, { cx, cy, rx, ry }) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function inRoundedSquare(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function mix(from, to, t) {
  const amount = Math.min(Math.max(t, 0), 1);
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
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
  { file: "icon-192.png", size: 192, padding: 0.07, rounded: true },
  { file: "icon-512.png", size: 512, padding: 0.07, rounded: true },
  // Maskierbare Icons werden von Android beschnitten - Inhalt weit nach innen.
  { file: "icon-maskable-512.png", size: 512, padding: 0.2, rounded: false },
  // iOS rundet das Touch-Icon selbst ab, deshalb randlos.
  { file: "apple-touch-icon.png", size: 180, padding: 0.1, rounded: false },
];

mkdirSync(OUT, { recursive: true });
for (const target of targets) {
  const png = render(target.size, target);
  writeFileSync(join(OUT, target.file), png);
  console.log(`${target.file} – ${(png.length / 1024).toFixed(1)} kB`);
}
