// Mesas functionality for admin panel
function createMesasModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        mesas: [],
        availableEscuelas: [],
        
        // Modal state (for Alpine.js templates)
        showMesaModal: false,
        showMesaViewModal: false,
        isEditingMesa: false,
        viewingMesa: {},
        mesaForm: {
            numero: '',
            escuela_id: '',
            mesa_testigo: false,
            mesa_extranjeros: false,
            mesa_abrio: false,
            acta_de_escrutinio: '',
            certificado_de_escrutinio: '',
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
            console.log('🗳️ Initializing Mesas module...');
            await this.loadAvailableEscuelas();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('mesas-content');
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

                const response = await fetch(`/api/admin/mesas?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.mesas = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load mesas error:', error);
                this.mesas = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading mesas: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(mesaData = null) {
            // Guard against unwanted executions
            if (this.showMesaModal === true) {
                console.warn('Mesa modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingMesa = !!mesaData;
            
            // Reset or populate form
            if (mesaData) {
                this.mesaForm = {
                    id: mesaData.id,
                    numero: mesaData.numero || '',
                    escuela_id: mesaData.escuela_id || '',
                    mesa_testigo: mesaData.mesa_testigo || false,
                    mesa_extranjeros: mesaData.mesa_extranjeros || false,
                    mesa_abrio: mesaData.mesa_abrio || false,
                    acta_de_escrutinio: mesaData.acta_de_escrutinio || '',
                    certificado_de_escrutinio: mesaData.certificado_de_escrutinio || '',
                    status: mesaData.status || 'active'
                };
            } else {
                this.mesaForm = {
                    numero: '',
                    escuela_id: '',
                    mesa_testigo: false,
                    mesa_extranjeros: false,
                    mesa_abrio: false,
                    acta_de_escrutinio: '',
                    certificado_de_escrutinio: '',
                    status: 'active'
                };
            }
            
            this.showMesaModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.mesaForm.numero || !this.mesaForm.escuela_id) {
                this.showNotification('Mesa numero and escuela are required.', 'error');
                return;
            }

            try {
                const url = this.mesaForm.id ? `/api/admin/mesas/${this.mesaForm.id}` : '/api/admin/mesas';
                const method = this.mesaForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.mesaForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Mesa ${this.mesaForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving mesa:', error);
                this.showNotification('Error saving mesa. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this mesa?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/mesas/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Mesa deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting mesa:', error);
                this.showNotification('Error deleting mesa. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'mesas-table',
                entityType: 'mesa',
                emptyMessage: 'No mesas found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'escuela_id',
                        label: 'Escuela',
                        placeholder: 'All Escuelas',
                        options: this.availableEscuelas.map(esc => ({
                            value: esc.id,
                            label: `${esc.nombre} (${esc.circuito?.localidad?.nombre || 'N/A'})`
                        }))
                    },
                    {
                        field: 'mesa_testigo',
                        label: 'Mesa Testigo',
                        placeholder: 'All',
                        options: [
                            { value: 'true', label: 'Sí' },
                            { value: 'false', label: 'No' }
                        ]
                    },
                    {
                        field: 'mesa_extranjeros',
                        label: 'Mesa Extranjeros',
                        placeholder: 'All',
                        options: [
                            { value: 'true', label: 'Sí' },
                            { value: 'false', label: 'No' }
                        ]
                    },
                    {
                        field: 'mesa_abrio',
                        label: 'Mesa Abrió',
                        placeholder: 'All',
                        options: [
                            { value: 'true', label: 'Sí' },
                            { value: 'false', label: 'No' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Numero',
                        field: 'numero',
                        type: 'text'
                    },
                    {
                        header: 'Escuela',
                        field: 'escuela',
                        type: 'custom',
                        render: (entity) => entity.escuela ? entity.escuela.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Circuito',
                        field: 'circuito',
                        type: 'custom',
                        render: (entity) => entity.escuela?.circuito ? entity.escuela.circuito.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Localidad',
                        field: 'localidad',
                        type: 'custom',
                        render: (entity) => entity.escuela?.circuito?.localidad ? entity.escuela.circuito.localidad.nombre : '<span class="text-muted">N/A</span>'
                    },
                    {
                        header: 'Características',
                        field: 'caracteristicas',
                        type: 'custom',
                        render: (entity) => {
                            let badges = [];
                            if (entity.mesa_testigo) badges.push('<span class="badge bg-primary me-1">Testigo</span>');
                            if (entity.mesa_extranjeros) badges.push('<span class="badge bg-info me-1">Extranjeros</span>');
                            if (entity.mesa_abrio) badges.push('<span class="badge bg-success me-1">Abrió</span>');
                            return badges.length ? badges.join('') : '<span class="text-muted">Normal</span>';
                        }
                    },
                    {
                        header: 'Documentos',
                        field: 'documentos',
                        type: 'custom',
                        render: (entity) => {
                            let docs = [];
                            if (entity.acta_de_escrutinio) docs.push('<i class="fas fa-file-alt text-primary me-1" title="Acta"></i>');
                            if (entity.certificado_de_escrutinio) docs.push('<i class="fas fa-certificate text-success me-1" title="Certificado"></i>');
                            return docs.length ? docs.join('') : '<span class="text-muted">Sin docs</span>';
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
        edit(mesaId) {
            console.log('🔥 edit called with mesaId:', mesaId);
            
            if (mesaId) {
                this.loadMesaForEditing(mesaId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(mesaId) {
            try {
                const response = await fetch(`/api/admin/mesas/${mesaId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingMesa = data.data;
                    this.showMesaViewModal = true;
                } else {
                    this.showNotification('Error loading mesa details', 'error');
                }
            } catch (error) {
                console.error('Error viewing mesa:', error);
                this.showNotification('Error loading mesa details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showMesaModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showMesaViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in mesas section
            if (this.setSection) {
                this.setSection('mesas');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showMesaModal = false;
            this.mesaForm = {
                numero: '',
                escuela_id: '',
                mesa_testigo: false,
                mesa_extranjeros: false,
                mesa_abrio: false,
                acta_de_escrutinio: '',
                certificado_de_escrutinio: '',
                status: 'active'
            };
            this.isEditingMesa = false;
        },

        closeViewModal() {
            this.showMesaViewModal = false;
            this.viewingMesa = {};
        },

        editFromView() {
            const mesaData = this.viewingMesa;
            this.closeViewModal();
            this.edit(mesaData.id);
        },

        // ============================================================================
        // MESAS SPECIFIC EXTENSIONS
        // ============================================================================

        async loadMesaForEditing(mesaId) {
            try {
                const response = await fetch(`/api/admin/mesas/${mesaId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading mesa for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading mesa:', error);
                this.showNotification('Error loading mesa. Please try again.', 'error');
            }
        },

        async loadAvailableEscuelas() {
            try {
                const response = await fetch('/api/admin/escuelas?limit=100');
                const data = await response.json();
                
                if (data.success) {
                    this.availableEscuelas = data.data || [];
                }
            } catch (error) {
                console.error('Error loading escuelas:', error);
                this.availableEscuelas = [];
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createMesasModule = createMesasModule;
} 