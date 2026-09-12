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

Vorbild ist kein App-Dashboard, sondern der Punktezettel selbst: ein Kontobuch
auf dem Spieltisch.

- **Farben** kommen vom Tisch: matter, dunkler Filz als Grund, gealtertes
  Messing als einzige Akzentfarbe, Pergament für die Schrift. Keine Verläufe.
  Die helle Variante ist dasselbe in Tinte auf Papier.
- **Getrennt wird mit 1px-Haarlinien**, nicht mit Schlagschatten oder Kästen.
  Es gibt bewusst keine „Karten": Abschnitte stehen direkt auf der Seite unter
  einer gesetzten Rubrik.
- **Typografie** zweigeteilt: [Cinzel](https://github.com/NDISCOVER/Cinzel) für
  Überschriften, Rubriken und Knöpfe, [Inter](https://github.com/rsms/inter)
  für jede Zahl. Am Tisch darf sich niemand verlesen, deshalb sind alle Werte
  serifenlos, mit Tabellenziffern und gross gesetzt.
- **Details statt Deko**: gepunktete Führungslinien wie im
  Inhaltsverzeichnis, eine Strichliste für die Kartenzahl, ein Strich je Runde
  als Fortschritt – und eine gesperrte Ansage wird diagonal durchgestrichen,
  so wie man es auf Papier täte.
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
  tokens.css          Farben und Abstände, hell wie dunkel
  base.css            Reset und Layout
  components.css      Buttons, Karten, Zahlenraster, Bottom-Sheet
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
