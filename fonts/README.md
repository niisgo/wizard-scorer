# Schriften

Beide Familien liegen als Variable Font im Repo, statt sie von einem CDN zu
laden. Zwei Gründe: Die App soll offline vollständig richtig aussehen, und es
soll beim Öffnen keine Verbindung zu einem Dritten aufgebaut werden.

| Datei | Familie | Verwendung |
| --- | --- | --- |
| `cinzel-latin.woff2`, `cinzel-latin-ext.woff2` | Cinzel 400–700 | Überschriften, Rubriken, Buttons |
| `inter-latin.woff2`, `inter-latin-ext.woff2` | Inter 400–700 | Fließtext und alle Zahlen |

Die `-ext`-Dateien decken osteuropäische und türkische Zeichen ab. Dank
`unicode-range` lädt der Browser sie nur, wenn ein Name solche Zeichen
enthält.

Beide stehen unter der **SIL Open Font License 1.1** (siehe `OFL.txt`):

- Cinzel — Copyright 2020 The Cinzel Project Authors, <https://github.com/NDISCOVER/Cinzel>
- Inter — Copyright 2020 The Inter Project Authors, <https://github.com/rsms/inter>
