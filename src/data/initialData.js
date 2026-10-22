/**
 * Datos iniciales de demostración para Biblioteca-SQL (Fase 1)
 * Diseñado conforme a las entidades del Trabajo de Extensión de Bases de Datos Relacionales.
 * Incluye un mínimo de 10 registros por entidad principal y coherencia relacional.
 */

export const INITIAL_EDITORIALES = [
  { id: 1, nombre: "Editorial Sudamericana", pais: "Argentina", email: "contacto@sudamericana.com", telefono: "+54 11 4312-8900", sitio_web: "https://penguinrandomhouse.com/sudamericana" },
  { id: 2, nombre: "Editorial Seix Barral", pais: "España", email: "info@seixbarral.es", telefono: "+34 93 492-8000", sitio_web: "https://planetadelibros.com/seix-barral" },
  { id: 3, nombre: "Fondo de Cultura Económica", pais: "México", email: "atencion@fondodeculturaeconomica.com", telefono: "+52 55 5227-4672", sitio_web: "https://fondodeculturaeconomica.com" },
  { id: 4, nombre: "Editorial Alfaguara", pais: "España", email: "comunicacion@alfaguara.com", telefono: "+34 91 309-8600", sitio_web: "https://penguinlibros.com/alfaguara" },
  { id: 5, nombre: "Editorial Anagrama", pais: "España", email: "editorial@anagrama-ed.es", telefono: "+34 93 203-7652", sitio_web: "https://anagrama-ed.es" },
  { id: 6, nombre: "Alianza Editorial", pais: "España", email: "alianza@alianzaeditorial.es", telefono: "+34 91 393-8888", sitio_web: "https://alianzaeditorial.es" },
  { id: 7, nombre: "Editorial Losada", pais: "Argentina", email: "ventas@editoriallosada.com", telefono: "+54 11 4374-0010", sitio_web: "https://editoriallosada.com" },
  { id: 8, nombre: "Siglo XXI Editores", pais: "México", email: "ventas@sigloxxieditores.com.mx", telefono: "+52 55 5658-7555", sitio_web: "https://sigloxxieditores.com.mx" },
  { id: 9, nombre: "Editorial Cátedra", pais: "España", email: "catedra@anaya.es", telefono: "+34 91 393-8989", sitio_web: "https://catedra.com" },
  { id: 10, nombre: "Tusquets Editores", pais: "España", email: "tusquets@tusquets-editores.es", telefono: "+34 93 241-1970", sitio_web: "https://planetadelibros.com/tusquets" }
];

export const INITIAL_AUTORES = [
  { id: 1, nombre: "Gabriel", apellidos: "García Márquez", nacionalidad: "Colombiana", fecha_nacimiento: "1927-03-06", biografia: "Premio Nobel de Literatura 1982 y máximo exponente del realismo mágico latinoamericano." },
  { id: 2, nombre: "Jorge Luis", apellidos: "Borges", nacionalidad: "Argentina", fecha_nacimiento: "1899-08-24", biografia: "Maestro del cuento filosófico, ensayista y poeta universal, autor de Ficciones y El Aleph." },
  { id: 3, nombre: "Mario", apellidos: "Vargas Llosa", nacionalidad: "Peruana", fecha_nacimiento: "1936-03-28", biografia: "Premio Nobel de Literatura 2010, figura clave del boom latinoamericano y autor de La ciudad y los perros." },
  { id: 4, nombre: "Julio", apellidos: "Cortázar", nacionalidad: "Argentina", fecha_nacimiento: "1914-08-26", biografia: "Innovador del relato corto y de la novela contemporánea con su revolucionaria obra Rayuela." },
  { id: 5, nombre: "Isabel", apellidos: "Allende", nacionalidad: "Chilena", fecha_nacimiento: "1942-08-02", biografia: "Reconocida novelista chilena, autora superventas internacional de La casa de los espíritus." },
  { id: 6, nombre: "Miguel", apellidos: "de Cervantes Saavedra", nacionalidad: "Española", fecha_nacimiento: "1547-09-29", biografia: "Máxima figura de la literatura española y creador de Don Quijote de la Mancha." },
  { id: 7, nombre: "Juan", apellidos: "Rulfo", nacionalidad: "Mexicana", fecha_nacimiento: "1917-05-16", biografia: "Escritor magistral mexicano, autor del célebre libro Pedro Páramo y El llano en llamas." },
  { id: 8, nombre: "Octavio", apellidos: "Paz", nacionalidad: "Mexicana", fecha_nacimiento: "1914-03-31", biografia: "Premio Nobel de Literatura 1990, poeta y ensayista fundamental, autor de El laberinto de la soledad." },
  { id: 9, nombre: "Pablo", apellidos: "Neruda", nacionalidad: "Chilena", fecha_nacimiento: "1904-07-12", biografia: "Premio Nobel de Literatura 1971 y una de las cumbres líricas del idioma castellano." },
  { id: 10, nombre: "Clarice", apellidos: "Lispector", nacionalidad: "Brasileña", fecha_nacimiento: "1920-12-10", biografia: "Extraordinaria escritora y periodista brasileña de estilo íntimo y vanguardista." },
  { id: 11, nombre: "Adolfo", apellidos: "Bioy Casares", nacionalidad: "Argentina", fecha_nacimiento: "1914-09-15", biografia: "Cofundador de proyectos literarios con Borges y autor de La invención de Morel." }
];

