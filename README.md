# Conexiones que importan

Dinámica interactiva para el stand de **Laboratorio Eczane** en el **Congreso AOCC 2026**.
Pantalla táctil vertical, 60 segundos, médico + representante.

**En vivo:** https://fspdev.github.io/ECZANE_CONEXIONES/

El juego, cómo correrlo localmente, cómo editar los textos y las decisiones de producto
están documentados en **[app/LEEME.md](app/LEEME.md)**.

## Estructura

```
app/                 la aplicación (esto es lo que se publica en Pages)
  index.html
  css/styles.css
  js/content.js      << todo el texto editable vive acá
  js/game.js
  assets/            tipografías y logos de marca
  server.js          servidor local para desarrollo
  LEEME.md
.github/workflows/   deploy automático a GitHub Pages
```

## Publicación

Cada push a `main` dispara el workflow y actualiza el sitio. No hay build:
la carpeta `app/` se sube tal cual.
