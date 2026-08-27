# Conexiones que importan — Eczane · Congreso AOCC 2026

Dinámica interactiva para pantalla táctil vertical del stand.

## Cómo correrlo

```bash
node D:/Desktop/ECZANE/app/server.js
```

Abrir `http://localhost:5173`. En la TV: navegador en modo kiosco a pantalla completa (F11).

> Se usa un servidor local porque abriendo `index.html` con doble clic el navegador
> bloquea la carga de las tipografías DIN Pro / Open Sans por seguridad (CORS en `file://`).
> No necesita internet: todo corre local.

## Formato

Lienzo fijo de **1080 × 1920** (vertical, 9:16) escalado al viewport. La misma URL se
ve idéntica en la TV 55" vertical y en un celular, sin layout alternativo.

## Editar contenido

Todo el texto está en **`js/content.js`**. Es el único archivo a tocar para cambiar
copys, pares clínicos, tiempos o placas. No hace falta tocar `game.js` ni `styles.css`.

- `config` — duración, pausas, si el reloj se detiene en los modales
- `copy` — textos de cada estado (tomados del brief)
- `fases` — 4 pantallas × 3 conexiones = 12 pares (24 tarjetones)
- `novedades` — placas de "Novedad desbloqueada" (una por fase, se elige con el campo `novedad` de cada fase)
- `cierrePlacas` — las dos placas con QR que se repiten en el cierre (dejar [] para ocultarlas)

## Marca

Según el instructivo de septiembre 2024:

| | |
|---|---|
| Naranja | `#f37b20` — Pantone 166C |
| Azul | `#005480` — Pantone 302C |
| Gris | `#909295` — Cool Gray 7C |
| Blanco | protagonista, fondo dominante |

Tipografías: **Open Sans** (textos informativos) y **DIN Pro / DIN Pro Condensed**
(comunicación institucional y nombres de producto).

> Ojo: la columna "Web" del PDF del instructivo está desalineada y repite `#a39094`
> en azul y gris. Los hex de arriba se derivaron de los valores RGB, que sí son correctos.

## Assets pendientes

Estos archivos faltan. La app funciona igual (muestra un placeholder), pero hay que
pedirlos antes del congreso:

- `assets/img/eczahedge-estuches.png` — foto de estuches y presentaciones
- `assets/img/qr-mapa.png` — QR del Mapa de Neurooncología Argentina
- `assets/img/qr-portal.png` — QR del Portal Médicos Eczane

## Decisiones de producto tomadas

Los dos documentos del cliente describían juegos distintos. Se resolvió así:

1. **Tarjetas visibles, no boca abajo.** El brief pedía mecánica de memoria, pero los
   disparadores del documento de contenido son párrafos clínicos de 2-3 renglones:
   memorizar posiciones es imposible en 60 s y además impide que el mensaje se lea.
   Se mantiene el flip animado y el efecto de acierto del brief.
2. **4 pantallas × 3 conexiones = 12**, tal cual el DOCX. Se usan los 12 pares del
   documento, sin descartes.
3. **Una placa de novedad al completar cada pantalla**, en el orden del esquema
   numerado del cliente: 1 Eczahedge, 2 Eczagen, 3 Mapa de Neurooncología,
   4 Web Eczane Portal Médicos. Queda en pantalla hasta que toquen "Sigamos".
4. **El reloj se pausa en los modales**, para que los 60 s sean de juego real.
   Se desactiva con `config.pausarEnModales: false`. Es especialmente importante
   en la placa de novedad, que ahora espera indefinidamente a que toquen "Sigamos".
5. **Los carteles de acierto y error no frenan el juego.** Se puede encadenar
   intentos mientras el aviso sigue en pantalla. La única pausa es cuando la jugada
   cierra la fase, para que se vea el acierto antes de la placa de novedad.
   `msAcierto` y `msError` ya no bloquean: solo controlan cuánto dura el cartel.
6. **Los logos se ajustan solos.** Los PNG del logotipo son cuadrados de 4500×4500
   con la marca centrada y mucho transparente alrededor (963 px por lado). La app mide
   la caja de tinta real y compensa con márgenes negativos, así el ancho pedido es el
   ancho *visible*. En la pantalla de inicio ese ancho se toma de la palabra
   "Conexiones", medida con la DIN Pro real. Si cambia el archivo del logo o el cuerpo
   del título, se recalcula solo.

## De dónde sale cada texto

- **Pares clínicos y placas** → DOCX `CONEXIONES Y PLACAS CONGRESO AOCC 2026.docx`,
  las 4 pantallas de conexiones y la sección **PLACAS**.
- **Copys de estado** (inicio, acierto, error, cierre) → PDF del brief,
  tabla "Enunciados y copies sugeridos".
- **Placas de novedad** → DOCX, sección **PLACAS**, transcriptas textuales.

## Riesgo abierto: los 60 segundos

12 conexiones en 60 s es ajustado. Jugando en automático, sin leer, el puro mecanismo
de tocar las 24 tarjetas consume ~12 s, y quedan ~48 s para leer 12 párrafos clínicos
(4 s cada uno). El reloj se pausa en las 4 placas de novedad, así que leer las novedades
no descuenta — pero conviene verlo con gente real antes del congreso. Si queda corto,
se sube `config.duracionSegundos`.

## Ajustes visuales pedidos por el cliente (ronda 1)

- **Logo de inicio** al 55 % del ancho del título, para que el título mande.
- **Título en DIN Pro Condensed Black**, en mayúsculas y a dos tintas (azul + naranja).
  El cuerpo se autoajusta: se mide la línea más larga ("QUE IMPORTAN") y se baja el
  tamaño hasta que entre. Si cambia el copy, se recalcula solo.
- **Botón "Iniciar misión"**: más grande, con flecha, flotación suave y un halo que
  late hacia afuera para que se lea como tocable desde lejos.
- **"Conexión lograda"** pasó de una pastilla abajo a un cartel grande centrado sobre
  el tablero, con tilde en círculo naranja y onda expansiva. El **error quedó
  deliberadamente discreto** (pastilla azul abajo): el brief pide no penalizar.
- **Tarjetones** con texto centrado en ambos ejes y más grande (26 → 32 px; los
  nombres de producto 52 → 58 px en Condensed Black). Verificado que las 12 conexiones
  entran sin desbordar.
- **Cierre** rearmado: "MISIÓN COMPLETADA", marcador gigante con anillo de celebración
  y una grilla 2×2 con **las 4 novedades**: las desbloqueadas en color y con tilde, las
  que no llegaron a descubrir atenuadas y con candado. Los QR quedan visibles en ambos
  casos, porque son el único camino a la web.
