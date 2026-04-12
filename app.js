import {
  toLineLengths,
  layout,
  lineHeight,
} from "https://esm.sh/@chenglou/pretext@0.5.0";

const STORAGE_POSTS = "rincon-posts";
const STORAGE_COMMENTS = "rincon-comments";

const defaultPosts = [
  {
    id: crypto.randomUUID(),
    titulo: "Tarde en la plaza",
    tipo: "poema",
    contenido:
      "El sol se pliega en la fuente,\nlas palomas guardan rumor,\ny en el banco de siempre\nmi ciudad aprende color.",
    fecha: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    titulo: "La lámpara azul",
    tipo: "cuento",
    contenido:
      "Lucía encontró una lámpara azul en el ático. Al encenderla, cada sombra se convirtió en un recuerdo que aún no había vivido.",
    fecha: new Date().toISOString(),
  },
];

const defaultComments = [
  {
    id: crypto.randomUUID(),
    nombre: "Elena",
    mensaje: "La imagen de la fuente en el poema me encantó. ✨",
    fecha: new Date().toISOString(),
  },
];

const state = {
  posts: loadData(STORAGE_POSTS, defaultPosts),
  comments: loadData(STORAGE_COMMENTS, defaultComments),
};

const form = document.querySelector("#post-form");
const poemList = document.querySelector("#poemas");
const storyList = document.querySelector("#cuentos");
const commentForm = document.querySelector("#comment-form");
const commentsList = document.querySelector("#comentarios");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const post = {
    id: crypto.randomUUID(),
    titulo: String(data.get("titulo") || "Sin título").trim(),
    tipo: data.get("tipo") === "cuento" ? "cuento" : "poema",
    contenido: String(data.get("contenido") || "").trim(),
    fecha: new Date().toISOString(),
  };

  if (!post.titulo || !post.contenido) return;

  state.posts.unshift(post);
  saveData(STORAGE_POSTS, state.posts);
  form.reset();
  renderPosts();
});

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(commentForm);

  const comment = {
    id: crypto.randomUUID(),
    nombre: String(data.get("nombre") || "Anónimo").trim(),
    mensaje: String(data.get("mensaje") || "").trim(),
    fecha: new Date().toISOString(),
  };

  if (!comment.mensaje) return;

  state.comments.unshift(comment);
  saveData(STORAGE_COMMENTS, state.comments);
  commentForm.reset();
  renderComments();
});

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function prettifyDate(dateString) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function computeMinHeight(text, widthPx) {
  const estimatedCharWidth = 8.2;
  const lineLength = Math.max(22, Math.floor(widthPx / estimatedCharWidth));
  const breaks = toLineLengths(text, lineLength);
  const lines = layout(lineLength, breaks, text).length;
  const px = Math.ceil(lines * lineHeight + 32);
  return `${Math.max(px, 120)}px`;
}

function createPostCard(post) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h4");
  title.textContent = post.titulo;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${post.tipo.toUpperCase()} · ${prettifyDate(post.fecha)}`;

  const content = document.createElement("p");
  content.textContent = post.contenido;

  card.append(title, meta, content);

  requestAnimationFrame(() => {
    const width = card.clientWidth || 320;
    card.style.minHeight = computeMinHeight(post.contenido, width);
  });

  return card;
}

function renderPosts() {
  poemList.innerHTML = "";
  storyList.innerHTML = "";

  for (const post of state.posts) {
    const card = createPostCard(post);
    if (post.tipo === "cuento") {
      storyList.append(card);
    } else {
      poemList.append(card);
    }
  }
}

function renderComments() {
  commentsList.innerHTML = "";

  for (const comment of state.comments) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${comment.nombre}</strong> <span>· ${prettifyDate(
      comment.fecha
    )}</span><p>${comment.mensaje}</p>`;
    commentsList.append(li);
  }
}

renderPosts();
renderComments();

window.addEventListener("resize", () => {
  renderPosts();
});
