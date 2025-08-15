// Escuelas functionality for admin panel
function createEscuelasModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        escuelas: [],
        availableCircuitos: [],
        
        // Modal state (for Alpine.js templates)
        showEscuelaModal: false,
        showEscuelaViewModal: false,
        isEditingEscuela: false,
        viewingEscuela: {},
        escuelaForm: {
            nombre: '',
            circuito_id: '',
            calle: '',
            altura: '',
            lat: '',
            lon: '',
            dificultad: '',
            abierto: true,
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
            console.log('🏫 Initializing Escuelas module...');
            await this.loadAvailableCircuitos();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('escuelas-content');
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

                const response = await fetch(`/api/admin/escuelas?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.escuelas = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load escuelas error:', error);
                this.escuelas = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading escuelas: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(escuelaData = null) {
            // Guard against unwanted executions
            if (this.showEscuelaModal === true) {
                console.warn('Escuela modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingEscuela = !!escuelaData;
            
            // Reset or populate form
            if (escuelaData) {
                this.escuelaForm = {
                    id: escuelaData.id,
                    nombre: escuelaData.nombre || '',
                    circuito_id: escuelaData.circuito_id || '',
                    calle: escuelaData.calle || '',
                    altura: escuelaData.altura || '',
                    lat: escuelaData.lat || '',
                    lon: escuelaData.lon || '',
                    dificultad: escuelaData.dificultad || '',
                    abierto: escuelaData.abierto !== undefined ? escuelaData.abierto : true,
                    status: escuelaData.status || 'active'
                };
            } else {
                this.escuelaForm = {
                    nombre: '',
                    circuito_id: '',
                    calle: '',
                    altura: '',
                    lat: '',
                    lon: '',
                    dificultad: '',
                    abierto: true,
                    status: 'active'
                };
            }
            
            this.showEscuelaModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.escuelaForm.nombre || !this.escuelaForm.circuito_id) {
                this.showNotification('Escuela nombre and circuito are required.', 'error');
                return;
            }

            try {
                const url = this.escuelaForm.id ? `/api/admin/escuelas/${this.escuelaForm.id}` : '/api/admin/escuelas';
                const method = this.escuelaForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.escuelaForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Escuela ${this.escuelaForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving escuela:', error);
                this.showNotification('Error saving escuela. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this escuela?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/escuelas/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Escuela deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting escuela:', error);
                this.showNotification('Error deleting escuela. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'escuelas-table',
                entityType: 'escuela',
                emptyMessage: 'No escuelas found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'circuito_id',
                        label: 'Circuito',
                        placeholder: 'All Circuitos',
                        options: this.availableCircuitos.map(circ => ({
                            value: circ.id,
                            label: `${circ.nombre} (${circ.localidad?.nombre || 'N/A'})`
                        }))
                    },
                    {
                        field: 'abierto',
                        label: 'Estado',
                        placeholder: 'All Estados',
                        options: [
                            { value: 'true', label: 'Abierto' },
                            { value: 'false', label: 'Cerrado' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Nombre',
                        field: 'nombre',
                        type: 'text'
                    },
                    {
                        header: 'Circuito',
                        field: 'circuito',
                        type: 'custom',
                        render: (entity) => entity.circuito ? entity.circuito.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Localidad',
                        field: 'localidad',
                        type: 'custom',
                        render: (entity) => entity.circuito?.localidad ? entity.circuito.localidad.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Ubicación',
                        field: 'ubicacion',
                        type: 'custom',
                        render: (entity) => {
                            const calle = entity.calle || '';
                            const altura = entity.altura || '';
                            const ubicacion = calle + (calle && altura ? ' ' + altura : altura);
                            return ubicacion || '<span class="text-muted">N/A</span>';
                        }
                    },
                    {
                        header: 'Dificultad',
                        field: 'dificultad',
                        type: 'custom',
                        render: (entity) => {
                            if (!entity.dificultad) return '<span class="text-muted">N/A</span>';
                            const badgeClass = entity.dificultad === 'baja' ? 'bg-success' : 
                                             entity.dificultad === 'media' ? 'bg-warning' : 'bg-danger';
                            return `<span class="badge ${badgeClass}">${entity.dificultad}</span>`;
                        }
                    },
                    {
                        header: 'Estado',
                        field: 'abierto',
                        type: 'custom',
                        render: (entity) => {
                            const badgeClass = entity.abierto ? 'bg-success' : 'bg-danger';
                            const text = entity.abierto ? 'Abierto' : 'Cerrado';
                            return `<span class="badge ${badgeClass}">${text}</span>`;
                        }
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
        edit(escuelaId) {
            console.log('🔥 edit called with escuelaId:', escuelaId);
            
            if (escuelaId) {
                this.loadEscuelaForEditing(escuelaId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(escuelaId) {
            try {
                const response = await fetch(`/api/admin/escuelas/${escuelaId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingEscuela = data.data;
                    this.showEscuelaViewModal = true;
                } else {
                    this.showNotification('Error loading escuela details', 'error');
                }
            } catch (error) {
                console.error('Error viewing escuela:', error);
                this.showNotification('Error loading escuela details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showEscuelaModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showEscuelaViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in escuelas section
            if (this.setSection) {
                this.setSection('escuelas');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showEscuelaModal = false;
            this.escuelaForm = {
                nombre: '',
                circuito_id: '',
                calle: '',
                altura: '',
                lat: '',
                lon: '',
                dificultad: '',
                abierto: true,
                status: 'active'
            };
            this.isEditingEscuela = false;
        },

        closeViewModal() {
            this.showEscuelaViewModal = false;
            this.viewingEscuela = {};
        },

        editFromView() {
            const escuelaData = this.viewingEscuela;
            this.closeViewModal();
            this.edit(escuelaData.id);
        },

        // ============================================================================
        // ESCUELAS SPECIFIC EXTENSIONS
        // ============================================================================

        async loadEscuelaForEditing(escuelaId) {
            try {
                const response = await fetch(`/api/admin/escuelas/${escuelaId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading escuela for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading escuela:', error);
                this.showNotification('Error loading escuela. Please try again.', 'error');
            }
        },

        async loadAvailableCircuitos() {
            try {
                const response = await fetch('/api/admin/circuitos?limit=100');
                const data = await response.json();
                
                if (data.success) {
                    this.availableCircuitos = data.data || [];
                }
            } catch (error) {
                console.error('Error loading circuitos:', error);
                this.availableCircuitos = [];
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createEscuelasModule = createEscuelasModule;
} 