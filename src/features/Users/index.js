// Users functionality for admin panel
function createUsersModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        users: [],
        roles: [],
        affiliates: [],

        // Modal state (for Alpine.js templates)
        showUserModal: false,
        showUserViewModal: false,
        isEditingUser: false,
        viewingUser: {},
        userForm: {
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            password: '',
            role_id: null,
            status: 'active',
            affiliate_ids: []
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
            console.log('👥 Initializing Users module...');
            await this.loadRoles();
            await this.loadAffiliates();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('users-content');
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

                const response = await fetch(`/api/admin/users?${params}`);
                
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
                console.error('Load users error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading users: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(userData = null) {
            // Guard against unwanted executions
            if (this.showUserModal === true) {
                console.warn('User modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingUser = !!userData;
            
            // Reset or populate form
            if (userData) {
                this.userForm = {
                    id: userData.id,
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    password: '', // Never pre-fill password
                    role_id: userData.role_id || null,
                    status: userData.status || 'active',
                    affiliate_ids: userData.affiliate_ids || []
                };
            } else {
                this.userForm = {
                    first_name: '',
                    last_name: '',
                    username: '',
                    email: '',
                    password: '',
                    role_id: null,
                    status: 'active',
                    affiliate_ids: []
                };
            }
            
            this.showUserModal = true;
            
            // Initialize affiliates selector after modal is shown
            setTimeout(() => {
                console.log('🔥 initAffiliatesSelector called');
                this.initAffiliatesSelector();
            }, 100);
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            if (!this.userForm.first_name || !this.userForm.last_name || !this.userForm.email) {
                this.showNotification('First name, last name, and email are required.', 'error');
                return;
            }

            // For new users, password is required
            if (!this.isEditingUser && !this.userForm.password) {
                this.showNotification('Password is required for new users.', 'error');
                return;
            }

            const userData = {
                first_name: this.userForm.first_name,
                last_name: this.userForm.last_name,
                username: this.userForm.username,
                email: this.userForm.email,
                role_id: this.userForm.role_id,
                status: this.userForm.status,
                affiliate_ids: this.userForm.affiliate_ids
            };

            // Only include password if it's provided
            if (this.userForm.password) {
                userData.password = this.userForm.password;
            }

            try {
                const url = this.userForm.id ? `/api/admin/users/${this.userForm.id}` : '/api/admin/users';
                const method = this.userForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`User ${this.userForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving user:', error);
                this.showNotification('Error saving user. Please try again.', 'error');
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this user?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/users/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`User deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting user:`, error);
                this.showNotification(`Error deleting user. Please try again.`, 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'users-table',
                entityType: 'user',
                emptyMessage: 'No users found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'role_id',
                        label: 'Role',
                        placeholder: 'All Roles',
                        options: this.roles.map(role => ({
                            value: role.id.toString(),
                            label: role.name
                        }))
                    },
                    {
                        field: 'status',
                        label: 'Status',
                        placeholder: 'All Statuses',
                        options: [
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'suspended', label: 'Suspended' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Name',
                        field: 'name',
                        type: 'custom',
                        render: (entity) => `
                            <div>
                                <strong>${entity.first_name} ${entity.last_name}</strong>
                                <br><small class="text-muted">${entity.email}</small>
                            </div>
                        `
                    },
                    {
                        header: 'Username',
                        field: 'username',
                        type: 'text'
                    },
                    {
                        header: 'Role',
                        field: 'role',
                        type: 'custom',
                        render: (entity) => entity.role?.name ? 
                            `<span class="badge bg-primary">${entity.role.name}</span>` : 
                            '<span class="text-muted">No Role</span>'
                    },
                    {
                        header: 'Status',
                        field: 'status',
                        type: 'badge',
                        badgeClass: (value) => {
                            switch(value) {
                                case 'active': return 'bg-success';
                                case 'inactive': return 'bg-warning';
                                case 'suspended': return 'bg-danger';
                                default: return 'bg-secondary';
                            }
                        }
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
        edit(userId) {
            console.log('🔥 edit called with userId:', userId);
            
            if (userId) {
                // Load user data for editing
                this.loadUserForEditing(userId);
            } else {
                // New user
                this.new();
            }
        },

        // 8. VIEW - Show view modal
        async view(userId) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingUser = data.data;
                    this.showUserViewModal = true;
                } else {
                    this.showNotification('Error loading user details', 'error');
                }
            } catch (error) {
                console.error('Error viewing user:', error);
                this.showNotification('Error loading user details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showUserModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showUserViewModal) {
                this.closeViewModal();
                return;
            }
            
            // Default: ensure we're in users section
            if (this.setSection) {
                this.setSection('users');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showUserModal = false;
            this.userForm = {
                first_name: '',
                last_name: '',
                username: '',
                email: '',
                password: '',
                role_id: null,
                status: 'active',
                affiliate_ids: []
            };
            this.isEditingUser = false;
        },

        closeViewModal() {
            this.showUserViewModal = false;
            this.viewingUser = {};
        },

        editFromView() {
            const userData = this.viewingUser;
            this.closeViewModal();
            this.edit(userData.id);
        },

        // ============================================================================
        // USERS SPECIFIC EXTENSIONS (roles, password management, etc.)
        // ============================================================================

        async loadRoles() {
            try {
                const response = await fetch('/api/admin/roles');
                const data = await response.json();
                if (data.success) {
                    this.roles = data.data;
                }
            } catch (error) {
                console.error('Error loading roles:', error);
                this.roles = [];
            }
        },

        async loadAffiliates() {
            try {
                const response = await fetch('/api/admin/affiliates');
                const data = await response.json();
                if (data.success) {
                    this.affiliates = data.data;
                }
            } catch (error) {
                console.error('Error loading affiliates:', error);
                this.affiliates = [];
            }
        },

        async loadUserForEditing(userId) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.new(data.data); // Use new() to populate form
                } else {
                    this.showNotification('Error loading user for editing', 'error');
                }
            } catch (error) {
                console.error('Error loading user:', error);
                this.showNotification('Error loading user. Please try again.', 'error');
            }
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        getRoleName(roleId) {
            const role = this.roles.find(r => r.id === roleId);
            return role ? role.name : 'No Role';
        },

        getUserStatusClass(status) {
            switch(status) {
                case 'active': return 'bg-success';
                case 'inactive': return 'bg-warning';
                case 'suspended': return 'bg-danger';
                default: return 'bg-secondary';
            }
        },

        // ============================================================================
        // AFFILIATES SELECTOR MANAGEMENT
        // ============================================================================

        initAffiliatesSelector() {
            const selectorElement = document.getElementById('user-affiliates');
            if (!selectorElement) {
                console.warn('Affiliates selector element not found');
                return;
            }

            // Create new instance
            this.affiliatesSelector = new GenericMultiSelect(selectorElement, {
                entity: 'affiliates',
                value: 'id',
                label: 'name',
                multiple: false,
                placeholder: 'Search and select affiliates...',
                selectedValues: this.userForm.affiliate_ids || [],
                onSelectionChange: (selectedValues) => {
                    this.userForm.affiliate_ids = selectedValues;
                }
            });
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createUsersModule = createUsersModule;
} 