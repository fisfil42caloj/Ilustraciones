const poemsContainer = document.querySelector("#poems-list");
const storiesContainer = document.querySelector("#stories-list");
const currentYear = document.querySelector("#current-year");

async function fetchCollection(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}`);
  }
  return response.json();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
  }).format(new Date(dateString));
}

function createCard(item) {
  const article = document.createElement("article");
  article.className = "card";

  const title = document.createElement("h3");
  title.textContent = item.titulo;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = formatDate(item.fecha);

  const text = document.createElement("div");
  text.className = "card-text";

  const paragraphs = String(item.texto)
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    text.appendChild(p);
  }

  article.append(title, meta, text);
  return article;
}

function renderCollection(items, container, emptyMessage) {
  container.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  const ordered = [...items].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  for (const item of ordered) {
    container.appendChild(createCard(item));
  }
}

async function init() {
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  try {
    const [poems, stories] = await Promise.all([
      fetchCollection("./content/poemas.json"),
      fetchCollection("./content/cuentos.json"),
    ]);

    renderCollection(
      poems,
      poemsContainer,
      "Todavía no hay poemas publicados en esta sección."
    );
    renderCollection(
      stories,
      storiesContainer,
      "Todavía no hay cuentos publicados en esta sección."
    );
  } catch (error) {
    const message = document.createElement("p");
    message.className = "empty-state error-state";
    message.textContent =
      "Ha habido un problema al cargar la biblioteca. Revisa que los archivos JSON existan correctamente en la carpeta content.";

    poemsContainer.replaceChildren(message.cloneNode(true));
    storiesContainer.replaceChildren(message);
    console.error(error);
  }
}

init();
