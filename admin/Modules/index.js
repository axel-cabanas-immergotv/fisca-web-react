// Modules functionality for admin panel
function createModulesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        currentModule: null,

        // Modal state (for Alpine.js templates)
        showModuleModal: false,
        showModuleViewModal: false,
        isEditingModule: false,
        viewingModule: {},
        moduleForm: {
            type: '',
            display_name: '',
            content: '',
            custom_css: ''
        },

        // Pagination state
        currentPageNum: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},

        // Editor state (for full editor)
        editorMode: 'visual',
        moduleCode: '',
        moduleEditor: null,

        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions for all entities)
        // ============================================================================

        // 1. INIT - Initialize entity when entering section
        async init() {
            console.log('🧩 Initializing Modules module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('modules-content');
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

                const response = await fetch(`/api/admin/modules?${params}`);
                
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
                console.error('Load modules error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading modules: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(moduleData = null) {
            // Guard against unwanted executions
            if (this.showModuleModal === true) {
                console.warn('Module modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingModule = !!moduleData;
            
            // Reset or populate form
            if (moduleData) {
                this.moduleForm = {
                    id: moduleData.id,
                    type: moduleData.type || '',
                    display_name: moduleData.display_name || '',
                    content: moduleData.content || '',
                    custom_css: moduleData.custom_css || ''
                };
            } else {
                this.moduleForm = {
                    type: '',
                    display_name: '',
                    content: '',
                    custom_css: ''
                };
            }
            
            this.showModuleModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            // Determine if we're in modal mode or editor mode
            if (this.showModuleModal) {
                return this._saveFromModal();
            } else {
                return this._saveFromEditor(id);
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this module?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/modules/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Module deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting module:`, error);
                this.showNotification(`Error deleting module. Please try again.`, 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'modules-table',
                entityType: 'module',
                emptyMessage: 'No modules found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'type',
                        label: 'Type',
                        placeholder: 'All Types',
                        options: [
                            { value: 'header', label: 'Header' },
                            { value: 'footer', label: 'Footer' },
                            { value: 'sidebar', label: 'Sidebar' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Module',
                        field: 'display_name',
                        type: 'custom',
                        render: (entity) => `
                            <div>
                                <strong>${entity.display_name}</strong>
                                <br><small class="text-muted">${this.getModuleTypeLabel(entity.type)}</small>
                            </div>
                        `
                    },
                    {
                        header: 'Type',
                        field: 'type',
                        type: 'badge',
                        badgeClass: (value) => {
                            switch(value) {
                                case 'header': return 'bg-primary';
                                case 'footer': return 'bg-secondary';
                                case 'sidebar': return 'bg-info';
                                default: return 'bg-dark';
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
                hideDeleteButton: (entity) => entity.type === 'header' || entity.type === 'footer', // System modules
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
        edit(moduleId) {
            console.log('🔥 edit called with moduleId:', moduleId);
            
            // Switch to module editor view
            if (this.setSection) {
                this.setSection('module-editor');
            }
            
            this.editorMode = 'visual';
            
            if (moduleId) {
                this.loadForEditing(moduleId);
            } else {
                // New module in full editor
                this.currentModule = {
                    id: null,
                    type: '',
                    display_name: '',
                    content: null,
                    custom_css: ''
                };
                this.moduleCode = '';
                this.initializeEditor();
            }
        },

        // 8. VIEW - Show view modal
        async view(moduleId) {
            try {
                const response = await fetch(`/api/admin/modules/${moduleId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingModule = data.data;
                    this.showModuleViewModal = true;
                } else {
                    this.showNotification('Error loading module details', 'error');
                }
            } catch (error) {
                console.error('Error viewing module:', error);
                this.showNotification('Error loading module details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If modal is open, close it
            if (this.showModuleModal) {
                this.closeModal();
                return;
            }
            
            // If view modal is open, close it
            if (this.showModuleViewModal) {
                this.closeViewModal();
                return;
            }
            
            // If in module editor, return to modules list
            if (this.currentSection === 'module-editor') {
                this.backToList();
                return;
            }
            
            // Default: ensure we're in modules section
            if (this.setSection) {
                this.setSection('modules');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showModuleModal = false;
            this.moduleForm = {
                type: '',
                display_name: '',
                content: '',
                custom_css: ''
            };
            this.isEditingModule = false;
        },

        closeViewModal() {
            this.showModuleViewModal = false;
            this.viewingModule = {};
        },

        editFromView() {
            const moduleData = this.viewingModule;
            this.closeViewModal();
            this.edit(moduleData.id);
        },

        // ============================================================================
        // FULL EDITOR EXTENSIONS (for complete editor pages)
        // ============================================================================

        async loadForEditing(moduleId) {
            try {
                const response = await fetch(`/api/admin/modules/${moduleId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.currentModule = data.data;
                    
                    // Ensure custom_css is initialized (CRITICAL for Alpine.js binding)
                    if (!this.currentModule.custom_css) {
                        this.currentModule.custom_css = '';
                    }
                    
                    // Parse content from JSON string to object if necessary
                    try {
                        if (this.currentModule.content) {
                            if (typeof this.currentModule.content === 'string') {
                                this.currentModule.content = JSON.parse(this.currentModule.content);
                            }
                            this.moduleCode = JSON.stringify(this.currentModule.content, null, 2);
                        } else {
                            this.currentModule.content = { blocks: [] };
                            this.moduleCode = JSON.stringify({ blocks: [] }, null, 2);
                        }
                    } catch (contentError) {
                        console.warn('Invalid module content, using empty content:', contentError);
                        this.currentModule.content = { blocks: [] };
                        this.moduleCode = JSON.stringify({ blocks: [] }, null, 2);
                    }
                    
                    setTimeout(() => {
                        this.initializeEditor();
                    }, 100);
                    
                } else {
                    this.showNotification('Error loading module: ' + (data.message || 'Module not found'), 'error');
                    this.backToList();
                }
            } catch (error) {
                console.error('Error loading module:', error);
                this.showNotification('Error loading module. Please try again.', 'error');
                this.backToList();
            }
        },

        initializeEditor() {
            // Destroy existing editor if it exists
            if (this.moduleEditor) {
                this.moduleEditor.destroy();
                this.moduleEditor = null;
            }

            setTimeout(() => {
                try {
                    this.moduleEditor = createEditor({
                        holder: 'module-editor',
                        placeholder: 'Start building your module...',
                        data: this.currentModule.content || { blocks: [] },
                        onChange: () => {
                            if (this.editorMode === 'visual') {
                                this.syncToCode();
                            }
                        }
                    });

                    console.log('✅ Module Editor initialized successfully');
                } catch (error) {
                    console.error('Error initializing Module Editor:', error);
                }
            }, 200);
        },

        async syncToCode() {
            if (this.moduleEditor) {
                try {
                    const outputData = await this.moduleEditor.save();
                    if (outputData) {
                        this.moduleCode = JSON.stringify(outputData, null, 2);
                    }
                } catch (error) {
                    console.error('Error saving editor data:', error);
                }
            }
        },

        syncToVisual() {
            try {
                const parsedData = JSON.parse(this.moduleCode);
                
                if (this.currentModule) {
                    this.currentModule.content = parsedData;
                }
                
                this.initializeEditor();
                
            } catch (error) {
                console.error('Error parsing JSON:', error);
                this.showNotification('Invalid JSON format. Please check your code.', 'error');
            }
        },

        backToList() {
            // Destroy editor instance
            if (this.moduleEditor) {
                this.moduleEditor.destroy();
                this.moduleEditor = null;
            }
            
            // Reset editor state
            this.currentModule = null;
            this.moduleCode = '';
            this.editorMode = 'visual';
            
            // Go back to modules section
            this.setSection('modules');
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        getModuleContentBlocksCount() {
            if (!this.viewingModule.content) return 0;
            try {
                const parsed = typeof this.viewingModule.content === 'string' 
                    ? JSON.parse(this.viewingModule.content) 
                    : this.viewingModule.content;
                return parsed.blocks ? parsed.blocks.length : 0;
            } catch (error) {
                return 0;
            }
        },

        getModuleTypeLabel(type) {
            switch(type) {
                case 'header': return 'Header Module';
                case 'footer': return 'Footer Module';
                case 'sidebar': return 'Sidebar Module';
                default: return 'Custom Module';
            }
        },

        // ============================================================================
        // PRIVATE FUNCTIONS (internal implementation details)
        // ============================================================================

        async _saveFromModal() {
            if (!this.moduleForm.type || !this.moduleForm.display_name) {
                this.showNotification('Type and display name are required.', 'error');
                return;
            }

            const moduleData = {
                type: this.moduleForm.type,
                display_name: this.moduleForm.display_name,
                content: JSON.stringify({
                    time: Date.now(),
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: this.moduleForm.display_name,
                                level: 2
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: this.moduleForm.content || 'Module content will be here.'
                            }
                        }
                    ]
                }),
                custom_css: this.moduleForm.custom_css || ''
            };

            try {
                const url = this.moduleForm.id ? `/api/admin/modules/${this.moduleForm.id}` : '/api/admin/modules';
                const method = this.moduleForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(moduleData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`Module ${this.moduleForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving module:', error);
                this.showNotification('Error saving module. Please try again.', 'error');
            }
        },

        async _saveFromEditor(id = null) {
            if (!this.currentModule) return;

            try {
                // Get latest content from editor
                if (this.editorMode === 'visual' && this.moduleEditor) {
                    const outputData = await this.moduleEditor.save();
                    if (outputData) {
                        this.currentModule.content = outputData;
                    }
                } else if (this.editorMode === 'code') {
                    try {
                        this.currentModule.content = JSON.parse(this.moduleCode);
                    } catch (error) {
                        this.showNotification('Invalid JSON format in code editor. Please fix and try again.', 'error');
                        return;
                    }
                }

                const isUpdate = this.currentModule.id;

                // For new modules, validate required fields
                if (!isUpdate) {
                    if (!this.currentModule.type || !this.currentModule.type.trim()) {
                        this.showNotification('Module type is required.', 'warning');
                        return;
                    }
                    
                    if (!this.currentModule.display_name || !this.currentModule.display_name.trim()) {
                        this.showNotification('Module display name is required.', 'warning');
                        return;
                    }
                }

                // Prepare data for API
                const moduleData = {
                    ...this.currentModule,
                    content: JSON.stringify(this.currentModule.content)
                };

                const url = isUpdate ? `/api/admin/modules/${this.currentModule.id}` : '/api/admin/modules';
                const method = isUpdate ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(moduleData)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Module ${isUpdate ? 'updated' : 'created'} successfully!`, 'success');
                    
                    if (result.data) {
                        this.currentModule = result.data;
                    }
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving module:', error);
                this.showNotification('Error saving module. Please try again.', 'error');
            }
        },

        // ============================================================================
        // CUSTOM CSS FUNCTIONS
        // ============================================================================



        clearCustomCSS() {
            if (confirm('Are you sure you want to clear all custom CSS?')) {
                // Clear CSS in both contexts: modal (moduleForm) and editor (currentModule)
                if (this.showModuleModal && this.moduleForm) {
                    this.moduleForm.custom_css = '';
                }
                if (this.currentModule) {
                    this.currentModule.custom_css = '';
                }
                this.showNotification('Custom CSS cleared.', 'success');
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createModulesModule = createModulesModule;
} 