export const INITIAL_LIBROS = [
  { id: 1, titulo: "Cien años de soledad", isbn: "978-0307474728", editorial_id: 1, anio_publicacion: 1967, genero: "Realismo Mágico", descripcion: "La epopeya de la familia Buendía en el mítico pueblo de Macondo." },
  { id: 2, titulo: "Ficciones", isbn: "978-8420633121", editorial_id: 6, anio_publicacion: 1944, genero: "Cuento Fantástico / Filosofía", descripcion: "Colección cumbre de relatos de laberintos, bibliotecas infinitas y espejos." },
  { id: 3, titulo: "La ciudad y los perros", isbn: "978-8420471839", editorial_id: 4, anio_publicacion: 1963, genero: "Novela", descripcion: "Crónica descarnada de la disciplina y rebelión juvenil en el Colegio Militar Leoncio Prado." },
  { id: 4, titulo: "Rayuela", isbn: "978-8466332309", editorial_id: 4, anio_publicacion: 1963, genero: "Contranovela", descripcion: "Novela interactiva que propone múltiples órdenes de lectura entre París y Buenos Aires." },
  { id: 5, titulo: "La casa de los espíritus", isbn: "978-0525433484", editorial_id: 1, anio_publicacion: 1982, genero: "Saga Familiar / Drama", descripcion: "Retrato genealógico de la familia Trueba y las transformaciones sociopolíticas en Chile." },
  { id: 6, titulo: "Don Quijote de la Mancha", isbn: "978-8437604947", editorial_id: 9, anio_publicacion: 1605, genero: "Novela Clásica", descripcion: "Las aventuras del hidalgo don Quijote y su escudero Sancho Panza." },
  { id: 7, titulo: "Pedro Páramo", isbn: "978-8437604183", editorial_id: 3, anio_publicacion: 1955, genero: "Realismo Fantasmagórico", descripcion: "El viaje de Juan Preciado al pueblo desolado de Comala en busca de su padre." },
  { id: 8, titulo: "El laberinto de la soledad", isbn: "978-9681603011", editorial_id: 3, anio_publicacion: 1950, genero: "Ensayo", descripcion: "Reflexión profunda sobre la identidad cultural, la historia y la psicología mexicana." },
  { id: 9, titulo: "Veinte poemas de amor y una canción desesperada", isbn: "978-8490620892", editorial_id: 7, anio_publicacion: 1924, genero: "Poesía", descripcion: "Una de las obras poéticas más leídas y memorables de la lírica amorosa moderna." },
  { id: 10, titulo: "La hora de la estrella", isbn: "978-8498418040", editorial_id: 10, anio_publicacion: 1977, genero: "Novela Existencial", descripcion: "Última novela de Clarice Lispector sobre la inocencia y precariedad de Macabéa en Río de Janeiro." },
  { id: 11, titulo: "Un modelo para la muerte", isbn: "978-8466345678", editorial_id: 7, anio_publicacion: 1946, genero: "Policial / Satírico", descripcion: "Obra detectivesca escrita en colaboración bajo el seudónimo B. Suárez Lynch." }
];

