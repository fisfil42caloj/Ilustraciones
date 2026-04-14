const root = document.documentElement;
const symbolLayer = document.getElementById("symbol-layer");

const symbols = ["λόγος","ἀλήθεια","οἶκος","σῶμα","χρόνος","lámpara","taza","umbral","sombra","casa"];

function splitFlowText() {
  document.querySelectorAll(".flow-text").forEach(el => {
    const text = el.textContent;
    el.innerHTML = "";
    text.split("").forEach(c => {
      const span = document.createElement("span");
      span.textContent = c;
      el.appendChild(span);
    });
  });
}

function cursorEffect(e) {
  root.style.setProperty("--mx", e.clientX + "px");
  root.style.setProperty("--my", e.clientY + "px");

  document.querySelectorAll(".flow-text span").forEach(span => {
    const rect = span.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    const d = Math.sqrt(dx*dx + dy*dy);
    span.style.transform = `translateY(${Math.sin(d*0.05)*2}px)`;
  });
}

function createSymbols() {
  for (let i = 0; i < 20; i++) {
    const s = document.createElement("span");
    s.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    s.style.left = Math.random()*100 + "%";
    s.style.top = Math.random()*100 + "%";
    symbolLayer.appendChild(s);
  }
}

async function loadPoems() {
  const res = await fetch("./content/poemas.json");
  const data = await res.json();
  const container = document.getElementById("poems-list");

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${p.titulo}</h3><p>${p.texto.slice(0,120)}...</p>`;
    container.appendChild(card);
  });
}

function init() {
  splitFlowText();
  createSymbols();
  loadPoems();
  window.addEventListener("pointermove", cursorEffect);
}

init();
