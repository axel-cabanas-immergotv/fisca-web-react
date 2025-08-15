// Permissions Matrix Module
function createPermissionsModule() {
    return {
        // State variables
        matrixData: null,
        loading: false,

        // 1. INIT - Initialize the module
        init() {
            console.log('Permissions Matrix module initialized');
            this.loadMatrix();
        },

        // 2. LOAD - Load matrix data
        async loadMatrix() {
            this.loading = true;
            try {
                const response = await fetch('/api/admin/permissions');
                const result = await response.json();

                if (result.success) {
                    this.matrixData = result.data;
                    this.showNotification('Permissions matrix loaded successfully', 'success');
                } else {
                    this.showNotification(result.message || 'Failed to load permissions matrix', 'error');
                }
            } catch (error) {
                console.error('Error loading permissions matrix:', error);
                this.showNotification('Error loading permissions matrix', 'error');
            } finally {
                this.loading = false;
            }
        },

        // 3. NEW - Not applicable for matrix view
        new() {
            this.showNotification('Use the checkboxes to assign permissions to roles', 'info');
        },

        // 4. SAVE - Not applicable for matrix view  
        async save() {
            this.showNotification('Changes are saved automatically when you toggle checkboxes', 'info');
        },

        // 5. DELETE - Not applicable for matrix view
        async delete(id) {
            this.showNotification('Use Roles section to manage roles', 'info');
        },

        // 6. RENDER_TABLE - Not applicable (using custom matrix)
        renderTable() {
            // Matrix is rendered directly in HTML template
        },

        // 7. EDIT - Not applicable for matrix view
        edit(id) {
            this.showNotification('Use the checkboxes to modify permissions', 'info');
        },

        // 8. VIEW - Not applicable for matrix view
        view(id) {
            this.showNotification('All permission details are visible in the matrix', 'info');
        },

        // 9. BACK - Not applicable for matrix view
        back() {
            this.showNotification('Use the sidebar to navigate to other sections', 'info');
        },

        // Toggle permission assignment for a role
        async togglePermissionAssignment(permissionId, roleId, isAssigned) {
            try {
                const response = await fetch('/api/admin/permissions/assign-role', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        permissionId: permissionId,
                        roleId: roleId,
                        assign: isAssigned
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // Update local matrix data
                    const matrixRow = this.matrixData.matrix.find(row => row.permission.id === permissionId);
                    if (matrixRow) {
                        matrixRow.roleAssignments[roleId] = isAssigned;
                    }

                    this.showNotification(result.message, 'success');
                } else {
                    this.showNotification(result.message || 'Failed to update permission assignment', 'error');
                    // Revert checkbox state on failure
                    await this.loadMatrix();
                }
            } catch (error) {
                console.error('Error toggling permission assignment:', error);
                this.showNotification('Error updating permission assignment', 'error');
                // Revert checkbox state on failure
                await this.loadMatrix();
            }
        },

        // Get CSS class for entity badges
        getEntityBadgeClass(entity) {
            const entityClasses = {
                'stories': 'badge bg-primary',
                'pages': 'badge bg-info',
                'categories': 'badge bg-warning text-dark',
                'users': 'badge bg-success',
                'roles': 'badge bg-danger',
                'permissions': 'badge bg-dark',
                'modules': 'badge bg-secondary',
                'menus': 'badge bg-light text-dark',
                'affiliates': 'badge bg-purple',
                'localidades': 'badge bg-teal',
                'secciones': 'badge bg-orange',
                'circuitos': 'badge bg-cyan',
                'escuelas': 'badge bg-indigo',
                'mesas': 'badge bg-pink',
                'ciudadanos': 'badge bg-brown'
            };
            return entityClasses[entity] || 'badge bg-secondary';
        },

        // Count total assignments in the matrix
        getAssignedCount() {
            if (!this.matrixData || !this.matrixData.matrix) return 0;
            
            return this.matrixData.matrix.reduce((total, row) => {
                return total + Object.values(row.roleAssignments).filter(assigned => assigned).length;
            }, 0);
        },

        // Utility: Show notification
        showNotification(message, type = 'info') {
            if (window.showNotification) {
                window.showNotification(message, type);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }
    };
}

// Global function to create the module
window.createPermissionsModule = createPermissionsModule; 