/**
 * Tabla intermedia para relación N:M entre Libros y Autores
 */
export const INITIAL_LIBROS_AUTORES = [
  { libro_id: 1, autor_id: 1, orden_autoria: 1 },
  { libro_id: 2, autor_id: 2, orden_autoria: 1 },
  { libro_id: 3, autor_id: 3, orden_autoria: 1 },
  { libro_id: 4, autor_id: 4, orden_autoria: 1 },
  { libro_id: 5, autor_id: 5, orden_autoria: 1 },
  { libro_id: 6, autor_id: 6, orden_autoria: 1 },
  { libro_id: 7, autor_id: 7, orden_autoria: 1 },
  { libro_id: 8, autor_id: 8, orden_autoria: 1 },
  { libro_id: 9, autor_id: 9, orden_autoria: 1 },
  { libro_id: 10, autor_id: 10, orden_autoria: 1 },
  // Co-autoría Borges y Bioy Casares en Libro 11
  { libro_id: 11, autor_id: 2, orden_autoria: 1 },
  { libro_id: 11, autor_id: 11, orden_autoria: 2 }
];

export const INITIAL_SOCIOS = [
  { id: 1, nombre: "Carlos", apellidos: "Mendoza Silva", dni: "08472910", email: "carlos.mendoza@email.com", telefono: "+51 984 123 456", direccion: "Av. Las Camelias 430, San Isidro", fecha_inscripcion: "2024-01-15", estado: "Activo" },
  { id: 2, nombre: "Lucía", apellidos: "Valenzuela Ramos", dni: "44910283", email: "lucia.valenzuela@email.com", telefono: "+51 972 654 321", direccion: "Calle Los Pinos 182, Miraflores", fecha_inscripcion: "2024-02-10", estado: "Activo" },
  { id: 3, nombre: "Andrés", apellidos: "Paredes Quispe", dni: "71283940", email: "andres.paredes@email.com", telefono: "+51 951 888 777", direccion: "Jr. Ayacucho 890, Cercado", fecha_inscripcion: "2024-03-01", estado: "Suspendido" },
  { id: 4, nombre: "Mariana", apellidos: "Herrera Delgado", dni: "10293847", email: "mariana.herrera@email.com", telefono: "+51 966 333 222", direccion: "Av. Arequipa 2450, Lince", fecha_inscripcion: "2024-03-18", estado: "Activo" },
  { id: 5, nombre: "Fernando", apellidos: "Castillo Morales", dni: "29384756", email: "fernando.castillo@email.com", telefono: "+51 944 555 111", direccion: "Calle Las Begonias 120, Surco", fecha_inscripcion: "2024-04-05", estado: "Activo" },
  { id: 6, nombre: "Sofía", apellidos: "Navarro Benítez", dni: "47562819", email: "sofia.navarro@email.com", telefono: "+51 933 777 444", direccion: "Av. Salaverry 1104, Jesús María", fecha_inscripcion: "2024-05-12", estado: "Inactivo" },
  { id: 7, nombre: "Diego", apellidos: "Salazar Torres", dni: "73849102", email: "diego.salazar@email.com", telefono: "+51 922 444 888", direccion: "Jr. Huancavelica 312, Lima", fecha_inscripcion: "2024-06-20", estado: "Activo" },
  { id: 8, nombre: "Camila", apellidos: "Ríos Montenegro", dni: "09182736", email: "camila.rios@email.com", telefono: "+51 911 222 333", direccion: "Av. Del Ejército 670, Magdalena", fecha_inscripcion: "2024-07-08", estado: "Activo" },
  { id: 9, nombre: "Mateo", apellidos: "Gutiérrez Vega", dni: "84729103", email: "mateo.gutierrez@email.com", telefono: "+51 988 111 999", direccion: "Calle Grau 405, Barranco", fecha_inscripcion: "2024-08-14", estado: "Activo" },
  { id: 10, nombre: "Valeria", apellidos: "Córdova Peña", dni: "38472910", email: "valeria.cordova@email.com", telefono: "+51 977 444 555", direccion: "Av. Larco 880, Miraflores", fecha_inscripcion: "2024-09-02", estado: "Activo" },
  { id: 11, nombre: "Joaquín", apellidos: "Mercado Figueroa", dni: "19283746", email: "joaquin.mercado@email.com", telefono: "+51 966 888 222", direccion: "Av. Brasil 1420, Pueblo Libre", fecha_inscripcion: "2024-09-25", estado: "Activo" },
  { id: 12, nombre: "Elena", apellidos: "Barrios Alarcón", dni: "58493021", email: "elena.barrios@email.com", telefono: "+51 955 333 111", direccion: "Calle Los Laureles 230, San Borja", fecha_inscripcion: "2024-10-01", estado: "Activo" }
];

