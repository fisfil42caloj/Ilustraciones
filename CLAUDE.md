# CLAUDE.md

Guía para asistentes de IA que trabajen en este repositorio.

## Qué es esto

**Ángel · Poiesis de la ausencia**: sitio estático de autor para publicar poemas y
cuentos. Biblioteca personal, no plataforma: no hay formularios públicos, ni comentarios,
ni cuentas de usuario. Solo texto, búsqueda, lectura individual y una capa visual al
servicio de la lectura.

El idioma del proyecto es el **español**: interfaz, contenido, comentarios y mensajes de
commit. `index.html` y `detalle.html` declaran `lang="es"`.

## Pila técnica

HTML + CSS + JavaScript de navegador, **sin build, sin dependencias instaladas, sin
framework**. No hay `package.json`, ni bundler, ni tests, ni CI. Los scripts se cargan
como módulos ES (`<script type="module">`).

La única dependencia externa es `@chenglou/pretext@0.5.0`, importada por URL desde
`esm.sh` en `detalle.js`. Es un import en tiempo de ejecución: **la página de detalle
necesita conexión a internet** para maquetar el texto.

## Estructura

```text
index.html          portada: hero, buscador, secciones de poemas y cuentos, sobre mí
detalle.html        lector de una pieza; recibe ?tipo=...&slug=...
app.js              lógica de la portada (efectos + carga de poemas)
detalle.js          lógica del lector (Pretext + render de la pieza)
styles.css          hoja de estilos única (57 líneas)
content/poemas.json colección de poemas
content/cuentos.json colección de cuentos
```

No hay carpeta de assets ni imágenes: toda la atmósfera visual se produce con CSS y con
símbolos de texto generados en JS.

## Modelo de contenido

Los dos JSON son arrays de objetos con exactamente estos tres campos:

```json
{
  "titulo": "El silencio que sobrevive",
  "fecha": "2026-04-12",
  "texto": "Primer párrafo.\n\nSegundo párrafo."
}
```

- `fecha` en formato `YYYY-MM-DD`.
- En `texto`, los párrafos se separan con **línea en blanco** (`\n\n`). En poemas los
  saltos simples (`\n`) se conservan como versos; en cuentos los bloques separados por
  línea en blanco se convierten en `<p>`.
- **No hay campo `slug`.** El identificador de una pieza se deriva de `titulo` con la
  función `slugify()` de `detalle.js` (minúsculas, sin tildes, no alfanumérico → `-`).
  Cambiar un título cambia su URL.
- Ambos archivos contienen hoy **una sola entrada de marcador de posición** con texto de
  ejemplo. Añadir contenido real es editar estos JSON; no hay CMS ni panel.

## Cómo ejecutarlo en local

`app.js` y `detalle.js` cargan los JSON con `fetch()`, así que **abrir `index.html` con
`file://` no funciona** (lo bloquea CORS). Hay que servir la carpeta por HTTP:

```bash
python3 -m http.server 8000
# luego http://localhost:8000/index.html
```

No hay comandos de build, test ni lint. La verificación es visual, en el navegador.

## Convenciones

- **Vanilla JS, sin dependencias nuevas.** Si algo hace falta, se importa por URL como
  Pretext o se escribe a mano. No introducir gestores de paquetes ni pasos de build sin
  pedirlo.
- **Nombres en español** para archivos y para claves de datos (`titulo`, `texto`,
  `detalle.html`, `content/poemas.json`). Los identificadores internos de JS mezclan
  inglés (`loadPoems`, `slugify`) — al tocar código existente, imita el módulo en el que
  estás.
- **Rutas relativas con `./`** en todas partes (`./styles.css`, `./content/poemas.json`).
  El sitio debe poder servirse desde un subdirectorio.
- **CSS:** una sola hoja, sin preprocesador, sin metodología de nombres tipo BEM. Clases
  descriptivas en español (`.panel`, `.card`, `.shell`, `.hero-title`, `.veil-copy`).
  Variables CSS solo para la posición del cursor (`--mx`, `--my`), fijadas desde JS.
- **Capas decorativas** (`.cursor-aura`, `.grain`, `.symbol-layer`) llevan siempre
  `aria-hidden="true"`. Mantener esa disciplina: la decoración no debe llegar a un lector
  de pantalla.
- **Registro editorial.** El texto de la interfaz es deliberadamente literario y
  filosófico (umbral, logos, intemperie, símbolos griegos y domésticos). No sustituirlo
  por copy funcional genérico.
- Commits en español, en indicativo, describiendo el cambio:
  `Añadir buscador, lectura individual y uso real de Pretext en previews y layout`.

## Estado real del código: lo que la portada promete y aún no hace

`index.html` describe una interfaz bastante más completa que la que `app.js` implementa.
Conviene saberlo antes de tocar nada, y **no dar por hecho que estas funciones existen**:

- **El buscador no está conectado.** `#search-input`, `#clear-search` y `#search-status`
  existen en el HTML; `app.js` no les añade ningún listener.
- **Los cuentos no se cargan.** `app.js` solo llama a `loadPoems()`; `#stories-list`
  queda vacío y `content/cuentos.json` nunca se lee desde la portada.
- **Los contadores están vacíos.** `#poems-count` y `#stories-count` no se rellenan.
- **El año del pie no se rellena.** `#current-year` se queda vacío.
- **Las tarjetas no enlazan al lector.** `app.js` crea `<div class="card">` sin `<a>`, así
  que `detalle.html?tipo=poema&slug=...` no es alcanzable navegando; solo escribiendo la
  URL a mano.
- **La hoja de estilos cubre una fracción del marcado.** `styles.css` define `body`,
  `.shell`, `.flow-text span`, `.cursor-aura`, `.symbol-layer span`, `.panel`, `.card` y
  la animación `float`. Todo lo demás (`.hero`, `.veil`, `.search-shell`, `.detail-main`,
  `.back-link`, `.detail-article`, `.grain`…) no tiene reglas propias.

Además hay dos defectos concretos:

- **`detalle.js` re-renderiza acumulando.** `window.addEventListener("resize", init)`
  vuelve a ejecutar `init()`, que hace `container.append(title, text)` sobre el mismo
  contenedor sin limpiarlo: al redimensionar la ventana el texto se duplica. Lo correcto
  sería vaciar `#detail-article` al entrar, o separar el remedido de Pretext del render.
- **`app.js` inyecta contenido con `innerHTML`** interpolando `p.titulo` y `p.texto` sin
  escapar. Con contenido propio es inofensivo, pero cualquier `<` o `&` en un texto se
  interpretará como marcado. Preferir `textContent` al tocar esa función.

Si te piden «terminar el buscador» o «arreglar la portada», esta lista es el alcance real
del trabajo.

## Al añadir una pieza nueva

1. Añadir el objeto al array de `content/poemas.json` o `content/cuentos.json`, con los
   tres campos y la fecha en `YYYY-MM-DD`.
2. Comprobar que el título produce un slug único (`slugify` colapsa tildes y puntuación).
3. Servir por HTTP y verificar la portada y `detalle.html?tipo=poema&slug=<slug>` —
   recordando que hoy hay que escribir esa URL a mano.
