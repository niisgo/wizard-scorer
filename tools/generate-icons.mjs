/* Erzeugt die App-Icons als PNG - ohne Abhängigkeiten, direkt aus Node.
   Start: npm run icons

   Motiv ist kein Bildchen, sondern ein Monogramm: ein W mit römischem
   Strichkontrast in Messing, eingefasst von einer doppelten Haarlinie -
   wie die Prägung auf einem Buchdeckel. Das bleibt auch bei 48 Pixeln
   lesbar und sieht nicht aus wie ein Aufkleber.

   Gerendert wird mit vierfachem Supersampling gegen harte Kanten. */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const OUT = fileURLToPath(new URL("../icons/", import.meta.url));
const SAMPLES = 4;

/* --- Farben (identisch mit den Design-Tokens) ---------------------------- */

const FELT = [15, 26, 20];
const BRASS = [194, 160, 89];
const FRAME = mix(FELT, BRASS, 0.55);
const FRAME_INNER = mix(FELT, BRASS, 0.3);

/* --- Das W --------------------------------------------------------------- */

/* Die vier Stämme des W als Mittellinien im Einheitsquadrat des
   Schriftfelds. Abwärtsstriche sind fett, Aufwärtsstriche dünn - so bauen
   römische Kapitalis-Schriften ihren Kontrast auf. `h` ist die halbe
   waagerecht gemessene Strichstärke. */
const APEX_Y = 0.2;
const STEMS = [
  { a: [0.08, 0], b: [0.3, 1], h: 0.09 },
  { a: [0.3, 1], b: [0.5, APEX_Y], h: 0.035 },
  { a: [0.5, APEX_Y], b: [0.7, 1], h: 0.09 },
  { a: [0.7, 1], b: [0.92, 0], h: 0.035 },
];

const [S1, S2, S3, S4] = STEMS;

/* Der Umriss, im Uhrzeigersinn oben links beginnend. Die Spitzen entstehen
   dort, wo sich zwei Stammkanten schneiden - deshalb wird gerechnet statt
   Striche mit runden Enden übereinanderzulegen. */
const OUTLINE = [
  [edgeX(S1, -1, 0), 0],
  [edgeX(S1, 1, 0), 0],
  meet(S1, 1, S2, -1), // Kerbe im linken V
  [edgeX(S2, -1, APEX_Y), APEX_Y],
  [edgeX(S3, 1, APEX_Y), APEX_Y], // geschnittene Spitze in der Mitte
  meet(S3, 1, S4, -1), // Kerbe im rechten V
  [edgeX(S4, -1, 0), 0],
  [edgeX(S4, 1, 0), 0],
  [edgeX(S4, 1, 1), 1],
  [edgeX(S3, -1, 1), 1],
  meet(S3, -1, S2, 1), // Tal zwischen den beiden V
  [edgeX(S2, 1, 1), 1],
  [edgeX(S1, -1, 1), 1],
];

/* Waagerechte Serifen an den oberen Enden und auf der Mittelspitze. */
const SERIFS = [
  { cx: 0.08, cy: 0.024, w: 0.3, h: 0.048 },
  { cx: 0.92, cy: 0.024, w: 0.3, h: 0.048 },
  { cx: 0.5275, cy: 0.222, w: 0.21, h: 0.044 },
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

const LETTER = { x0: 0.19, x1: 0.81, y0: 0.31, y1: 0.71 };
const FRAME_INSET = 0.0;
const FRAME_STROKE = 0.018;
const INNER_INSET = 0.052;
const INNER_STROKE = 0.009;

/**
 * Farbe an einem Punkt der Inhaltsfläche (0..1), oder null für Hintergrund.
 */
function markAt(x, y) {
  if (onFrame(x, y, FRAME_INSET, FRAME_STROKE)) return FRAME;
  if (onFrame(x, y, INNER_INSET, INNER_STROKE)) return FRAME_INNER;

  // In das Einheitsquadrat des Buchstabens umrechnen.
  const lx = (x - LETTER.x0) / (LETTER.x1 - LETTER.x0);
  const ly = (y - LETTER.y0) / (LETTER.y1 - LETTER.y0);
  if (lx < -0.2 || lx > 1.2 || ly < -0.2 || ly > 1.2) return null;

  for (const serif of SERIFS) {
    if (
      Math.abs(lx - serif.cx) <= serif.w / 2 &&
      Math.abs(ly - serif.cy) <= serif.h / 2
    ) {
      return BRASS;
    }
  }

  return inPolygon(lx, ly, OUTLINE) ? BRASS : null;
}

function onFrame(x, y, inset, stroke) {
  const low = inset;
  const high = 1 - inset;
  if (x < low || x > high || y < low || y > high) return false;
  const inner = stroke;
  return (
    x < low + inner || x > high - inner || y < low + inner || y > high - inner
  );
}


/* --- Zeichnen ------------------------------------------------------------ */

/**
 * @param {number} size Kantenlänge in Pixeln
 * @param {object} options
 * @param {number} options.padding Rand um die Zeichnung (Anteil der Kante)
 * @param {boolean} options.rounded abgerundete Ecken statt randlos
 */
function render(size, { padding, rounded }) {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = size * 0.2;
  const step = 1 / SAMPLES;
  const total = SAMPLES * SAMPLES;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let hits = 0;

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = (px + (sx + 0.5) * step) / size;
          const y = (py + (sy + 0.5) * step) / size;

          if (rounded && !inRoundedSquare(x * size, y * size, size, radius)) continue;

          const nx = (x - padding) / (1 - 2 * padding);
          const ny = (y - padding) / (1 - 2 * padding);
          const inside = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;
          const color = (inside ? markAt(nx, ny) : null) ?? FELT;

          r += color[0];
          g += color[1];
          b += color[2];
          hits += 1;
        }
      }

      const offset = (py * size + px) * 4;
      pixels[offset] = hits ? Math.round(r / hits) : 0;
      pixels[offset + 1] = hits ? Math.round(g / hits) : 0;
      pixels[offset + 2] = hits ? Math.round(b / hits) : 0;
      pixels[offset + 3] = Math.round((hits / total) * 255);
    }
  }

  return encodePng(size, size, pixels);
}

function inRoundedSquare(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function mix(from, to, amount) {
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
  { file: "icon-192.png", size: 192, padding: 0.05, rounded: true },
  { file: "icon-512.png", size: 512, padding: 0.05, rounded: true },
  // Maskierbare Icons werden von Android beschnitten - Inhalt weit nach innen.
  { file: "icon-maskable-512.png", size: 512, padding: 0.19, rounded: false },
  // iOS rundet das Touch-Icon selbst ab, deshalb randlos.
  { file: "apple-touch-icon.png", size: 180, padding: 0.08, rounded: false },
];

mkdirSync(OUT, { recursive: true });
for (const target of targets) {
  const png = render(target.size, target);
  writeFileSync(join(OUT, target.file), png);
  console.log(`${target.file} – ${(png.length / 1024).toFixed(1)} kB`);
}
