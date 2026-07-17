# Biblioteca Frontend

Frontend en React + Vite para un catálogo de libros ("Biblioteca virtual"). Este repositorio **solo** contiene el cliente: toda la persistencia y lógica de negocio viven en una API REST externa (estilo Laravel) que expone `/api/books`.

## Cómo correr el proyecto

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. (Opcional) Crear un archivo `.env` en la raíz con la URL de la API, si no corre en la dirección por defecto:
   ```
   VITE_API_URL=http://127.0.0.1:8000/api/books
   ```
   Si no se define, `src/config.js` usa ese mismo valor por defecto.
3. Asegurarse de que la API backend esté corriendo y accesible en esa URL. Sin ella, la app mostrará errores de carga/guardado pero seguirá renderizando.
4. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Por defecto queda disponible en `http://localhost:5173`.

Otros comandos disponibles:
- `npm run build` — build de producción a `dist/`.
- `npm run preview` — sirve el build de producción localmente.
- `npm run lint` — corre ESLint (config en `eslint.config.js`).

No hay suite de tests configurada en este proyecto.

## Componentes

- **`src/App.jsx`** — componente raíz. No usa librería de routing: mantiene en estado local qué vista está activa (`mostrarFormulario`, `libroSeleccionado`) y alterna entre `ListaLibros` (catálogo) y `FormularioLibro` (crear/editar). `versionLista` se incrementa al guardar para forzar que `ListaLibros` se remonte y vuelva a pedir los datos (`key={versionLista}`).
- **`src/components/ListaLibros.jsx`** — obtiene y renderiza el catálogo paginado desde `${API_URL}/search`.
  - Parámetros de query: `page`, `search` (con debounce de 300ms), `anio` y `calificacion` (se aplican de inmediato).
  - Espera una respuesta paginada estilo Laravel (`{ data, current_page, last_page }`), pero tolera también un arreglo plano.
  - Normaliza cada libro con la función interna `normalizarLibro()` antes de renderizar, porque el backend no es consistente con los nombres de campos.
  - Maneja el borrado: `DELETE ${API_URL}/{id}`, con confirmación inline por tarjeta (`confirmarEliminar`).
  - Prop `onEditarLibro(libro)`: se dispara desde el botón "Editar" de cada tarjeta y sube el evento a `App` para cambiar a la vista de formulario.
- **`src/components/FormularioLibro.jsx`** — formulario de creación/edición de un libro.
  - El mismo componente maneja ambos modos: crear (`POST ${API_URL}`) cuando no hay `libroInicial`, editar (`PUT ${API_URL}/{id}`) cuando `libroInicial.id` existe.
  - Valida en el cliente antes de enviar (`validar()`): título y autor obligatorios, año entre 1900 y el año actual + 1, calificación entre 1 y 5.
  - Props: `libroInicial`, `onGuardar(libroGuardado)`, `onCancelar()`.
- **`src/config.js`** — define `API_URL`, tomado de `VITE_API_URL` o con valor por defecto. Es la única fuente de la URL base de la API; no se debe hardcodear el host en otro lugar.
- **`src/main.jsx`** — punto de entrada, monta `<App />` en `#root`.

### Normalización de respuestas de la API

El backend no es consistente con los nombres de campos entre respuestas (el título puede venir como `titulo`, `title`, `nombre` o `name`; el año como `anio`, `year` o `año`). `normalizarLibro()` en `ListaLibros.jsx` es el único lugar que resuelve esto. Al agregar un campo nuevo para mostrar, hay que extender ese normalizador en lugar de leer campos crudos de la API directamente en el JSX.

## Buenas prácticas / reglas para trabajar en este proyecto (también aplican para asistentes de IA)

- **Idioma**: los textos de UI, nombres de variables y funciones están en español (`libro`, `cargando`, `manejarCambio`, `manejarSubmit`). El código nuevo debe mantener esa convención en vez de mezclar identificadores en inglés.
- **Separación de componentes**: cada componente debe tener una sola responsabilidad.
  - La lógica de fetch/mutación de datos debe vivir en el componente dueño de esos datos (`ListaLibros` es dueño del listado y el borrado; `FormularioLibro` es dueño de crear/actualizar). No introducir un cliente de API compartido o un hook genérico hasta que un tercer componente realmente lo necesite.
  - Si un componente empieza a mezclar más de una responsabilidad (por ejemplo, listar libros *y* un conjunto creciente de modales no relacionados), hay que extraer esa parte a un componente propio. La confirmación de borrado dentro de `ListaLibros` es candidata a extraerse si crece en complejidad.
- **Estado**:
  - No usar librerías de estado global (Redux/Context/Zustand) mientras el proyecto se mantenga en este tamaño; el estado local por componente, pasado por props, es suficiente y más simple de seguir.
  - Subir el estado (`lift state up`) solo hasta el ancestro común que realmente lo necesita, no más arriba.
  - Preferir estado derivado sobre estado duplicado: calcular valores a partir del estado/props existentes (como hace `normalizarLibro`) en lugar de guardar copias redundantes que se pueden desincronizar.
- **Efectos**: usar `useEffect` solo para sincronizar con sistemas externos (fetches, timers), como ya hacen los componentes existentes — no para calcular valores derivados que se pueden obtener directamente en el render.
- **Dependencias**: no agregar librerías nuevas (routing, manejo de estado, kits de UI, etc.) sin una necesidad clara. El proyecto se mantiene intencionalmente cercano al template plano de Vite + React.