export const INITIAL_EJEMPLARES = [
  // Ejemplares de Cien años de soledad (Libro 1)
  { id: 1, libro_id: 1, codigo_inventario: "EJ-01-01", fecha_adquisicion: "2023-01-10", estado_conservacion: "Excelente", ubicacion_estante: "Estante A-1", disponibilidad: "Prestado" },
  { id: 2, libro_id: 1, codigo_inventario: "EJ-01-02", fecha_adquisicion: "2023-03-15", estado_conservacion: "Bueno", ubicacion_estante: "Estante A-1", disponibilidad: "Disponible" },
  { id: 3, libro_id: 1, codigo_inventario: "EJ-01-03", fecha_adquisicion: "2023-09-20", estado_conservacion: "Excelente", ubicacion_estante: "Estante A-1", disponibilidad: "Disponible" },
  
  // Ejemplares de Ficciones (Libro 2)
  { id: 4, libro_id: 2, codigo_inventario: "EJ-02-01", fecha_adquisicion: "2023-02-14", estado_conservacion: "Bueno", ubicacion_estante: "Estante A-2", disponibilidad: "Prestado" },
  { id: 5, libro_id: 2, codigo_inventario: "EJ-02-02", fecha_adquisicion: "2023-05-18", estado_conservacion: "Excelente", ubicacion_estante: "Estante A-2", disponibilidad: "Disponible" },
  
  // Ejemplares de La ciudad y los perros (Libro 3)
  { id: 6, libro_id: 3, codigo_inventario: "EJ-03-01", fecha_adquisicion: "2023-04-11", estado_conservacion: "Regular", ubicacion_estante: "Estante B-1", disponibilidad: "Prestado" },
  { id: 7, libro_id: 3, codigo_inventario: "EJ-03-02", fecha_adquisicion: "2023-08-01", estado_conservacion: "Excelente", ubicacion_estante: "Estante B-1", disponibilidad: "Disponible" },
  
  // Ejemplares de Rayuela (Libro 4)
  { id: 8, libro_id: 4, codigo_inventario: "EJ-04-01", fecha_adquisicion: "2023-02-28", estado_conservacion: "Bueno", ubicacion_estante: "Estante B-2", disponibilidad: "Disponible" },
  { id: 9, libro_id: 4, codigo_inventario: "EJ-04-02", fecha_adquisicion: "2023-11-10", estado_conservacion: "En mantenimiento", ubicacion_estante: "Taller Reparaciones", disponibilidad: "En mantenimiento" },
  
  // Ejemplares de La casa de los espíritus (Libro 5)
  { id: 10, libro_id: 5, codigo_inventario: "EJ-05-01", fecha_adquisicion: "2023-06-05", estado_conservacion: "Excelente", ubicacion_estante: "Estante C-1", disponibilidad: "Prestado" },
  { id: 11, libro_id: 5, codigo_inventario: "EJ-05-02", fecha_adquisicion: "2024-01-12", estado_conservacion: "Excelente", ubicacion_estante: "Estante C-1", disponibilidad: "Disponible" },
  
  // Ejemplares de Don Quijote (Libro 6)
  { id: 12, libro_id: 6, codigo_inventario: "EJ-06-01", fecha_adquisicion: "2022-10-15", estado_conservacion: "Regular", ubicacion_estante: "Estante Clásicos 1", disponibilidad: "Disponible" },
  { id: 13, libro_id: 6, codigo_inventario: "EJ-06-02", fecha_adquisicion: "2023-07-22", estado_conservacion: "Excelente", ubicacion_estante: "Estante Clásicos 1", disponibilidad: "Disponible" },
  
  // Ejemplares de Pedro Páramo (Libro 7)
  { id: 14, libro_id: 7, codigo_inventario: "EJ-07-01", fecha_adquisicion: "2023-03-30", estado_conservacion: "Bueno", ubicacion_estante: "Estante C-2", disponibilidad: "Prestado" },
  
  // Ejemplares de El laberinto de la soledad (Libro 8)
  { id: 15, libro_id: 8, codigo_inventario: "EJ-08-01", fecha_adquisicion: "2023-04-15", estado_conservacion: "Bueno", ubicacion_estante: "Estante Ensayo 1", disponibilidad: "Disponible" },
  
  // Ejemplares de Veinte poemas (Libro 9)
  { id: 16, libro_id: 9, codigo_inventario: "EJ-09-01", fecha_adquisicion: "2023-05-20", estado_conservacion: "Excelente", ubicacion_estante: "Estante Poesía 1", disponibilidad: "Disponible" },
  
  // Ejemplares de La hora de la estrella (Libro 10)
  { id: 17, libro_id: 10, codigo_inventario: "EJ-10-01", fecha_adquisicion: "2023-09-01", estado_conservacion: "Excelente", ubicacion_estante: "Estante D-1", disponibilidad: "Disponible" },
  
  // Ejemplares de Un modelo para la muerte (Libro 11)
  { id: 18, libro_id: 11, codigo_inventario: "EJ-11-01", fecha_adquisicion: "2023-10-05", estado_conservacion: "Bueno", ubicacion_estante: "Estante D-2", disponibilidad: "Disponible" }
];

