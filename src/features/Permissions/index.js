// Permissions functionality for admin panel
function createPermissionsModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        permissions: [],

        // Modal state (for Alpine.js templates)
        showPermissionModal: false,
        showPermissionViewModal: false,
        isEditingPermission: false,
        viewingPermission: {},
        permissionForm: {
            name: '',
            display_name: '',
            description: '',
            resource: '',
            action: ''
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
            console.log('🔐 Initializing Permissions module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('permissions-content');
            if (!container) return;

            try {
                // Update current state
                this.currentPageNum = page;
                this.pageSize = limit;
                this.currentSearch = search;
                this.currentFilters = filters;

                // Build query parameters (permissions usually don't have pagination)
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });

                const response = await fetch(`/api/admin/permissions?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    container.innerHTML = this.renderTable({ ...data, data: data.data });
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load permissions error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading permissions: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(permissionData = null) {
            // Guard against unwanted executions
            if (this.showPermissionModal === true) {
                console.warn('Permission modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingPermission = !!permissionData;
            
            // Reset or populate form
            if (permissionData) {
                this.permissionForm = {
                    id: permissionData.id,
                    name: permissionData.name || '',
                    display_name: permissionData.display_name || '',
                    description: permissionData.description || '',
                    resource: permissionData.resource || '',
                    action: permissionData.action || ''
                };
            } else {
                this.permissionForm = {
                    name: '',
                    display_name: '',
                    description: '',
                    resource: '',
                    action: ''
                };
            }
            
            this.showPermissionModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.permissionForm.name || !this.permissionForm.display_name) {
                this.showNotification('Permission name and display name are required.', 'error');
                return;
            }

            const permissionData = {
                name: this.permissionForm.name,
                display_name: this.permissionForm.display_name,
                description: this.permissionForm.description,
                resource: this.permissionForm.resource,
                action: this.permissionForm.action
            };

            try {
                const url = this.permissionForm.id ? `/api/admin/permissions/${this.permissionForm.id}` : '/api/admin/permissions';
                const method = this.permissionForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(permissionData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`Permission ${this.permissionForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving permission:', error);
                this.showNotification('Error saving permission. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            this.showNotification('System permissions cannot be deleted for security reasons.', 'warning');
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'permissions-table',
                entityType: 'permission',
                emptyMessage: 'No permissions found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'resource',
                        label: 'Resource',
                        placeholder: 'All Resources',
                        options: [
                            { value: 'pages', label: 'Pages' },
                            { value: 'stories', label: 'Stories' },
                            { value: 'modules', label: 'Modules' },
                            { value: 'menus', label: 'Menus' },
                            { value: 'users', label: 'Users' },
                            { value: 'roles', label: 'Roles' },
                            { value: 'permissions', label: 'Permissions' },
                            { value: 'categories', label: 'Categories' }
                        ]
                    },
                    {
                        field: 'action',
                        label: 'Action',
                        placeholder: 'All Actions',
                        options: [
                            { value: 'create', label: 'Create' },
                            { value: 'read', label: 'Read' },
                            { value: 'update', label: 'Update' },
                            { value: 'delete', label: 'Delete' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Permission',
                        field: 'name',
                        type: 'custom',
                        render: (entity) => `
                            <div>
                                <strong>${entity.display_name}</strong>
                                <br><small class="text-muted">${entity.name}</small>
                            </div>
                        `
                    },
                    {
                        header: 'Resource',
                        field: 'resource',
                        type: 'badge',
                        badgeClass: () => 'bg-primary'
                    },
                    {
                        header: 'Action',
                        field: 'action',
                        type: 'badge',
                        badgeClass: (value) => {
                            switch (value) {
                                case 'create': return 'bg-success';
                                case 'read': return 'bg-info';
                                case 'update': return 'bg-warning';
                                case 'delete': return 'bg-danger';
                                default: return 'bg-secondary';
                            }
                        }
                    },
                    {
                        header: 'Description',
                        field: 'description',
                        type: 'custom',
                        render: (entity) => entity.description || '<span class="text-muted">No description</span>'
                    },
                    {
                        header: 'Roles',
                        field: 'roles_count',
                        type: 'custom',
                        render: (entity) => `
                            <span class="badge bg-secondary">${entity.roles_count || 0} roles</span>
                        `
                    }
                ],
                showViewButton: true,
                disableEdit: true, // Permissions are usually system-defined
                disableDelete: true, // Permissions shouldn't be deleted typically
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
        edit(permissionId) {
            console.log('🔥 edit called with permissionId:', permissionId);
            this.showNotification('System permissions cannot be edited for security reasons.', 'warning');
        },

        // 8. VIEW - Show view modal
        async view(permissionId) {
            try {
                const response = await fetch(`/api/admin/permissions/${permissionId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingPermission = data.data;
                    this.showPermissionViewModal = true;
                } else {
                    this.showNotification('Error loading permission details', 'error');
                }
            } catch (error) {
                console.error('Error viewing permission:', error);
                this.showNotification('Error loading permission details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showPermissionModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showPermissionViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in permissions section
            if (this.setSection) {
                this.setSection('permissions');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showPermissionModal = false;
            this.permissionForm = {
                name: '',
                display_name: '',
                description: '',
                resource: '',
                action: ''
            };
            this.isEditingPermission = false;
        },

        closeViewModal() {
            this.showPermissionViewModal = false;
            this.viewingPermission = {};
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        getActionBadgeClass(action) {
            switch (action) {
                case 'create': return 'bg-success';
                case 'read': return 'bg-info';
                case 'update': return 'bg-warning';
                case 'delete': return 'bg-danger';
                default: return 'bg-secondary';
            }
        },

        getResourceDisplayName(resource) {
            const resourceMap = {
                'pages': 'Pages',
                'stories': 'Stories',
                'modules': 'Modules',
                'menus': 'Menus',
                'users': 'Users',
                'roles': 'Roles',
                'permissions': 'Permissions',
                'categories': 'Categories'
            };
            return resourceMap[resource] || resource;
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createPermissionsModule = createPermissionsModule;
} 