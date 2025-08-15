// Secciones functionality for admin panel
function createSeccionesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        secciones: [],
        
        // Modal state (for Alpine.js templates)
        showSeccionModal: false,
        showSeccionViewModal: false,
        isEditingSeccion: false,
        viewingSeccion: {},
        seccionForm: {
            numero: '',
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
            console.log('🔢 Initializing Secciones module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('secciones-content');
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

                const response = await fetch(`/api/admin/secciones?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.secciones = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load secciones error:', error);
                this.secciones = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading secciones: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(seccionData = null) {
            // Guard against unwanted executions
            if (this.showSeccionModal === true) {
                console.warn('Seccion modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingSeccion = !!seccionData;
            
            // Reset or populate form
            if (seccionData) {
                this.seccionForm = {
                    id: seccionData.id,
                    numero: seccionData.numero || '',
                    status: seccionData.status || 'active'
                };
            } else {
                this.seccionForm = {
                    numero: '',
                    status: 'active'
                };
            }
            
            this.showSeccionModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.seccionForm.numero) {
                this.showNotification('Seccion numero is required.', 'error');
                return;
            }

            try {
                const url = this.seccionForm.id ? `/api/admin/secciones/${this.seccionForm.id}` : '/api/admin/secciones';
                const method = this.seccionForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.seccionForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Seccion ${this.seccionForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving seccion:', error);
                this.showNotification('Error saving seccion. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this seccion?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/secciones/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Seccion deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting seccion:', error);
                this.showNotification('Error deleting seccion. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'secciones-table',
                entityType: 'seccion',
                emptyMessage: 'No secciones found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                columns: [
                    {
                        header: 'Numero',
                        field: 'numero',
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
        edit(seccionId) {
            console.log('🔥 edit called with seccionId:', seccionId);
            
            if (seccionId) {
                this.loadSeccionForEditing(seccionId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(seccionId) {
            try {
                const response = await fetch(`/api/admin/secciones/${seccionId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingSeccion = data.data;
                    this.showSeccionViewModal = true;
                } else {
                    this.showNotification('Error loading seccion details', 'error');
                }
            } catch (error) {
                console.error('Error viewing seccion:', error);
                this.showNotification('Error loading seccion details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showSeccionModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showSeccionViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in secciones section
            if (this.setSection) {
                this.setSection('secciones');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showSeccionModal = false;
            this.seccionForm = {
                numero: '',
                status: 'active'
            };
            this.isEditingSeccion = false;
        },

        closeViewModal() {
            this.showSeccionViewModal = false;
            this.viewingSeccion = {};
        },

        editFromView() {
            const seccionData = this.viewingSeccion;
            this.closeViewModal();
            this.edit(seccionData.id);
        },

        // ============================================================================
        // SECCIONES SPECIFIC EXTENSIONS
        // ============================================================================

        async loadSeccionForEditing(seccionId) {
            try {
                const response = await fetch(`/api/admin/secciones/${seccionId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading seccion for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading seccion:', error);
                this.showNotification('Error loading seccion. Please try again.', 'error');
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createSeccionesModule = createSeccionesModule;
} 