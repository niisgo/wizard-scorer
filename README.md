# Wizard Scorer

Digitaler Punkteblock für das Kartenspiel **Wizard** – als installierbare PWA,
gebaut fürs Handy, nutzbar auf allem anderen auch.

Kein Zettel, kein Kopfrechnen: Die App sagt vor jeder Runde an, wie viele Karten
ausgeteilt werden, nimmt die Stichansagen reihum entgegen – inklusive der Regel,
dass die Ansagen nicht aufgehen dürfen – und rechnet die Punkte nach den
offiziellen Regeln aus.

## Ablauf

1. **Spielerzahl wählen** (3 bis 6) – die App sagt dazu, wie viele Runden das
   Blatt hergibt.
2. **Namen eintragen.** Die Namen der letzten Partie sind vorbelegt.
3. **Austeilen.** Die App sagt gross an, wie viele Karten jeder bekommt, wer
   gibt und wer zuerst ansagt.
4. **Punkteübersicht.** Von hier führt ein einziger Button weiter – er zeigt
   immer nur den nächsten Schritt.
5. **Schätzen.** Reihum, links vom Geber beginnend, der Geber zuletzt.
6. **Runde beenden.** Eintragen, wie viele Stiche wirklich geholt wurden.
7. **Punkte.** Werden berechnet und sofort angezeigt. Weiter zur nächsten Runde,
   bis das Blatt aufgebraucht ist – dann kommt die Schlusstabelle.

## Die Regeln, die die App durchsetzt

| Regel | Umsetzung |
| --- | --- |
| In Runde *n* bekommt jeder *n* Karten | Wird angesagt und geprüft |
| Rundenanzahl = 60 Karten ÷ Spielerzahl | 3 Spieler → 20 Runden, 6 → 10 |
| Der Geber wechselt reihum, er sagt zuletzt an | Ansage-Reihenfolge links vom Geber |
| **Die Ansagen dürfen nicht aufgehen** | Die Zahl, mit der die Summe exakt der Stichzahl entspräche, ist beim letzten Ansagenden gesperrt |
| Ansage getroffen | 20 Punkte + 10 pro geholtem Stich |
| Ansage verfehlt | 10 Minuspunkte pro Stich Abweichung, nach oben wie nach unten |
| Es gibt genau so viele Stiche wie Karten | Die Runde lässt sich erst werten, wenn die Summe stimmt |

Haben die Mitspieler bereits mehr angesagt, als es Stiche gibt, ist für den
letzten Ansagenden **nichts** gesperrt – dann kann die Runde ohnehin nicht mehr
aufgehen.

## Gestaltung

Vorbild ist ein gedrucktes Plakat, nicht eine Oberfläche: weisses Papier,
schwarze Konturen, Zinnober als Signalfarbe.

- **Weiss als Grund**, nicht Creme oder Grau. Darauf Schwarz, ein Zinnober
  (`#dc3b1e`) für alles Aktive, Senfgelb (`#e9a81c`) für das, was gerade
  ausgewählt ist, und Petrol (`#0f6b62`) für Rubriken und Punktgewinne.
  Keine Verläufe, keine weichen Schatten, keine Rundungen.
- **Zwei Linienstärken mit klarer Bedeutung:** 1px schwarz trennt Zeilen,
  2px schwarz umrandet alles, was man anfassen kann.
- **Harte versetzte Schatten.** Knöpfe und ausgewählte Felder werfen einen
  5px-Schatten ohne Weichzeichner und rutschen beim Drücken darauf – das
  gibt am Tisch eine spürbare Rückmeldung, ganz ohne Animation.
- **Typografie zweigeteilt:** [Anton](https://github.com/googlefonts/AntonFont)
  für Überschriften, Namen und die grosse Kartenzahl,
  [Archivo](https://github.com/Omnibus-Type/Archivo) für jede Punktzahl.
  Am Tisch darf sich niemand verlesen, deshalb stehen alle Werte in Archivo
  mit Tabellenziffern.
- **Dunkel ist dasselbe Plakat, schwarz gedruckt:** gleiche Konturen,
  gleiche Signalfarben, Papier und Tinte tauschen die Rollen.
- Beide Schriften liegen im Repo (siehe [fonts/](fonts/)), damit die App
  offline gleich aussieht und beim Öffnen keine Verbindung zu einem CDN
  aufbaut.

## Am Tisch gedacht

- **Offline nutzbar.** Ein Service Worker liefert die App aus dem Cache aus, der
  Empfang im Vereinsheim ist egal.
- **Installierbar.** Über den Homescreen startet sie ohne Browserleiste.
- **Spielstand übersteht alles.** Nach jedem Schritt gespeichert; ein
  geschlossener Tab oder ein leerer Akku kostet keine Runde.
- **Bildschirm anlassen.** Optional, damit das Display während der Partie nicht
  zugeht.
- **Wertung korrigierbar.** Verzählt? Letzte Wertung zurücknehmen, die Ansagen
  bleiben stehen.
- **Hell und dunkel**, standardmässig der Systemeinstellung folgend.

## Entwicklung

Kein Build-Schritt, keine Abhängigkeiten – reine ES-Module, die der Browser
direkt lädt.

```bash
npm run dev     # Dev-Server auf http://localhost:5173
npm test        # Regel- und Ablauftests (node:test)
npm run icons   # App-Icons neu erzeugen
```

### Aufbau

```
index.html            App-Hülle
sw.js                 Service Worker (Dateiliste von Hand gepflegt)
manifest.webmanifest  PWA-Manifest
css/
  tokens.css          Farben, Abstände, Linienstärken – hell wie dunkel
  base.css            Reset und Layout
  components.css      Knöpfe, Zahlenraster, Rubriken, Bottom-Sheet
  screens.css         Screen-spezifisches
js/
  rules.js            Die Wizard-Regeln als reine Funktionen
  game.js             Partie-Objekt und Zustandsübergänge
  store.js            Laufende Partie, automatisch gespeichert
  storage.js          localStorage-Wrapper
  router.js           Screen-Router
  flow.js             Phase der Partie -> passender Screen
  screens/            start, names, deal, board, bids, tricks, final
  ui/                 Shell, Bausteine, Rangliste, Menü
tools/
  serve.mjs           Dev-Server
  generate-icons.mjs  PNG-Icons direkt aus Node
tests/                node:test
```

`rules.js` und `game.js` kennen kein DOM. Die gesamte Wertung inklusive der
Hook-Regel lässt sich damit ohne Browser testen.

Weil es keinen Build gibt, führt `sw.js` seine Dateiliste von Hand – ein Test
stellt sicher, dass sie exakt dem Projektinhalt entspricht und keine neue Datei
stillschweigend aus dem Offline-Cache fällt.

## Deployment

Push auf `main` lässt GitHub Actions die Tests laufen und veröffentlicht das
Ergebnis auf GitHub Pages. Alle Pfade sind relativ, die App läuft deshalb auch
in einem Unterverzeichnis.

## Lizenz

MIT – siehe [LICENSE](LICENSE).

Wizard ist ein Kartenspiel von Ken Fisher, erschienen bei Amigo. Dieses Projekt
ist ein privater Punkteblock und steht in keiner Verbindung zum Verlag.
