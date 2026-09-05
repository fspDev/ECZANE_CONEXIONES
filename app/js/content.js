/* ============================================================
   CONEXIONES QUE IMPORTAN — Contenido editable
   Congreso AOCC 2026 · Laboratorio Eczane
   ------------------------------------------------------------
   Este es el UNICO archivo que hay que tocar para cambiar
   textos. No modificar game.js ni styles.css para editar copy.

   Los campos `disparador`, `solucion` y `solucionDetalle` admiten
   HTML simple (<b>, <em>, <br>) — se usa para marcar palabras clave
   en negrita y para forzar saltos de línea en nombres largos.

   Estructura tomada del DOCX "CONEXIONES Y PLACAS":
   4 pantallas x 3 conexiones = 12 conexiones (24 tarjetones).
   Cada pantalla desbloquea una placa de novedad al completarse.

   Ronda de revisión del cliente (PDF "Juego interactivo V2"):
   la Fase 1 y la Fase 4 intercambiaron su contenido clínico —
   la novedad que se desbloquea quedó fija por posición (Fase 1
   sigue desbloqueando Eczahedge, Fase 4 sigue desbloqueando el
   Portal), solo cambiaron las conexiones que hay que armar ahí.
   ============================================================ */

const CONTENIDO = {

  /* ---------- Ajustes generales ---------- */
  config: {
    duracionSegundos: 60,      // contador del brief
    msAcierto: 2200,           // cuanto dura el cartel de acierto (no frena el juego)
    msError: 1800,             // cuanto dura el cartel de error (no frena el juego)
    msFase: 1600,              // cartel de cambio de pantalla
    pausarEnModales: true      // el reloj se detiene en los modales
  },

  /* ---------- Copies (tomados del brief) ---------- */
  copy: {
    tituloInicio:    'Conexiones<br><em>que importan</em>',
    bajadaInicio:    'Descubrí las asociaciones correctas<br>y desbloqueá novedades.',
    aliado:          'Tu representante es tu aliado:<br>pueden resolverlo juntos.',
    botonInicio:     'Iniciar misión',
    instruccion:     'Elegí dos tarjetones para formar una conexión.',
    cuentaRegresiva: '¿Listos para conectar?',
    tiempo:          'Tienen 60 segundos.',
    acierto:         'Conexión lograda',
    aciertoApoyo:    'Excelente, encontraron una asociación correcta.',
    desbloqueo:      'Novedad desbloqueada',
    desbloqueoApoyo: 'Esta conexión abre nueva información.',
    error:           'Casi. Probemos otra conexión.',
    errorApoyo:      'Esa dupla no conecta, sigamos.',
    cierre:          'Misión completada',
    cierreApoyo:     'Gracias por participar.',
    botonNovedad:    'Sigamos',
    botonReinicio:   'Nueva misión'
  },

  /* ---------- 4 pantallas x 3 conexiones = 12 (24 tarjetones) ---------- */
  fases: [
    {
      id: 'pantalla-1',
      numero: 'Fase 1 de 4',
      titulo: '',
      novedad: 'eczahedge',
      pares: [
        {
          id: 'p10',
          disparador: 'Cáncer de endometrio avanzado o recurrente p-MMR en progresión, en combinación con pembrolizumab, después de terapia previa basada en platino.',
          solucion: 'Lenvatinib<br>Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p11',
          disparador: 'En glioblastoma recurrente tras falla a primera línea',
          solucion: 'Lomustina<br>Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p12',
          disparador: 'Prolonga OS en pacientes con carcinoma hepatocelular que progresaron tras 1era línea de tratamiento.',
          solucion: 'Rezitix',
          solucionDetalle: 'Regorafenib'
        }
      ]
    },
    {
      id: 'pantalla-2',
      numero: 'Fase 2 de 4',
      titulo: '',
      novedad: 'eczagen',
      pares: [
        {
          id: 'p4',
          disparador: 'Carcinoma hepatocelular avanzado o irresecable',
          solucion: 'Lenvatinib<br>Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p5',
          disparador: 'Estándar de quimiorradioterapia y mantenimiento en glioblastoma (Stupp)',
          solucion: 'Temoxan',
          solucionDetalle: 'Temozolomida'
        },
        {
          id: 'p6',
          disparador: 'Carcinoma basocelular recurrente / irresecable',
          solucion: 'Eczahedge',
          solucionDetalle: 'Vismodegib'
        }
      ]
    },
    {
      id: 'pantalla-3',
      numero: 'Fase 3 de 4',
      titulo: '',
      novedad: 'mapa',
      pares: [
        {
          id: 'p7',
          disparador: 'Carcinoma diferenciado de tiroides en progresión refractario a yodo radiactivo',
          solucion: 'Lenvatinib<br>Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p8',
          disparador: 'Mejora significativa de OS y FPS en <b>pacientes con GIST</b> localmente avanzado irresecable o metastásico previamente tratados',
          solucion: 'Rezitix',
          solucionDetalle: 'Regorafenib'
        },
        {
          id: 'p9',
          disparador: 'Programa que ofrece perfil histo-molecular completo (OMS 2021) de <b>gliomas difusos</b> del adulto',
          solucion: 'Eczagen',
          solucionDetalle: '',
          iconoSolucion: 'assets/img/eczagen-icono.png'
        }
      ]
    },
    {
      id: 'pantalla-4',
      numero: 'Fase 4 de 4',
      titulo: '',
      novedad: 'portal',
      pares: [
        {
          id: 'p1',
          disparador: 'Programa de <b>diagnóstico</b> integrado en <b>gliomas difusos</b> del adulto',
          solucion: 'Eczagen',
          solucionDetalle: '',
          iconoSolucion: 'assets/img/eczagen-icono.png'
        },
        {
          id: 'p2',
          disparador: 'Mejora significativa de <b>OS y FPS</b> en <b>pacientes con CCm</b> previamente tratados con terapia estándar.',
          solucion: 'Rezitix',
          solucionDetalle: 'Regorafenib'
        },
        {
          id: 'p3',
          // Esquema de drogas como titulo grande y "(Esquema PCV)" como
          // subtitulo chico en italica — pedido del cliente, invierte el
          // orden habitual (nombre comercial arriba, droga abajo).
          disparador: 'En pacientes con glioma difuso de bajo grado y alto riesgo, demostró más de 14 años de mediana de sobrevida global vs RT sola.',
          solucion: 'Lomustina Eczane + Procarbazina Eczane + Vincristina',
          solucionDetalle: '<em>(Esquema PCV)</em>'
        }
      ]
    }
  ],

  /* ---------- Placas de "Novedad desbloqueada" ----------
     Las 4 del DOCX, en el orden del esquema del cliente.
     Pueden llevar imagen (foto de producto / logo) o qr. */
  novedades: {
    eczahedge: {
      titulo: 'ECZAHEDGE',
      bajada: 'Primera línea en cáncer basocelular localmente avanzado y metastásico',
      detalle: 'Eficacia de simple administración',
      imagen: 'assets/img/eczahedge-estuches.jpg',
      qr: null
    },
    eczagen: {
      titulo: 'ECZAGEN',
      bajada: 'Programa de diagnóstico de precisión en gliomas difusos del adulto',
      detalle: 'Una brújula molecular hacia un diagnóstico certero, rápido y confiable.',
      imagen: 'assets/img/eczagen-logo.png',
      qr: null
    },
    mapa: {
      titulo: 'MAPA ARGENTINO DE NEUROONCOLOGÍA',
      bajada: 'Mapa para localizar especialistas, instituciones y servicios vinculados a la atención neurooncológica',
      detalle: '',
      imagen: null,
      qr: 'assets/img/qr-mapa.png'                   // PENDIENTE: QR mapa
    },
    portal: {
      titulo: 'WEB ECZANE PORTAL MÉDICOS',
      bajada: 'Acceso a documentación útil para profesionales de la salud y pacientes',
      detalle: '',
      imagen: null,
      qr: 'assets/img/qr-portal.png'                 // PENDIENTE: QR web
    }
  },

  /* ---------- Placas con QR: se repiten en el cierre ----------
     Recordatorio final, por si no llegaron a escanear durante el juego.
     Dejar el array vacio ([]) para que el cierre muestre solo el resumen. */
  cierrePlacas: [
    {
      titulo: 'Mapa Argentino de Neurooncología',
      detalle: 'Especialistas, instituciones y servicios de atención neurooncológica.',
      qr: 'assets/img/qr-mapa.png'                    // PENDIENTE: QR mapa
    },
    {
      titulo: 'Portal Médicos Eczane',
      detalle: 'Acceso a documentación útil para profesionales de la salud y pacientes.',
      qr: 'assets/img/qr-portal.png'                  // PENDIENTE: QR web
    }
  ]
};
