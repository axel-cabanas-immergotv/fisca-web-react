// Menus functionality for admin panel
function createMenusModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        currentMenu: {
            title: '',
            platform: 'Web',
            links: [],
            status: 'active',
            sort_order: 0
        },
        editingItem: {
            title: '',
            url: '',
            target: '_self',
            icon: '',
            description: ''
        },

        // Modal state (for Alpine.js templates)
        showMenuModal: false,
        showMenuViewModal: false,
        showMenuItemModal: false,
        isEditingMenu: false,
        viewingMenu: {},
        menuForm: {
            title: '',
            platform: 'Web',
            status: 'active',
            sort_order: 0
        },

        // Pagination state
        currentPageNum: 1,
        pageSize: 20,
        currentSearch: '',
        currentFilters: {},

        // Menu-specific state (for hierarchical editor)
        editingIndex: null,
        editingSubIndex: null,
        editingSubSubIndex: null,
        editingMode: 'new', // 'new', 'edit', 'sub', 'subsub'
        sortableInstances: [],
        
        // Cache for menu items data during drag operations
        menuItemsCache: new Map(),

        // ============================================================================
        // UNIVERSAL FUNCTIONS (9 standard functions for all entities)
        // ============================================================================

        // 1. INIT - Initialize entity when entering section
        async init() {
            console.log('🔗 Initializing Menus module...');
            await this.load();
        },

        // 2. LOAD - Load entity data for table
        async load(page = 1, limit = this.pageSize, search = this.currentSearch, filters = this.currentFilters) {
            const container = document.getElementById('menus-content');
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

                const response = await fetch(`/api/admin/menus?${params}`);
                
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
                console.error('Load menus error:', error);
                container.innerHTML = `<div class="alert alert-danger">Error loading menus: ${error.message}</div>`;
            }
        },

        // 3. NEW - Show creation form/modal
        new(menuData = null) {
            // Guard against unwanted executions
            if (this.currentSection === 'menu-editor') {
                console.warn('Menu editor is already open, ignoring new() call');
                return;
            }
            
            // Menus use the full page editor, not a modal
            this.edit(null);
        },

        // 4. SAVE - Save entity (create or update)
        async save(id = null) {
            // Determine if we're in modal mode or editor mode
            if (this.showMenuModal) {
                return this._saveFromModal();
            } else {
                return this._saveFromEditor(id);
            }
        },

        // 5. DELETE - Delete entity
        async delete(id) {
            if (!confirm(`Are you sure you want to delete this menu?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/admin/menus/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Menu deleted successfully!`, 'success');
                    await this.load();
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error(`Error deleting menu:`, error);
                this.showNotification(`Error deleting menu. Please try again.`, 'error');
            }
        },

        // 6. RENDER_TABLE - Render entity table
        renderTable(data) {
            const config = {
                tableId: 'menus-table',
                entityType: 'menu',
                emptyMessage: 'No menus found. Create your first menu!',
                adminAppInstance: this,
                    enableSearch: true,
                currentSearch: this.currentSearch,
                currentFilters: this.currentFilters,
                    filters: [
                        {
                            field: 'platform',
                            label: 'Platform',
                            placeholder: 'All Platforms',
                            options: [
                                { value: 'Web', label: 'Web' },
                            { value: 'Mobile', label: 'Mobile' },
                            { value: 'Both', label: 'Both' }
                            ]
                        },
                        {
                            field: 'status',
                            label: 'Status',
                        placeholder: 'All Statuses',
                            options: [
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' }
                            ]
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
                                <br><small class="text-muted">${entity.platform}</small>
                            </div>
                        `
                    },
                    {
                        header: 'Items',
                        field: 'links',
                        type: 'custom',
                        render: (entity) => `
                            <span class="badge bg-info">${this.getTotalMenuItems(entity.links)} items</span>
                        `
                    },
                    {
                        header: 'Status',
                        field: 'status',
                        type: 'badge',
                        badgeClass: (value) => value === 'active' ? 'bg-success' : 'bg-warning'
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
        edit(menuId) {
            console.log('🔥 edit called with menuId:', menuId);
            
            // Switch to menu editor view
            if (this.setSection) {
                this.setSection('menu-editor');
            }
            
            if (menuId) {
                this.loadForEditing(menuId);
                    } else {
                // New menu in full editor
                this.currentMenu = {
                    title: 'New Menu',
                    platform: 'Web',
                    links: [],
                    status: 'active',
                    sort_order: 0
                };
                this.resetEditingState();
            }
        },

        // 8. VIEW - Show view modal
        async view(menuId) {
            try {
                const response = await fetch(`/api/admin/menus/${menuId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.viewingMenu = data.data;
                    this.showMenuViewModal = true;
                } else {
                    this.showNotification('Error loading menu details', 'error');
                }
            } catch (error) {
                console.error('Error viewing menu:', error);
                this.showNotification('Error loading menu details', 'error');
            }
        },

        // 9. BACK - Return to entity list from modal/editor
        back() {
            // If view modal is open, close it
            if (this.showMenuViewModal) {
                this.closeViewModal();
                return;
            }
            
            // If in menu editor, return to menus list
            if (this.currentSection === 'menu-editor') {
                this.backToList();
                return;
            }
            
            // Default: ensure we're in menus section
            if (this.setSection) {
                this.setSection('menus');
            }
        },

        // ============================================================================
        // MODAL MANAGEMENT EXTENSIONS (for Alpine.js templates)
        // ============================================================================

        closeModal() {
            this.showMenuModal = false;
            this.menuForm = {
                title: '',
                platform: 'Web',
                status: 'active',
                sort_order: 0
            };
            this.isEditingMenu = false;
        },

        closeViewModal() {
            this.showMenuViewModal = false;
            this.viewingMenu = {};
        },

        editFromView() {
            const menuData = this.viewingMenu;
            this.closeViewModal();
            this.edit(menuData.id);
        },

        previewFromView() {
            this.showNotification('Menu preview will be available soon.', 'info');
        },

        // ============================================================================
        // MENU EDITOR EXTENSIONS (for hierarchical menu builder)
        // ============================================================================

        async loadForEditing(menuId) {
            try {
                const response = await fetch(`/api/admin/menus/${menuId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    this.currentMenu = data.data;
                    
                    // Parse and validate links
                    this.currentMenu.links = this.parseMenuLinks(this.currentMenu.links);
                    
                    // Ensure all items have IDs and proper structure
                    this.currentMenu.links = this.ensureMenuItemsHaveIds(this.currentMenu.links);
                    
                    this.resetEditingState();
                    
                    this.initializeSortables();
                    
                } else {
                    this.showNotification('Error loading menu: ' + (data.message || 'Menu not found'), 'error');
                    this.backToList();
                }
            } catch (error) {
                console.error('Error loading menu:', error);
                this.showNotification('Error loading menu. Please try again.', 'error');
                this.backToList();
            }
        },

        resetEditingState() {
            this.editingItem = {
                title: '',
                url: '',
                target: '_self',
                icon: '',
                description: ''
            };
            this.editingIndex = null;
            this.editingSubIndex = null;
            this.editingSubSubIndex = null;
            this.editingMode = 'new';
        },

        backToList() {
            // Destroy sortable instances
            this.destroySortables();
            
            // Reset state
            this.currentMenu = {
                title: '',
                platform: 'Web',
                links: [],
                status: 'active',
                sort_order: 0
            };
            this.resetEditingState();

            // Go back to menus section
            this.setSection('menus');
        },

        // ============================================================================
        // MENU ITEMS MANAGEMENT (hierarchical structure)
        // ============================================================================

        addMenuItem() {
            this.editingMode = 'new';
            this.editingIndex = null;
            this.editingSubIndex = null;
            this.editingSubSubIndex = null;
            this.editingItem = {
                id: this.generateId(),
                title: '',
                url: '',
                target: '_self',
                icon: '',
                description: '',
                children: []
            };
            this.showMenuItemModal = true;
        },

        editMenuItem(index) {
            this.editingMode = 'edit';
            this.editingIndex = index;
            this.editingSubIndex = null;
            this.editingSubSubIndex = null;
            this.editingItem = { ...this.currentMenu.links[index] };
            this.showMenuItemModal = true;
        },

        addSubMenuItem(index) {
            this.editingMode = 'sub';
            this.editingIndex = index;
            this.editingSubIndex = null;
            this.editingSubSubIndex = null;
            this.editingItem = {
                id: this.generateId(),
                title: '',
                url: '',
                target: '_self',
                icon: '',
                description: '',
                children: []
            };
            this.showMenuItemModal = true;
        },

        editSubMenuItem(parentIndex, subIndex) {
            this.editingMode = 'edit-sub';
            this.editingIndex = parentIndex;
            this.editingSubIndex = subIndex;
            this.editingSubSubIndex = null;
            this.editingItem = { ...this.currentMenu.links[parentIndex].children[subIndex] };
            this.showMenuItemModal = true;
        },

        addSubSubMenuItem(parentIndex, subIndex) {
            this.editingMode = 'subsub';
            this.editingIndex = parentIndex;
            this.editingSubIndex = subIndex;
            this.editingSubSubIndex = null;
            this.editingItem = {
                id: this.generateId(),
                title: '',
                url: '',
                target: '_self',
                icon: '',
                description: ''
            };
        },

        editSubSubMenuItem(parentIndex, subIndex, subSubIndex) {
            this.editingMode = 'edit-subsub';
            this.editingIndex = parentIndex;
            this.editingSubIndex = subIndex;
            this.editingSubSubIndex = subSubIndex;
            this.editingItem = { ...this.currentMenu.links[parentIndex].children[subIndex].children[subSubIndex] };
        },

        saveMenuItem() {
            if (!this.editingItem.title || !this.editingItem.url) {
                this.showNotification('Title and URL are required for menu items.', 'error');
                return;
            }

            const newItem = { ...this.editingItem };
            
            // Ensure the item has an ID
            if (!newItem.id) {
                newItem.id = this.generateId();
            }
            
            // Ensure children array exists
            if (!newItem.children) {
                newItem.children = [];
            }

            switch (this.editingMode) {
                case 'new':
                    this.currentMenu.links.push(newItem);
                    break;
                    
                case 'edit':
                    this.currentMenu.links[this.editingIndex] = newItem;
                    break;
                    
                case 'sub':
                    if (!this.currentMenu.links[this.editingIndex].children) {
                        this.currentMenu.links[this.editingIndex].children = [];
                    }
                    this.currentMenu.links[this.editingIndex].children.push(newItem);
                    break;
                    
                case 'edit-sub':
                    this.currentMenu.links[this.editingIndex].children[this.editingSubIndex] = newItem;
                    break;
                    
                case 'subsub':
                    if (!this.currentMenu.links[this.editingIndex].children[this.editingSubIndex].children) {
                        this.currentMenu.links[this.editingIndex].children[this.editingSubIndex].children = [];
                    }
                    this.currentMenu.links[this.editingIndex].children[this.editingSubIndex].children.push(newItem);
                    break;
                    
                case 'edit-subsub':
                    this.currentMenu.links[this.editingIndex].children[this.editingSubIndex].children[this.editingSubSubIndex] = newItem;
                    break;
            }

            this.resetEditingState();
            this.showNotification('Menu item saved successfully!', 'success');
            this.showMenuItemModal = false;
            
            // Update cache and reinitialize sortables after Alpine.js updates the DOM
            if (this.$nextTick && typeof this.$nextTick === 'function') {
                this.$nextTick(() => {
                    this.updateMenuItemsCache();
                    this._setupSortables();
                });
            } else {
                setTimeout(() => {
                    this.updateMenuItemsCache();
                    this._setupSortables();
                }, 100);
            }
        },

        removeMenuItem(index) {
            if (confirm('Are you sure you want to remove this menu item?')) {
                this.currentMenu.links.splice(index, 1);
                this.showNotification('Menu item removed successfully!', 'success');
                // Update cache after removal
                this.updateMenuItemsCache();
            }
        },

        removeSubMenuItem(parentIndex, subIndex) {
            if (confirm('Are you sure you want to remove this sub menu item?')) {
                this.currentMenu.links[parentIndex].children.splice(subIndex, 1);
                this.showNotification('Sub menu item removed successfully!', 'success');
                // Update cache after removal
                this.updateMenuItemsCache();
            }
        },

        removeSubSubMenuItem(parentIndex, subIndex, subSubIndex) {
            if (confirm('Are you sure you want to remove this sub-sub menu item?')) {
                this.currentMenu.links[parentIndex].children[subIndex].children.splice(subSubIndex, 1);
                this.showNotification('Sub-sub menu item removed successfully!', 'success');
                // Update cache after removal
                this.updateMenuItemsCache();
            }
        },

        // ============================================================================
        // SORTABLE DRAG & DROP FUNCTIONALITY
        // ============================================================================

        // SortableJS integration with hierarchical support
        initializeSortables() {
            console.log('🔄 Initializing sortables...');
            this.destroySortables();
            this.updateMenuItemsCache();

            // Wait for Alpine.js to finish rendering if available
            if (this.$nextTick && typeof this.$nextTick === 'function') {
                this.$nextTick(() => {
                    this._setupSortables();
                });
            } else {
                // Fallback for cases where $nextTick is not available
                setTimeout(() => {
                    this._setupSortables();
                }, 100);
            }
        },

        // Update the cache with current menu items data
        updateMenuItemsCache() {
            this.menuItemsCache.clear();
            this._cacheMenuItems(this.currentMenu.links, []);
        },

        // Recursively cache menu items with their paths
        _cacheMenuItems(items, path) {
            if (!Array.isArray(items)) return;
            
            items.forEach((item, index) => {
                const currentPath = [...path, index];
                const cacheKey = item.id || `path_${currentPath.join('_')}`;
                
                this.menuItemsCache.set(cacheKey, {
                    data: { ...item },
                    path: currentPath
                });
                
                if (item.children && Array.isArray(item.children)) {
                    this._cacheMenuItems(item.children, currentPath);
                }
            });
        },

        // Setup sortables after DOM is ready
        _setupSortables() {
            console.log('🎯 Setting up sortables...');
            
            // Check if SortableJS is available
            if (typeof window.Sortable === 'undefined') {
                console.error('SortableJS is not loaded');
                return;
            }

            // Shared sortable configuration
            const baseConfig = {
                handle: '.menu-item-handle',
                animation: 200,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                chosenClass: 'sortable-chosen',
                forceFallback: false, // Cambio a false para mejor compatibilidad
                fallbackClass: 'sortable-fallback',
                onStart: (evt) => this.handleSortableStart(evt),
                onEnd: (evt) => this.handleSortableEnd(evt),
                onMove: (evt) => this.handleSortableMove(evt)
            };

            // Main items sortable (level 0)
            const mainContainer = document.getElementById('menu-items-sortable');
            if (mainContainer) {
                console.log('📦 Creating main sortable');
                const sortable = window.Sortable.create(mainContainer, {
                    ...baseConfig,
                    group: {
                        name: 'menu-items',
                        pull: true,
                        put: true
                    }
                });
                this.sortableInstances.push(sortable);
            }

            // Sub items sortables (level 1)
            const subContainers = document.querySelectorAll('.sub-items-sortable');
            console.log(`📦 Creating ${subContainers.length} sub sortables`);
            subContainers.forEach((container, index) => {
                const sortable = window.Sortable.create(container, {
                    ...baseConfig,
                    group: {
                        name: 'menu-items', // Mismo grupo para permitir intercambio
                        pull: true,
                        put: true
                    }
                });
                this.sortableInstances.push(sortable);
            });

            console.log(`✅ Created ${this.sortableInstances.length} sortable instances`);
        },

        // Handle sortable start event
        handleSortableStart(evt) {
            console.log('🎬 Drag start:', evt);
            
            const draggedElement = evt.item;
            const itemId = draggedElement.getAttribute('data-id');
            
            // Store the item data in a temporary attribute for the duration of the drag
            const cachedItem = this.menuItemsCache.get(itemId);
            if (cachedItem) {
                console.log('💾 Cached item found:', cachedItem.data);
                draggedElement.setAttribute('data-cached-item', JSON.stringify(cachedItem.data));
            } else {
                console.warn('⚠️ No cached item found for ID:', itemId);
            }
        },

        // Handle sortable move event (for validation)
        handleSortableMove(evt) {
            // Optionally add custom validation logic here
            return true;
        },

        // Handle sortable end event
        handleSortableEnd(evt) {
            console.log('🎬 Drag end:', evt);
            
            // If moving within the same container and same position, do nothing
            if (evt.from === evt.to && evt.oldIndex === evt.newIndex) {
                console.log('⚡ No change, skipping rebuild');
                return;
            }

            try {
                // Rebuild the entire menu structure
                this.rebuildMenuFromCurrentState();
                this.showNotification('Menu order updated!', 'success');
                
                // Update cache and reinitialize if needed
                this.updateMenuItemsCache();
                
            } catch (error) {
                console.error('❌ Error during drag end:', error);
                this.showNotification('Error updating menu order', 'error');
            }
        },

        // Rebuild menu structure using cached data and current DOM order
        rebuildMenuFromCurrentState() {
            console.log('🔄 Rebuilding menu from current state...');
            
            const newLinks = [];
            const mainContainer = document.getElementById('menu-items-sortable');
            
            if (!mainContainer) {
                console.error('❌ Main container not found');
                return;
            }

            // Process main level items
            const mainItems = mainContainer.querySelectorAll(':scope > .menu-item');
            console.log(`📋 Processing ${mainItems.length} main items`);
            
            mainItems.forEach((mainElement) => {
                const itemData = this.extractItemDataFromElement(mainElement);
                if (!itemData) {
                    console.warn('⚠️ Could not extract data for main item');
                    return;
                }
                
                // Process sub items for this main item
                const subContainer = mainElement.querySelector('.sub-items-sortable');
                if (subContainer) {
                    itemData.children = [];
                    const subItems = subContainer.querySelectorAll(':scope > .menu-item');
                    console.log(`📋 Processing ${subItems.length} sub items for ${itemData.title}`);
                    
                    subItems.forEach((subElement) => {
                        const subItemData = this.extractItemDataFromElement(subElement);
                        if (subItemData) {
                            itemData.children.push(subItemData);
                        }
                    });
                } else {
                    itemData.children = [];
                }
                
                newLinks.push(itemData);
            });

            // Update the menu structure
            console.log('✅ New menu structure:', newLinks);
            this.currentMenu.links = newLinks;
        },

        // Enhanced item data extraction with multiple fallback strategies
        extractItemDataFromElement(element) {
            const itemId = element.getAttribute('data-id');
            console.log(`🔍 Extracting data for item ID: ${itemId}`);
            
            // Strategy 1: Try cached data from drag operation
            const cachedData = element.getAttribute('data-cached-item');
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    console.log('✅ Using cached drag data:', parsed);
                    element.removeAttribute('data-cached-item'); // Clean up
                    return this.ensureItemStructure(parsed);
                } catch (e) {
                    console.warn('⚠️ Failed to parse cached drag data:', e);
                }
            }
            
            // Strategy 2: Try cache lookup by ID
            if (itemId && this.menuItemsCache.has(itemId)) {
                const cached = this.menuItemsCache.get(itemId);
                console.log('✅ Using memory cache data:', cached.data);
                return this.ensureItemStructure(cached.data);
            }
            
            // Strategy 3: Try Alpine.js data attribute
            const alpineData = element.getAttribute('data-item-json');
            if (alpineData) {
                try {
                    const parsed = JSON.parse(alpineData);
                    console.log('✅ Using Alpine data:', parsed);
                    return this.ensureItemStructure(parsed);
                } catch (e) {
                    console.warn('⚠️ Failed to parse Alpine data:', e);
                }
            }
            
            // Strategy 4: Extract from DOM content as last resort
            console.warn('⚠️ Using DOM extraction fallback for:', itemId);
            const titleElement = element.querySelector('.menu-item-title span');
            const urlElement = element.querySelector('.menu-item-url span');
            
            return this.ensureItemStructure({
                id: itemId || this.generateId(),
                title: titleElement ? titleElement.textContent.trim() : 'Untitled Item',
                url: urlElement ? urlElement.textContent.trim() : '',
                target: '_self',
                icon: '',
                description: '',
                children: []
            });
        },

        // Ensure item has proper structure
        ensureItemStructure(item) {
            return {
                id: item.id || this.generateId(),
                title: item.title || 'Untitled Item',
                url: item.url || '',
                target: item.target || '_self',
                icon: item.icon || '',
                description: item.description || '',
                children: Array.isArray(item.children) ? item.children : []
            };
        },





        // Find item by ID in the entire structure
        findItemById(id) {
            // Search in main items
            for (let i = 0; i < this.currentMenu.links.length; i++) {
                if (this.currentMenu.links[i].id === id) {
                    return { data: this.currentMenu.links[i], path: [i] };
                }
                
                // Search in sub items
                if (this.currentMenu.links[i].children) {
                    for (let j = 0; j < this.currentMenu.links[i].children.length; j++) {
                        if (this.currentMenu.links[i].children[j].id === id) {
                            return { data: this.currentMenu.links[i].children[j], path: [i, j] };
                        }
                        
                        // Search in sub-sub items
                        if (this.currentMenu.links[i].children[j].children) {
                            for (let k = 0; k < this.currentMenu.links[i].children[j].children.length; k++) {
                                if (this.currentMenu.links[i].children[j].children[k].id === id) {
                                    return { data: this.currentMenu.links[i].children[j].children[k], path: [i, j, k] };
                                }
                            }
                        }
                    }
                }
            }
            return null;
        },



        destroySortables() {
            this.sortableInstances.forEach(instance => {
                if (instance && instance.destroy) {
                    instance.destroy();
                }
            });
            this.sortableInstances = [];
        },

        // Utility functions
        findItemIndexById(id) {
            return this.currentMenu.links.findIndex(item => item.id === id);
        },

        findSubItemIndicesById(id) {
            for (let i = 0; i < this.currentMenu.links.length; i++) {
                if (this.currentMenu.links[i].children) {
                    for (let j = 0; j < this.currentMenu.links[i].children.length; j++) {
                        if (this.currentMenu.links[i].children[j].id === id) {
                            return { parentIndex: i, subIndex: j };
                        }
                    }
                }
            }
            return { parentIndex: -1, subIndex: -1 };
        },

        // ============================================================================
        // DEBUG FUNCTIONS (for troubleshooting drag & drop)
        // ============================================================================

        // Debug function to show current cache state
        debugCache() {
            console.log('🔍 Menu Items Cache:', Array.from(this.menuItemsCache.entries()));
            console.log('🔍 Current Menu Structure:', this.currentMenu.links);
            console.log('🔍 Sortable Instances:', this.sortableInstances.length);
        },

        // Debug function to show DOM state
        debugDOM() {
            const mainContainer = document.getElementById('menu-items-sortable');
            if (mainContainer) {
                const items = mainContainer.querySelectorAll('.menu-item');
                console.log('🔍 DOM Items:', Array.from(items).map(item => ({
                    id: item.getAttribute('data-id'),
                    title: item.querySelector('.menu-item-title span')?.textContent,
                    hasJsonData: !!item.getAttribute('data-item-json'),
                    hasCachedData: !!item.getAttribute('data-cached-item')
                })));
            }
        },

        // ============================================================================
        // HELPER FUNCTIONS (utilities for templates and internal use)
        // ============================================================================

        // Utility function to safely parse links from string or return array
        parseMenuLinks(links) {
            if (Array.isArray(links)) {
                return links;
            }
            
            if (typeof links === 'string') {
                try {
                    const parsed = JSON.parse(links);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (error) {
                    console.warn('Failed to parse menu links:', error);
                    return [];
                }
            }
            
            return [];
        },

        // Utility function to generate unique IDs for menu items
        generateId() {
            return 'item_' + Math.random().toString(36).substr(2, 9);
        },

        // Ensure all menu items have proper IDs and structure
        ensureMenuItemsHaveIds(items) {
            if (!Array.isArray(items)) return [];
            
            return items.map(item => {
                // Ensure item has an ID
                if (!item.id) {
                    item.id = this.generateId();
                }
                
                // Ensure item has all required properties
                const validatedItem = {
                    id: item.id,
                    title: item.title || '',
                    url: item.url || '',
                    target: item.target || '_self',
                    icon: item.icon || '',
                    description: item.description || '',
                    children: []
                };
                
                // Process children recursively
                if (item.children && Array.isArray(item.children)) {
                    validatedItem.children = this.ensureMenuItemsHaveIds(item.children);
                }
                
                return validatedItem;
            });
        },

        // Legacy move functions (kept for backward compatibility)
        moveMenuItem(oldIndex, newIndex) {
            const item = this.currentMenu.links.splice(oldIndex, 1)[0];
            this.currentMenu.links.splice(newIndex, 0, item);
        },

        moveSubMenuItem(parentIndex, oldIndex, newIndex) {
            if (this.currentMenu.links[parentIndex] && this.currentMenu.links[parentIndex].children) {
                const item = this.currentMenu.links[parentIndex].children.splice(oldIndex, 1)[0];
                this.currentMenu.links[parentIndex].children.splice(newIndex, 0, item);
            }
        },

        moveSubSubMenuItem(parentIndex, subIndex, oldIndex, newIndex) {
            if (this.currentMenu.links[parentIndex] && 
                this.currentMenu.links[parentIndex].children[subIndex] && 
                this.currentMenu.links[parentIndex].children[subIndex].children) {
                const item = this.currentMenu.links[parentIndex].children[subIndex].children.splice(oldIndex, 1)[0];
                this.currentMenu.links[parentIndex].children[subIndex].children.splice(newIndex, 0, item);
            }
        },

        getTotalMenuItems(links = []) {
            const linksArray = this.parseMenuLinks(links);
            
            let count = linksArray.length;
            linksArray.forEach(link => {
                if (link.children && Array.isArray(link.children)) {
                    count += this.getTotalMenuItems(link.children);
                }
            });
            return count;
        },

        // ============================================================================
        // PRIVATE FUNCTIONS (internal implementation details)
        // ============================================================================

        async _saveFromModal() {
            if (!this.menuForm.title) {
                this.showNotification('Menu title is required.', 'error');
                return;
            }

            const menuData = {
                title: this.menuForm.title,
                platform: this.menuForm.platform,
                status: this.menuForm.status,
                sort_order: this.menuForm.sort_order,
                links: JSON.stringify([]) // Start with empty links array
            };

            try {
                const url = this.menuForm.id ? `/api/admin/menus/${this.menuForm.id}` : '/api/admin/menus';
                const method = this.menuForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(menuData)
                });

                const result = await response.json();

                if (result.success) {
                    this.closeModal();
                    await this.load();
                    this.showNotification(`Menu ${this.menuForm.id ? 'updated' : 'created'} successfully!`, 'success');
                } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving menu:', error);
                this.showNotification('Error saving menu. Please try again.', 'error');
            }
        },

        async _saveFromEditor(id = null) {
            if (!this.currentMenu) return;

            try {
                const isUpdate = this.currentMenu.id;

                // For new menus, validate required fields
                if (!isUpdate) {
                    if (!this.currentMenu.title || !this.currentMenu.title.trim()) {
                        this.showNotification('Menu title is required.', 'warning');
                        return;
                    }
                }

                // Prepare data for API
                const menuData = {
                    ...this.currentMenu,
                    links: JSON.stringify(this.currentMenu.links)
                };

                const url = isUpdate ? `/api/admin/menus/${this.currentMenu.id}` : '/api/admin/menus';
                const method = isUpdate ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(menuData)
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification(`Menu ${isUpdate ? 'updated' : 'created'} successfully!`, 'success');
                    
                    if (result.data) {
                        this.currentMenu = result.data;
                        // Re-parse links after save
                        if (typeof this.currentMenu.links === 'string') {
                            this.currentMenu.links = JSON.parse(this.currentMenu.links);
                        }
                    }
            } else {
                    this.showNotification(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Error saving menu:', error);
                this.showNotification('Error saving menu. Please try again.', 'error');
            }
        },
        hideMenuItemModal() {
            this.showMenuItemModal = false;
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createMenusModule = createMenusModule;
}
