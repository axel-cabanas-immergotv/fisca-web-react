# Web Editor CMS

Un sistema de gestión de contenidos similar a WordPress, construido con Node.js y Vanilla JavaScript.

## Características

- **Backend**: Node.js + Express + Sequelize + PostgreSQL
- **Frontend**: Vanilla JavaScript + Alpine.js + Bootstrap
- **Editor**: Editor.js para contenido enriquecido
- **Autenticación**: JWT con sistema de roles y permisos
- **Arquitectura**: Single Page Application con renderizado client-side
- **SEO**: Server-side rendering para stories individuales
- **Responsive**: Compatible con móviles y escritorio
- **Performance**: Cache Redis para endpoints públicos

## Arquitectura y Convenciones

### Estructura de Componentes

Cada componente del panel de administración sigue una estructura estandarizada:

```
src/admin/[Entity]/
├── index.html      # Componente principal (listado, botones)
├── editor.html     # Formulario de edición
├── view.html       # Visualizador de datos
├── [otros].html    # Templates adicionales (orden alfabético)
└── index.js        # Lógica del componente
```

### Tipos de Formularios de Edición

1. **Modal**: Formularios que aparecen en modal-dialog Bootstrap
   - Ejemplo: Categories
   - Se abren al hacer click en "Editar"

2. **Story**: Formularios que ocupan casi toda la pantalla
   - Ejemplo: Stories
   - Oculta otras secciones, mantiene menú lateral
   - Se renderiza en `story-editor-container`

3. **Page**: Formularios full-screen
   - Ejemplo: Pages
   - Ocupa toda la pantalla
   - Se renderiza en contenedor específico

### Proceso de Build

- Los templates HTML se concatenan en orden específico:
  1. `index.html` (siempre primero)
  2. `editor.html` (siempre segundo)
  3. Otros archivos en orden alfabético
- JavaScript y CSS se minifican usando esbuild
- Un solo archivo compilado para máximo rendimiento

### Convenciones de Código

- **Archivos máximo 400 líneas** (backend) / 500 líneas (frontend)
- **Funcionalidades separadas** en carpetas específicas
- **Editor.js centralizado** en `src/admin/editorConfig.js`
- **Clean URLs** para stories: `/story/mi-primer-story`
- **Componentes reutilizables** altamente configurables

## Estructura del Proyecto

```
web-editor/
├── server.js                 # Servidor principal
├── package.json              # Dependencias del proyecto
├── build.js                  # Script de build para frontend
├── models/                   # Modelos de Sequelize
│   ├── index.js             
│   ├── User.js               # Usuario y autenticación
│   ├── Role.js               # Roles del sistema
│   ├── Permission.js         # Permisos granulares
│   ├── Story.js              # Posts/artículos
│   ├── Page.js               # Páginas del sitio
│   ├── Category.js           # Categorías para stories
│   ├── Module.js             # Header, Footer y módulos
│   ├── Menu.js               # Menús de navegación
│   └── File.js               # Gestión de archivos
├── routes/                   # Rutas del API
│   ├── auth.js               # Autenticación JWT
│   ├── admin.js              # Panel de administración
│   ├── admin/                # Rutas específicas por entidad
│   │   ├── stories.js       
│   │   ├── pages.js         
│   │   ├── categories.js    
│   │   ├── users.js         
│   │   ├── roles.js         
│   │   ├── permissions.js   
│   │   ├── modules.js       
│   │   └── menus.js         
│   ├── public.js             # API pública
│   ├── story.js              # Rutas para stories individuales
│   └── upload.js             # Subida de archivos
├── middleware/               # Middleware de autenticación
│   └── auth.js              
├── migrations/               # Migraciones de base de datos
├── seeds/                    # Datos iniciales
│   └── defaultData.js       
├── src/                      # Código fuente del frontend
│   ├── public/               # Sitio público
│   │   ├── index.html       # Página principal
│   │   ├── story.html       # Template para stories
│   │   ├── main.js          # Lógica del sitio público
│   │   └── story.js         # Lógica para stories
│   ├── admin/                # Panel de administración
│   │   ├── admin-template.html
│   │   ├── admin.js         # Controlador principal
│   │   ├── editorConfig.js  # Configuración centralizada Editor.js
│   │   ├── Stories/         # Componente Stories
│   │   ├── Pages/           # Componente Pages
│   │   ├── Categories/      # Componente Categories
│   │   ├── Users/           # Componente Users
│   │   ├── Roles/           # Componente Roles
│   │   ├── Permissions/     # Componente Permissions
│   │   ├── Modules/         # Componente Modules
│   │   ├── Menus/           # Componente Menus
│   │   └── utils/           # Utilities compartidas
│   │       ├── tableComponent.js
│   │       └── dropzone.js
│   ├── auth/                 # Página de login
│   ├── editorjs/             # Plugins personalizados Editor.js
│   │   ├── storiesreel/     # Widget Stories Carousel
│   │   ├── columns/         # Plugin de columnas
│   │   └── advunit/         # Widget publicitario
│   └── styles/               # Archivos CSS
│       ├── admin.css        # Estilos del admin (WordPress-like)
│       └── main.css         # Estilos del sitio público
└── dist/                     # Archivos compilados (generados)
```

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd web-editor
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

