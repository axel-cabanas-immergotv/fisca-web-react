# Admin Panel - Documentación de Arquitectura

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Tipos de Editor](#tipos-de-editor)
4. [Funciones Universales Estándar](#funciones-universales-estándar)
5. [Variables de Estado Estándar](#variables-de-estado-estándar)
6. [Anatomía de un Componente](#anatomía-de-un-componente)
7. [Sistema de Build](#sistema-de-build)
8. [Arquitectura de Módulos](#arquitectura-de-módulos)
9. [Cómo Agregar Nuevos Componentes](#cómo-agregar-nuevos-componentes)
10. [Reglas de Frontend](#reglas-de-frontend)

## 🎯 Visión General

El admin panel está construido siguiendo una arquitectura modular donde cada entidad y componente de layout está completamente encapsulado en su propia carpeta. Esta organización garantiza:

- **Escalabilidad**: Fácil agregar nuevos componentes
- **Mantenibilidad**: Código organizado y predecible
- **Reutilización**: Componentes autocontenidos
- **Extensibilidad**: Patrón consistente y replicable

## 📁 Estructura de Carpetas

```
src/admin/
├── 📄 admin.js                    # Orquestador principal
├── 📄 admin-template.html         # Template base con directivas
├── 📄 editorConfig.js            # Configuración centralizada de Editor.js
├── 📄 README.md                  # Esta documentación
│
├── 🗂️ utils/                      # Utilidades compartidas
│   ├── dropzone.js               # Funcionalidad de subida de archivos
│   └── tableComponent.js         # Componente de tabla reutilizable
│
├── 🏗️ COMPONENTES BASE (Layout)
├── 📁 Head/                      # <head>, CSS, inicio de <body>
│   └── index.html
├── 📁 Navbar/                    # Barra de navegación superior
│   └── index.html
├── 📁 Sidebar/                   # Menú lateral de navegación
│   └── index.html
├── 📁 Dashboard/                 # Página principal con estadísticas
│   ├── index.html
│   └── index.js
├── 📁 Footer/                    # Scripts finales y cierre HTML
│   └── index.html
│
└── 🔧 COMPONENTES DE ENTIDAD (CRUD)
    ├── 📁 Categories/            # Gestión de categorías (Modal)
    │   ├── index.html           # Vista principal con tabla
    │   ├── editor.html          # Modal de edición
    │   └── index.js             # Lógica del módulo
    ├── 📁 Stories/              # Gestión de historias (Story)
    │   ├── index.html           # Vista principal
    │   ├── editor.html          # Editor de historia completo
    │   └── index.js             # Lógica del módulo
    ├── 📁 Pages/                # Gestión de páginas (Page)
    │   ├── index.html           # Vista principal
    │   ├── editor.html          # Editor full-screen
    │   └── index.js             # Lógica del módulo
    ├── 📁 Modules/              # Gestión de módulos (Page)
    ├── 📁 Menus/                # Gestión de menús (Page)
    ├── 📁 Users/                # Gestión de usuarios (Modal)
    ├── 📁 Roles/                # Gestión de roles (Modal)
    └── 📁 Permissions/          # Gestión de permisos (Page)
```

## 🎨 Tipos de Editor

Cada entidad utiliza uno de tres tipos de editor según su complejidad:

### 1. **Modal Editor** 🪟
*Entidades: Users, Categories, Roles*

- **Uso**: Formularios simples con pocos campos
- **Implementación**: Bootstrap modal dialog
- **Características**:
  - Overlay sobre la vista principal
  - Formulario compacto
  - Ideal para CRUD básico

```html
<!-- Ejemplo: Categories/editor.html -->
<div x-show="categoriesModule?.showCategoryModal" class="modal-backdrop">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form @submit.prevent="categoriesModule.saveCategory()">
                <!-- Campos del formulario -->
            </form>
        </div>
    </div>
</div>
```

### 2. **Story Editor** 📰
*Entidades: Stories*

- **Uso**: Contenido rico con Editor.js
- **Implementación**: Reemplaza la vista de tabla
- **Características**:
  - Editor.js para contenido rich text
  - Ocupa casi toda la pantalla (menos sidebar)
  - Se renderiza en lugar del contenido principal

```html
<!-- Ejemplo: Stories/editor.html -->
<div x-show="currentSection === 'stories' && storiesModule?.showEditor" 
     class="story-editor-container">
    <div id="story-editor"></div>
    <!-- Editor.js se monta aquí -->
</div>
```

### 3. **Page Editor** 📄
*Entidades: Pages, Modules, Menus, Permissions*

- **Uso**: Funcionalidades complejas o contenido extenso
- **Implementación**: Full screen con navegación propia
- **Características**:
  - Pantalla completa
  - Puede incluir múltiples secciones
  - Editor.js para contenido cuando aplica

```html
<!-- Ejemplo: Pages/editor.html -->
<div x-show="currentSection === 'pages' && pagesModule?.showPageEditor" 
     class="page-editor-container">
    <div class="editor-header">
        <!-- Controles de navegación -->
    </div>
    <div id="page-content-editor"></div>
</div>
```

## 🔧 Funciones Universales Estándar

Todas las entidades implementan 9 funciones estándar que garantizan consistencia y mantenibilidad:

### 1. `async init()` - Inicialización
```javascript
async init() {
    console.log('📄 Initializing [Entity] module...');
    // Cargar datos relacionados (roles, categorías, etc.)
    await this.loadRelatedData();
    // Cargar datos principales
    await this.load();
}
```

### 2. `async load(page, limit, search, filters)` - Carga de Datos
```javascript
async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
    const container = document.getElementById('[entity]-content');
    if (!container) return;

    try {
        // Actualizar estado de paginación
        this.currentPageNum = page;
        this.pageSize = limit;
        this.currentSearch = search;
        this.currentFilters = filters;

        // Construir parámetros de consulta
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (search) params.append('search', search);
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        // Realizar consulta a API
        const response = await fetch(`/api/admin/[entity]?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            container.innerHTML = this.renderTable(data);
        } else {
            throw new Error(data.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Load [entity] error:', error);
        container.innerHTML = `<div class="alert alert-danger">Error loading [entity]: ${error.message}</div>`;
    }
}
```

### 3. `new(entityData = null)` - Formulario Nuevo/Editar
```javascript
new(entityData = null) {
    // Evitar ejecuciones no deseadas
    if (this.showEntityModal === true) {
        console.warn('Modal is already open, ignoring new() call');
        return;
    }
    
    this.isEditingEntity = !!entityData;
    
    // Resetear o poblar formulario
    if (entityData) {
        this.entityForm = { ...entityData };
    } else {
        this.entityForm = this.getDefaultFormData();
    }
    
    this.showEntityModal = true;
}
```

### 4. `async save(id = null)` - Guardar Entidad
```javascript
async save(id = null) {
    // Validaciones de formulario
    if (!this.validateForm()) {
        return;
    }

    try {
        const url = this.entityForm.id ? 
            `/api/admin/[entity]/${this.entityForm.id}` : 
            '/api/admin/[entity]';
        const method = this.entityForm.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.entityForm)
        });

        const result = await response.json();

        if (result.success) {
            this.closeModal();
            await this.load();
            this.showNotification(`Entity ${this.entityForm.id ? 'updated' : 'created'} successfully!`, 'success');
        } else {
            this.showNotification(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        this.showNotification('Error saving entity. Please try again.', 'error');
    }
}
```

### 5. `async delete(id)` - Eliminar Entidad
```javascript
async delete(id) {
    if (!confirm(`Are you sure you want to delete this [entity]?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/[entity]/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            this.showNotification(`[Entity] deleted successfully!`, 'success');
            await this.load();
        } else {
            this.showNotification(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        this.showNotification(`Error deleting [entity]. Please try again.`, 'error');
    }
}
```

### 6. `renderTable(data)` - Renderizar Tabla
```javascript
renderTable(data) {
    const config = {
        tableId: '[entity]-table',
        entityType: '[entity]',
        emptyMessage: 'No [entities] found.',
        adminAppInstance: this,
        enableSearch: true,
        currentSearch: this.currentSearch,
        currentFilters: this.currentFilters,
        filters: [
            // Configuración de filtros específicos
        ],
        columns: [
            // Configuración de columnas específicas
        ],
        showViewButton: true,
        actionHandlers: {
            edit: (type, id) => this.edit(id),
            delete: (type, id) => this.delete(id),
            view: (type, id) => this.view(id)
        },
        onPageChange: (page) => this.load(page),
        onPageSizeChange: (newLimit) => this.load(1, newLimit),
        onSearch: (search, filters) => this.load(1, this.pageSize, search, filters)
    };

    return createEntityTable(data, config);
}
```

### 7. `edit(entityId)` - Editar Entidad
```javascript
edit(entityId) {
    if (entityId) {
        // Cargar datos para edición
        this.loadEntityForEditing(entityId);
    } else {
        // Nueva entidad
        this.new();
    }
}
```

### 8. `async view(entityId)` - Ver Detalles
```javascript
async view(entityId) {
    try {
        const response = await fetch(`/api/admin/[entity]/${entityId}`);
        const data = await response.json();

        if (data.success && data.data) {
            this.viewingEntity = data.data;
            this.showEntityViewModal = true;
        } else {
            this.showNotification('Error loading [entity] details', 'error');
        }
    } catch (error) {
        this.showNotification('Error loading [entity] details', 'error');
    }
}
```

### 9. `back()` - Volver a Lista
```javascript
back() {
    // Si modal está abierto, cerrarlo
    if (this.showEntityModal) {
        this.closeModal();
        return;
    }
    
    // Si modal de vista está abierto, cerrarlo
    if (this.showEntityViewModal) {
        this.closeViewModal();
        return;
    }
    
    // Por defecto: asegurar que estamos en la sección correcta
    if (this.setSection) {
        this.setSection('[entity]');
    }
}
```

## 📊 Variables de Estado Estándar

Todas las entidades comparten un conjunto de variables de estado que garantizan la consistencia en el manejo de datos y UI:

> **⚠️ Importante**: Todas las variables deben seguir la nomenclatura estándar:
> - `currentPageNum` (no `currentPage`) para paginación
> - `showEntityModal` y `showEntityViewModal` para modales
> - `isEditingEntity` para distinguir create vs edit


### Estado de Modales (Alpine.js)
```javascript
// Control de visibilidad de modales
showEntityModal: false,         // Modal principal de edición
showEntityViewModal: false,     // Modal de vista/detalles
isEditingEntity: false,         // Flag para distinguir create vs edit
viewingEntity: {},              // Datos de la entidad en vista
```

### Estado de Paginación
```javascript
// Control de paginación y filtros
currentPageNum: 1,               // Página actual (normalizado)
pageSize: 20,                   // Elementos por página
currentSearch: '',              // Término de búsqueda actual
currentFilters: {},             // Filtros aplicados
```

### Estado de Editor (Para entidades con Editor.js)
```javascript
// Solo para entidades con contenido rich text
editorMode: 'visual',           // Modo del editor ('visual' o 'code')
entityCode: '',                 // Código HTML/JSON del contenido
entityEditor: null,             // Instancia de Editor.js
```

### Estado de Dropzone (Para entidades con subida de archivos)
```javascript
// Solo para entidades que manejan archivos
imageDropzone: null,            // Instancia de Dropzone
featuredImageDropzone: null,    // Dropzone específico para imagen destacada
```

### Contexto Compartido (Inyectado por admin.js)
```javascript
// Funciones compartidas inyectadas automáticamente
hasPermission: function,        // Verificación de permisos
showNotification: function,     // Sistema de notificaciones
user: object,                   // Información del usuario logueado
setSection: function,           // Navegación entre secciones
```

### Ejemplo Completo de Estado
```javascript
function createExampleModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        examples: [],
        currentExample: {
            title: '',
            content: '',
            status: 'draft'
        },
        categories: [],  // Datos relacionados
        
        // Modal state (for Alpine.js templates)
        showExampleModal: false,
        showExampleViewModal: false,
        isEditingExample: false,
        viewingExample: {},
        exampleForm: {
            title: '',
            content: '',
            status: 'draft',
            category_id: null
        },
        
        // Pagination state
        currentPageNum: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},
        
        // Editor state (if using Editor.js)
        editorMode: 'visual',
        exampleCode: '',
        exampleEditor: null,
        
        // Dropzone state (if handling file uploads)
        imageDropzone: null,
        
        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions)
        // ============================================================================
        
        // ... implementar las 9 funciones universales
        
        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS
        // ============================================================================
        
        closeModal() {
            this.showExampleModal = false;
            this.exampleForm = this.getDefaultFormData();
            this.isEditingExample = false;
        },
        
        closeViewModal() {
            this.showExampleViewModal = false;
            this.viewingExample = {};
        },
        
        // ============================================================================
        // ENTITY SPECIFIC EXTENSIONS
        // ============================================================================
        
        getDefaultFormData() {
            return {
                title: '',
                content: '',
                status: 'draft',
                category_id: null
            };
        },
        
        validateForm() {
            if (!this.exampleForm.title) {
                this.showNotification('Title is required', 'error');
                return false;
            }
            return true;
        }
    };
}
```

## 🧩 Anatomía de un Componente

Cada componente sigue esta estructura estándar:

### Archivos Requeridos

#### `index.html` (Siempre primero)
- Vista principal del componente
- Tabla de datos o dashboard
- Botones de acción (Crear, Editar, Eliminar)

#### `editor.html` (Siempre segundo)  
- Formulario de edición según el tipo
- Validaciones del lado cliente
- Integración con Alpine.js

#### `index.js` (Para entidades)
- Módulo JavaScript con toda la lógica
- Funciones CRUD
- Manejo de estado con Alpine.js
- Comunicación con APIs

### Patrón de Nomenclatura Alpine.js

```javascript
// Cada módulo expone una función create[EntityName]Module()
function createCategoriesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        categories: [],
        
        // Modal state (for Alpine.js templates)
        showCategoryModal: false,
        showCategoryViewModal: false,
        isEditingCategory: false,
        viewingCategory: {},
        categoryForm: {},
        
        // Pagination state
        currentPage: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},
        
        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions for all entities)
        // ============================================================================
        
        // 1. INIT - Initialize entity when entering section
        async init() { /* ... */ },
        
        // 2. LOAD - Load entity data for table
        async load(page, limit, search, filters) { /* ... */ },
        
        // 3. NEW - Show creation form/modal
        new(entityData = null) { /* ... */ },
        
        // 4. SAVE - Save entity (create or update)
        async save(id = null) { /* ... */ },
        
        // 5. DELETE - Delete entity
        async delete(id) { /* ... */ },
        
        // 6. RENDER_TABLE - Render entity table
        renderTable(data) { /* ... */ },
        
        // 7. EDIT - Show edit form/editor
        edit(entityId) { /* ... */ },
        
        // 8. VIEW - Show view modal
        async view(entityId) { /* ... */ },
        
        // 9. BACK - Return to entity list from modal/editor
        back() { /* ... */ },
        
        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================
        
        closeModal() { /* ... */ },
        closeViewModal() { /* ... */ },
        
        // ============================================================================
        // ENTITY SPECIFIC EXTENSIONS (custom functionality per entity)
        // ============================================================================
        
        // Custom methods specific to this entity...
    };
}
```

### Binding HTML-JavaScript

```html
<!-- HTML utiliza el nombre del módulo como namespace -->
<div x-show="categoriesModule?.showCategoryModal">
    <button @click="categoriesModule.createNew()">
        Add New Category
    </button>
    <form @submit.prevent="categoriesModule.saveCategory()">
        <input x-model="categoriesModule.categoryForm.name">
    </form>
</div>
```

## ⚙️ Sistema de Build

### Proceso de Compilación

El sistema de build (`build.js`) procesa los componentes en este orden:

1. **Directiva `{{include-entity "EntityName"}}`**
2. **Lectura de carpeta**: `/src/admin/EntityName/`
3. **Orden de archivos**:
   - `index.html` (primero)
   - `editor.html` (segundo) 
   - Otros archivos alfabéticamente
4. **Concatenación** en `dist/admin.html`

### Configuración en build.js

```javascript
// Lista de entidades procesadas
const entities = [
    'Head', 'Navbar', 'Sidebar', 'Dashboard',
    'Categories', 'Modules', 'Menus', 'Pages', 
    'Roles', 'Stories', 'Users', 'Permissions', 
    'Footer'
];

// Función de procesamiento
function processEntityFolder(entityName) {
    const entityPath = path.join('src/admin', entityName);
    
    // Orden específico: index.html -> editor.html -> otros
    const files = ['index.html', 'editor.html', /* otros */];
    
    return files.map(file => 
        fs.readFileSync(path.join(entityPath, file), 'utf8')
    ).join('\n');
}
```

### Template Principal

```html
<!-- src/admin/admin-template.html -->
{{include-entity "Head"}}
    {{include-entity "Navbar"}}
    {{include-entity "Sidebar"}}
                {{include-entity "Dashboard"}}
                {{include-entity "Stories"}}
                {{include-entity "Pages"}}
                <!-- ... más entidades ... -->
{{include-entity "Footer"}}
```

## 🏛️ Arquitectura de Módulos

### Orquestador Principal (`admin.js`)

```javascript
// Import de todos los módulos
import './Dashboard/index.js';
import './Categories/index.js';
// ... más imports

function adminApp() {
    return {
        // Estado global
        currentSection: 'dashboard',
        user: null,
        
        // Instancias de módulos
        dashboardModule: null,
        categoriesModule: null,
        // ... más módulos
        
        // Inicialización
        async init() {
            // Crear instancias con contexto compartido
            const sharedContext = {
                hasPermission: this.hasPermission.bind(this),
                showNotification: this.showNotification.bind(this),
                setSection: this.setSection.bind(this)
            };
            
            this.categoriesModule = Object.assign(
                createCategoriesModule(), 
                sharedContext
            );
        },
        
        // Navegación entre secciones
        async loadCurrentSection() {
            switch (this.currentSection) {
                case 'categories':
                    await this.categoriesModule.init();
                    break;
                // ... más casos
            }
        }
    };
}
```

### Contexto Compartido

Todos los módulos reciben un contexto compartido con:

- `hasPermission(action)`: Verificación de permisos
- `showNotification(message, type)`: Sistema de notificaciones
- `setSection(section)`: Navegación entre secciones
- `user`: Información del usuario logueado

## ➕ Cómo Agregar Nuevos Componentes

### 1. Crear la Estructura de Carpeta

```bash
mkdir src/admin/NuevaEntidad
touch src/admin/NuevaEntidad/index.html
touch src/admin/NuevaEntidad/editor.html
touch src/admin/NuevaEntidad/index.js
```

### 2. Decidir el Tipo de Editor

**¿Formulario simple?** → Modal  
**¿Contenido rich text?** → Story  
**¿Funcionalidad compleja?** → Page

### 3. Implementar los Archivos

#### `index.html`
```html
<!-- Nueva Entidad -->
<div x-show="currentSection === 'nuevaentidad'" class="content-section">
    <div class="content-header d-flex justify-content-between align-items-center">
        <div>
            <h1>Nueva Entidad</h1>
            <p class="text-muted">Descripción de la entidad</p>
        </div>
        <button class="btn btn-primary" 
                @click="nuevaentidadModule.createNew()" 
                x-show="hasPermission('nuevaentidad.create')">
            <i class="fas fa-plus me-2"></i>Add New
        </button>
    </div>
    
    <div id="nuevaentidad-content">
        <!-- Contenido se carga aquí -->
    </div>
</div>
```

#### `editor.html`
```html
<!-- Modal/Page/Story según el tipo elegido -->
<div x-show="nuevaentidadModule?.showEditor" class="modal-backdrop">
    <!-- Implementación según tipo de editor -->
</div>
```

#### `index.js`
```javascript
function createNuevaentidadModule() {
    return {
        // ============================================================================
        // STATE VARIABLES (seguir el estándar)
        // ============================================================================
        
        // Entity data
        nuevaentidades: [],
        currentNuevaentidad: {},
        
        // Modal state (for Alpine.js templates)
        showNuevaentidadModal: false,
        showNuevaentidadViewModal: false,
        isEditingNuevaentidad: false,
        viewingNuevaentidad: {},
        nuevaentidadForm: {},
        
        // Pagination state
        currentPage: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},
        
        // ============================================================================
        // UNIVERSAL FUNCTIONS (implementar las 9 funciones obligatorias)
        // ============================================================================
        
        // 1. INIT - Initialize entity when entering section
        async init() {
            console.log('🆕 Initializing NuevaEntidad module...');
            await this.load();
        },
        
        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('nuevaentidad-content');
            if (!container) return;

            try {
                // Update current state
                this.currentPageNum = page;
                this.pageSize = limit;
                this.currentSearch = search;
                this.currentFilters = filters;

                // Build query parameters
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString()
                });

                if (search) params.append('search', search);
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });

                const response = await fetch(`/api/admin/nuevaentidad?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load nuevaentidad error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading nuevaentidad: ${error.message}</div>`;
            }
        },
        
        // 3. NEW - Show creation form/modal
        new(entityData = null) {
            if (this.showNuevaentidadModal === true) {
                console.warn('Modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingNuevaentidad = !!entityData;
            
            if (entityData) {
                this.nuevaentidadForm = { ...entityData };
            } else {
                this.nuevaentidadForm = this.getDefaultFormData();
            }
            
            this.showNuevaentidadModal = true;
        },
        
        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.validateForm()) {
                return;
            }

            try {
                const url = this.nuevaentidadForm.id ? 
                    `/api/admin/nuevaentidad/${this.nuevaentidadForm.id}` : 
                    '/api/admin/nuevaentidad';
                const method = this.nuevaentidadForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.nuevaentidadForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`NuevaEntidad ${this.nuevaentidadForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                this.showNotification('Error saving nuevaentidad. Please try again.', 'error');
            }
        },
        
        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this nuevaentidad?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/nuevaentidad/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`NuevaEntidad deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                this.showNotification(`Error deleting nuevaentidad. Please try again.`, 'error');
            }
        },
        
        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'nuevaentidad-table',
                entityType: 'nuevaentidad',
                emptyMessage: 'No nuevaentidades found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    // Definir filtros específicos
                ],
                columns: [
                    // Definir columnas específicas
                ],
                showViewButton: true,
                actionHandlers: {
                    edit: (type, id) => this.edit(id),
                    delete: (type, id) => this.delete(id),
                    view: (type, id) => this.view(id)
                },
                onPageChange: (page) => this.load(page),
                onPageSizeChange: (newLimit) => this.load(1, newLimit),
                onSearch: (search, filters) => this.load(1, this.pageSize, search, filters)
            };

            return createEntityTable(data, config);
        },
        
        // 7. EDIT - Show edit form/editor
        edit(nuevaentidadId) {
            if (nuevaentidadId) {
                this.loadEntityForEditing(nuevaentidadId);
            } else {
                this.new();
            }
        },
        
        // 8. VIEW - Show view modal
        async view(nuevaentidadId) {
            try {
                const response = await fetch(`/api/admin/nuevaentidad/${nuevaentidadId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingNuevaentidad = data.data;
                    this.showNuevaentidadViewModal = true;
                } else {
                    this.showNotification('Error loading nuevaentidad details', 'error');
                }
            } catch (error) {
                this.showNotification('Error loading nuevaentidad details', 'error');
            }
        },
        
        // 9. BACK - Return to entity list from modal/editor
        back() {
            if (this.showNuevaentidadModal) {
                this.closeModal();
                return;
            }
            
            if (this.showNuevaentidadViewModal) {
                this.closeViewModal();
                return;
            }
            
            if (this.setSection) {
                this.setSection('nuevaentidad');
            }
        },
        
        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS
        // ============================================================================
        
        closeModal() {
            this.showNuevaentidadModal = false;
            this.nuevaentidadForm = this.getDefaultFormData();
            this.isEditingNuevaentidad = false;
        },
        
        closeViewModal() {
            this.showNuevaentidadViewModal = false;
            this.viewingNuevaentidad = {};
        },
        
        // ============================================================================
        // ENTITY SPECIFIC EXTENSIONS
        // ============================================================================
        
        getDefaultFormData() {
            return {
                // Definir campos por defecto
                name: '',
                status: 'active'
            };
        },
        
        validateForm() {
            if (!this.nuevaentidadForm.name) {
                this.showNotification('Name is required', 'error');
                return false;
            }
            return true;
        },
        
        async loadEntityForEditing(id) {
            try {
                const response = await fetch(`/api/admin/nuevaentidad/${id}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.new(data.data);
                } else {
                    this.showNotification('Error loading nuevaentidad for editing', 'error');
                }
            } catch (error) {
                this.showNotification('Error loading nuevaentidad. Please try again.', 'error');
            }
        }
    };
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.createNuevaentidadModule = createNuevaentidadModule;
}
```

### 4. Registrar en el Sistema

#### En `admin.js`:
```javascript
// Agregar import
import './NuevaEntidad/index.js';

// Agregar instancia de módulo
nuevaentidadModule: null,

// Inicializar en init()
this.nuevaentidadModule = Object.assign(
    createNuevaentidadModule(), 
    sharedContext
);

// Agregar caso en loadCurrentSection()
case 'nuevaentidad':
    await this.nuevaentidadModule.init();
    break;
```

#### En `build.js`:
```javascript
const entities = [
    'Head', 'Navbar', 'Sidebar', 'Dashboard',
    'Categories', 'Modules', 'Menus', 'Pages', 
    'Roles', 'Stories', 'Users', 'Permissions',
    'NuevaEntidad', // ← Agregar aquí
    'Footer'
];
```

#### En `admin-template.html`:
```html
{{include-entity "NuevaEntidad"}}
```

#### En `Sidebar/index.html`:
```html
<a href="#" 
   class="sidebar-item"
   x-bind:class="{ 'active': currentSection === 'nuevaentidad' }"
   @click.prevent="setSection('nuevaentidad')">
    <i class="fas fa-icon"></i>
    <span>Nueva Entidad</span>
</a>
```

## 📐 Reglas de Frontend

### Principios Fundamentales

1. **Todo Client-Side**: Excepto stories individuales (SEO)
2. **No Frameworks**: Prohibido React, Angular, Tailwind
3. **Alpine.js**: Para reactividad y manejo de UI/UX
4. **Bootstrap 5**: Para estilos y componentes
5. **Editor.js**: Para todo contenido rich text
6. **Vanilla JS**: Base del código

### Limitaciones de Archivos

- **HTML/JS**: Máximo 400-500 líneas por archivo (target: menos de 400)
- **CSS**: Sin límite (solo para estilos)
- **Modularidad**: Funcionalidades en carpetas separadas
- **Código limpio**: Eliminar funciones innecesarias, mantener solo lo esencial

### Patrón de Organización

```
Entidad/
├── index.html     # Vista principal (siempre primero)
├── editor.html    # Editor (siempre segundo)  
├── extra.html     # Archivos extra (alfabético)
└── index.js       # Lógica del módulo
```

### Editor.js Centralizado

Toda configuración de Editor.js está en `editorConfig.js`:

```javascript
// Para agregar nuevos bloques/plugins
function getEditorConfig(containerId = 'editor') {
    return {
        holder: containerId,
        tools: {
            // Agregar nuevos tools aquí
            newBlock: NewBlockClass
        }
    };
}
```

### Patrón de Consultas API

Todas las entidades siguen el mismo patrón para consultas:

```javascript
// En las consultas API
const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
});

// Agregar filtros de búsqueda si existen
if (search) params.append('search', search);
Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
});

const response = await fetch(`/api/admin/entidad?${params}`);

if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

const data = await response.json();
```

### Funciones Universales Obligatorias

Todas las entidades DEBEN implementar las 9 funciones universales:

```javascript
// Estrictamente en este orden y con estos nombres
1. async init()              - Inicialización del módulo
2. async load()              - Carga de datos para tabla
3. new()                     - Mostrar formulario nuevo/editar
4. async save()              - Guardar entidad
5. async delete()            - Eliminar entidad
6. renderTable()             - Renderizar tabla con createEntityTable()
7. edit()                    - Mostrar editor/formulario de edición
8. async view()              - Mostrar modal de vista
9. back()                    - Volver a lista desde modal/editor
```

### Manejo de Errores Estándar

Todas las funciones de API DEBEN incluir manejo robusto de errores:

```javascript
// Verificar HTTP status
if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

// Mensaje de error con fallback
throw new Error(data.message || 'Unknown error occurred');

// Log de errores para debugging
console.error('Load [entity] error:', error);
```

### Componente de Tabla Reutilizable

Utilizar SIEMPRE `createEntityTable()` en `renderTable()`:

```javascript
renderTable(data) {
    const config = {
        tableId: 'entidad-table',           // ID único de la tabla
        entityType: 'entidad',              // Tipo para eventos
        emptyMessage: 'No entities found.', // Mensaje cuando vacío
        adminAppInstance: this,             // Referencia al módulo
        enableSearch: true,                 // Habilitar búsqueda
        currentSearch: this.currentSearch,  // Término actual
        currentFilters: this.currentFilters,// Filtros aplicados
        
        // Configuración de filtros
        filters: [
            {
                field: 'status',
                label: 'Status',
                placeholder: 'All Statuses',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                ]
            }
        ],
        
        // Configuración de columnas
        columns: [
            {
                header: 'Name',
                field: 'name',
                type: 'text'    // text, badge, date, custom
            },
            {
                header: 'Status',
                field: 'status',
                type: 'badge',
                badgeClass: (value) => value === 'active' ? 'bg-success' : 'bg-danger'
            },
            {
                header: 'Custom',
                field: 'custom',
                type: 'custom',
                render: (entity) => `<strong>${entity.name}</strong>`
            }
        ],
        
        // Configuración de acciones
        showViewButton: true,
        actionHandlers: {
            edit: (type, id) => this.edit(id),
            delete: (type, id) => this.delete(id),
            view: (type, id) => this.view(id)
        },
        
        // Eventos de paginación y búsqueda
        onPageChange: (page) => this.load(page),
        onPageSizeChange: (newLimit) => this.load(1, newLimit),
        onSearch: (search, filters) => this.load(1, this.pageSize, search, filters)
    };

    return createEntityTable(data, config);
}
```

## 🔄 Flujo de Desarrollo

1. **Análisis**: ¿Qué tipo de editor necesita? (Modal/Story/Page)
2. **Estructura**: Crear carpeta con archivos base (`index.html`, `editor.html`, `index.js`)
3. **Variables de Estado**: Implementar las variables estándar (entities, modals, paginación)
4. **Funciones Universales**: Implementar las 9 funciones obligatorias en orden
5. **Función renderTable**: Configurar `createEntityTable()` con columnas y filtros
6. **Extensiones Específicas**: Agregar funcionalidad particular de la entidad
7. **Registro**: Agregar a `build.js`, `admin.js`, `admin-template.html`
8. **Navegación**: Actualizar `sidebar` con nuevo enlace
9. **Testing**: Verificar las 9 funciones y flujo completo CRUD

### Checklist de Implementación

- [ ] Variables de estado estándar definidas
- [ ] Las 9 funciones universales implementadas
- [ ] `renderTable()` utiliza `createEntityTable()`
- [ ] Modales (`closeModal()`, `closeViewModal()`)
- [ ] Validación de formularios (`validateForm()`)
- [ ] Carga de datos relacionados (si aplica)
- [ ] Manejo de errores en todas las funciones
- [ ] Mensajes de notificación apropiados
- [ ] Navegación correcta entre secciones
- [ ] Permisos verificados en botones de acción

---

Esta arquitectura garantiza que el admin panel sea mantenible, escalable y siga un patrón consistente que cualquier desarrollador puede entender y extender fácilmente. 