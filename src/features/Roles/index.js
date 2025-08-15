// Roles functionality for admin panel
function createRolesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        roles: [],
        permissions: [],

        // Modal state (for Alpine.js templates)
        showRoleModal: false,
        showRoleViewModal: false,
        isEditingRole: false,
        viewingRole: {},
        roleForm: {
            name: '',
            display_name: '',
            description: '',
            permissions: []
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
            console.log('🛡️ Initializing Roles module...');
            await this.loadPermissions();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('roles-content');
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

                const response = await fetch(`/api/admin/roles?${params}`);
                
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
                console.error('Load roles error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading roles: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(roleData = null) {
            // Guard against unwanted executions
            if (this.showRoleModal === true) {
                console.warn('Role modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingRole = !!roleData;
            
            // Reset or populate form
            if (roleData) {
                this.roleForm = {
                    id: roleData.id,
                    name: roleData.name || '',
                    display_name: roleData.display_name || '',
                    description: roleData.description || '',
                    permissions: roleData.permissions ? roleData.permissions.map(p => p.id) : []
                };
            } else {
                this.roleForm = {
                    name: '',
                    display_name: '',
                    description: '',
                    permissions: []
                };
            }
            
            this.showRoleModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.roleForm.name || !this.roleForm.display_name) {
                this.showNotification('Role name and display name are required.', 'error');
                return;
            }

            const roleData = {
                name: this.roleForm.name,
                display_name: this.roleForm.display_name,
                description: this.roleForm.description,
                permissions: this.roleForm.permissions
            };

            try {
                const url = this.roleForm.id ? `/api/admin/roles/${this.roleForm.id}` : '/api/admin/roles';
                const method = this.roleForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(roleData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`Role ${this.roleForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving role:', error);
                this.showNotification('Error saving role. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this role?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/roles/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Role deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting role:`, error);
                this.showNotification(`Error deleting role. Please try again.`, 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'roles-table',
                entityType: 'role',
                emptyMessage: 'No roles found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                columns: [
                    {
                        header: 'Role',
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
                        header: 'Description',
                        field: 'description',
                        type: 'custom',
                        render: (entity) => entity.description || '<span class="text-muted">No description</span>'
                    },
                    {
                        header: 'Permissions',
                        field: 'permissions',
                        type: 'custom',
                        render: (entity) => `
                            <span class="badge bg-info">${entity.permissions ? entity.permissions.length : 0} permissions</span>
                        `
                    },
                    {
                        header: 'Users',
                        field: 'users_count',
                        type: 'custom',
                        render: (entity) => `
                            <span class="badge bg-secondary">${entity.users_count || 0} users</span>
                        `
                    },
                    {
                        header: 'Date',
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
        edit(roleId) {
            console.log('🔥 edit called with roleId:', roleId);
            
            if (roleId) {
                // Load role data for editing
                this.loadRoleForEditing(roleId);
            } else {
                // New role
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(roleId) {
            try {
                const response = await fetch(`/api/admin/roles/${roleId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingRole = data.data;
                    this.showRoleViewModal = true;
                } else {
                    this.showNotification('Error loading role details', 'error');
                }
            } catch (error) {
                console.error('Error viewing role:', error);
                this.showNotification('Error loading role details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showRoleModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showRoleViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in roles section
            if (this.setSection) {
                this.setSection('roles');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showRoleModal = false;
            this.roleForm = {
                name: '',
                display_name: '',
                description: '',
                permissions: []
            };
            this.isEditingRole = false;
        },

        closeViewModal() {
            this.showRoleViewModal = false;
            this.viewingRole = {};
        },

        editFromView() {
            const roleData = this.viewingRole;
            this.closeViewModal();
            this.edit(roleData.id);
        },

        // ============================================================================
        // ROLES SPECIFIC EXTENSIONS (permissions management, etc.)
        // ============================================================================

        async loadPermissions() {
            try {
                const response = await fetch('/api/admin/permissions');
                const data = await response.json();
                if (data.success) {
                    this.permissions = data.data;
                }
            } catch (error) {
                console.error('Error loading permissions:', error);
                this.permissions = [];
            }
        },

        async loadRoleForEditing(roleId) {
            try {
                const response = await fetch(`/api/admin/roles/${roleId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading role for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading role:', error);
                this.showNotification('Error loading role. Please try again.', 'error');
            }
        },

        togglePermission(permissionId) {
            const index = this.roleForm.permissions.indexOf(permissionId);
            if (index > -1) {
                this.roleForm.permissions.splice(index, 1);
            } else {
                this.roleForm.permissions.push(permissionId);
            }
        },

        hasPermission(permissionId) {
            return this.roleForm.permissions.includes(permissionId);
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        getRolePermissionsCount() {
            if (!this.viewingRole.permissions) return 0;
            return this.viewingRole.permissions.length;
        },

        renderPermissionsByResource() {
            if (!this.viewingRole.permissions) return '<p class="text-muted">No permissions assigned.</p>';
            
            // Group permissions by resource
            const grouped = {};
            this.viewingRole.permissions.forEach(permission => {
                const parts = permission.name.split('.');
                const resource = parts[0];
                const action = parts[1];
                
                if (!grouped[resource]) {
                    grouped[resource] = [];
                }
                grouped[resource].push(action);
            });

            let html = '';
            Object.keys(grouped).forEach(resource => {
                const actions = grouped[resource];
                html += `
                    <div class="mb-3">
                        <h6 class="text-capitalize fw-bold">${resource}</h6>
                        <div class="d-flex flex-wrap gap-1">
                            ${actions.map(action => `<span class="badge bg-primary">${action}</span>`).join('')}
                        </div>
                    </div>
                `;
            });

            return html || '<p class="text-muted">No permissions assigned.</p>';
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createRolesModule = createRolesModule;
} 