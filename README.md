# Biblioteca Mundo Hispano

**Catálogo de recursos bíblicos en español. Funciona offline como PWA.**

Sitio en producción: https://kenoxys.github.io/bibmundo/

---

## ¿Qué es?

**Biblioteca Mundo Hispano** es una **PWA (Progressive Web App / Aplicación Web Progresiva)** en español para consultar y leer recursos bíblicos sin conexión a internet.

Es una aplicación de una sola página (SPA) que funciona como una biblioteca digital: muestra un catálogo de libros PDF organizados por categorías, permite buscar por título y abre cada documento en un visor de PDF integrado. Puede instalarse como una aplicación nativa en Android, iOS y Windows.

---

## Características principales

| Característica | Descripción |
|---|---|
| **Funciona offline** | Usa Service Worker e IndexedDB para guardar el catálogo y usarlo sin conexión. |
| **Visor de PDF integrado** | Incorpora PDF.js para leer los documentos directamente en el navegador, con navegación de páginas. |
| **Categorías** | 5 categorías: Biblias y Comentarios, Estudio Bíblico, Ministerio de Predicación, Ministerio Pastoral, Otros Recursos. |
| **Búsqueda en tiempo real** | Filtra libros por título mientras escribes. |
| **PWA instalable** | Tiene `manifest.json` y botón de "Instalar" para agregar la app a la pantalla de inicio. |
| **Diseño responsivo** | CSS con variables, adaptado a móvil y escritorio. |
| **29 libros** | Catálogo inicial de recursos bíblicos en PDF. |

---

## Estructura del proyecto

```
Biblioteca Mundo Hispano/
├── docs/                        # Web application (servida por GitHub Pages)
│   ├── index.html              # Página única (SPA)
│   ├── app.js                  # Lógica en Vanilla JS (módulos ES6)
│   ├── sw.js                   # Service Worker (offline/cache)
│   ├── styles.css              # Estilos con CSS variables
│   ├── manifest.json           # Manifiesto PWA
│   ├── library.json            # Catálogo generado de libros
│   ├── _headers                # Headers CORS para PDFs en GitHub Pages
│   ├── icons/                  # Iconos de la app (PWA)
│   ├── LIBRARY/                # PDF files (BMH_001.pdf, etc.)
│   └── lib/                    # PDF.js (pdf.min.js + pdf.worker.min.js)
├── scripts/
│   └── generate_library_json.py # Script Python que genera library.json
├── bibmundo.pdf                # PDF de ejemplo en la raíz
├── AGENTS.md                   # Documentación técnica para desarrolladores
├── LICENSE
└── README.md                   # Este archivo
```

---

## Tecnologías usadas

- **Python 3** — genera el catálogo (`library.json`) a partir de los PDFs usando `pdfinfo` (poppler-utils).
- **JavaScript (Vanilla, ES6 modules)** — lógica de la interfaz, carga de libros, búsqueda y visor PDF.
- **PDF.js** — renderizado de PDFs en el cliente sin servidor.
- **Service Worker + IndexedDB** — caché y funcionamiento offline.
- **HTML5 / CSS3** — interfaz de usuario.

---

## Cómo instalar y usar en local

### Requisitos
- Python 3 (para generar el catálogo)
- `pdfinfo` de poppler-utils (para extraer títulos de los PDFs)
- Un servidor web estático (ej. `python3 -m http.server`)

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/Kenoxys/bibmundo.git
   cd bibmundo
   ```

2. **Agrega PDFs nuevos** (opcional)
   Coloca tus archivos PDF en `docs/LIBRARY/` con el nombre `BMH_XXX.pdf`.

3. **Genera el catálogo**
   ```bash
   python3 scripts/generate_library_json.py
   ```
   Esto crea/actualiza `docs/library.json` con los títulos, categorías y rutas de los PDFs.

4. **Ejecuta en local**
   ```bash
   python3 -m http.server 8000
   ```
   Abre en el navegador: `http://localhost:8000/docs/`

---

## Cómo desplegar en GitHub Pages

1. Sube los cambios a la rama `main`:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```

2. En GitHub, ve a **Settings → Pages**:
   - **Branch:** `main`
   - **Folder:** `/docs` (root)
   - Haz clic en **Save**

3. Espera ~1 minuto. Tu sitio quedará disponible en:
   `https://kenoxys.github.io/bibmundo/`

---

## Cómo agregar un nuevo PDF

1. Coloca el PDF en `docs/LIBRARY/` con nombre `BMH_XXX.pdf`.
2. Ejecuta: `python3 scripts/generate_library_json.py`
3. Commit y push los cambios (el PDF y el `library.json` actualizado).

---

## Resumen de cambios recientes (versión actual)

- **Rutas de PDF corregidas**: ahora usan rutas relativas `LIBRARY/BMH_XXX.pdf` que funcionan en GitHub Pages (`/bibmundo/`).
- **App movida a `/docs/`**: GitHub Pages sirve la aplicación desde la carpeta `docs/`.
- **Cards mejoradas**: más separación entre categorías, mejor sombra y efecto hover.
- **Lector PDF mejorado**: mejor espaciado, contenedor con borde y sombra, no se ve "pegado".
- **Manejo de errores PDF**: rutas resueltas correctamente con `window.location.href` y mensaje de error más claro.
- **CORS para PDFs**: archivo `_headers` para que PDF.js pueda cargar los PDFs en GitHub Pages.
- **manifest.json corregido**: eliminado texto corrupto al final del archivo.
- **Service Worker**: versión de caché actualizada (`v4`) para forzar actualización en navegadores.

---

## Problemas conocidos

- Los errores de `Permissions-Policy` en consola son advertencias del navegador y no afectan el funcionamiento.
- Si no se ven los cambios después de subir, limpia el Service Worker y caché del navegador (hard refresh: `Ctrl + Shift + R`).
