// Localidades functionality for admin panel
function createLocalidadesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        localidades: [],
        
        // Modal state (for Alpine.js templates)
        showLocalidadModal: false,
        showLocalidadViewModal: false,
        isEditingLocalidad: false,
        viewingLocalidad: {},
        localidadForm: {
            nombre: '',
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
            console.log('🏛️ Initializing Localidades module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('localidades-content');
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

                const response = await fetch(`/api/admin/localidades?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.localidades = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load localidades error:', error);
                this.localidades = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading localidades: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(localidadData = null) {
            // Guard against unwanted executions
            if (this.showLocalidadModal === true) {
                console.warn('Localidad modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingLocalidad = !!localidadData;
            
            // Reset or populate form
            if (localidadData) {
                this.localidadForm = {
                    id: localidadData.id,
                    nombre: localidadData.nombre || '',
                    status: localidadData.status || 'active'
                };
            } else {
                this.localidadForm = {
                    nombre: '',
                    status: 'active'
                };
            }
            
            this.showLocalidadModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.localidadForm.nombre) {
                this.showNotification('Localidad nombre is required.', 'error');
                return;
            }

            try {
                const url = this.localidadForm.id ? `/api/admin/localidades/${this.localidadForm.id}` : '/api/admin/localidades';
                const method = this.localidadForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.localidadForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Localidad ${this.localidadForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving localidad:', error);
                this.showNotification('Error saving localidad. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this localidad?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/localidades/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Localidad deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting localidad:', error);
                this.showNotification('Error deleting localidad. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'localidades-table',
                entityType: 'localidad',
                emptyMessage: 'No localidades found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                columns: [
                    {
                        header: 'Nombre',
                        field: 'nombre',
                        type: 'text'
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
        edit(localidadId) {
            console.log('🔥 edit called with localidadId:', localidadId);
            
            if (localidadId) {
                this.loadLocalidadForEditing(localidadId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(localidadId) {
            try {
                const response = await fetch(`/api/admin/localidades/${localidadId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingLocalidad = data.data;
                    this.showLocalidadViewModal = true;
                } else {
                    this.showNotification('Error loading localidad details', 'error');
                }
            } catch (error) {
                console.error('Error viewing localidad:', error);
                this.showNotification('Error loading localidad details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showLocalidadModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showLocalidadViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in localidades section
            if (this.setSection) {
                this.setSection('localidades');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showLocalidadModal = false;
            this.localidadForm = {
                nombre: '',
                status: 'active'
            };
            this.isEditingLocalidad = false;
        },

        closeViewModal() {
            this.showLocalidadViewModal = false;
            this.viewingLocalidad = {};
        },

        editFromView() {
            const localidadData = this.viewingLocalidad;
            this.closeViewModal();
            this.edit(localidadData.id);
        },

        // ============================================================================
        // LOCALIDADES SPECIFIC EXTENSIONS
        // ============================================================================

        async loadLocalidadForEditing(localidadId) {
            try {
                const response = await fetch(`/api/admin/localidades/${localidadId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading localidad for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading localidad:', error);
                this.showNotification('Error loading localidad. Please try again.', 'error');
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createLocalidadesModule = createLocalidadesModule;
} 