# Schriften

Beide Familien liegen im Repo, statt sie von einem CDN zu laden. Zwei Gründe:
Die App soll offline vollständig richtig aussehen, und es soll beim Öffnen
keine Verbindung zu einem Dritten aufgebaut werden.

| Datei | Familie | Verwendung |
| --- | --- | --- |
| `anton-latin.woff2`, `anton-latin-ext.woff2` | Anton 400 | Überschriften, Namen, Knöpfe, die grosse Kartenzahl |
| `archivo-latin.woff2`, `archivo-latin-ext.woff2` | Archivo 400–700 | Fliesstext und alle Punktzahlen |

Anton gibt es nur in einem Schnitt, und der ist bereits sehr fett. Überall,
wo Anton gesetzt wird, steht deshalb ausdrücklich `font-weight: 400` – sonst
rechnet der Browser einen falschen Fettschnitt dazu.

Die `-ext`-Dateien decken osteuropäische und türkische Zeichen ab. Dank
`unicode-range` lädt der Browser sie nur, wenn ein Name solche Zeichen
enthält.

Beide stehen unter der **SIL Open Font License 1.1** (siehe `OFL.txt`):

- Anton — Copyright The Anton Project Authors, <https://github.com/googlefonts/AntonFont>
- Archivo — Copyright The Archivo Project Authors, <https://github.com/Omnibus-Type/Archivo>
