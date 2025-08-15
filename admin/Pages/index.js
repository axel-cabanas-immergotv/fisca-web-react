// Pages functionality for admin panel
function createPagesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        currentPage: {
            title: '',
            path: '',
            content: null,
            seo_title: '',
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            meta_robots: 'index,follow',
            status: 'draft',
            custom_css: ''
        },
        
        // Modal state (for Alpine.js templates)
        showPageModal: false,
        showPageViewModal: false,
        isEditingPage: false,
        viewingPage: {},
        pageForm: {
            title: '',
            slug: '',
            status: 'draft',
            content: ''
        },

        // Pagination state
        currentPageNum: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},

        // Editor state (for full editor)
        editorMode: 'visual',
        pageCode: '',
        pageEditor: null,

        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions for all entities)
        // ============================================================================

        // 1. INIT - Initialize entity when entering section
        async init() {
            console.log('📄 Initializing Pages module...');
            console.log('📄 Initial showPageModal state:', this.showPageModal);
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('pages-content');
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

                const response = await fetch(`/api/admin/pages?${params}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    const text = await response.text();
                    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
                }

                if (data.success) {
                    container.innerHTML = this.renderTable(data);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Load pages error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading pages: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(pageData = null) {
            // Guard against unwanted executions
            if (this.showPageModal === true) {
                console.warn('Modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingPage = !!pageData;
            
            // Reset or populate form
            if (pageData) {
                this.pageForm = {
                    id: pageData.id,
                    title: pageData.title || '',
                    slug: pageData.slug || '',
                    status: pageData.status || 'draft',
                    content: pageData.content || ''
                };
            } else {
                this.pageForm = {
                    title: '',
                    slug: '',
                    status: 'draft',
                    content: ''
                };
            }
            
            this.showPageModal = true;
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            // Determine if we're in modal mode or editor mode
            if (this.showPageModal) {
                return this._saveFromModal();
            } else {
                return this._saveFromEditor(id);
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this page?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/pages/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Page deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting page:`, error);
                this.showNotification(`Error deleting page. Please try again.`, 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'pages-table',
                entityType: 'page',
                emptyMessage: 'No pages found.',
                adminAppInstance: this,
                enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                filters: [
                    {
                        field: 'status',
                        label: 'Status',
                        placeholder: 'All Statuses',
                        options: [
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Draft' }
                        ]
                    }
                ],
                columns: [
                    {
                        header: 'Title',
                        field: 'title',
                        type: 'custom',
                        render: (entity) => `
                            <strong>${entity.title}</strong>
                            ${entity.is_system ? '<span class="badge bg-info ms-2">System</span>' : ''}
                        `
                    },
                    {
                        header: 'Slug',
                        field: 'slug',
                        type: 'code'
                    },
                    {
                        header: 'Status',
                        field: 'status',
                        type: 'badge',
                        badgeClass: (value) => value === 'published' ? 'bg-success' : 'bg-warning'
                    },
                    {
                        header: 'Date',
                        field: 'created_at',
                        type: 'date'
                    }
                ],
                showViewButton: true,
                viewUrl: (entity) => `/${entity.slug}`,
                conditionalDelete: (entity) => !entity.is_system,
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
        edit(pageId) {
            console.log('🔥 edit called with pageId:', pageId);
            
            // Switch to page editor view
            if (this.setSection) {
                this.setSection('page-editor');
            }
            
            this.editorMode = 'visual';
            
            if (pageId) {
                this.loadForEditing(pageId);
            } else {
                // New page in full editor
                this.currentPage = {
                    title: 'New Page',
                    path: '',
                    content: null,
                    seo_title: '',
                    meta_title: '',
                    meta_description: '',
                    meta_keywords: '',
                    meta_robots: 'index,follow',
                    status: 'draft',
                    custom_css: ''
                };
                this.pageCode = '';
                this.initializeEditor();
            }
        },

        // 8. VIEW - Show view modal
        async view(pageId) {
            try {
                const response = await fetch(`/api/admin/pages/${pageId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingPage = data.data;
                    this.showPageViewModal = true;
                } else {
                    this.showNotification('Error loading page details', 'error');
                }
            } catch (error) {
                console.error('Error viewing page:', error);
                this.showNotification('Error loading page details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() { 
            // Default: ensure we're in pages section
            if (this.setSection) {
                this.setSection('pages');
            }
        },


        // ============================================================================
        // FULL EDITOR EXTENSIONS (for complete editor pages)
        // ============================================================================

        async loadForEditing(pageId) {
            try {
                const response = await fetch(`/api/admin/pages/${pageId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.currentPage = data.data;
                    
                    // Map slug to path for the editor
                    if (this.currentPage.slug && !this.currentPage.path) {
                        this.currentPage.path = this.currentPage.slug === 'home' ? '/' : `/${this.currentPage.slug}`;
                    }
                    
                    // Parse content from JSON string to object if necessary
                    try {
                        if (this.currentPage.content) {
                            if (typeof this.currentPage.content === 'string') {
                                this.currentPage.content = JSON.parse(this.currentPage.content);
                            }
                            this.pageCode = JSON.stringify(this.currentPage.content, null, 2);
                        } else {
                            this.currentPage.content = { blocks: [] };
                            this.pageCode = JSON.stringify({ blocks: [] }, null, 2);
                        }
                    } catch (contentError) {
                        console.warn('Invalid page content, using empty content:', contentError);
                        this.currentPage.content = { blocks: [] };
                        this.pageCode = JSON.stringify({ blocks: [] }, null, 2);
                    }
                    
                    setTimeout(() => {
                        this.initializeEditor();
                    }, 100);
                } else {
                    this.showNotification('Error loading page: ' + (data.message || 'Page not found'), 'error');
                    this.backToList();
                }
            } catch (error) {
                console.error('Error loading page:', error);
                this.showNotification('Error loading page. Please try again.', 'error');
                this.backToList();
            }
        },

        initializeEditor() {
            // Destroy existing editor if it exists
            if (this.pageEditor) {
                this.pageEditor.destroy();
                this.pageEditor = null;
            }

            setTimeout(() => {
                try {
                    this.pageEditor = createEditor({
                        holder: 'page-editor',
                        placeholder: 'Start creating your page layout...',
                        data: this.currentPage.content || { blocks: [] },
                        onChange: () => {
                            if (this.editorMode === 'visual') {
                                this.syncToCode();
                            }
                        }
                    });

                    console.log('✅ Page Editor initialized successfully');
                } catch (error) {
                    console.error('Error initializing Page Editor:', error);
                }
            }, 200);
        },


        async syncToCode() {
            if (this.pageEditor) {
                try {
                    const outputData = await this.pageEditor.save();
                    if (outputData) {
                        this.pageCode = JSON.stringify(outputData, null, 2);
                    }
                } catch (error) {
                    console.error('Error saving editor data:', error);
                }
            }
        },

        syncToVisual() {
            try {
                const parsedData = JSON.parse(this.pageCode);
                
                if (this.currentPage) {
                    this.currentPage.content = parsedData;
                }
                
                this.initializeEditor();
                
            } catch (error) {
                console.error('Error parsing JSON:', error);
                this.showNotification('Invalid JSON format. Please check your code.', 'error');
            }
        },

        preview() {
            if (!this.currentPage.path || this.currentPage.path.trim() === '') {
                this.showNotification('Please set a page path before previewing.', 'warning');
                return;
            }

            const previewUrl = this.currentPage.path;
            window.open(previewUrl, '_blank');
            this.showNotification('Opening preview in new tab...', 'info', 2000);
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        getContentBlocksCount() {
            if (!this.viewingPage.content) return 0;
            try {
                const parsed = typeof this.viewingPage.content === 'string' 
                    ? JSON.parse(this.viewingPage.content) 
                    : this.viewingPage.content;
                return parsed.blocks ? parsed.blocks.length : 0;
            } catch (error) {
                return 0;
            }
        },

        // ============================================================================
        // PRIVATE FUNCTIONS (internal implementation details)
        // ============================================================================

        async _saveFromModal() {
            if (!this.pageForm.title || !this.pageForm.slug) {
                this.showNotification('Title and slug are required.', 'error');
                return;
            }

            const pageData = {
                title: this.pageForm.title,
                slug: this.pageForm.slug,
                status: this.pageForm.status,
                content: JSON.stringify({
                    time: Date.now(),
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: this.pageForm.title,
                                level: 1
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: this.pageForm.content || 'Page content will be here.'
                            }
                        }
                    ]
                })
            };

            try {
                const url = this.pageForm.id ? `/api/admin/pages/${this.pageForm.id}` : '/api/admin/pages';
                const method = this.pageForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pageData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`Page ${this.pageForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving page:', error);
                this.showNotification('Error saving page. Please try again.', 'error');
            }
        },

        async _saveFromEditor(id = null) {
            if (!this.currentPage) return;

            try {
                // Get latest content from editor
                if (this.editorMode === 'visual' && this.pageEditor) {
                    const outputData = await this.pageEditor.save();
                    if (outputData) {
                        this.currentPage.content = outputData;
                    }
                } else if (this.editorMode === 'code') {
                    try {
                        this.currentPage.content = JSON.parse(this.pageCode);
                    } catch (error) {
                        this.showNotification('Invalid JSON format in code editor. Please fix and try again.', 'error');
                        return;
                    }
                }

                const isUpdate = this.currentPage.id;
                const isSystemPage = this.currentPage.is_system;

                // For new pages, validate required fields
                if (!isUpdate) {
                    if (!this.currentPage.path || !this.currentPage.path.trim()) {
                        this.showNotification('Page path is required for new pages.', 'warning');
                        return;
                    }
                    
                    if (!this.currentPage.path.startsWith('/')) {
                        this.currentPage.path = '/' + this.currentPage.path;
                    }
                }

                // Prepare data for API
                const pageData = {
                    ...this.currentPage,
                    content: JSON.stringify(this.currentPage.content)
                };



                // For system pages, remove slug from the data to prevent backend errors
                if (isSystemPage) {
                    delete pageData.slug;
                    delete pageData.path;
                } else if (isUpdate && this.currentPage.path) {
                    if (this.currentPage.path === '/') {
                        pageData.slug = 'home';
                    } else {
                        pageData.slug = this.currentPage.path.replace(/^\//, '');
                    }
                }

                const url = isUpdate ? `/api/admin/pages/${this.currentPage.id}` : '/api/admin/pages';
                const method = isUpdate ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pageData)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Page ${isUpdate ? 'updated' : 'created'} successfully!`, 'success');
                    
                    if (result.data) {
                        this.currentPage = result.data;
                        if (this.currentPage.slug && !this.currentPage.path) {
                            this.currentPage.path = this.currentPage.slug === 'home' ? '/' : `/${this.currentPage.slug}`;
                        }
                    }
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving page:', error);
                this.showNotification('Error saving page. Please try again.', 'error');
            }
        },

        // ============================================================================
        // CUSTOM CSS FUNCTIONS
        // ============================================================================



        clearCustomCSS() {
            if (confirm('Are you sure you want to clear all custom CSS?')) {
                this.currentPage.custom_css = '';
                this.showNotification('Custom CSS cleared.', 'success');
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createPagesModule = createPagesModule;
} 