# Biblioteca-SQL — Fase 1: Frontend Administrativo

Sistema web para la administración y circulación bibliotecaria desarrollado como primera fase del proyecto **Biblioteca-SQL**. Esta fase implementa la interfaz visual completa, lógica de negocio reactiva, validaciones, gestión de ejemplares físicos, control de préstamos, sanciones y persistencia provisional aislada, dejando la aplicación totalmente estructurada para su posterior integración con una API y base de datos relacional PostgreSQL.

---

## 1. Tecnologías Utilizadas

- **React 19** — Biblioteca declarativa para interfaces de usuario modulares.
- **Vite 8** — Entorno de desarrollo ultrarrápido y empaquetador para producción.
- **React Router DOM 7** — Enrutamiento y navegación cliente por componentes (SPA).
- **Lucide React** — Iconografía SVG consistente y accesible.
- **Recharts 3** — Visualización de gráficos para análisis de circulación e inventario.
- **CSS3 Personalizado (Vanilla)** — Sistema de diseño propio sin dependencias de Tailwind ni Bootstrap, basado en variables CSS con paleta blanca dominante y acentos en rojo coral suave.
- **LocalStorage Storage Adapter** — Adaptador de persistencia provisional desacoplado con soporte para inicialización y restauración de fábrica.

---

## 2. Requisitos Previos

- **Node.js**: Versión 18.0.0 o superior (recomendado Node.js 20+ o 24).
- **npm**: Versión 9.0.0 o superior (incluido con Node.js).
- Navegador web moderno (Chrome, Edge, Firefox, Safari).

---

## 3. Instalación y Ejecución

### Clonación / Ubicación
El proyecto se encuentra ubicado en la carpeta:
```bash
Biblioteca-SQL
```

### Instalación de dependencias
Desde la terminal dentro de `Biblioteca-SQL`, ejecutar:
```bash
npm install
```

### Iniciar servidor de desarrollo
Para levantar el servidor de desarrollo local con recarga en caliente (HMR):
```bash
npm run dev
```
La aplicación estará accesible en: `http://localhost:5173/`

### Compilación para producción
Para validar tipos, empaquetar y optimizar los activos listos para despliegue:
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `dist/`.

### Previsualizar compilación de producción
```bash
npm run preview
```

### Comprobación de calidad de código (Linter)
```bash
npm run lint
```

---

## 4. Estructura del Proyecto

