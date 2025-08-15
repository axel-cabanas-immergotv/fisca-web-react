// Affiliates functionality for admin panel
function createAffiliatesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        affiliates: [],
        
        // Modal state (for Alpine.js templates)
        showAffiliateModal: false,
        showAffiliateViewModal: false,
        isEditingAffiliate: false,
        viewingAffiliate: {},
        affiliateForm: {
            name: '',
            slug: '',
            description: '',
            domain: '',
            logo_url: '',
            primary_color: '#007cba',
            secondary_color: '#0073aa',
            settings: null,
            status: 'active',
            sort_order: 0
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
            console.log('🏢 Initializing Affiliates module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('affiliates-content');
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

                const response = await fetch(`/api/admin/affiliates?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.affiliates = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load affiliates error:', error);
                this.affiliates = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading affiliates: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(affiliateData = null) {
            // Guard against unwanted executions
            if (this.showAffiliateModal === true) {
                console.warn('Affiliate modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingAffiliate = !!affiliateData;
            
            // Reset or populate form
            if (affiliateData) {
                this.affiliateForm = {
                    id: affiliateData.id,
                    name: affiliateData.name || '',
                    slug: affiliateData.slug || '',
                    description: affiliateData.description || '',
                    domain: affiliateData.domain || '',
                    logo_url: affiliateData.logo_url || '',
                    primary_color: affiliateData.primary_color || '#007cba',
                    secondary_color: affiliateData.secondary_color || '#0073aa',
                    settings: affiliateData.settings || null,
                    status: affiliateData.status || 'active',
                    sort_order: affiliateData.sort_order || 0
                };
            } else {
                this.affiliateForm = {
                    name: '',
                    slug: '',
                    description: '',
                    domain: '',
                    logo_url: '',
                    primary_color: '#007cba',
                    secondary_color: '#0073aa',
                    settings: null,
                    status: 'active',
                    sort_order: 0
                };
            }
            
            this.showAffiliateModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.affiliateForm.name) {
                this.showNotification('Affiliate name is required.', 'error');
                return;
            }

            try {
                const url = this.affiliateForm.id ? `/api/admin/affiliates/${this.affiliateForm.id}` : '/api/admin/affiliates';
                const method = this.affiliateForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.affiliateForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Affiliate ${this.affiliateForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving affiliate:', error);
                this.showNotification('Error saving affiliate. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this affiliate?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/affiliates/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Affiliate deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting affiliate:', error);
                this.showNotification('Error deleting affiliate. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'affiliates-table',
                entityType: 'affiliate',
                emptyMessage: 'No affiliates found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                columns: [
                    {
                        header: 'Name',
                        field: 'name',
                        type: 'custom',
                        render: (entity) => `
                            <div class="d-flex align-items-center">
                                ${entity.primary_color ? `<div class="affiliate-color-box me-2" style="background-color: ${entity.primary_color}; width: 20px; height: 20px; border-radius: 3px;"></div>` : ''}
                                <div>
                                    <strong>${entity.name}</strong>
                                    ${entity.domain ? `<br><small class="text-muted">${entity.domain}</small>` : ''}
                                </div>
                            </div>
                        `
                    },
                    {
                        header: 'Slug',
                        field: 'slug',
                        type: 'code'
                    },
                    {
                        header: 'Description',
                        field: 'description',
                        type: 'custom',
                        render: (entity) => entity.description ? 
                            `<span class="text-truncate" style="max-width: 200px; display: inline-block;" title="${entity.description}">${entity.description}</span>` : 
                            '<span class="text-muted">No description</span>'
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
        edit(affiliateId) {
            console.log('🔥 edit called with affiliateId:', affiliateId);
            
            if (affiliateId) {
                this.loadAffiliateForEditing(affiliateId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(affiliateId) {
            try {
                const response = await fetch(`/api/admin/affiliates/${affiliateId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingAffiliate = data.data;
                    this.showAffiliateViewModal = true;
                } else {
                    this.showNotification('Error loading affiliate details', 'error');
                }
            } catch (error) {
                console.error('Error viewing affiliate:', error);
                this.showNotification('Error loading affiliate details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showAffiliateModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showAffiliateViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in affiliates section
            if (this.setSection) {
                this.setSection('affiliates');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showAffiliateModal = false;
            this.affiliateForm = {
                name: '',
                slug: '',
                description: '',
                domain: '',
                logo_url: '',
                primary_color: '#007cba',
                secondary_color: '#0073aa',
                settings: null,
                status: 'active',
                sort_order: 0
            };
            this.isEditingAffiliate = false;
        },

        closeViewModal() {
            this.showAffiliateViewModal = false;
            this.viewingAffiliate = {};
        },

        editFromView() {
            const affiliateData = this.viewingAffiliate;
            this.closeViewModal();
            this.edit(affiliateData.id);
        },

        // ============================================================================
        // AFFILIATES SPECIFIC EXTENSIONS
        // ============================================================================

        async loadAffiliateForEditing(affiliateId) {
            try {
                const response = await fetch(`/api/admin/affiliates/${affiliateId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading affiliate for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading affiliate:', error);
                this.showNotification('Error loading affiliate. Please try again.', 'error');
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createAffiliatesModule = createAffiliatesModule;
} 