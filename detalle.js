import {
  toLineLengths,
  layout,
} from "https://esm.sh/@chenglou/pretext@0.5.0";

const container = document.querySelector("#detail-article");

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    tipo: params.get("tipo"),
    slug: params.get("slug"),
  };
}

async function fetchCollection(path) {
  const res = await fetch(path);
  return res.json();
}

function applyPretextMeasure(el, text, tipo) {
  const width = el.clientWidth || 720;
  const normalized = text.replace(/\n+/g, " ");
  const base = tipo === "cuento" ? 66 : 42;
  const lineLength = Math.min(base, Math.max(28, Math.floor(width / 9)));

  const breaks = toLineLengths(normalized, lineLength);
  const lines = layout(lineLength, breaks, normalized).length;

  el.style.maxWidth = `${lineLength}ch`;
  el.style.setProperty("--lines", lines);
}

function render(item, tipo) {
  const title = document.createElement("h1");
  title.textContent = item.titulo;

  const text = document.createElement("div");
  text.className = "detail-text";

  if (tipo === "poema") {
    text.innerHTML = item.texto.replace(/\n/g, "<br>");
  } else {
    const blocks = item.texto.split(/\n\n+/);
    blocks.forEach((b) => {
      const p = document.createElement("p");
      p.textContent = b;
      text.appendChild(p);
    });
  }

  container.append(title, text);

  requestAnimationFrame(() => {
    applyPretextMeasure(container, item.texto, tipo);
  });
}

async function init() {
  const { tipo, slug } = getParams();

  const data = await fetchCollection(
    tipo === "poema" ? "./content/poemas.json" : "./content/cuentos.json"
  );

  const item = data.find((x) => slugify(x.titulo) === slug);

  if (!item) {
    container.textContent = "Texto no encontrado.";
    return;
  }

  render(item, tipo);
}

window.addEventListener("resize", init);

init();