```text
Biblioteca-SQL/
├── public/
│   └── favicon.svg              # Identidad gráfica (ícono de libro en acento coral)
├── src/
│   ├── assets/                  # Recursos estáticos
│   ├── components/
│   │   ├── layout/              # Componentes estructurales de navegación
│   │   │   ├── Layout.jsx       # Contenedor principal con gestión de modales globales
│   │   │   ├── Sidebar.jsx      # Barra lateral clara con indicador activo rojo suave
│   │   │   └── Topbar.jsx       # Barra superior con migas de pan, perfil y badge demo
│   │   └── ui/                  # Componentes reutilizables de interfaz
│   │       ├── Badge.jsx        # Badges semánticos para estados
│   │       ├── Button.jsx       # Botones con variantes primarias, secundarias y outline
│   │       ├── Card.jsx         # Tarjetas blancas con bordes discretos
│   │       ├── ConfirmModal.jsx # Diálogos accesibles de confirmación destructiva
│   │       ├── DataTable.jsx    # Tablas de datos con estados vacíos y acciones
│   │       ├── Modal.jsx        # Ventana modal con control por teclado (Escape)
│   │       ├── SearchInput.jsx  # Campo de búsqueda contextual con botón de limpieza
│   │       ├── Select.jsx       # Selector desplegable estilizado
│   │       ├── StatCard.jsx     # Tarjetas métricas para indicadores del panel
│   │       └── ToastContainer.jsx # Notificaciones flotantes discretas (toasts)
│   ├── context/
│   │   └── AppContext.jsx       # Estado global de notificaciones, sincronización y demo
│   ├── data/
│   │   └── initialData.js       # Conjunto de datos ficticios (≥ 10 registros por tabla)
│   ├── pages/                   # Vistas principales del sistema
│   │   ├── DashboardPage.jsx    # Panel principal con KPIs, gráficos y accesos rápidos
│   │   ├── SociosPage.jsx       # Gestión de socios y expedientes de lectura
│   │   ├── LibrosPage.jsx       # Catálogo bibliográfico con autores e ISBN
│   │   ├── AutoresPage.jsx      # Directorio de autores y obras relacionadas (N:M)
│   │   ├── EditorialesPage.jsx  # Casas editoriales y libros asociados (1:N)
│   │   ├── EjemplaresPage.jsx   # Control físico de ejemplares y disponibilidad
│   │   ├── PrestamosPage.jsx    # Flujo de circulación: préstamos y devoluciones
│   │   ├── MultasPage.jsx       # Registro y liquidación de sanciones monetarias
│   │   ├── ConfiguracionPage.jsx# Diagnóstico de almacenamiento y hoja de ruta PostgreSQL
│   │   └── NotFoundPage.jsx     # Página 404 de respaldo
│   ├── routes/
│   │   └── AppRoutes.jsx        # Mapeo de rutas con React Router DOM
│   ├── services/                # Capa desacoplada de acceso a datos
│   │   ├── apiConfig.js         # Configuración central y contrato HTTP documentado
│   │   ├── storageAdapter.js    # Adaptador para localStorage y reinicio de fábrica
│   │   ├── dashboardService.js  # Cálculo dinámico de métricas y gráficos
│   │   ├── sociosService.js     # CRUD y validaciones para socios
│   │   ├── librosService.js     # Catálogo, unicidad de ISBN y relación N:M
│   │   ├── autoresService.js    # Directorio de autores y consulta de obras
│   │   ├── editorialesService.js# Casas editoriales y restricciones referenciales
│   │   ├── ejemplaresService.js # Inventario físico y control de disponibilidad
│   │   ├── prestamosService.js  # Lógica de circulación y transiciones automáticas
│   │   └── multasService.js     # Control de sanciones e importes
│   ├── styles/                  # Sistema de diseño CSS modular
│   │   ├── variables.css        # Tokens de color, tipografía, bordes y sombras
│   │   ├── global.css           # Reseteo CSS, tipografía base y scrollbars
│   │   ├── layout.css           # Estilos para Sidebar, Topbar y responsive móvil
│   │   ├── components.css       # Estilos de botones, tablas, formularios y modales
│   │   └── pages.css            # Estilos del dashboard y rejillas de detalle
│   ├── utils/
│   │   ├── formatters.js        # Formateadores de moneda, fechas e iniciales
│   │   └── validators.js        # Validaciones de formularios e ISBN
│   ├── App.css                  # Contenedor raíz
│   ├── App.jsx                  # Raíz con Providers y BrowserRouter
│   ├── index.css                # Importador maestro de hojas de estilo
│   └── main.jsx                 # Punto de entrada Vite React
├── .env.example                 # Variables de entorno de ejemplo sin secretos
├── index.html                   # HTML con tipografía Plus Jakarta Sans y español
├── package.json                 # Dependencias y scripts del proyecto
└── README.md                    # Documentación del proyecto
```

---

## 5. Módulos Disponibles y Funcionalidades

1. **Panel Principal (Dashboard)**:
   - Cálculo en tiempo real de 6 indicadores clave (Títulos, Ejemplares, Socios, Préstamos Activos, Vencidos y Multas Pendientes).
   - Visualizaciones mediante gráficos de dona (Préstamos por Estado) y barras (Disponibilidad de Ejemplares).
   - Accesos directos para registrar socio, ejemplar, libro o préstamo.
   - Tabla de actividad reciente con botón directo para devolución.