export const INITIAL_PRESTAMOS = [
  {
    id: 1,
    socio_id: 1,
    ejemplar_id: 1,
    fecha_prestamo: "2026-10-10",
    fecha_devolucion_prevista: "2026-10-24",
    fecha_devolucion_real: null,
    estado: "Activo",
    observaciones: "Préstamo regular para lectura de investigación."
  },
  {
    id: 2,
    socio_id: 2,
    ejemplar_id: 4,
    fecha_prestamo: "2026-10-05",
    fecha_devolucion_prevista: "2026-10-19",
    fecha_devolucion_real: null,
    estado: "Vencido",
    observaciones: "Fecha límite vencida. Se notificó al socio vía correo."
  },
  {
    id: 3,
    socio_id: 3,
    ejemplar_id: 6,
    fecha_prestamo: "2026-09-28",
    fecha_devolucion_prevista: "2026-10-12",
    fecha_devolucion_real: null,
    estado: "Vencido",
    observaciones: "Acumula retraso. Socio con condición suspendida."
  },
  {
    id: 4,
    socio_id: 4,
    ejemplar_id: 10,
    fecha_prestamo: "2026-10-15",
    fecha_devolucion_prevista: "2026-10-29",
    fecha_devolucion_real: null,
    estado: "Activo",
    observaciones: "Préstamo renovado por 14 días calendario."
  },
  {
    id: 5,
    socio_id: 5,
    ejemplar_id: 14,
    fecha_prestamo: "2026-10-18",
    fecha_devolucion_prevista: "2026-11-01",
    fecha_devolucion_real: null,
    estado: "Activo",
    observaciones: "Préstamo solicitado en sala principal."
  },
  {
    id: 6,
    socio_id: 7,
    ejemplar_id: 2,
    fecha_prestamo: "2026-09-01",
    fecha_devolucion_prevista: "2026-09-15",
    fecha_devolucion_real: "2026-09-14",
    estado: "Devuelto",
    observaciones: "Entregado a tiempo en perfectas condiciones."
  },
  {
    id: 7,
    socio_id: 8,
    ejemplar_id: 5,
    fecha_prestamo: "2026-09-05",
    fecha_devolucion_prevista: "2026-09-19",
    fecha_devolucion_real: "2026-09-18",
    estado: "Devuelto",
    observaciones: "Devolución conforme."
  },
  {
    id: 8,
    socio_id: 9,
    ejemplar_id: 8,
    fecha_prestamo: "2026-09-10",
    fecha_devolucion_prevista: "2026-09-24",
    fecha_devolucion_real: "2026-09-29",
    estado: "Devuelto",
    observaciones: "Devuelto con 5 días de atraso. Se generó multa administrativa."
  },
  {
    id: 9,
    socio_id: 10,
    ejemplar_id: 12,
    fecha_prestamo: "2026-08-15",
    fecha_devolucion_prevista: "2026-08-29",
    fecha_devolucion_real: "2026-08-28",
    estado: "Devuelto",
    observaciones: "Devolución anticipada."
  },
  {
    id: 10,
    socio_id: 11,
    ejemplar_id: 15,
    fecha_prestamo: "2026-08-20",
    fecha_devolucion_prevista: "2026-09-03",
    fecha_devolucion_real: "2026-09-02",
    estado: "Devuelto",
    observaciones: "Devuelto en sala de lectura."
  },
  {
    id: 11,
    socio_id: 12,
    ejemplar_id: 16,
    fecha_prestamo: "2026-09-12",
    fecha_devolucion_prevista: "2026-09-26",
    fecha_devolucion_real: "2026-09-26",
    estado: "Devuelto",
    observaciones: "Devolución oportuna."
  }
];

