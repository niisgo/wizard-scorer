/* Einstiegspunkt. Haelt die Referenzen auf die drei Layout-Bereiche und
   rendert den aktuellen Screen. Die eigentlichen Screens kommen spaeter. */

const root = {
  topbar: document.getElementById("topbar"),
  screen: document.getElementById("screen"),
  actionbar: document.getElementById("actionbar"),
};

function render() {
  root.topbar.innerHTML = "";
  root.actionbar.innerHTML = "";
  root.screen.innerHTML = `
    <h1>Wizard Scorer</h1>
    <p>Der digitale Punkteblock wird gerade gebaut.</p>
  `;
}

render();
