// Categories functionality for admin panel
function createCategoriesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        categories: [],
        availableParents: [],
        
        // Modal state (for Alpine.js templates)
        showCategoryModal: false,
        showCategoryViewModal: false,
        isEditingCategory: false,
        viewingCategory: {},
        categoryForm: {
            name: '',
            slug: '',
            description: '',
            parent_id: '',
            color: '#007cba',
            icon: '',
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
            console.log('🏷️ Initializing Categories module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('categories-content');
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

                const response = await fetch(`/api/admin/categories?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.categories = data.data || [];
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load categories error:', error);
                this.categories = [];
                container.innerHTML = `<div class="alert alert-danger">Error loading categories: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(categoryData = null) {
            // Guard against unwanted executions
            if (this.showCategoryModal === true) {
                console.warn('Category modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingCategory = !!categoryData;
            
            // Reset or populate form
            if (categoryData) {
                this.categoryForm = {
                    id: categoryData.id,
                    name: categoryData.name || '',
                    slug: categoryData.slug || '',
                    description: categoryData.description || '',
                    parent_id: categoryData.parent_id || '',
                    color: categoryData.color || '#007cba',
                    icon: categoryData.icon || '',
                    status: categoryData.status || 'active'
                };
            } else {
                this.categoryForm = {
                    name: '',
                    slug: '',
                    description: '',
                    parent_id: '',
                    color: '#007cba',
                    icon: '',
                    status: 'active'
                };
            }
            
            this.loadAvailableParents();
            this.showCategoryModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.categoryForm.name || !this.categoryForm.slug) {
                this.showNotification('Category name and slug are required.', 'error');
                return;
            }

            try {
                const url = this.categoryForm.id ? `/api/admin/categories/${this.categoryForm.id}` : '/api/admin/categories';
                const method = this.categoryForm.id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.categoryForm)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(
                        `Category ${this.categoryForm.id ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    this.closeModal();
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving category:', error);
                this.showNotification('Error saving category. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm('Are you sure you want to delete this category?')) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/categories/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Category deleted successfully!', 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                this.showNotification('Error deleting category. Please try again.', 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'categories-table',
                entityType: 'category',
                emptyMessage: 'No categories found.',
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
                                ${entity.color ? `<div class="category-color-box me-2" style="background-color: ${entity.color}; width: 20px; height: 20px; border-radius: 3px;"></div>` : ''}
                                ${entity.icon ? `<i class="${entity.icon} me-2"></i>` : ''}
                                <strong>${entity.name}</strong>
                            </div>
                        `
                    },
                    {
                        header: 'Slug',
                        field: 'slug',
                        type: 'code'
                    },
                    {
                        header: 'Parent',
                        field: 'parent',
                        type: 'custom',
                        render: (entity) => entity.parent ? entity.parent.name : '<span class="text-muted">None</span>'
                    },
                    {
                        header: 'Status',
                        field: 'status',
                        type: 'badge',
                        badgeClass: (value) => value === 'active' ? 'bg-success' : 'bg-warning'
                    },
                    {
                        header: 'Stories',
                        field: 'stories_count',
                        type: 'custom',
                        render: (entity) => `<span class="badge bg-info">${entity.stories_count || 0}</span>`
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
        edit(categoryId) {
            console.log('🔥 edit called with categoryId:', categoryId);
            
            if (categoryId) {
                this.loadCategoryForEditing(categoryId);
            } else {
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(categoryId) {
            try {
                const response = await fetch(`/api/admin/categories/${categoryId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.viewingCategory = data.data;
                    this.showCategoryViewModal = true;
                } else {
                    this.showNotification('Error loading category details', 'error');
                }
            } catch (error) {
                console.error('Error viewing category:', error);
                this.showNotification('Error loading category details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showCategoryModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showCategoryViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in categories section
            if (this.setSection) {
                this.setSection('categories');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showCategoryModal = false;
            this.categoryForm = {
                name: '',
                slug: '',
                description: '',
                parent_id: '',
                color: '#007cba',
                icon: '',
                status: 'active'
            };
            this.isEditingCategory = false;
        },

        closeViewModal() {
            this.showCategoryViewModal = false;
            this.viewingCategory = {};
        },

        editFromView() {
            const categoryData = this.viewingCategory;
            this.closeViewModal();
            this.edit(categoryData.id);
        },

        // ============================================================================
        // CATEGORIES SPECIFIC EXTENSIONS
        // ============================================================================

        async loadCategoryForEditing(categoryId) {
            try {
                const response = await fetch(`/api/admin/categories/${categoryId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading category for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading category:', error);
                this.showNotification('Error loading category. Please try again.', 'error');
            }
        },

        async loadAvailableParents(excludeId = null) {
            try {
                const response = await fetch('/api/admin/categories?limit=100');
                const data = await response.json();
                
                if (data.success) {
                    this.availableParents = data.data.filter(cat => 
                        cat.id != excludeId // Exclude current category to prevent circular reference
                    );
                }
            } catch (error) {
                console.error('Error loading parent categories:', error);
                this.availableParents = [];
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createCategoriesModule = createCategoriesModule;
} 