import {
  toLineLengths,
  layout,
  lineHeight,
} from "https://esm.sh/@chenglou/pretext@0.5.0";

const poemsContainer = document.querySelector("#poems-list");
const storiesContainer = document.querySelector("#stories-list");
const currentYear = document.querySelector("#current-year");

async function fetchCollection(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error();
  return response.json();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
  }).format(new Date(dateString));
}

function computeMinHeight(text, widthPx) {
  const normalized = text.replace(/\n+/g, " ");
  const lineLength = Math.max(24, Math.floor(widthPx / 8.2));
  const breaks = toLineLengths(normalized, lineLength);
  const lines = layout(lineLength, breaks, normalized).length;
  return `${Math.max(lines * lineHeight + 80, 180)}px`;
}

function createCard(item, tipo) {
  const article = document.createElement("article");
  article.className = "card";

  const title = document.createElement("h3");
  title.textContent = item.titulo;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = formatDate(item.fecha);

  const text = document.createElement("div");
  text.className = "card-text";

  if (tipo === "poema") {
    text.innerHTML = item.texto.replace(/\n/g, "<br>");
  } else {
    const paragraphs = item.texto.split(/\n\n+/);
    paragraphs.forEach(p => {
      const el = document.createElement("p");
      el.textContent = p;
      text.appendChild(el);
    });
  }

  article.append(title, meta, text);

  requestAnimationFrame(() => {
    const width = article.clientWidth || 320;
    article.style.minHeight = computeMinHeight(item.texto, width);
  });

  return article;
}

function render(items, container, tipo) {
  container.innerHTML = "";
  items
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .forEach(item => container.appendChild(createCard(item, tipo)));
}

async function init() {
  currentYear.textContent = new Date().getFullYear();

  const [poems, stories] = await Promise.all([
    fetchCollection("./content/poemas.json"),
    fetchCollection("./content/cuentos.json"),
  ]);

  render(poems, poemsContainer, "poema");
  render(stories, storiesContainer, "cuento");
}

window.addEventListener("resize", init);

init();
