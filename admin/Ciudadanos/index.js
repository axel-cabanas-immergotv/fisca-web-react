// Ciudadanos functionality for admin panel
function createCiudadanosModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        ciudadanos: [],
        availableMesas: [],
        
        // Modal state (for Alpine.js templates)
        showCiudadanoModal: false,
        showCiudadanoViewModal: false,
        isEditingCiudadano: false,
        viewingCiudadano: {},
        ciudadanoForm: {
            nombre: '',
            apellido: '',
            dni: '',
            mesa_id: '',
            nacionalidad: '',
            genero: '',
            domicilio: '',
            codigo_postal: '',
            numero_orden: '',
            status: 'active'
        },

        // Pagination state
        currentPageNum: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},

        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions for all entities)
        // ============================================================================

        // 1. INIT - Initialize entity when entering section
        async init() {
            console.log('👥 Initializing Ciudadanos module...');
            await this.loadAvailableMesas();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('ciudadanos-content');
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

                const response = await fetch(`/api/admin/ciudadanos?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.ciudadanos = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load ciudadanos error:', error);
                this.ciudadanos = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading ciudadanos: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(ciudadanoData = null) {
            // Guard against unwanted executions
            if (this.showCiudadanoModal === true) {
                console.warn('Ciudadano modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingCiudadano = !!ciudadanoData;
            
            // Reset or populate form
            if (ciudadanoData) {
                this.ciudadanoForm = {
                    id: ciudadanoData.id,
                    nombre: ciudadanoData.nombre || '',
                    apellido: ciudadanoData.apellido || '',
                    dni: ciudadanoData.dni || '',
                    mesa_id: ciudadanoData.mesa_id || '',
                    nacionalidad: ciudadanoData.nacionalidad || '',
                    genero: ciudadanoData.genero || '',
                    domicilio: ciudadanoData.domicilio || '',
                    codigo_postal: ciudadanoData.codigo_postal || '',
                    numero_orden: ciudadanoData.numero_orden || '',
                    status: ciudadanoData.status || 'active'
                };
            } else {
                this.ciudadanoForm = {
                    nombre: '',
                    apellido: '',
                    dni: '',
                    mesa_id: '',
                    nacionalidad: '',
                    genero: '',
                    domicilio: '',
                    codigo_postal: '',
                    numero_orden: '',
                    status: 'active'
                };
            }
            
            this.showCiudadanoModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.ciudadanoForm.nombre || !this.ciudadanoForm.apellido || !this.ciudadanoForm.dni || !this.ciudadanoForm.mesa_id) {
                this.showNotification('Nombre, apellido, DNI and mesa are required.', 'error');
                return;
            }

            try {
                const url = this.ciudadanoForm.id ? `/api/admin/ciudadanos/${this.ciudadanoForm.id}` : '/api/admin/ciudadanos';
                const method = this.ciudadanoForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.ciudadanoForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Ciudadano ${this.ciudadanoForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving ciudadano:', error);
                this.showNotification('Error saving ciudadano. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this ciudadano?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/ciudadanos/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Ciudadano deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting ciudadano:', error);
                this.showNotification('Error deleting ciudadano. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'ciudadanos-table',
                entityType: 'ciudadano',
                emptyMessage: 'No ciudadanos found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'mesa_id',
                        label: 'Mesa',
                        placeholder: 'All Mesas',
                        options: this.availableMesas.map(mesa => ({
                            value: mesa.id,
                            label: `${mesa.numero} (${mesa.escuela?.nombre || 'N/A'})`
                        }))
                    },
                    {
                        field: 'genero',
                        label: 'Género',
                        placeholder: 'All Géneros',
                        options: [
                            { value: 'masculino', label: 'Masculino' },
                            { value: 'femenino', label: 'Femenino' },
                            { value: 'otro', label: 'Otro' }
                        ]
                    },
                    {
                        field: 'nacionalidad',
                        label: 'Nacionalidad',
                        placeholder: 'All Nacionalidades',
                        options: [
                            { value: 'Argentina', label: 'Argentina' },
                            { value: 'Chile', label: 'Chile' },
                            { value: 'Brasil', label: 'Brasil' },
                            { value: 'Uruguay', label: 'Uruguay' },
                            { value: 'Paraguay', label: 'Paraguay' },
                            { value: 'Bolivia', label: 'Bolivia' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Nombre Completo',
                        field: 'nombre_completo',
                        type: 'custom',
                        render: (entity) => `<strong>${entity.apellido}, ${entity.nombre}</strong>`
                    },
                    {
                        header: 'DNI',
                        field: 'dni',
                        type: 'text'
                    },
                    {
                        header: 'Mesa',
                        field: 'mesa',
                        type: 'custom',
                        render: (entity) => entity.mesa ? entity.mesa.numero : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Escuela',
                        field: 'escuela',
                        type: 'custom',
                        render: (entity) => entity.mesa?.escuela ? entity.mesa.escuela.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Circuito',
                        field: 'circuito',
                        type: 'custom',
                        render: (entity) => entity.mesa?.escuela?.circuito ? entity.mesa.escuela.circuito.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Localidad',
                        field: 'localidad',
                        type: 'custom',
                        render: (entity) => entity.mesa?.escuela?.circuito?.localidad ? entity.mesa.escuela.circuito.localidad.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Género',
                        field: 'genero',
                        type: 'custom',
                        render: (entity) => {
                            if (!entity.genero) return '<span class="text-muted">N/A</span>';
                            const badgeClass = entity.genero === 'masculino' ? 'bg-primary' : 
                                             entity.genero === 'femenino' ? 'bg-info' : 'bg-secondary';
                            return `<span class="badge ${badgeClass}">${entity.genero}</span>`;
                        }
                    },
                    {
                        header: 'Nacionalidad',
                        field: 'nacionalidad',
                        type: 'text'
                    },
                    {
                        header: 'Domicilio',
                        field: 'domicilio',
                        type: 'text'
                    },
                    {
                        header: 'Orden',
                        field: 'numero_orden',
                        type: 'custom',
                        render: (entity) => entity.numero_orden ? `<span class="badge bg-warning">${entity.numero_orden}</span>` : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Status',
                        field: 'status',
                        type: 'badge',
                        badgeClass: (value) => value === 'active' ? 'bg-success' : 'bg-warning'
                    },
                    {
                        header: 'Created',
                        field: 'created_at',
                        type: 'date'
                    }
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
        edit(ciudadanoId) {
            console.log('🔥 edit called with ciudadanoId:', ciudadanoId);
            
            if (ciudadanoId) {
                this.loadCiudadanoForEditing(ciudadanoId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(ciudadanoId) {
            try {
                const response = await fetch(`/api/admin/ciudadanos/${ciudadanoId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingCiudadano = data.data;
                    this.showCiudadanoViewModal = true;
                } else {
                    this.showNotification('Error loading ciudadano details', 'error');
                }
            } catch (error) {
                console.error('Error viewing ciudadano:', error);
                this.showNotification('Error loading ciudadano details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showCiudadanoModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showCiudadanoViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in ciudadanos section
            if (this.setSection) {
                this.setSection('ciudadanos');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showCiudadanoModal = false;
            this.ciudadanoForm = {
                nombre: '',
                apellido: '',
                dni: '',
                mesa_id: '',
                nacionalidad: '',
                genero: '',
                domicilio: '',
                codigo_postal: '',
                numero_orden: '',
                status: 'active'
            };
            this.isEditingCiudadano = false;
        },

        closeViewModal() {
            this.showCiudadanoViewModal = false;
            this.viewingCiudadano = {};
        },

        editFromView() {
            const ciudadanoData = this.viewingCiudadano;
            this.closeViewModal();
            this.edit(ciudadanoData.id);
        },

        // ============================================================================
        // CIUDADANOS SPECIFIC EXTENSIONS
        // ============================================================================

        async loadCiudadanoForEditing(ciudadanoId) {
            try {
                const response = await fetch(`/api/admin/ciudadanos/${ciudadanoId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading ciudadano for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading ciudadano:', error);
                this.showNotification('Error loading ciudadano. Please try again.', 'error');
            }
        },

        async loadAvailableMesas() {
            try {
                const response = await fetch('/api/admin/mesas?limit=100');
                const data = await response.json();
                
                if (data.success) {
                    this.availableMesas = data.data || [];
                }
            } catch (error) {
                console.error('Error loading mesas:', error);
                this.availableMesas = [];
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createCiudadanosModule = createCiudadanosModule;
} 