4. **Compilar el frontend**
   ```bash
   npm run build
   ```

5. **Iniciar el servidor**
   ```bash
   npm run dev
   ```

6. **Acceder a la aplicación**
   - Sitio público: http://localhost:3000
   - Panel de administración: http://localhost:3000/admin
   - Login: http://localhost:3000/login

## Configuración de Base de Datos

El sistema usa PostgreSQL exclusivamente. La configuración se realiza a través del archivo `.env`.

### Configuración PostgreSQL

```bash
# .env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=web_editor_cms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### Inicialización de Base de Datos

1. **Crear base de datos**: Crear la base de datos en PostgreSQL
2. **Ejecutar migraciones**: `npm run migrate`
3. **Cargar datos iniciales**: `npm run seed`
4. **Iniciar el servidor**: `npm run dev`

**Nota**: Las migraciones son compatibles con ambas bases de datos automáticamente.

## Credenciales por Defecto

- **Email**: admin@webeditor.com
- **Password**: admin123

## Funcionalidades Principales

### Sitio Público
- Páginas dinámicas con Editor.js
- Stories/artículos con categorías
- Widgets personalizados (Stories Carousel, Menu)
- Módulos Header y Footer
- SEO optimizado para stories

### Panel de Administración
- Dashboard con estadísticas
- Gestión de Pages y Stories
- Sistema de categorías
- Gestión de usuarios y roles
- Configuración de módulos
- Editor visual con Editor.js

### Sistema de Permisos
- Roles: Admin, Editor, Author, Viewer
- Permisos granulares por entidad y acción
- Control de acceso basado en roles
- Propiedad de contenido (users can edit their own content)

## Entidades del Sistema

### Pages (Páginas)
- **Propósito**: Layouts que definen cómo se muestran las stories
- **Editor**: Editor.js con widgets personalizados
- **Rutas built-in**: `/home`, `/story/:id`
- **Tipo de formulario**: Page (full-screen)

### Stories (Artículos/Posts)
- **Propósito**: Contenido principal del sitio
- **Campos**: título, subtítulo, body, categoría, autor, imagen
- **Editor**: Editor.js para contenido enriquecido
- **SEO**: Meta tags server-side para `/story/:slug`
- **Tipo de formulario**: Story (casi full-screen)

### Modules (Módulos)
- **Built-in**: Header, Footer
- **Propósito**: Contenido que siempre se muestra
- **Editor**: Editor.js con widgets personalizados
- **Estructura**: Header → Page → Footer

### Menus (Menús)
- **Propósito**: Navegación del sitio
- **Características**: Jerárquico (multinivel), responsive
- **Integración**: Widget personalizado para Editor.js
- **Soporte**: Megamenu con contenido Editor.js

### Categories (Categorías)
- **Propósito**: Clasificación de stories
- **Uso**: Filtrado en widgets Stories Carousel
- **Tipo de formulario**: Modal

### Users, Roles, Permissions (Sistema de Usuarios)
- **Granularidad**: Por entidad y acción (CREAR, EDITAR, ACTUALIZAR, BORRAR, etc.)
- **Roles predefinidos**: Admin, Editor, Author, Viewer
- **Propiedad**: Los usuarios pueden editar su propio contenido

## Widgets Personalizados de Editor.js

### Stories Carousel
- **Propósito**: Mostrar colección de stories en formato carrusel
- **Configuración**: Número de items, filtro por categoría
- **Responsive**: Adaptable a móvil y escritorio

### Menu Widget
- **Propósito**: Insertar menús de navegación
- **Características**: Multinivel, responsive, megamenu
- **Configuración**: Selección de menú creado

### Columns
- **Propósito**: Crear layouts de columnas
- **Uso**: Organizar contenido en múltiples columnas

### AdvUnit
- **Propósito**: Espacios publicitarios
- **Configuración**: Tamaño, posición, contenido

## Sistema de Permisos Granular

### Acciones por Entidad
- **CREAR**: Crear nuevas instancias
- **EDITAR**: Modificar cualquier instancia
- **ACTUALIZAR**: Actualizar datos
- **BORRAR**: Eliminar cualquier instancia
- **BORRAR_PROPIO**: Eliminar solo contenido propio
- **ACTUALIZAR_PROPIO**: Actualizar solo contenido propio

### Roles Predefinidos
- **Admin**: Acceso completo a todo el sistema
- **Editor**: Gestión de contenido y usuarios limitados
- **Author**: Creación y gestión de contenido propio
- **Viewer**: Solo lectura

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Verificar autenticación

### Administración
- `GET /api/admin/stories` - Listar stories
- `GET /api/admin/pages` - Listar páginas
- `GET /api/admin/categories` - Listar categorías
- `GET /api/admin/users` - Listar usuarios

### Público
- `GET /api/public/stories` - Stories publicadas
- `GET /api/public/pages/:slug` - Página por slug
- `GET /api/public/modules` - Módulos activos

## Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **Sequelize**: ORM para base de datos
- **PostgreSQL**: Base de datos
- **JWT**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **Helmet**: Seguridad HTTP

### Frontend
- **Vanilla JavaScript**: Sin frameworks pesados
- **Alpine.js**: Reactividad ligera
- **Bootstrap 5**: Framework CSS
- **Editor.js**: Editor de contenido
- **Font Awesome**: Iconos
- **esbuild**: Bundler y minificador

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar frontend
- `npm start` - Ejecutar en modo producción
- `npm run migrate` - Ejecutar migraciones
- `npm run seed` - Cargar datos iniciales

## Desarrollo Avanzado

### Agregar Nuevos Componentes de Admin

1. **Crear estructura de carpeta**:
   ```
   src/admin/[NuevoComponente]/
   ├── index.html      # Listado y botones principales
   ├── editor.html     # Formulario de edición
   ├── view.html       # Visualizador
   └── index.js        # Lógica Alpine.js
   ```

2. **Seguir convenciones**:
   - Máximo 500 líneas por archivo
   - Usar Alpine.js para reactividad
   - Reutilizar `tableComponent.js` para listados
   - Implementar el tipo de formulario apropiado

3. **Integrar en build**: El sistema automáticamente incluirá los templates

### Agregar Nuevos Widgets de Editor.js

1. **Crear en `src/editorjs/[widget-name]/`**:
   ```
   ├── index.js           # Exportación principal
   ├── config.js          # Configuración del widget
   ├── integration.js     # Integración con Editor.js
   ├── [widget]-global.js # Lógica global
   └── [widget].css       # Estilos específicos
   ```

2. **Registrar en `editorConfig.js`**:
   ```javascript
   import MyWidget from '../editorjs/mywidget/index.js';
   
   // En tools:
   mywidget: MyWidget
   ```

3. **Implementar renderizado en `main.js`**:
   ```javascript
   case 'mywidget':
     return renderMyWidget(block.data);
   ```

### Extender Sistema de Permisos

1. **Agregar nuevos permisos en `seeds/defaultData.js`**:
   ```javascript
   { name: 'nueva_entidad_crear', description: 'Create nueva entidad' }
   ```

2. **Asignar a roles según necesidad**

3. **Implementar verificación en rutas**:
   ```javascript
   router.get('/', authMiddleware, checkPermission('nueva_entidad_leer'), ...);
   ```

### Convenciones de Nomenclatura

- **Archivos**: camelCase para JavaScript, kebab-case para CSS
- **Variables**: Inglés, camelCase
- **Comentarios**: Inglés en código
- **UI/Mensajes**: Español para usuario final
- **Rutas**: Clean URLs, kebab-case

## Performance y Optimización

### Frontend
- **Un solo archivo JS/CSS**: Compilación con esbuild
- **Client-side rendering**: Excepto stories individuales
- **Cache del navegador**: Assets con versionado
- **Alpine.js**: Reactividad ligera sin virtual DOM

### Backend
- **Cache Redis**: Endpoints públicos
- **Compresión**: Middleware gzip
- **Helmet**: Headers de seguridad
- **Rate limiting**: Protección contra spam

## Licencia

MIT License 