/* ============================================================
   CONEXIONES QUE IMPORTAN — Contenido editable
   Congreso AOCC 2026 · Laboratorio Eczane
   ------------------------------------------------------------
   Este es el UNICO archivo que hay que tocar para cambiar
   textos. No modificar game.js ni styles.css para editar copy.

   Estructura tomada del DOCX "CONEXIONES Y PLACAS":
   4 pantallas x 3 conexiones = 12 conexiones (24 tarjetones).
   Cada pantalla desbloquea una placa de novedad al completarse.
   ============================================================ */

const CONTENIDO = {

  /* ---------- Ajustes generales ---------- */
  config: {
    duracionSegundos: 60,      // contador del brief
    msAcierto: 1400,           // cuanto dura el cartel de acierto (no frena el juego)
    msError: 900,              // cuanto dura el cartel de error (no frena el juego)
    msFase: 1600,              // cartel de cambio de pantalla
    pausarEnModales: true      // el reloj se detiene en los modales
  },

  /* ---------- Copies (tomados del brief) ---------- */
  copy: {
    tituloInicio:    'Conexiones<br>que importan',
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
    cierreApoyo:     'Gracias por participar.<br>Sigamos el recorrido.',
    botonNovedad:    'Sigamos',
    botonReinicio:   'Nueva misión'
  },

  /* ---------- 4 pantallas x 3 conexiones = 12 (24 tarjetones) ----------
     El campo `novedad` es la placa que se desbloquea al completar la
     pantalla. Se muestra antes de pasar a la siguiente. */
  fases: [
    {
      id: 'pantalla-1',
      numero: 'Tanda 1 de 4',
      titulo: '',
      novedad: 'eczahedge',
      pares: [
        {
          id: 'p1',
          disparador: 'Testeo Molecular sin cargo para estratificación pronóstica temprana de glioma difuso en el adulto. (IDH1/IDH2, 1p19q, ATRX, CDKN2A, p53, MGMT, entre otros)',
          solucion: 'Eczagen',
          solucionDetalle: ''
        },
        {
          id: 'p2',
          disparador: 'Mejora significativamente la sobrevida global y la supervivencia libre de progresión en pacientes con Cáncer Colorrectal Metastásico previamente tratados con terapias estándar.',
          solucion: 'Rezitix',
          solucionDetalle: 'regorafenib'
        },
        {
          id: 'p3',
          disparador: 'En pacientes con glioma difuso de bajo grado y alto riesgo, demostró más de 14 años de mediana de sobrevida global vs RT sola.',
          solucion: 'Esquema PCV',
          solucionDetalle: 'Lomustina Eczane + Procarbazina Eczane + Vincristina'
        }
      ]
    },
    {
      id: 'pantalla-2',
      numero: 'Tanda 2 de 4',
      titulo: '',
      novedad: 'eczagen',
      pares: [
        {
          id: 'p4',
          disparador: 'Carcinoma hepatocelular avanzado o irresecable',
          solucion: 'Lenvatinib Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p5',
          disparador: 'Estándar de Quimiorradioterapia y Mantenimiento en Glioblastoma (Stupp)',
          solucion: 'Temoxan',
          solucionDetalle: 'Temozolomida'
        },
        {
          id: 'p6',
          disparador: 'Carcinoma Basocelular recurrente / irresecable',
          solucion: 'Eczahedge',
          solucionDetalle: 'Vismodegib'
        }
      ]
    },
    {
      id: 'pantalla-3',
      numero: 'Tanda 3 de 4',
      titulo: '',
      novedad: 'mapa',
      pares: [
        {
          id: 'p7',
          disparador: 'Carcinoma diferenciado de tiroides en progresión refractario a yodo radiactivo',
          solucion: 'Lenvatinib Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p8',
          disparador: 'Mejora significativamente la sobrevida libre de progresión en pacientes con GIST localmente avanzado irresecable o metastásico previamente tratados con Imatinib y Sunitinib (3ra línea).',
          solucion: 'Rezitix',
          solucionDetalle: 'regorafenib'
        },
        {
          id: 'p9',
          disparador: 'Testeo molecular que permite el diagnóstico diferencial entre gliomas de bajo y alto grado.',
          solucion: 'Eczagen',
          solucionDetalle: ''
        }
      ]
    },
    {
      id: 'pantalla-4',
      numero: 'Tanda 4 de 4',
      titulo: '',
      novedad: 'portal',
      pares: [
        {
          id: 'p10',
          disparador: 'Cáncer de endometrio avanzado o recurrente p-MMR en progresión, en combinación con pembrolizumab, después de terapia previa basada en platino.',
          solucion: 'Lenvatinib Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p11',
          disparador: 'En Glioblastoma Recurrente tras Falla a Primera Línea',
          solucion: 'Lomustina Eczane',
          solucionDetalle: ''
        },
        {
          id: 'p12',
          disparador: 'Prolonga la sobrevida global en pacientes con carcinoma hepatocelular que progresaron tras primera línea de tratamiento.',
          solucion: 'Rezitix',
          solucionDetalle: 'Regorafenib'
        }
      ]
    }
  ],

  /* ---------- Placas de "Novedad desbloqueada" ----------
     Las 4 del DOCX, en el orden del esquema del cliente.
     Pueden llevar imagen (foto de producto) o qr. */
  novedades: {
    eczahedge: {
      titulo: 'ECZAHEDGE',
      bajada: 'Primera línea en cáncer basocelular localmente avanzado y metastásico',
      detalle: 'Eficacia de simple administración',
      imagen: 'assets/img/eczahedge-estuches.png',   // PENDIENTE: foto de estuches
      qr: null
    },
    eczagen: {
      titulo: 'ECZAGEN',
      bajada: 'Programa de diagnóstico de precisión en gliomas difusos del adulto',
      detalle: 'Una brújula molecular hacia un diagnóstico certero, rápido y confiable. Panel de biomarcadores ampliado para el diagnóstico integral.',
      imagen: null,
      qr: null
    },
    mapa: {
      titulo: 'MAPA DE NEUROONCOLOGÍA ARGENTINA',
      bajada: 'Mapa para buscar especialistas, instituciones y servicios vinculados a la atención neurooncológica',
      detalle: 'Encontralo en nuestra web.',
      imagen: null,
      qr: 'assets/img/qr-mapa.png'                   // PENDIENTE: QR mapa
    },
    portal: {
      titulo: 'WEB ECZANE PORTAL MÉDICOS',
      bajada: 'Documentación de programas de gestión de riesgo, calendarios de tomas, prospectos y charlas científicas grabadas',
      detalle: 'Regístrese en nuestro portal web.',
      imagen: null,
      qr: 'assets/img/qr-portal.png'                 // PENDIENTE: QR web
    }
  },

  /* ---------- Placas con QR: se repiten en el cierre ----------
     Recordatorio final, por si no llegaron a escanear durante el juego.
     Dejar el array vacio ([]) para que el cierre muestre solo el resumen. */
  cierrePlacas: [
    {
      titulo: 'Mapa de Neurooncología Argentina',
      detalle: 'Especialistas, instituciones y servicios de atención neurooncológica.',
      qr: 'assets/img/qr-mapa.png'                    // PENDIENTE: QR mapa
    },
    {
      titulo: 'Portal Médicos Eczane',
      detalle: 'Programas de gestión de riesgo, calendarios de tomas, prospectos y charlas científicas grabadas.',
      qr: 'assets/img/qr-portal.png'                  // PENDIENTE: QR web
    }
  ]
};