2. **Socios**:
   - Listado paginado con búsqueda por nombre, DNI o email, y filtro por estado (`Activo`, `Inactivo`, `Suspendido`).
   - Formularios modales para creación y edición con validación de obligatoriedad y formato de correo.
   - Expediente del socio con visualización de su historial de préstamos y multas registradas.
   - Eliminación protegida (impide borrar socios con préstamos activos).

3. **Libros (Catálogo Bibliográfico)**:
   - Separación estricta entre el título catalográfico y sus ejemplares físicos.
   - Control de unicidad de código bibliográfico ISBN (10 o 13 dígitos).
   - Selector de editorial (1:N) y selección múltiple de autores (N:M mediante `libros_autores`).
   - Ficha técnica detallada que lista los autores con su nacionalidad y todos los ejemplares físicos vinculados.

4. **Autores**:
   - Directorio de autores con nacionalidad, fecha de nacimiento y reseña biográfica.
   - Ficha del autor con listado dinámico de obras que tiene registradas en la biblioteca.
   - Restricción de eliminación si tiene obras en el catálogo.

5. **Editoriales**:
   - Directorio de casas editoriales con país de origen, contacto y sitio web.
   - Ficha con el catálogo de libros publicados bajo su sello.

6. **Ejemplares (Unidades Físicas)**:
   - Administración independiente de cada copia física asociada a un libro.
   - Código de inventario único (e.g., `EJ-01-01`), ubicación física en estante (`Estante A-1`) y estado de conservación (`Excelente`, `Bueno`, `Regular`, `Deteriorado`).
   - Disponibilidad operativa (`Disponible`, `Prestado`, `En mantenimiento`, `Extraviado`).
   - Imposibilidad de eliminar un ejemplar que esté actualmente prestado.

7. **Préstamos (Circulación)**:
   - Registro de préstamo vinculando un socio habilitado y un ejemplar disponible.
   - Regla de negocio automática: al conceder el préstamo, el ejemplar pasa inmediatamente a `Prestado` y deja de figurar en la lista de disponibles.
   - Validación de fechas: la fecha límite de devolución debe ser mayor o igual a la fecha de inicio del préstamo.
   - Detección dinámica de préstamos vencidos por comparación de fechas.
   - Acción de **Devolución**: registra la fecha real y devuelve automáticamente el ejemplar a condición `Disponible`.

8. **Multas (Sanciones)**:
   - Registro de sanciones monetarias asociadas a un préstamo, derivando automáticamente el socio infractor.
   - Validación de importe monetario positivo y visualización en formato de moneda configurado (`$`).
   - Transiciones de estado de pago explícitas (`Marcar como Pagada` o `Anular multa`).

9. **Configuración**:
   - Monitoreo de conteo de registros por entidad en `localStorage`.
   - Botón para **Restaurar Datos de Demostración** con confirmación modal.
   - Especificaciones y hoja de ruta arquitectónica para PostgreSQL.

---

## 6. Persistencia Provisional y Datos de Demostración

- Los datos de demostración se inicializan automáticamente en `localStorage` con un lote realista y ficticio en español de **más de 10 registros por cada entidad principal** (12 socios, 11 libros, 11 autores, 10 editoriales, 18 ejemplares, 11 préstamos, 10 multas y 12 relaciones libros-autores).
- Los datos se conservan tras recargar la página.
- Para restablecer todas las colecciones al estado inicial de fábrica:
  1. Hacer clic en el botón **"Restaurar Demo"** ubicado en la barra superior o en la vista de **Configuración**.
  2. Confirmar la acción en el diálogo modal.

---

## 7. Capa de Servicios y Preparación para el Backend PostgreSQL

### Desacoplamiento de Datos
Ningún componente de la interfaz realiza manipulación directa de `localStorage` ni asume que los datos son locales. Todos los componentes invocan métodos asíncronos (`Promise`) expuestos en:
- `sociosService.js`
- `librosService.js`
- `autoresService.js`
- `editorialesService.js`
- `ejemplaresService.js`
- `prestamosService.js`
- `multasService.js`
- `dashboardService.js`