export const INITIAL_MULTAS = [
  {
    id: 1,
    prestamo_id: 2,
    socio_id: 2,
    importe: 15.00,
    fecha_emision: "2026-10-20",
    motivo: "Retraso en devolución (3 días de mora)",
    estado: "Pendiente",
    fecha_pago: null
  },
  {
    id: 2,
    prestamo_id: 3,
    socio_id: 3,
    importe: 35.00,
    fecha_emision: "2026-10-13",
    motivo: "Retraso prolongado en devolución (10 días)",
    estado: "Pendiente",
    fecha_pago: null
  },
  {
    id: 3,
    prestamo_id: 8,
    socio_id: 9,
    importe: 25.00,
    fecha_emision: "2026-09-29",
    motivo: "Retraso en devolución (5 días de atraso)",
    estado: "Pagada",
    fecha_pago: "2026-09-30"
  },
  {
    id: 4,
    prestamo_id: 6,
    socio_id: 7,
    importe: 10.00,
    fecha_emision: "2026-08-05",
    motivo: "Deterioro leve de portada",
    estado: "Pagada",
    fecha_pago: "2026-08-06"
  },
  {
    id: 5,
    prestamo_id: 7,
    socio_id: 8,
    importe: 20.00,
    fecha_emision: "2026-07-15",
    motivo: "Retraso en entrega anterior",
    estado: "Pagada",
    fecha_pago: "2026-07-16"
  },
  {
    id: 6,
    prestamo_id: 1,
    socio_id: 1,
    importe: 12.50,
    fecha_emision: "2026-06-10",
    motivo: "Mora administrativa regularizada",
    estado: "Pagada",
    fecha_pago: "2026-06-12"
  },
  {
    id: 7,
    prestamo_id: 9,
    socio_id: 10,
    importe: 15.00,
    fecha_emision: "2026-07-22",
    motivo: "Extravío momentáneo de marcapáginas patrimonial",
    estado: "Anulada",
    fecha_pago: null
  },
  {
    id: 8,
    prestamo_id: 10,
    socio_id: 11,
    importe: 18.00,
    fecha_emision: "2026-05-18",
    motivo: "Retraso en devolución interbibliotecaria",
    estado: "Pagada",
    fecha_pago: "2026-05-20"
  },
  {
    id: 9,
    prestamo_id: 11,
    socio_id: 12,
    importe: 10.00,
    fecha_emision: "2026-04-12",
    motivo: "Mancha en lomo posterior",
    estado: "Pagada",
    fecha_pago: "2026-04-14"
  },
  {
    id: 10,
    prestamo_id: 3,
    socio_id: 3,
    importe: 50.00,
    fecha_emision: "2026-03-20",
    motivo: "Pérdida temporal de material complementario",
    estado: "Pendiente",
    fecha_pago: null
  }
];
