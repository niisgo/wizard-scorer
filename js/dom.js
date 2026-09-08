/* Minimale DOM-Helfer. Elemente werden gebaut statt per innerHTML gesetzt,
   damit Spielernamen nie als Markup interpretiert werden. */

/**
 * @param {string} tag
 * @param {Record<string, any>} [props] class, text, dataset, on<Event>, sonst Attribut
 * @param {Array<Node|string|null|false>|Node|string} [children]
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = String(value);
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? "" : String(value));
  }

  append(node, children);
  return node;
}

/** Kinder anhängen; Strings werden zu Textknoten, null/false werden ignoriert. */
export function append(parent, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function clear(node) {
  node.replaceChildren();
  return node;
}

export function fragment(children) {
  return append(document.createDocumentFragment(), children);
}

/** Punkte immer mit Vorzeichen: +30 / -10 / 0 */
export function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

/** Kurzes haptisches Feedback, wenn das Gerät es kann. */
export function buzz(pattern = 8) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* egal */
  }
}