### Estrategia de Alternancia (`apiConfig.js`)
El archivo `src/services/apiConfig.js` centraliza la bandera de origen de datos:
```javascript
export const DATA_SOURCE_MODE = 'local'; // 'local' | 'http'
```
Cuando en la Fase 2 se implemente el backend, bastará configurar `VITE_DATA_SOURCE_MODE=http` y la variable `VITE_API_URL` en el archivo `.env`.

### Contrato HTTP que deberá implementar el Backend (Fase 2)
```text
GET    /api/v1/socios               -> Lista de socios con filtros
GET    /api/v1/socios/:id           -> Detalle de socio con préstamos y multas
POST   /api/v1/socios               -> Crear socio
PUT    /api/v1/socios/:id           -> Actualizar socio
DELETE /api/v1/socios/:id           -> Eliminar socio

GET    /api/v1/libros               -> Lista de libros con editorial y autores
GET    /api/v1/libros/:id           -> Detalle de libro con ejemplares físicos
POST   /api/v1/libros               -> Crear libro y vincular autores en libros_autores
PUT    /api/v1/libros/:id           -> Actualizar libro y autores
DELETE /api/v1/libros/:id           -> Eliminar libro

GET    /api/v1/autores              -> Directorio de autores
GET    /api/v1/autores/:id          -> Detalle de autor con obras catalogadas
POST   /api/v1/autores              -> Crear autor
PUT    /api/v1/autores/:id          -> Actualizar autor
DELETE /api/v1/autores/:id          -> Eliminar autor

GET    /api/v1/editoriales          -> Directorio de editoriales
GET    /api/v1/editoriales/:id      -> Detalle de editorial con catálogo asociado
POST   /api/v1/editoriales          -> Crear editorial
PUT    /api/v1/editoriales/:id      -> Actualizar editorial
DELETE /api/v1/editoriales/:id      -> Eliminar editorial

GET    /api/v1/ejemplares           -> Lista de ejemplares con libro asociado
POST   /api/v1/ejemplares           -> Registrar nuevo ejemplar
PUT    /api/v1/ejemplares/:id       -> Actualizar ubicación o estado del ejemplar
DELETE /api/v1/ejemplares/:id       -> Eliminar ejemplar

GET    /api/v1/prestamos            -> Lista de préstamos de circulación
POST   /api/v1/prestamos            -> Registrar préstamo y actualizar ejemplar a Prestado
POST   /api/v1/prestamos/:id/return -> Registrar devolución y liberar ejemplar a Disponible
DELETE /api/v1/prestamos/:id        -> Anular préstamo

GET    /api/v1/multas               -> Lista de multas y sanciones
POST   /api/v1/multas               -> Emitir multa vinculada a préstamo
PATCH  /api/v1/multas/:id/status    -> Cambiar estado de pago (Pagada / Anulada)
DELETE /api/v1/multas/:id           -> Eliminar multa

GET    /api/v1/dashboard/metrics    -> Métricas consolidadas del panel
```

---

## 8. Elementos Pendientes para la Fase 2 (PostgreSQL)

En esta Fase 1 **no se ha implementado backend ni conectado base de datos real**, de acuerdo con las especificaciones del proyecto:
- Creación de base de datos relacional y tablas en PostgreSQL.
- Definición formal del Diagrama Entidad-Relación (DER) con cardinalidades exactas.
- Script SQL con claves primarias (`PK`), foráneas (`FK`), restricciones de tipo (`CHECK`, `UNIQUE`, `NOT NULL`) y disparadores (`triggers`).
- Ejecución de migraciones y script `INSERT INTO` con los datos académicos de entrega.
- Backend en Node.js/Express para servir la API RESTful.
- Autenticación de bibliotecarios mediante tokens seguros.

---

## 9. Reglas de Git Respetadas

En estricto cumplimiento de las prohibiciones absolutas del proyecto, **no se ejecutó ningún comando ni operación de Git** (`git init`, `git add`, `git commit`, `git push`, etc.). La gestión del repositorio y el control de versiones queda reservada exclusivamente para el usuario.
