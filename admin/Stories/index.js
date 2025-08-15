// Stories functionality for admin panel
function createStoriesModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        currentStory: {
            title: '',
            subtitle: '',
            slug: '',
            excerpt: '',
            content: null,
            featured_image: '',
            summary_image: '',
            status: 'draft',
            category_id: null,
            meta_title: '',
            meta_description: '',
            tags: ''
        },
        categories: [],

        // Modal state (for Alpine.js templates)
        showStoryModal: false,
        showStoryViewModal: false,
        isEditingStory: false,
        viewingStory: {},
        storyForm: {
            title: '',
            subtitle: '',
            slug: '',
            excerpt: '',
            status: 'draft',
            category_id: null,
            content: '',
            featured_image: '',
            summary_image: '',
            meta_title: '',
            meta_description: '',
            tags: ''
        },

        // Pagination state
        currentPageNum: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},

        // Editor state (for full editor)
        editorMode: 'visual',
        storyCode: '',
        storyEditor: null,
        summaryImageDropzone: null,

        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions for all entities)
        // ============================================================================

        // 1. INIT - Initialize entity when entering section
        async init() {
            console.log('📰 Initializing Stories module...');
            await this.loadCategories();
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('stories-content');
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

                const response = await fetch(`/api/admin/stories?${params}`);
                
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
                console.error('Load stories error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading stories: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(storyData = null) {
            // Guard against unwanted executions
            if (this.showStoryModal === true) {
                console.warn('Story modal is already open, ignoring new() call');
                return;
            }
            
            this.isEditingStory = !!storyData;
            
            // Reset or populate form
            if (storyData) {
                this.storyForm = {
                    id: storyData.id,
                    title: storyData.title || '',
                    subtitle: storyData.subtitle || '',
                    slug: storyData.slug || '',
                    excerpt: storyData.excerpt || '',
                    status: storyData.status || 'draft',
                    category_id: storyData.category_id || null,
                    content: storyData.content || '',
                    featured_image: storyData.featured_image || '',
                    summary_image: storyData.summary_image || '',
                    meta_title: storyData.meta_title || '',
                    meta_description: storyData.meta_description || '',
                    tags: storyData.tags || ''
                };
            } else {
                this.storyForm = {
                    title: '',
                    subtitle: '',
                    slug: '',
                    excerpt: '',
                    status: 'draft',
                    category_id: null,
                    content: '',
                    featured_image: '',
                    summary_image: '',
                    meta_title: '',
                    meta_description: '',
                    tags: ''
                };
            }
            
            // Stories use the full page editor, not a modal
            this.edit(null);
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            // Determine if we're in modal mode or editor mode
            if (this.showStoryModal) {
                return this._saveFromModal();
            } else {
                return this._saveFromEditor(id);
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this story?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/stories/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Story deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting story:`, error);
                this.showNotification(`Error deleting story. Please try again.`, 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'stories-table',
                entityType: 'story',
                emptyMessage: 'No stories found. Create your first story!',
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
                    },
                    {
                        field: 'category_id',
                        label: 'Category',
                        placeholder: 'All Categories',
                        options: this.categories.map(cat => ({
                            value: cat.id.toString(),
                            label: cat.name
                        }))
                    }
                ],
                columns: [
                    {
                        header: 'Title',
                        field: 'title',
                        type: 'custom',
                        render: (entity) => `
                            <div>
                                <strong>${entity.title}</strong>
                                ${entity.subtitle ? `<br><small class="text-muted">${entity.subtitle}</small>` : ''}
                            </div>
                        `
                    },
                    {
                        header: 'Category',
                        field: 'category',
                        type: 'custom',
                        render: (entity) => entity.category?.name ? 
                            `<span class="badge bg-secondary">${entity.category.name}</span>` : 
                            '<span class="text-muted">Uncategorized</span>'
                    },
                    {
                        header: 'Status',
                        field: 'status',
                        type: 'badge',
                        badgeClass: (value) => {
                            switch(value) {
                                case 'published': return 'bg-success';
                                case 'draft': return 'bg-warning';
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
                viewUrl: (entity) => `/story/${entity.slug}`,
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
        edit(storyId) {
            console.log('🔥 edit called with storyId:', storyId);
            
            // Switch to story editor view
            if (this.setSection) {
                this.setSection('story-editor');
            }
            
            this.editorMode = 'visual';
            
            if (storyId) {
                this.loadForEditing(storyId);
            } else {
                // New story in full editor
                this.currentStory = {
                    title: '',
                    subtitle: '',
                    slug: '',
                    excerpt: '',
                    content: null,
                    featured_image: '',
                    summary_image: '',
                    status: 'draft',
                    category_id: null,
                    meta_title: '',
                    meta_description: '',
                    tags: ''
                };
                this.storyCode = '';
                this.initializeEditor();
            }
        },

        // 8. VIEW - Show view modal
        async view(storyId) {
            try {
                const response = await fetch(`/api/admin/stories/${storyId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingStory = data.data;
                    this.showStoryViewModal = true;
                } else {
                    this.showNotification('Error loading story details', 'error');
                }
            } catch (error) {
                console.error('Error viewing story:', error);
                this.showNotification('Error loading story details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If view modal is open, close it
            if (this.showStoryViewModal) {
                this.closeViewModal();
                return;
            }
            
            // If in story editor, return to stories list
            if (this.currentSection === 'story-editor') {
                this.backToList();
                return;
            }
            
            // Default: ensure we're in stories section
            if (this.setSection) {
                this.setSection('stories');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showStoryModal = false;
            this.storyForm = {
                title: '',
                subtitle: '',
                slug: '',
                excerpt: '',
                status: 'draft',
                category_id: null,
                content: '',
                featured_image: '',
                summary_image: '',
                meta_title: '',
                meta_description: '',
                tags: ''
            };
            this.isEditingStory = false;
        },

        closeViewModal() {
            this.showStoryViewModal = false;
            this.viewingStory = {};
        },

        editFromView() {
            const storyData = this.viewingStory;
            this.closeViewModal();
            this.edit(storyData.id);
        },

        // ============================================================================
        // FULL EDITOR EXTENSIONS (for complete editor pages)
        // ============================================================================

        async loadForEditing(storyId) {
            try {
                const response = await fetch(`/api/admin/stories/${storyId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.currentStory = data.data;
                    
                    // Parse content from JSON string to object if necessary
                    try {
                        if (this.currentStory.content) {
                            if (typeof this.currentStory.content === 'string') {
                                this.currentStory.content = JSON.parse(this.currentStory.content);
                            }
                            this.storyCode = JSON.stringify(this.currentStory.content, null, 2);
                        } else {
                            this.currentStory.content = { blocks: [] };
                            this.storyCode = JSON.stringify({ blocks: [] }, null, 2);
                        }
                    } catch (contentError) {
                        console.warn('Invalid story content, using empty content:', contentError);
                        this.currentStory.content = { blocks: [] };
                        this.storyCode = JSON.stringify({ blocks: [] }, null, 2);
                    }
                    
                    setTimeout(() => {
                        this.initializeEditor();
                    }, 100);
                    
                } else {
                    this.showNotification('Error loading story: ' + (data.message || 'Story not found'), 'error');
                    this.backToList();
                }
            } catch (error) {
                console.error('Error loading story:', error);
                this.showNotification('Error loading story. Please try again.', 'error');
                this.backToList();
            }
        },

        initializeEditor() {
            // Destroy existing editor if it exists
            if (this.storyEditor) {
                this.storyEditor.destroy();
                this.storyEditor = null;
            }

            setTimeout(() => {
                try {
                    this.storyEditor = createEditor({
                        holder: 'story-editor',
                        placeholder: 'Start writing your story...',
                        data: this.currentStory.content || { blocks: [] },
                        onChange: () => {
                            if (this.editorMode === 'visual') {
                                this.syncToCode();
                            }
                        }
                    });

                    console.log('✅ Story Editor initialized successfully');
                } catch (error) {
                    console.error('Error initializing Story Editor:', error);
                }
            }, 200);
        },

        async syncToCode() {
            if (this.storyEditor) {
                try {
                    const outputData = await this.storyEditor.save();
                    if (outputData) {
                        this.storyCode = JSON.stringify(outputData, null, 2);
                    }
                } catch (error) {
                    console.error('Error saving editor data:', error);
                }
            }
        },

        syncToVisual() {
            try {
                const parsedData = JSON.parse(this.storyCode);
                
                if (this.currentStory) {
                    this.currentStory.content = parsedData;
                }
                
                this.initializeEditor();
                
            } catch (error) {
                console.error('Error parsing JSON:', error);
                this.showNotification('Invalid JSON format. Please check your code.', 'error');
            }
        },

        backToList() {
            // Destroy editor instance
            if (this.storyEditor) {
                this.storyEditor.destroy();
                this.storyEditor = null;
            }
            
            // Reset editor state
            this.currentStory = {
                title: '',
                subtitle: '',
                slug: '',
                excerpt: '',
                content: null,
                featured_image: '',
                summary_image: '',
                status: 'draft',
                category_id: null,
                meta_title: '',
                meta_description: '',
                tags: ''
            };
            this.storyCode = '';
            this.editorMode = 'visual';
            
            // Go back to stories section
            this.setSection('stories');
        },

        preview() {
            if (!this.currentStory.slug || this.currentStory.slug.trim() === '') {
                this.showNotification('Please set a story slug before previewing.', 'warning');
                return;
            }

            const previewUrl = `/story/${this.currentStory.slug}`;
            window.open(previewUrl, '_blank');
            this.showNotification('Opening preview in new tab...', 'info', 2000);
        },

        // ============================================================================
        // STORIES SPECIFIC EXTENSIONS (category management, images, etc.)
        // ============================================================================

        async loadCategories() {
            try {
                const response = await fetch('/api/admin/categories');
                const data = await response.json();
                if (data.success) {
                    this.categories = data.data;
                }
            } catch (error) {
                console.error('Error loading categories:', error);
                this.categories = [];
            }
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        getStatusBadgeClass(status) {
            switch(status) {
                case 'published': return 'bg-success';
                case 'draft': return 'bg-warning';
                default: return 'bg-secondary';
            }
        },

        getStoryContentBlocksCount() {
            if (!this.viewingStory.content) return 0;
            try {
                const parsed = typeof this.viewingStory.content === 'string' 
                    ? JSON.parse(this.viewingStory.content) 
                    : this.viewingStory.content;
                return parsed.blocks ? parsed.blocks.length : 0;
            } catch (error) {
                return 0;
            }
        },

        // ============================================================================
        // PRIVATE FUNCTIONS (internal implementation details)
        // ============================================================================

        async _saveFromModal() {
            if (!this.storyForm.title || !this.storyForm.slug) {
                this.showNotification('Title and slug are required.', 'error');
                return;
            }

            const storyData = {
                title: this.storyForm.title,
                subtitle: this.storyForm.subtitle,
                slug: this.storyForm.slug,
                excerpt: this.storyForm.excerpt,
                status: this.storyForm.status,
                category_id: this.storyForm.category_id,
                featured_image: this.storyForm.featured_image,
                summary_image: this.storyForm.summary_image,
                meta_title: this.storyForm.meta_title,
                meta_description: this.storyForm.meta_description,
                tags: this.storyForm.tags,
                content: JSON.stringify({
                    time: Date.now(),
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: this.storyForm.title,
                                level: 1
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: this.storyForm.content || 'Story content will be here.'
                            }
                        }
                    ]
                })
            };

            try {
                const url = this.storyForm.id ? `/api/admin/stories/${this.storyForm.id}` : '/api/admin/stories';
                const method = this.storyForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(storyData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`Story ${this.storyForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving story:', error);
                this.showNotification('Error saving story. Please try again.', 'error');
            }
        },

        async _saveFromEditor(id = null) {
            if (!this.currentStory) return;

            try {
                // Get latest content from editor
                if (this.editorMode === 'visual' && this.storyEditor) {
                    const outputData = await this.storyEditor.save();
                    if (outputData) {
                        this.currentStory.content = outputData;
                    }
                } else if (this.editorMode === 'code') {
                    try {
                        this.currentStory.content = JSON.parse(this.storyCode);
                    } catch (error) {
                        this.showNotification('Invalid JSON format in code editor. Please fix and try again.', 'error');
                        return;
                    }
                }

                const isUpdate = this.currentStory.id;

                // For new stories, validate required fields
                if (!isUpdate) {
                    if (!this.currentStory.title || !this.currentStory.title.trim()) {
                        this.showNotification('Story title is required.', 'warning');
                        return;
                    }
                    
                    if (!this.currentStory.slug || !this.currentStory.slug.trim()) {
                        this.showNotification('Story slug is required.', 'warning');
                        return;
                    }
                }

                // Prepare data for API
                const storyData = {
                    ...this.currentStory,
                    content: JSON.stringify(this.currentStory.content)
                };



                const url = isUpdate ? `/api/admin/stories/${this.currentStory.id}` : '/api/admin/stories';
                const method = isUpdate ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(storyData)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Story ${isUpdate ? 'updated' : 'created'} successfully!`, 'success');
                    
                    if (result.data) {
                        this.currentStory = result.data;
                    }
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving story:', error);
                this.showNotification('Error saving story. Please try again.', 'error');
            }
        },

        // ============================================================================
        // CUSTOM CSS FUNCTIONS
        // ============================================================================



        clearCustomCSS() {
            if (confirm('Are you sure you want to clear all custom CSS?')) {
                this.currentStory.custom_css = '';
                this.showNotification('Custom CSS cleared.', 'success');
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createStoriesModule = createStoriesModule;
} 