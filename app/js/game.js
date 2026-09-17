/* ============================================================
   CONEXIONES QUE IMPORTAN - Logica de juego
   Toda la edicion de textos se hace en js/content.js
   ============================================================ */
(function () {
  'use strict';

  var C = CONTENIDO;
  var cfg = C.config;

  var $ = function (sel) { return document.querySelector(sel); };

  // Total de conexiones: sale del contenido, no de un numero escrito a mano.
  var TOTAL = C.fases.reduce(function (n, f) { return n + f.pares.length; }, 0);

  /* ---------- Escalado del lienzo 1080x1920 al viewport ---------- */
  var stage = $('#stage');
  function escalar() {
    var k = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
    stage.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
  }
  window.addEventListener('resize', escalar);
  window.addEventListener('orientationchange', escalar);
  escalar();

  /* ---------- Estado ---------- */
  var st = {
    pantalla: 'inicio',
    faseIdx: 0,
    conexiones: 0,
    novedades: [],
    seleccion: null,     // { lado:'a'|'b', par:'p1', el:HTMLElement }
    bloqueado: false,
    restante: cfg.duracionSegundos,
    tick: null,
    cuenta: null,        // intervalo de la cuenta regresiva
    demoras: [],         // setTimeout pendientes de la partida en curso
    pausado: false
  };

  /* ---------- Demoras cancelables ----------
     Todo lo que el juego agenda a futuro (mostrar el "hecho", pasar de
     fase, limpiar un error, los carteles) pasa por aca. Si la partida
     termina antes de que venza el plazo — porque se acabo el tiempo o
     porque volvieron al inicio — esos callbacks tienen que morir: si no,
     vencen sobre otra pantalla y la vuelven a mandar al juego. */
  function demorar(ms, fn) {
    var id = setTimeout(function () {
      var i = st.demoras.indexOf(id);
      if (i !== -1) st.demoras.splice(i, 1);
      fn();
    }, ms);
    st.demoras.push(id);
    return id;
  }

  function limpiarDemoras() {
    st.demoras.forEach(clearTimeout);
    st.demoras = [];
    if (st.cuenta) { clearInterval(st.cuenta); st.cuenta = null; }
    clearTimeout(avisoTO);
  }

  /* Corta la partida en seco: reloj, plazos pendientes, carteles y el
     boton de la placa (que queda con un onclick apuntando al flujo viejo). */
  function frenarPartida() {
    detenerReloj();
    limpiarDemoras();
    st.pausado = false;
    st.bloqueado = false;
    $('#btn-novedad').onclick = null;
    $('#modal-novedad').classList.remove('activo');
    $('#modal-fase').classList.remove('activo');
    $('#aviso').classList.remove('ver');
  }

  /* ---------- Navegacion entre pantallas ---------- */
  function irA(nombre) {
    ['inicio', 'cuenta', 'juego', 'cierre'].forEach(function (n) {
      $('#pantalla-' + n).classList.toggle('activa', n === nombre);
    });
    st.pantalla = nombre;
  }

  /* ---------- Reloj ---------- */
  function arrancarReloj() {
    detenerReloj();
    st.tick = setInterval(function () {
      if (st.pausado) return;
      st.restante--;
      pintarReloj();
      if (st.restante <= 0) { detenerReloj(); cerrar(); }
    }, 1000);
    pintarReloj();
  }
  function detenerReloj() { if (st.tick) { clearInterval(st.tick); st.tick = null; } }

  function pintarReloj() {
    var v = Math.max(0, st.restante);
    var el = $('#reloj');
    el.textContent = v < 10 ? '0' + v : String(v);
    var urgente = v <= 10;
    el.classList.toggle('urgente', urgente);
    var barra = $('#barra');
    barra.style.width = (v / cfg.duracionSegundos * 100) + '%';
    barra.classList.toggle('urgente', urgente);
  }

  function pausar(ms, luego) {
    if (cfg.pausarEnModales) st.pausado = true;
    demorar(ms, function () {
      if (cfg.pausarEnModales) st.pausado = false;
      luego();
    });
  }

  /* ---------- Construccion del tablero por fase ---------- */
  function mezclar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pintarFase() {
    var fase = C.fases[st.faseIdx];
    // El titulo tematico es opcional: si la pantalla no tiene, se oculta
    // y queda solo el rotulo de tanda.
    $('#fase-num').textContent = fase.numero;
    var t = $('#fase-titulo');
    t.textContent = fase.titulo || '';
    t.style.display = fase.titulo ? '' : 'none';

    var grilla = $('#grilla');
    grilla.innerHTML = '';
    $('#lineas-svg').innerHTML = '';

    // Las columnas se mezclan por separado: A y B nunca quedan enfrentadas.
    var izq = mezclar(fase.pares);
    var der = mezclar(fase.pares);

    for (var i = 0; i < fase.pares.length; i++) {
      grilla.appendChild(tarjetonA(izq[i]));
      grilla.appendChild(tarjetonB(der[i]));
    }
    st.seleccion = null;
    st.bloqueado = false;
  }

  /* disparador/solucion/solucionDetalle admiten HTML simple (<b>, <em>,
     <br>) definido en content.js para marcar palabras clave y forzar
     saltos de linea — por eso se arman con innerHTML y no textContent. */
  function tarjetonA(par) {
    var b = document.createElement('button');
    b.className = 'tarjeton tarjeton--a';
    b.dataset.par = par.id;
    b.dataset.lado = 'a';
    b.innerHTML = '<div class="texto">' + par.disparador + '</div>';
    b.addEventListener('click', function () { tocar(b); });
    return b;
  }

  function tarjetonB(par) {
    var b = document.createElement('button');
    b.className = 'tarjeton tarjeton--b';
    b.dataset.par = par.id;
    b.dataset.lado = 'b';
    var mol = par.solucionDetalle
      ? '<div class="molecula">' + par.solucionDetalle + '</div>' : '';
    var textoSolucion = par.solucion.replace(/<[^>]*>/g, '');
    // Nombres largos (ej. el esquema de drogas de PCV) entran mas chicos.
    var claseMarca = 'marca' + (textoSolucion.length > 28 ? ' marca--largo' : '');
    // Con logo se muestra SOLO el isologotipo: el nombre ya esta dibujado
    // dentro de la marca, repetirlo en texto era redundante.
    var marca = par.logoSolucion
      ? '<img class="marca-logo-completo" src="' + par.logoSolucion +
        '" alt="' + textoSolucion + '">'
      : '<div class="' + claseMarca + '">' + par.solucion + '</div>';
    b.innerHTML = marca + mol;
    // Red de seguridad para el kiosco: si el PNG no esta o no se puede
    // leer, el tarjeton no puede quedar vacio — se cae al nombre en texto,
    // que es lo que habia antes de sumar el isologotipo.
    var im = b.querySelector('.marca-logo-completo');
    if (im) {
      var aTexto = function () {
        console.warn('No se pudo cargar ' + im.getAttribute('src') + ' — se usa el nombre en texto.');
        var d = document.createElement('div');
        d.className = claseMarca;
        d.innerHTML = par.solucion;
        if (im.parentNode) im.parentNode.replaceChild(d, im);
      };
      im.addEventListener('error', aTexto);
      // Si la imagen ya venia fallada de la cache, el evento `error` ya paso
      // y nadie lo escucho: `complete` en true con ancho 0 delata ese caso.
      if (im.complete && im.naturalWidth === 0) aTexto();
    }
    b.addEventListener('click', function () { tocar(b); });
    return b;
  }

  /* ---------- Interaccion ---------- */
  function tocar(el) {
    if (st.bloqueado) return;
    if (el.classList.contains('hecho') || el.classList.contains('ok')) return;

    var sel = st.seleccion;

    // Sin seleccion previa: se marca y listo.
    if (!sel) { seleccionar(el); return; }

    // Mismo tarjeton: se deselecciona.
    if (sel.el === el) { limpiarSeleccion(); return; }

    // Mismo lado: se cambia la seleccion (no cuenta como intento).
    if (sel.el.dataset.lado === el.dataset.lado) { limpiarSeleccion(); seleccionar(el); return; }

    // Lados opuestos: se valida.
    validar(sel.el, el);
  }

  function seleccionar(el) {
    // Puede venir marcado en rojo de un intento anterior que sigue animando.
    el.classList.remove('error');
    el.classList.add('sel');
    st.seleccion = { el: el, lado: el.dataset.lado, par: el.dataset.par };
  }
  function limpiarSeleccion() {
    if (st.seleccion) st.seleccion.el.classList.remove('sel');
    st.seleccion = null;
  }

  /* El cartel de acierto/error NO frena el juego: se puede seguir tocando
     tarjetones mientras el aviso sigue en pantalla. Solo se bloquea cuando
     la jugada cierra la fase, porque ahi no queda nada mas para tocar y
     conviene que se vea el acierto antes de la placa de novedad. */
  function validar(elA, elB) {
    var acierto = elA.dataset.par === elB.dataset.par;
    elA.classList.remove('sel'); elB.classList.remove('sel');
    st.seleccion = null;

    if (acierto) {
      elA.classList.add('ok'); elB.classList.add('ok');
      st.conexiones++;
      $('#marcador').textContent = st.conexiones + '/' + TOTAL;
      trazarLinea(elA, elB);
      aviso(C.copy.acierto, C.copy.aciertoApoyo, false);

      var fase = C.fases[st.faseIdx];
      var faseCompleta = $('#grilla').querySelectorAll('.tarjeton--a.ok').length >= fase.pares.length;

      demorar(cfg.msAcierto, function () {
        elA.classList.add('hecho'); elB.classList.add('hecho');
      });

      if (faseCompleta) {
        st.bloqueado = true;
        demorar(cfg.msAcierto, seguir);
      } else {
        st.bloqueado = false;
      }

    } else {
      elA.classList.add('error'); elB.classList.add('error');
      aviso(C.copy.error, C.copy.errorApoyo, true);
      st.bloqueado = false;

      demorar(cfg.msError, function () {
        elA.classList.remove('error'); elB.classList.remove('error');
      });
    }
  }

  function seguir() {
    var fase = C.fases[st.faseIdx];
    var hechos = $('#grilla').querySelectorAll('.tarjeton--a.ok').length;

    if (hechos < fase.pares.length) { st.bloqueado = false; return; }

    // Fase completa: primero la novedad de esta fase, despues el pase.
    var pasar = function () {
      if (st.faseIdx < C.fases.length - 1) {
        st.faseIdx++;
        mostrarFase(function () { pintarFase(); st.bloqueado = false; });
      } else {
        detenerReloj();
        cerrar();
      }
    };

    if (fase.novedad && C.novedades[fase.novedad]) {
      mostrarNovedad(fase.novedad, pasar);
    } else {
      pasar();
    }
  }

  /* ---------- Linea de conexion (SVG sobre el tablero) ---------- */
  function trazarLinea(elA, elB) {
    var svg = $('#lineas-svg');
    var base = $('#tablero').getBoundingClientRect();
    var k = base.width / $('#tablero').offsetWidth || 1;

    function centro(el) {
      var r = el.getBoundingClientRect();
      return {
        x: (r.left - base.left) / k,
        y: (r.top - base.top + r.height / 2) / k,
        w: r.width / k
      };
    }
    var a = centro(elA), b = centro(elB);
    var x1 = a.x + a.w, y1 = a.y, x2 = b.x, y2 = b.y;
    var mx = (x1 + x2) / 2;

    var d = 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    var largo = p.getTotalLength();
    p.style.setProperty('--largo', largo);
    p.style.strokeDasharray = largo;
  }

  /* ---------- Aviso flotante ---------- */
  var avisoTO = null;
  var TILDE = '<span class="tilde"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" ' +
    'stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 6 9 17l-5-5"/></svg></span>';

  function aviso(titulo, apoyo, esError) {
    var el = $('#aviso');
    el.className = 'aviso ' + (esError ? 'aviso--error' : 'aviso--acierto');
    el.innerHTML = (esError ? '' : TILDE) + '<b></b>' + (apoyo ? '<small></small>' : '');
    el.querySelector('b').textContent = titulo;
    if (apoyo) el.querySelector('small').textContent = apoyo;

    void el.offsetWidth;             // reinicia la animacion
    el.classList.add('ver');
    clearTimeout(avisoTO);
    avisoTO = setTimeout(function () { el.classList.remove('ver'); }, 1600);
  }

  /* Baja el cuerpo del titulo de la placa hasta que la linea mas larga
     entre a lo ancho. El <br> del contenido fija DONDE cortar; esto se
     encarga de que ese corte se respete y no se parta en mas lineas.
     (Ej.: "MAPA ARGENTINO DE" no entraba a 82px y caia en 3 renglones.) */
  function ajustarTituloPlaca() {
    var t = $('#nov-titulo');
    t.style.fontSize = '';
    var disponible = t.offsetWidth;
    if (!disponible) return;

    var lineas = t.innerHTML.split(/<br\s*\/?>/i)
      .map(function (l) { return l.replace(/<[^>]*>/g, '').trim(); })
      .filter(Boolean);
    if (lineas.length < 2) return;   // una sola linea: que envuelva sola

    var cs = getComputedStyle(t);
    var base = parseFloat(cs.fontSize);
    var regla = document.createElement('span');
    regla.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;' +
      'text-transform:' + cs.textTransform + ';font-family:' + cs.fontFamily +
      ';font-weight:' + cs.fontWeight + ';font-size:' + base + 'px;letter-spacing:' + cs.letterSpacing;
    document.body.appendChild(regla);

    var ancho = 0;
    lineas.forEach(function (l) {
      regla.textContent = l;
      ancho = Math.max(ancho, regla.getBoundingClientRect().width);
    });
    regla.parentNode.removeChild(regla);

    if (ancho > disponible) {
      t.style.fontSize = Math.floor(base * (disponible / ancho) * 0.98) + 'px';
    }
  }

  /* Borde VISIBLE (de tinta) de un elemento, arriba y abajo.
     En una imagen o un boton el borde de la caja ya es el borde visible.
     En un texto no: la caja arrastra medio interlineado y el hueco de los
     descendentes, que nadie ve. Si se reparte el aire por cajas, el bloque
     del medio queda opticamente corrido. Se mide con las metricas de la
     fuente, igual que en centrarTitulo().

     Se usa offsetTop/offsetHeight y no getBoundingClientRect porque la
     geometria de layout ignora los transforms. El rect vendria escalado
     por el lienzo y ademas deformado por las animaciones de entrada (la
     de la placa y la del candado, que arranca en scale(.4)), y mezclarlo
     con metricas de fuente daria cualquier cosa. */
  var medidor = null;
  function bordesTinta(el) {
    var arriba = el.offsetTop;
    var alto = el.offsetHeight;
    // Imagenes, botones (el borde visible es la pastilla, no la letra) y
    // cualquier elemento sin texto: la caja ya es el borde visible.
    if (el.tagName === 'IMG' || el.tagName === 'BUTTON' || !el.textContent.trim()) {
      return { arriba: arriba, abajo: arriba + alto };
    }

    var cs = getComputedStyle(el);
    var fs = parseFloat(cs.fontSize);
    var lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
    if (!medidor) medidor = document.createElement('canvas').getContext('2d');
    medidor.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;

    var mf = medidor.measureText('Hg');
    var asc = mf.fontBoundingBoxAscent || fs * 0.8;
    var desc = mf.fontBoundingBoxDescent || fs * 0.2;
    var baseSuperior = (lh - (asc + desc)) / 2 + asc;

    var texto = el.textContent.trim();
    if (cs.textTransform === 'uppercase') texto = texto.toUpperCase();
    var m = medidor.measureText(texto || 'Hg');
    var lineas = Math.max(1, Math.round(alto / lh));

    return {
      arriba: arriba + baseSuperior - (m.actualBoundingBoxAscent || asc),
      abajo: arriba + baseSuperior + lh * (lineas - 1) + (m.actualBoundingBoxDescent || 0)
    };
  }

  /* Deja el mismo aire VISIBLE arriba y abajo de `medio`, conservando el
     total. Itera un par de veces porque los margenes de bloques vecinos
     pueden colapsar y el primer ajuste no siempre entra entero. */
  function centrarVertical(medio, arriba, abajo) {
    if (!medio || !arriba || !abajo) return;
    if (getComputedStyle(medio).display === 'none') return;

    for (var paso = 0; paso < 3; paso++) {
      var gArriba = bordesTinta(medio).arriba - bordesTinta(arriba).abajo;
      var gAbajo = bordesTinta(abajo).arriba - bordesTinta(medio).abajo;
      var objetivo = (gArriba + gAbajo) / 2;
      var dArriba = objetivo - gArriba;
      var dAbajo = objetivo - gAbajo;
      // offsetTop viene redondeado a enteros, asi que menos de 1px es ruido.
      if (Math.abs(dArriba) < 1 && Math.abs(dAbajo) < 1) break;

      var cs = getComputedStyle(medio);
      medio.style.marginTop = ((parseFloat(cs.marginTop) || 0) + dArriba) + 'px';
      medio.style.marginBottom = ((parseFloat(cs.marginBottom) || 0) + dAbajo) + 'px';
    }
  }

  /* Deja el MISMO aire visible entre todos los elementos de la placa,
     boton incluido. El valor sale de --placa-ritmo, asi que se regula
     desde el CSS sin tocar esto. Todo el reparto se hace con margin-top:
     los margin-bottom del CSS estan en cero para que no compitan. */
  function repartirPlaca(placa) {
    var ritmo = parseFloat(getComputedStyle(placa).getPropertyValue('--placa-ritmo'));
    if (!ritmo) return;

    var hijos = [].slice.call(placa.children);
    // Se limpia lo que haya quedado de la placa anterior.
    hijos.forEach(function (el) { el.style.marginTop = ''; });

    var visibles = hijos.filter(function (el) {
      return getComputedStyle(el).display !== 'none' &&
             el.getBoundingClientRect().height > 0.5;
    });
    if (visibles.length < 2) return;

    for (var paso = 0; paso < 4; paso++) {
      var listo = true;
      for (var i = 1; i < visibles.length; i++) {
        var hueco = bordesTinta(visibles[i]).arriba -
                    bordesTinta(visibles[i - 1]).abajo;
        var delta = ritmo - hueco;
        // offsetTop viene redondeado a enteros: menos de 1px es ruido.
        if (Math.abs(delta) < 1) continue;
        listo = false;
        var cs = getComputedStyle(visibles[i]);
        visibles[i].style.marginTop =
          ((parseFloat(cs.marginTop) || 0) + delta) + 'px';
      }
      if (listo) break;
    }
  }

  function centrarPlaca(n) {
    var img = $('#nov-img');
    var logo = $('#nov-logo');
    // Se limpian los ajustes de la placa anterior: sin esto, los margenes
    // calculados para una novedad se arrastrarian a la siguiente.
    img.style.marginTop = ''; img.style.marginBottom = '';
    logo.style.marginTop = ''; logo.style.marginBottom = '';

    // Sin la imagen cargada su alto es 0 y el reparto sale mal. Se
    // reintenta al terminar la carga; despues queda en cache.
    var faltaImg = n.imagen && !img.complete;
    var faltaLogo = n.logoMarca && !logo.complete;
    if (faltaImg || faltaLogo) {
      var reintentar = function () { centrarPlaca(n); };
      if (faltaImg) img.addEventListener('load', reintentar, { once: true });
      if (faltaLogo) logo.addEventListener('load', reintentar, { once: true });
      return;
    }

    if (n.logoMarca) {
      // Placa de marca: ritmo parejo entre todos los elementos.
      repartirPlaca($('#modal-novedad .placa'));
    } else if (n.imagen) {
      // Placa de producto: solo se centra la foto entre el texto y el
      // boton; el resto conserva su jerarquia tipografica (el rotulo
      // pegado al titulo, por ejemplo).
      var encima = n.detalle ? $('#nov-detalle') : $('#nov-bajada');
      centrarVertical(img, encima, $('#btn-novedad'));
    }
  }

  /* ---------- Modal de novedad ---------- */
  function mostrarNovedad(id, luego) {
    var n = C.novedades[id];
    st.novedades.push(id);

    $('#nov-kicker').textContent = C.copy.desbloqueo;
    // El titulo admite <br> para forzar el corte de linea (ej. el Mapa).
    $('#nov-titulo').innerHTML = n.titulo;
    $('#nov-bajada').textContent = n.bajada;
    $('#nov-detalle').textContent = n.detalle || '';

    /* Dos tipos de placa:
       - producto: titulo en texto + textos + foto abajo (Eczahedge)
       - marca:    isologotipo arriba, sin titulo en texto (Eczagen) */
    var logo = $('#nov-logo');
    // La clase decide si el logo se ve: no se toca style.display para no
    // pisar la regla del CSS que lo mantiene oculto por defecto.
    var placa = $('#modal-novedad .placa');
    placa.classList.toggle('placa--marca', !!n.logoMarca);
    placa.classList.toggle('placa--con-foto', !!n.imagen);
    if (n.logoMarca) { logo.src = n.logoMarca; logo.alt = n.titulo; }
    else { logo.removeAttribute('src'); }

    var img = $('#nov-img');
    if (n.imagen) { img.src = n.imagen; img.style.display = ''; }
    else { img.removeAttribute('src'); img.style.display = 'none'; }
    img.onerror = function () { img.style.display = 'none'; };

    // La placa queda en pantalla hasta que toquen "Sigamos".
    // Mientras tanto el reloj se detiene: leerla no gasta el tiempo de juego.
    $('#modal-novedad').classList.add('activo');
    ajustarTituloPlaca();   // recien ahora la placa tiene ancho medible
    centrarPlaca(n);        // y recien ahora se pueden medir los huecos
    if (cfg.pausarEnModales) st.pausado = true;

    var btn = $('#btn-novedad');
    btn.onclick = function () {
      btn.onclick = null;
      $('#modal-novedad').classList.remove('activo');
      if (cfg.pausarEnModales) st.pausado = false;
      luego();
    };
  }

  /* ---------- Cartel de cambio de fase ---------- */
  function mostrarFase(luego) {
    var fase = C.fases[st.faseIdx];
    // Sin titulo tematico, el numero de tanda pasa a ser el titulo grande.
    $('#fasemodal-kicker').textContent = fase.titulo ? fase.numero : '';
    $('#fasemodal-titulo').textContent = fase.titulo || fase.numero;
    $('#modal-fase').classList.add('activo');
    pausar(cfg.msFase, function () {
      $('#modal-fase').classList.remove('activo');
      luego();
    });
  }

  /* ---------- Cierre ----------
     Se listan las 4 novedades: las desbloqueadas en color y con tilde,
     las que no llegaron a descubrir atenuadas. Asi queda claro que
     lograron y que se perdieron. El orden de la grilla sale del orden
     de las claves de `novedades` en content.js. */
  var TILDE_MINI = '<span class="tilde-mini"><svg viewBox="0 0 24 24" fill="none" ' +
    'stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 6 9 17l-5-5"/></svg></span>';
  var CANDADO_MINI = '<span class="tilde-mini"><svg viewBox="0 0 24 24" fill="none" ' +
    'stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>';

  function pintarNovedadesCierre() {
    var cont = $('#novedades-cierre');
    cont.innerHTML = '';

    var claves = Object.keys(C.novedades);
    var logradas = 0;

    claves.forEach(function (k) {
      var n = C.novedades[k];
      var abierta = st.novedades.indexOf(k) !== -1;
      if (abierta) logradas++;

      // Eczagen usa su isologotipo horizontal en lugar del titulo en texto.
      var encabezado = n.logoCierre
        ? '<img class="nov-card-logo" src="' + n.logoCierre + '" alt="' + n.titulo + '">'
        : '<h4></h4>';

      var d = document.createElement('div');
      d.className = 'nov-card' + (abierta ? '' : ' nov-card--trabada');
      d.innerHTML = (abierta ? TILDE_MINI : CANDADO_MINI) + encabezado + '<p></p>';
      if (!n.logoCierre) d.querySelector('h4').innerHTML = n.titulo;
      d.querySelector('p').textContent = n.bajada;

      cont.appendChild(d);
    });

    $('#cierre-nov-cuenta').textContent = logradas + ' de ' + claves.length;
  }

  function cerrar() {
    frenarPartida();
    $('#cierre-num').textContent = st.conexiones;
    $('#cierre-total').textContent = '/' + TOTAL;
    $('#cierre-msg').textContent = C.copy.cierre;
    pintarNovedadesCierre();
    irA('cierre');
  }

  /* ---------- Arranque de partida ---------- */
  function iniciar() {
    frenarPartida();          // por si quedo algo vivo de la partida anterior
    st.faseIdx = 0;
    st.conexiones = 0;
    st.novedades = [];
    st.restante = cfg.duracionSegundos;
    st.pausado = false;
    $('#marcador').textContent = '0/' + TOTAL;
    pintarReloj();

    irA('cuenta');
    var num = $('#cuenta-num');
    var n = 3;
    num.textContent = n;
    num.classList.add('pulso');

    st.cuenta = setInterval(function () {
      n--;
      if (n <= 0) {
        clearInterval(st.cuenta); st.cuenta = null;
        pintarFase();
        irA('juego');
        arrancarReloj();
        return;
      }
      num.classList.remove('pulso');
      void num.offsetWidth;
      num.textContent = n;
      num.classList.add('pulso');
    }, 900);
  }

  /* ---------- Textos estaticos desde content.js ---------- */
  function pintarCopys() {
    $('#titulo-inicio').innerHTML = C.copy.tituloInicio;
    $('#bajada-inicio').innerHTML = C.copy.bajadaInicio;
    $('#aliado-inicio').innerHTML = C.copy.aliado;
    $('#btn-iniciar .rotulo').textContent = C.copy.botonInicio;
    $('#cuenta-titulo').textContent = C.copy.cuentaRegresiva;
    $('#cuenta-sub').textContent = C.copy.tiempo;
    $('#instruccion').textContent = C.copy.instruccion;
    $('#cierre-apoyo').innerHTML = C.copy.cierreApoyo;
    $('#btn-reiniciar').textContent = C.copy.botonReinicio;
    $('#btn-novedad').textContent = C.copy.botonNovedad;

  }

  /* ---------- Ajuste optico de los logos ----------
     Los PNG del logotipo son cuadrados de 4500x4500 con la marca centrada
     y mucho transparente alrededor (963 px por lado). Si se les da un ancho
     a secas, la marca se ve mucho mas chica de lo pedido. Aca se mide la
     caja de tinta real y se compensa con ancho + margenes negativos, asi
     el ancho pedido es el ancho VISIBLE. Si manana cambian el archivo del
     logo, se recalcula solo. */

  var cacheTinta = {};

  function medirTinta(src) {
    if (cacheTinta[src]) return cacheTinta[src];
    cacheTinta[src] = new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = im.naturalWidth; c.height = im.naturalHeight;
          var x = c.getContext('2d');
          x.drawImage(im, 0, 0);
          var d = x.getImageData(0, 0, c.width, c.height).data;
          var L = c.width, R = -1, T = c.height, B = -1;
          for (var y = 0; y < c.height; y++) {
            for (var px = 0; px < c.width; px++) {
              if (d[(y * c.width + px) * 4 + 3] > 12) {
                if (px < L) L = px; if (px > R) R = px;
                if (y < T) T = y;  if (y > B) B = y;
              }
            }
          }
          if (R < 0) { resolve(null); return; }
          resolve({
            w: c.width, h: c.height,
            izq: L / c.width,
            der: (c.width - 1 - R) / c.width,
            arr: T / c.height,
            aba: (c.height - 1 - B) / c.height,
            anchoRel: (R - L + 1) / c.width
          });
        } catch (e) { resolve(null); }   // canvas bloqueado: se deja como esta
      };
      im.onerror = function () { resolve(null); };
      im.src = src;
    });
    return cacheTinta[src];
  }

  // Le da al logo un ancho VISIBLE de `ancho` px (en unidades del lienzo).
  function calzarLogo(img, ancho) {
    if (!img || !(ancho > 0)) return;
    medirTinta(img.getAttribute('src')).then(function (t) {
      if (!t) { img.style.width = Math.round(ancho) + 'px'; return; }
      var w = ancho / t.anchoRel;
      var h = w * (t.h / t.w);
      img.style.width = Math.round(w) + 'px';
      img.style.marginTop = Math.round(-h * t.arr) + 'px';
      img.style.marginBottom = Math.round(-h * t.aba) + 'px';
      img.style.marginLeft = Math.round(-w * t.izq) + 'px';
      img.style.marginRight = Math.round(-w * t.der) + 'px';
    });
  }

  /* Ajusta el cuerpo del titulo para que la linea mas larga entre a lo ancho.
     "QUE IMPORTAN" es mas ancha que "CONEXIONES", asi que el limite lo pone
     ella. Se recalcula solo si manana cambian el copy. */
  function ajustarTitulo() {
    var t = $('#titulo-inicio');
    var disponible = t.offsetWidth;
    if (!disponible) return;

    var lineas = C.copy.tituloInicio.split(/<br\s*\/?>/i)
      .map(function (l) { return l.replace(/<[^>]*>/g, '').trim(); })
      .filter(Boolean);
    if (!lineas.length) return;

    t.style.fontSize = '';                       // vuelve al valor del CSS
    var base = parseFloat(getComputedStyle(t).fontSize);
    var cs = getComputedStyle(t);

    var regla = document.createElement('span');
    regla.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;' +
      'text-transform:' + cs.textTransform + ';font-family:' + cs.fontFamily +
      ';font-weight:' + cs.fontWeight + ';font-size:' + base + 'px;letter-spacing:' + cs.letterSpacing;
    document.body.appendChild(regla);

    var ancho = 0;
    lineas.forEach(function (l) {
      regla.textContent = l;
      ancho = Math.max(ancho, regla.getBoundingClientRect().width);
    });
    regla.parentNode.removeChild(regla);

    if (ancho > disponible) {
      t.style.fontSize = Math.floor(base * (disponible / ancho) * 0.98) + 'px';
    }
  }

  /* Centra opticamente el titulo en el hueco entre el logo y la bajada.
     No alcanza con igualar margenes: la caja de texto lleva aire arriba
     (ascendente) y abajo (descendente) que nadie ve, y el titulo va en
     mayusculas, asi que sobra mas abajo que arriba. Se mide la TINTA real
     con las metricas de la fuente y se reparten los huecos visibles. */
  function centrarTitulo() {
    var t = $('#titulo-inicio');
    var bajada = $('#bajada-inicio');
    if (!t || !bajada) return;

    var ct = getComputedStyle(t);
    var cb = getComputedStyle(bajada);
    var cv = document.createElement('canvas').getContext('2d');

    // Distancia desde el borde superior de una caja de texto hasta la
    // tinta, y desde la tinta hasta el borde inferior.
    function tinta(cs, texto, lineas) {
      var fs = parseFloat(cs.fontSize);
      var lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
      cv.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;

      var mFuente = cv.measureText('Hg');
      var asc = mFuente.fontBoundingBoxAscent;
      var desc = mFuente.fontBoundingBoxDescent;
      if (!asc || !desc) { asc = fs * 0.8; desc = fs * 0.2; }

      var medioInterlineado = (lh - (asc + desc)) / 2;
      var baseSuperior = medioInterlineado + asc;

      var mPrimera = cv.measureText(lineas[0]);
      var mUltima = cv.measureText(lineas[lineas.length - 1]);

      return {
        arriba: baseSuperior - (mPrimera.actualBoundingBoxAscent || asc),
        alto: lh * lineas.length,
        abajo: lh * lineas.length -
               (baseSuperior + lh * (lineas.length - 1) + (mUltima.actualBoundingBoxDescent || 0))
      };
    }

    function lineasDe(html, mayus) {
      return html.split(/<br\s*\/?>/i)
        .map(function (l) { return l.replace(/<[^>]*>/g, '').trim(); })
        .filter(Boolean)
        .map(function (l) { return mayus ? l.toUpperCase() : l; });
    }

    var tT = tinta(ct, null, lineasDe(C.copy.tituloInicio, ct.textTransform === 'uppercase'));
    var tB = tinta(cb, null, lineasDe(C.copy.bajadaInicio, false));

    // Se conserva el aire total y se reparte en partes iguales.
    var mtActual = parseFloat(ct.marginTop) || 0;
    var mbActual = parseFloat(cb.marginTop) || 0;
    var huecoTotal = (mtActual + tT.arriba) + (tT.abajo + mbActual + tB.arriba);
    var mitad = huecoTotal / 2;

    t.style.marginTop = Math.round(mitad - tT.arriba) + 'px';
    bajada.style.marginTop = Math.round(mitad - tT.abajo - tB.arriba) + 'px';
  }

  // Ancho de la primera linea del titulo, con su tipografia real.
  // Se mide fuera de #stage para no arrastrar la escala del lienzo.
  function anchoPalabraTitulo() {
    var titulo = $('#titulo-inicio');
    var palabra = C.copy.tituloInicio.split(/<br\s*\/?>/i)[0].replace(/<[^>]*>/g, '').trim();
    if (!palabra) return 0;

    var cs = getComputedStyle(titulo);
    var regla = document.createElement('span');
    regla.textContent = palabra;
    regla.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;' +
      'text-transform:' + cs.textTransform + ';font-family:' + cs.fontFamily +
      ';font-weight:' + cs.fontWeight + ';font-size:' + cs.fontSize +
      ';letter-spacing:' + cs.letterSpacing;
    document.body.appendChild(regla);
    var ancho = regla.getBoundingClientRect().width;
    regla.parentNode.removeChild(regla);
    return ancho;
  }

  function ajustarLogos() {
    ajustarTitulo();   // primero el titulo: el logo se mide contra el
    centrarTitulo();   // y despues se reparte el aire de arriba y abajo
    // 54.6% del ancho visible de "CONEXIONES". El protagonismo es del
    // titulo; este valor ya incluye el +10% que pidio el cliente.
    calzarLogo($('#logo-inicio'), anchoPalabraTitulo() * 0.546);
    [].forEach.call(document.querySelectorAll('.logo--chico'), function (l) {
      calzarLogo(l, 250);
    });
  }

  /* ---------- Eventos ---------- */
  $('#btn-iniciar').addEventListener('click', iniciar);
  $('#btn-reiniciar').addEventListener('click', function () {
    frenarPartida();   // sin esto, un plazo pendiente reabre el juego solo
    irA('inicio');
  });

  // Kiosco: sin zoom por doble toque ni menu contextual.
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  /* ---------- Chequeo de assets ----------
     El kiosco corre sin internet y a veces sobre una copia de la carpeta
     que viajo por mail o pendrive. Si en el camino se perdio una imagen,
     conviene enterarse al abrir y no en medio de la demo: esto avisa por
     consola cual falta, con el nombre exacto del archivo. */
  function revisarImagenes() {
    var rutas = [];
    [].forEach.call(document.images, function (i) {
      if (i.getAttribute('src')) rutas.push(i.getAttribute('src'));
    });
    C.fases.forEach(function (f) {
      f.pares.forEach(function (p) { if (p.logoSolucion) rutas.push(p.logoSolucion); });
    });
    Object.keys(C.novedades).forEach(function (k) {
      ['logoMarca', 'logoCierre', 'imagen'].forEach(function (campo) {
        if (C.novedades[k][campo]) rutas.push(C.novedades[k][campo]);
      });
    });
    rutas.filter(function (r, i) { return rutas.indexOf(r) === i; }).forEach(function (r) {
      var t = new Image();
      t.onerror = function () { console.error('FALTA EL ARCHIVO: ' + r); };
      t.src = r;
    });
  }

  pintarCopys();
  revisarImagenes();
  irA('inicio');
  ajustarLogos();
  // Se remide cuando terminan de cargar las DIN Pro: antes el ancho
  // corresponde a la tipografia de reemplazo.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ajustarLogos);
  }
})();
