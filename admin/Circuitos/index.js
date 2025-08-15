// Circuitos functionality for admin panel
function createCircuitosModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        circuitos: [],
        availableLocalidades: [],
        
        // Modal state (for Alpine.js templates)
        showCircuitoModal: false,
        showCircuitoViewModal: false,
        isEditingCircuito: false,
        viewingCircuito: {},
        circuitoForm: {
            nombre: '',
            localidad_id: '',
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
            console.log('🔄 Initializing Circuitos module...');
            await this.loadAvailableLocalidades();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('circuitos-content');
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

                const response = await fetch(`/api/admin/circuitos?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.circuitos = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load circuitos error:', error);
                this.circuitos = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading circuitos: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(circuitoData = null) {
            // Guard against unwanted executions
            if (this.showCircuitoModal === true) {
                console.warn('Circuito modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingCircuito = !!circuitoData;
            
            // Reset or populate form
            if (circuitoData) {
                this.circuitoForm = {
                    id: circuitoData.id,
                    nombre: circuitoData.nombre || '',
                    localidad_id: circuitoData.localidad_id || '',
                    status: circuitoData.status || 'active'
                };
            } else {
                this.circuitoForm = {
                    nombre: '',
                    localidad_id: '',
                    status: 'active'
                };
            }
            
            this.showCircuitoModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.circuitoForm.nombre || !this.circuitoForm.localidad_id) {
                this.showNotification('Circuito nombre and localidad are required.', 'error');
                return;
            }

            try {
                const url = this.circuitoForm.id ? `/api/admin/circuitos/${this.circuitoForm.id}` : '/api/admin/circuitos';
                const method = this.circuitoForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.circuitoForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Circuito ${this.circuitoForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving circuito:', error);
                this.showNotification('Error saving circuito. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this circuito?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/circuitos/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Circuito deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting circuito:', error);
                this.showNotification('Error deleting circuito. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'circuitos-table',
                entityType: 'circuito',
                emptyMessage: 'No circuitos found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'localidad_id',
                        label: 'Localidad',
                        placeholder: 'All Localidades',
                        options: this.availableLocalidades.map(loc => ({
                            value: loc.id,
                            label: loc.nombre
                        }))
                    }
                ],
                columns: [
                    {
                        header: 'Nombre',
                        field: 'nombre',
                        type: 'text'
                    },
                    {
                        header: 'Localidad',
                        field: 'localidad',
                        type: 'custom',
                        render: (entity) => entity.localidad ? entity.localidad.nombre : '<span class="text-muted">N/A</span>'
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
        edit(circuitoId) {
            console.log('🔥 edit called with circuitoId:', circuitoId);
            
            if (circuitoId) {
                this.loadCircuitoForEditing(circuitoId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(circuitoId) {
            try {
                const response = await fetch(`/api/admin/circuitos/${circuitoId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingCircuito = data.data;
                    this.showCircuitoViewModal = true;
                } else {
                    this.showNotification('Error loading circuito details', 'error');
                }
            } catch (error) {
                console.error('Error viewing circuito:', error);
                this.showNotification('Error loading circuito details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showCircuitoModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showCircuitoViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in circuitos section
            if (this.setSection) {
                this.setSection('circuitos');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showCircuitoModal = false;
            this.circuitoForm = {
                nombre: '',
                localidad_id: '',
                status: 'active'
            };
            this.isEditingCircuito = false;
        },

        closeViewModal() {
            this.showCircuitoViewModal = false;
            this.viewingCircuito = {};
        },

        editFromView() {
            const circuitoData = this.viewingCircuito;
            this.closeViewModal();
            this.edit(circuitoData.id);
        },

        // ============================================================================
        // CIRCUITOS SPECIFIC EXTENSIONS
        // ============================================================================

        async loadCircuitoForEditing(circuitoId) {
            try {
                const response = await fetch(`/api/admin/circuitos/${circuitoId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading circuito for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading circuito:', error);
                this.showNotification('Error loading circuito. Please try again.', 'error');
            }
        },

        async loadAvailableLocalidades() {
            try {
                const response = await fetch('/api/admin/localidades?limit=100');
                const data = await response.json();
                
                if (data.success) {
                    this.availableLocalidades = data.data || [];
                }
            } catch (error) {
                console.error('Error loading localidades:', error);
                this.availableLocalidades = [];
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createCircuitosModule = createCircuitosModule;
} 