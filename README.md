# Ilustraciones · Rincón de Poemas y Cuentos

Página web estática para publicar poemas y cuentos con una sección de comunidad para comentarios.

## Stack usado

- HTML + CSS + JavaScript vanilla.
- Librería [`@chenglou/pretext`](https://github.com/chenglou/pretext), consumida vía ESM CDN, para calcular layout/alto mínimo de tarjetas de texto y mejorar legibilidad de publicaciones largas.

## Ejecutar localmente

Como es un proyecto estático, puedes abrir `index.html` en el navegador o servirlo con un servidor simple, por ejemplo:

```bash
python3 -m http.server 4173
```

Luego abre: <http://localhost:4173>
