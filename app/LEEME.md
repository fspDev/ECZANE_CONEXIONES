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

## Ronda de revisión del cliente (V2) — 2026-09-05

Aplicado sobre capturas anotadas del cliente (PDF `Juego interactivo V 2.pdf`).

1. **Paleta:** el azul Eczane (#005480) se reemplazó por el **azul de Eczagen
   (#0047bb)** en toda la app, y se sacó el degradé celeste del fondo — ahora
   es blanco plano en todas las pantallas. Decisión del cliente: aplicar a
   todo el juego, no solo a lo relacionado con Eczagen.
2. **Intercambio de Fase 1 ⇄ Fase 4:** el contenido clínico se movió, pero la
   novedad que se desbloquea quedó fija por posición — Fase 1 sigue
   desbloqueando Eczahedge, Fase 4 sigue desbloqueando el Portal.
3. **"Tanda" → "Fase"** en el rótulo del tablero y en los carteles de cambio
   de pantalla.
4. **5 disparadores clínicos reescritos** con estilo de siglas (OS/FPS/CCm),
   tal como los dio el cliente en el PDF — más cortos que los del DOCX
   original: los dos de la Fase 4 (Eczagen y Rezitix), los dos de la Fase 3
   (Eczagen y Rezitix-GIST) y el de Rezitix en la Fase 1. Se marcaron en
   negrita las palabras clave que el cliente indicó en cada uno.
5. **Tarjeta "Esquema PCV" invertida:** ahora el esquema de drogas
   ("Lomustina Eczane + Procarbazina Eczane + Vincristina") es el título
   grande, y "(Esquema PCV)" quedó como subtítulo chico en itálica — al
   revés de las otras 11 tarjetas B, que muestran el nombre comercial arriba.
6. **Logo de Eczagen** en vez del texto "Eczagen": aparece en sus dos
   tarjetones (Fase 3 y Fase 4) y en su placa de novedad. El archivo
   original era un PDF vectorial; se rasterizó a PNG con fondo transparente
   (ver nota técnica abajo).
7. **Nombres largos en 2 líneas:** "Lenvatinib Eczane" y "Lomustina Eczane"
   fuerzan el salto entre el nombre y "Eczane" (antes se achicaban para
   entrar en una sola línea).
8. **Casing:** 3 disparadores que estaban en Title Case pasaron a oración
   normal (solo la primera letra), y "regorafenib" pasó a "Regorafenib" con
   R mayúscula en las 3 tarjetas donde aparece.
9. **Textos de placas:**
   - Título corregido: "Mapa de Neurooncología Argentina" → **"Mapa
     Argentino de Neurooncología"**.
   - Mapa: "Mapa para buscar…" → "Mapa para **localizar**…"; se sacó el
     texto bajo el QR ("Encontralo en nuestra web"), queda solo el espacio
     para el código.
   - Portal: bajada acortada a "Acceso a documentación útil para
     profesionales de la salud y pacientes"; se sacó el texto bajo el QR
     ("Regístrese en nuestro portal web").
10. **Duración de los carteles de acierto/error** extendida: 1,4s → 2,2s
    (acierto) y 0,9s → 1,8s (error). Son números de partida — el cliente
    pidió "extender" sin dar una cifra exacta; se ajusta en `config`.

### Nota técnica: cómo se rasterizó el logo de Eczagen

El archivo que envió el cliente es un PDF vectorial. No hay conversor
PDF→PNG instalado en esta máquina (`pdftoppm`/ImageMagick/Ghostscript
ausentes), así que se resolvió con Chrome instalado: se armó una página
HTML que carga el PDF con `pdf.js` y lo dibuja en un `<canvas>` a escala
4x, Chrome headless la abre y el canvas sube su propio PNG a un servidor
local (sin tainting, porque pdf.js dibuja vectores directo, no una imagen
cross-origin). Después se recortó el aire y se hizo transparente el fondo
blanco con `System.Drawing` desde PowerShell. Los scripts quedaron en
`%TEMP%/claude/dx/raster/` por si hace falta re-rasterizar a otra
resolución.

### Pendiente para cerrar esta ronda

- **Foto del estuche de Eczahedge:** el cliente la pegó directo en el chat,
  no como archivo adjunto — no hay forma de tomarla desde ahí. Falta que la
  guarde como archivo (ej. en Descargas) y pase la ruta.
- **QR de Mapa y Portal:** el cliente avisó que los genera en los próximos
  días. Mientras tanto la app muestra el placeholder "QR pendiente".

## Segunda ronda de ajustes — 2026-09-05 (tarde)

1. **Cierre:**  pasó a mostrar solo "Gracias por participar." —
   se sacó "Sigamos el recorrido", que aparecía como segunda línea.
2. **"QR pendiente" eliminado de toda la app.** Donde el QR todavía no
   existe, la caja queda vacía (mantiene el espacio reservado, sin texto).
   Se cambia en , en los dos  de las imágenes de QR.
3. **Tarjetas de Eczagen: ícono + texto conviven.** Antes el logo
   reemplazaba el texto "Eczagen"; ahora se ve el ícono (sin la
   palabra "eczagen", que ya está como texto al lado) más el nombre en
   la misma tipografía que el resto de las tarjetas. Se agregó un tercer
   recorte del logo (, solo la marca gráfica) además
   de las dos versiones ya existentes.
4. **Negrita de palabras clave:** confirmado contra el PDF que las 5
   reescrituras tienen exactamente las palabras marcadas en negrita que
   pidió el cliente. Ojo: el kit de marca no trae un    real, solo Regular y SemiBold — la negrita se resuelve con el
   "bold sintético" del navegador (Chromium lo hace bien, pero si se
   quiere más nitidez conviene pedir el archivo Bold real).

### Sigue pendiente

- ~~Foto del estuche de Eczahedge~~ — resuelto: el cliente la adjuntó como
  archivo (`eczahedge familia.png`). Se recortó el aire transparente, se
  achicó a 980x1100 y se aplanó sobre blanco como JPEG calidad 88
  (1,47 MB → 121 KB): la placa siempre tiene fondo blanco, así que la
  transparencia no aportaba nada y sí pesaba. De paso se subió el
  `max-height` de `.placa-img` (420px → 640px) para que una foto de
  producto real tenga la presencia que un placeholder no necesitaba.

## Segunda ronda de ajustes — 2026-09-05 (tarde)

1. **Cierre:** `cierreApoyo` pasó a mostrar solo "Gracias por participar." —
   se sacó "Sigamos el recorrido", que aparecía como segunda línea.
2. **"QR pendiente" eliminado de toda la app.** Donde el QR todavía no
   existe, la caja queda vacía (mantiene el espacio reservado, sin texto).
   Se cambia en `js/game.js`, en los dos `onerror` de las imágenes de QR.
3. **Tarjetas de Eczagen: ícono + texto conviven.** Antes el logo
   reemplazaba el texto "Eczagen"; ahora se ve el ícono (sin la palabra
   "eczagen", que ya está como texto al lado) más el nombre en la misma
   tipografía que el resto de las tarjetas. Se agregó un tercer recorte
   del logo (`eczagen-icono.png`, solo la marca gráfica) además de las
   dos versiones ya existentes.
4. **Negrita de palabras clave:** confirmado contra el PDF que las 5
   reescrituras tienen exactamente las palabras marcadas en negrita que
   pidió el cliente. Ojo: el kit de marca no trae un `OpenSans-Bold.ttf`
   real, solo Regular y SemiBold — la negrita se resuelve con el
   "bold sintético" del navegador (Chromium lo hace bien, pero si se
   quiere más nitidez conviene pedir el archivo Bold real).

### Sigue pendiente

- ~~Foto del estuche de Eczahedge~~ — **resuelto** (ver más abajo, tercera
  ronda de ajustes).
- QR de Mapa y Portal — el cliente los genera en los próximos días.

## Tercera ronda de ajustes — 2026-09-05

- **Foto del estuche de Eczahedge.** El cliente la adjuntó como archivo
  (`eczahedge familia.png`, 2120×2788, fondo transparente). Se recortó el
  aire transparente sobrante, se achicó a 980×1100 y se aplanó sobre
  blanco como JPEG calidad 88 — la placa siempre tiene fondo blanco, así
  que la transparencia no aportaba nada y sí pesaba (1,47 MB → 121 KB).
  De paso se subió el `max-height` de `.placa-img` (420px → 640px): una
  foto de producto real se beneficia de más presencia que la que tenía
  el espacio pensado para un placeholder.
