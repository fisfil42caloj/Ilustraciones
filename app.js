import {
  toLineLengths,
  layout,
  lineHeight,
} from "https://esm.sh/@chenglou/pretext@0.5.0";

const poemsContainer = document.querySelector("#poems-list");
const storiesContainer = document.querySelector("#stories-list");
const currentYear = document.querySelector("#current-year");
const searchInput = document.querySelector("#search-input");
const clearButton = document.querySelector("#clear-search");
const searchStatus = document.querySelector("#search-status");
const poemsCount = document.querySelector("#poems-count");
const storiesCount = document.querySelector("#stories-count");

let poems = [];
let stories = [];
let query = "";

async function fetchCollection(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error();
  return response.json();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
  }).format(new Date(dateString));
}

function buildPreview(text, widthPx, tipo) {
  if (tipo === "poema") {
    const blocks = text.split(/\n\n+/).slice(0, 2);
    return blocks.join("\n\n");
  }

  const normalized = text.replace(/\n+/g, " ");
  const lineLength = Math.max(30, Math.floor(widthPx / 8.5));
  const breaks = toLineLengths(normalized, lineLength);
  const lines = layout(lineLength, breaks, normalized);

  const previewLines = lines.slice(0, 7);
  return previewLines.join(" ") + (lines.length > 7 ? "…" : "");
}

function computeMinHeight(text, widthPx) {
  const normalized = text.replace(/\n+/g, " ");
  const lineLength = Math.max(30, Math.floor(widthPx / 8.5));
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

  const preview = buildPreview(item.texto, article.clientWidth || 320, tipo);

  if (tipo === "poema") {
    text.innerHTML = preview.replace(/\n/g, "<br>");
  } else {
    text.textContent = preview;
  }

  const link = document.createElement("a");
  link.className = "read-more";
  link.textContent = "Leer completo";
  link.href = `detalle.html?tipo=${tipo}&slug=${slugify(item.titulo)}`;

  article.append(title, meta, text, link);

  requestAnimationFrame(() => {
    const width = article.clientWidth || 320;
    article.style.minHeight = computeMinHeight(item.texto, width);
  });

  return article;
}

function filterItems(items) {
  if (!query) return items;

  return items.filter((item) => {
    const base = `${item.titulo} ${item.texto}`.toLowerCase();
    return base.includes(query);
  });
}

function render() {
  const filteredPoems = filterItems(poems);
  const filteredStories = filterItems(stories);

  poemsContainer.innerHTML = "";
  storiesContainer.innerHTML = "";

  filteredPoems.forEach((p) =>
    poemsContainer.appendChild(createCard(p, "poema"))
  );
  filteredStories.forEach((s) =>
    storiesContainer.appendChild(createCard(s, "cuento"))
  );

  poemsCount.textContent = `${filteredPoems.length} textos`;
  storiesCount.textContent = `${filteredStories.length} textos`;

  if (query) {
    searchStatus.textContent = `Resultados para “${query}”`;
  } else {
    searchStatus.textContent = "Mostrando toda la biblioteca.";
  }
}

async function init() {
  currentYear.textContent = new Date().getFullYear();

  const [p, s] = await Promise.all([
    fetchCollection("./content/poemas.json"),
    fetchCollection("./content/cuentos.json"),
  ]);

  poems = p.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  stories = s.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  render();
}

searchInput.addEventListener("input", (e) => {
  query = e.target.value.toLowerCase().trim();
  render();
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  query = "";
  render();
});

window.addEventListener("resize", () => {
  render();
});

init();
