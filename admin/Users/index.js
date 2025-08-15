// Users functionality for admin panel
function createUsersModule() {
    return {
        // ============================================================================
        // STATE VARIABLES
        // ============================================================================
        
        // Entity data
        users: [],
        roles: [],

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
            console.log('👥 Initializing Users module...');
            await this.loadRoles();
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
                    status: userData.status || 'active'
                };
            } else {
                this.userForm = {
                    first_name: '',
                    last_name: '',
                    username: '',
                    email: '',
                    password: '',
                    role_id: null,
                    status: 'active'
                };
            }
            
            this.showUserModal = true;
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
                status: this.userForm.status
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
                status: 'active'
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
        // MI EQUIPO FUNCTIONALITY (Team hierarchy management)
        // ============================================================================

        // Team data and state
        teamData: null,
        loadingTeam: false,
        showSubordinatesModal: false,
        selectedUserForSubordinates: null,
        selectedUserSubordinates: [],
        loadingSubordinates: false,
        
        // Dynamic hierarchy data storage
        dynamicHierarchy: null,
        loadedChildren: new Map(), // Map of userId -> children array

        // Create new team member - opens user creation modal
        createTeamMember() {
            console.log('👥 Creating new team member...');
            // Use the existing new() function to open the user creation modal
            this.new();
        },

        // Load my team hierarchy data with lazy loading support
        async loadMyTeam(loadLevel = 'direct') {
            this.loadingTeam = true;
            try {
                const response = await fetch(`/api/admin/users/my-team?loadLevel=${loadLevel}`);
                const result = await response.json();

                if (result.success) {
                    this.teamData = result.data;
                    
                    // Clear any previously loaded children when loading new team data
                    this.loadedChildren.clear();
                    
                    console.log('📊 Raw team data from API:', this.teamData);
                    console.log('🔧 Load level:', loadLevel);
                    
                    // Debug team data structure
                    this.debugTeamData();
                    
                    this.showNotification('Información del equipo cargada exitosamente', 'success');
                    
                    // Wait for D3.js to load and then initialize chart
                    this.waitForD3AndInitChart();
                } else {
                    this.showNotification(result.message || 'Error al cargar información del equipo', 'error');
                }
            } catch (error) {
                console.error('Error loading team data:', error);
                this.showNotification('Error al cargar información del equipo', 'error');
            } finally {
                this.loadingTeam = false;
            }
        },

        // Wait for D3 to load and then initialize chart
        waitForD3AndInitChart(retries = 0, maxRetries = 15) {
            console.log(`🔄 Checking for D3.js... attempt ${retries + 1}/${maxRetries + 1}`);
            
            // Check if D3.js loaded successfully
            if (window.d3 && window.d3Loaded) {
                console.log('✅ D3.js loaded successfully');
                setTimeout(() => {
                    this.initD3OrgChart();
                }, 100);
                return;
            }

            // Check if all D3.js loading attempts failed
            if (window.d3LoadFailed) {
                console.error('❌ D3.js loading failed definitively');
                this.showNotification('Error: No se pudo cargar la librería D3.js desde ningún CDN. Verifica tu conexión a internet.', 'error');
                this.showOrgChartFallback();
                return;
            }

            if (retries < maxRetries) {
                // Wait 1000ms and try again (longer wait for network delays)
                setTimeout(() => {
                    this.waitForD3AndInitChart(retries + 1, maxRetries);
                }, 1000);
            } else {
                console.error('❌ D3.js failed to load after', maxRetries + 1, 'attempts');
                this.showNotification('Error: Tiempo de espera agotado para cargar D3.js. Intenta recargar la página.', 'error');
                
                // Show fallback
                this.showOrgChartFallback();
            }
        },

        // Show fallback when D3 fails to load
        showOrgChartFallback() {
            const container = document.getElementById('orgChart');
            if (container) {
                container.innerHTML = `
                    <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h5 class="text-muted">Organigrama no disponible</h5>
                        <p class="text-muted mb-3">No se pudo cargar la librería D3.js desde los CDNs.<br>
                        Esto puede deberse a problemas de conectividad o bloqueo de contenido externo.</p>
                        <div class="d-flex gap-2 flex-wrap justify-content-center">
                            <button type="button" class="btn btn-primary btn-sm" onclick="usersModule.retryLoadD3()">
                                <i class="fas fa-sync-alt me-1"></i>
                                Reintentar D3.js
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="location.reload()">
                                <i class="fas fa-refresh me-1"></i>
                                Recargar página
                            </button>
                        </div>
                        <small class="text-muted mt-3">
                            Si el problema persiste, verifica tu conexión a internet o contacta al administrador.
                        </small>
                    </div>
                `;
            }
        },

        // Retry loading D3.js manually
        async retryLoadD3() {
            console.log('🔄 Manual retry of D3.js loading...');
            
            // Clean up any existing D3.js attempts
            this.cleanupD3Scripts();
            
            // Reset failure state
            window.d3LoadFailed = false;
            window.d3Loaded = false;
            delete window.d3;
            
            // Show loading state
            const container = document.getElementById('orgChart');
            if (container) {
                container.innerHTML = `
                    <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <h5 class="text-muted">Reintentando cargar D3.js...</h5>
                        <p class="text-muted">Limpiando scripts anteriores y reintentando...</p>
                    </div>
                `;
            }

            // Try to load D3.js again with all fallbacks
            const fallbackUrls = [
                'https://d3js.org/d3.v7.min.js',
                'https://unpkg.com/d3@7.8.5/dist/d3.min.js',
                'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
            ];

            for (let i = 0; i < fallbackUrls.length; i++) {
                try {
                    console.log(`🔄 Attempting to load D3.js from: ${fallbackUrls[i]}`);
                    await this.loadScriptPromise(fallbackUrls[i]);
                    
                    // Wait a moment for D3 to be available
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    if (window.d3) {
                        console.log(`✅ D3.js loaded successfully from: ${fallbackUrls[i]}`);
                        window.d3Loaded = true;
                        this.showNotification('✅ D3.js cargado exitosamente. Inicializando organigrama...', 'success');
                        
                        // Wait a bit and then try to initialize
                        setTimeout(() => {
                            this.initD3OrgChart();
                        }, 500);
                        return;
                    }
                } catch (error) {
                    console.warn(`❌ Failed to load D3.js from: ${fallbackUrls[i]}`, error);
                }
            }

            // If we get here, all attempts failed
            console.error('❌ All manual retry attempts failed');
            window.d3LoadFailed = true;
            
            // Check network connectivity
            this.checkNetworkConnectivity().then(isOnline => {
                if (isOnline) {
                    this.showNotification('❌ No se pudo cargar D3.js después de todos los intentos. Puede ser un problema de firewall o bloqueo de CDN.', 'error');
                } else {
                    this.showNotification('❌ No se pudo cargar D3.js. Verifica tu conexión a internet.', 'error');
                }
                this.showOrgChartFallback();
            });
        },

        // Clean up any existing D3.js script tags
        cleanupD3Scripts() {
            console.log('🧹 Cleaning up existing D3.js scripts...');
            const scripts = document.querySelectorAll('script[src*="d3"]');
            scripts.forEach(script => {
                if (script.src.includes('d3')) {
                    console.log(`🗑️ Removing script: ${script.src}`);
                    script.remove();
                }
            });
        },

        // Helper function to load a script as a Promise
        loadScriptPromise(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },

        // Check network connectivity
        async checkNetworkConnectivity() {
            try {
                // Try to fetch a small resource to check connectivity
                const response = await fetch('/favicon.ico', { 
                    method: 'HEAD',
                    cache: 'no-cache',
                    timeout: 5000 
                });
                return response.ok;
            } catch (error) {
                console.warn('Network connectivity check failed:', error);
                // Also check navigator.onLine as fallback
                return navigator.onLine;
            }
        },

        // Initialize D3.js organizational chart
        initD3OrgChart() {
            console.log('🎯 initD3OrgChart called');
            console.log('D3 exists:', !!window.d3);
            console.log('teamData exists:', !!this.teamData);
            console.log('orgChart container exists:', !!document.getElementById('orgChart'));
            
            if (!window.d3) {
                console.error('❌ D3.js not loaded');
                return;
            }
            
            if (!this.teamData) {
                console.error('❌ Team data not available');
                return;
            }

            const container = document.getElementById('orgChart');
            if (!container) {
                console.error('❌ orgChart container not found');
                return;
            }

            // Clear existing chart
            d3.select(container).selectAll("*").remove();
            
            console.log('✅ Creating D3.js diagram');
            
            // Create hierarchical data structure for D3
            const hierarchyData = this.createD3HierarchyData();
            console.log('🔧 D3 hierarchy data:', hierarchyData);
            
            if (!hierarchyData) {
                this.renderD3OrgChart(testData);
            } else {
                this.renderD3OrgChart(hierarchyData);
            }
        },

        // Render the D3.js organizational chart
        renderD3OrgChart(data) {
            const container = d3.select('#orgChart');
            container.selectAll("*").remove();

            // Set up dimensions
            const containerElement = document.getElementById('orgChart');
            const width = containerElement.offsetWidth || 800;
            const height = containerElement.offsetHeight || 500;
            const nodeWidth = 180;
            const nodeHeight = 80;

            // Create SVG
            const svg = container.append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'd3-orgchart');

            // Add zoom and pan behavior
            const zoom = d3.zoom()
                .scaleExtent([0.1, 3])
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                });

            svg.call(zoom);

            // Create a group for the chart content (for zooming/panning)
            const g = svg.append('g')
                .attr('transform', 'translate(40,40)');

            // Create tree layout
            const tree = d3.tree()
                .nodeSize([nodeWidth + 50, nodeHeight + 60])
                .separation((a, b) => {
                    return a.parent === b.parent ? 1 : 1.2;
                });

            // Create hierarchy
            const root = d3.hierarchy(data);
            tree(root);

            // Center the tree
            const nodes = root.descendants();
            const links = root.links();

            // Calculate bounds for centering
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;
            
            nodes.forEach(d => {
                if (d.x < minX) minX = d.x;
                if (d.x > maxX) maxX = d.x;
                if (d.y < minY) minY = d.y;
                if (d.y > maxY) maxY = d.y;
            });

            const centerX = width / 2 - (minX + maxX) / 2;
            const centerY = 60;

            // Create links (connections between nodes)
            g.selectAll('.d3-link')
                .data(links)
                .enter().append('path')
                .attr('class', 'd3-link')
                .attr('d', d => {
                    const sourceX = d.source.x + centerX;
                    const sourceY = d.source.y + centerY + nodeHeight;
                    const targetX = d.target.x + centerX;
                    const targetY = d.target.y + centerY;

                    return `M${sourceX},${sourceY}
                           C${sourceX},${(sourceY + targetY) / 2}
                           ${targetX},${(sourceY + targetY) / 2}
                           ${targetX},${targetY}`;
                });

            // Create node groups
            const nodeGroups = g.selectAll('.d3-node')
                .data(nodes)
                .enter().append('g')
                .attr('class', d => `d3-node ${d.data.nodeType}-node`)
                .attr('transform', d => `translate(${d.x + centerX - nodeWidth/2}, ${d.y + centerY})`);

            // Add rectangles for nodes
            nodeGroups.append('rect')
                .attr('class', 'd3-node-rect')
                .attr('width', nodeWidth)
                .attr('height', nodeHeight)
                .attr('rx', 8)
                .attr('ry', 8);

            // Add node names
            nodeGroups.append('text')
                .attr('class', 'd3-node-name')
                .attr('x', nodeWidth / 2)
                .attr('y', 25)
                .text(d => d.data.name);

            // Add node roles
            nodeGroups.append('text')
                .attr('class', 'd3-node-role')
                .attr('x', nodeWidth / 2)
                .attr('y', 42)
                .text(d => d.data.role);

            // Add node assignments (if exists)
            nodeGroups.filter(d => d.data.assignment)
                .append('text')
                .attr('class', 'd3-node-assignment')
                .attr('x', nodeWidth / 2)
                .attr('y', 58)
                .text(d => d.data.assignment);

            // Add expand buttons for nodes that can expand
            const expandableNodes = nodeGroups.filter(d => d.data.hasUnloadedChildren);
            
            const expandButtons = expandableNodes.append('g')
                .attr('class', 'd3-expand-btn')
                .attr('transform', `translate(${nodeWidth / 2}, ${nodeHeight + 15})`)
                .style('cursor', 'pointer');

            expandButtons.append('circle')
                .attr('r', 12);

            // Add click handlers for expand buttons
            expandButtons.on('click', (event, d) => {
                event.stopPropagation();
                console.log('🖱️ D3 expand button clicked for node:', d.data.id);
                
                if (d.data.hasUnloadedChildren) {
                    console.log('✅ Loading children for node:', d.data.userId);
                    
                    // Show loading feedback on the button
                    const clickedButton = d3.select(event.currentTarget);
                    this.setExpandButtonLoading(clickedButton, true);
                    
                    // Store current zoom/pan transform to restore later
                    const currentTransform = d3.zoomTransform(svg.node());
                    
                    // Load children with loading feedback
                    this.loadD3NodeChildren(d.data, nodeGroups.filter(node => node.data.id === d.data.id), currentTransform);
                } else {
                    console.log('⚠️ Node cannot expand or already loaded');
                }
            });

            console.log('✅ D3.js diagram initialized with expand controls');

            // Store chart reference for future updates
            this.d3Chart = { svg, g, tree, root, centerX, centerY, nodeWidth, nodeHeight, zoom };
        },

        // Set loading state for expand button
        setExpandButtonLoading(buttonElement, isLoading) {
            const textElement = buttonElement.select('text');
            const circleElement = buttonElement.select('circle');
            
            if (isLoading) {
                // Change to loading state
                circleElement.style('fill', '#ffc107').style('stroke', '#fff');
                buttonElement.style('cursor', 'wait');
            } else {
                // Restore normal state
                circleElement.style('fill', '#2196F3').style('stroke', '#fff');
                buttonElement.style('cursor', 'pointer');
            }
        },

        // Load children for a D3 node dynamically
        async loadD3NodeChildren(nodeData, nodeElement, currentTransform = null) {
            console.log('🚀 loadD3NodeChildren called with:', { 
                nodeData: nodeData, 
                hasUserId: !!nodeData.userId, 
                isLoaded: nodeData.loaded,
                hasUnloadedChildren: nodeData.hasUnloadedChildren
            });
            
            // Check if this node can be expanded
            if (!nodeData.userId) {
                console.log('⏹️ Skipping loadD3NodeChildren - missing userId');
                return;
            }

            // Check if this node has already been expanded and has no more children to load
            if (nodeData.loaded && !nodeData.hasUnloadedChildren) {
                console.log('⏹️ Skipping loadD3NodeChildren - already fully loaded');
                return;
            }

            console.log('🔄 Loading children for user:', nodeData.userId);
            
            try {
                const response = await fetch(`/api/admin/users/${nodeData.userId}/subordinates?level=direct`);
                const result = await response.json();

                if (result.success && result.data && result.data.length > 0) {
                    // Store the loaded children in our dynamic storage
                    this.loadedChildren.set(nodeData.userId, result.data);
                    
                    // Add children to the node data
                    if (!nodeData.children) {
                        nodeData.children = [];
                    }
                    
                    // Add real children with their data
                    result.data.forEach(subordinate => {
                        // Check if this child already exists to avoid duplicates
                        const existingChild = nodeData.children.find(child => 
                            child.userId === subordinate.id
                        );
                        
                        if (!existingChild) {
                            const childNode = this.createD3NodeDataFromUser(subordinate, 'subordinate');
                            if (childNode) {
                                nodeData.children.push(childNode);
                            }
                        }
                    });

                    // Mark as loaded but keep hasUnloadedChildren true for future expansion
                    nodeData.loaded = true;
                    
                    // Update the hierarchy data and re-render with new children, preserving transform
                    this.updateHierarchyAndRender(nodeData, currentTransform);
                    
                    console.log('✅ Successfully loaded children for user:', nodeData.userId);
                } else if (result.success && result.data && result.data.length === 0) {
                    // No children found - this node cannot expand further
                    nodeData.loaded = true;
                    nodeData.hasUnloadedChildren = false;
                    nodeData.children = [];
                    
                    // Update the hierarchy data and re-render to remove expand button, preserving transform
                    this.updateHierarchyAndRender(nodeData, currentTransform);
                    
                    console.log('ℹ️ No children found for user:', nodeData.userId);
                } else {
                    console.error('❌ Failed to load children:', result.message);
                    this.showNotification('Error al cargar subordinados', 'error');
                }
            } catch (error) {
                console.error('❌ Error loading children:', error);
                this.showNotification('Error al cargar subordinados', 'error');
            } finally {
                // Reset any loading buttons for this node after the operation completes
                setTimeout(() => {
                    this.resetLoadingButtonsForNode(nodeData.id);
                }, 100);
            }
        },

        // Reset loading state for buttons of a specific node
        resetLoadingButtonsForNode(nodeId) {
            if (!this.d3Chart || !this.d3Chart.svg) return;
            
            // Find all expand buttons in the current chart and reset loading state
            this.d3Chart.svg.selectAll('.d3-expand-btn').each(function(d) {
                if (d && d.data && d.data.id === nodeId) {
                    const button = d3.select(this);
                    const textElement = button.select('text');
                    const circleElement = button.select('circle');
                    
                    // Reset to normal state
                    textElement.text('+').style('animation', 'none');
                    circleElement.style('fill', '#2196F3').style('stroke', '#fff');
                    button.style('cursor', 'pointer');
                }
            });
        },

        // Helper to create D3 node data from user object
        createD3NodeDataFromUser(user, nodeType) {
            if (!user || !user.id) return null;

            const firstName = user.first_name || user.firstName || '';
            const lastName = user.last_name || user.lastName || '';
            const userRole = user.role;

            const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Usuario Sin Nombre';
            const roleDisplay = userRole?.display_name || userRole?.name || 'Sin Rol';
            
            let assignment = '';
            try {
                assignment = this.getUserAssignmentText(user) || '';
            } catch (error) {
                console.warn(`⚠️ Error getting assignment for ${nodeType}:`, error);
                assignment = '';
            }

            const nodeData = {
                id: `user_${user.id}`,
                name: displayName,
                role: roleDisplay,
                nodeType: nodeType,
                assignment: assignment,
                userId: user.id,
                children: [],
                loaded: false
            };

            // All node types except 'superior' can potentially expand
            if (nodeType !== 'superior') {
                nodeData.hasUnloadedChildren = true;
                nodeData.children = [];
                console.log(`✅ ${displayName} (${nodeType}) SET AS EXPANDABLE - can load children dynamically`);
            } else {
                nodeData.hasUnloadedChildren = false;
                nodeData.children = [];
                console.log(`❌ ${displayName} (${nodeType}) CANNOT expand - is superior`);
            }

            return nodeData;
        },

        // Create hierarchical data structure for D3.js
        createD3HierarchyData() {
            const currentUser = this.teamData.currentUser;

            console.log('🏗️ Creating D3 hierarchy...');
            console.log('Current user raw:', currentUser);

            if (!currentUser) {
                console.error('❌ No current user data available');
                return null;
            }

            // Helper function to create safe node data
            const createSafeNodeData = (user, nodeType) => {
                if (!user) return null;

                const userId = user.id;
                const firstName = user.first_name || user.firstName || '';
                const lastName = user.last_name || user.lastName || '';
                const userRole = user.role;

                if (!userId) return null;

                const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Usuario Sin Nombre';
                const roleDisplay = userRole?.display_name || userRole?.name || 'Sin Rol';
                
                console.log(`🏗️ Creating D3 node: ${displayName} as ${nodeType} (ID: ${userId})`);
                
                let assignment = '';
                try {
                    assignment = this.getUserAssignmentText(user) || '';
                } catch (error) {
                    console.warn(`⚠️ Error getting assignment for ${nodeType}:`, error);
                    assignment = '';
                }

                const nodeData = {
                    id: `user_${userId}`,
                    name: displayName,
                    role: roleDisplay,
                    nodeType: nodeType,
                    assignment: assignment,
                    userId: userId,
                    children: [],
                    loaded: false
                };

                // Check if this user has dynamically loaded children
                const dynamicChildren = this.loadedChildren.get(userId);
                if (dynamicChildren && dynamicChildren.length > 0) {
                    console.log(`📚 Adding ${dynamicChildren.length} dynamically loaded children for ${displayName}`);
                    nodeData.children = dynamicChildren.map(child => 
                        createSafeNodeData(child, 'subordinate')
                    ).filter(child => child !== null);
                    nodeData.loaded = true;
                    nodeData.hasUnloadedChildren = true; // Still expandable for deeper levels
                } else {
                    // All node types except 'superior' can potentially expand
                    if (nodeType !== 'superior') {
                        console.log(`✅ ${displayName} (${nodeType}) SET AS EXPANDABLE - can attempt to load children`);
                        nodeData.hasUnloadedChildren = true;
                        nodeData.children = [];
                    } else {
                        console.log(`❌ ${displayName} (${nodeType}) CANNOT expand - is superior`);
                        nodeData.hasUnloadedChildren = false;
                        nodeData.children = [];
                    }
                }

                return nodeData;
            };

            // Start with creator/superior as root if exists, otherwise current user as root
            let rootNode;
            let currentNode;

            if (this.teamData.superior) {
                // Superior (creator) is root
                rootNode = createSafeNodeData(this.teamData.superior, 'superior');
                if (!rootNode) return null;

                // Current user is child of superior
                currentNode = createSafeNodeData(currentUser, 'current');
                if (currentNode) {
                    rootNode.children.push(currentNode);
                }

                // Add siblings (other users created by the same superior) as children of superior
                if (this.teamData.siblings && Array.isArray(this.teamData.siblings)) {
                    this.teamData.siblings.forEach(sibling => {
                        const siblingNode = createSafeNodeData(sibling, 'sibling');
                        if (siblingNode) {
                            rootNode.children.push(siblingNode);
                        }
                    });
                }
            } else {
                // Current user is root (no creator/superior)
                currentNode = createSafeNodeData(currentUser, 'current');
                rootNode = currentNode;
                if (!rootNode) return null;
            }

            // Add subordinates (users created by current user) to current user
            if (this.teamData.subordinates && Array.isArray(this.teamData.subordinates) && currentNode) {
                console.log('📊 Adding subordinates to current user:', this.teamData.subordinates.length);
                
                this.teamData.subordinates.forEach((subordinate, index) => {
                    console.log(`🔗 Processing subordinate ${index}:`, subordinate.first_name, subordinate.last_name);
                    const subordinateNode = createSafeNodeData(subordinate, 'subordinate');
                    if (subordinateNode) {
                        console.log('✅ Added subordinate node:', subordinateNode.name);
                        currentNode.children.push(subordinateNode);
                    } else {
                        console.log('❌ Failed to create subordinate node for:', subordinate.first_name);
                    }
                });
                
                // Mark current user as having loaded initial children
                if (this.teamData.subordinates.length > 0) {
                    currentNode.loaded = true;
                }
                
                console.log('📈 Final currentNode children count:', currentNode.children.length);
            } else {
                console.log('⚠️ No subordinates to add:', {
                    hasSubordinates: !!this.teamData.subordinates,
                    isArray: Array.isArray(this.teamData.subordinates),
                    hasCurrentNode: !!currentNode,
                    subordinatesLength: this.teamData.subordinates?.length
                });
            }

            console.log('✅ Final D3 hierarchy:', rootNode);
            return rootNode;
        },

        // Debug function to show raw team data structure
        debugTeamData() {
            console.log('🔍 DEBUGGING TEAM DATA STRUCTURE:');
            console.log('Current User:', this.teamData?.currentUser);
            console.log('Superior:', this.teamData?.superior);
            console.log('Siblings:', this.teamData?.siblings);
            console.log('Subordinates:', this.teamData?.subordinates);
            console.log('Assignments:', this.teamData?.assignments);
            console.log('Total Team Size:', this.teamData?.totalTeamSize);
            
            // Deep inspection of current user
            if (this.teamData?.currentUser) {
                console.log('🔍 CURRENT USER DETAILED:');
                console.log('- ID:', this.teamData.currentUser.id);
                console.log('- Name:', this.teamData.currentUser.first_name, this.teamData.currentUser.last_name);
                console.log('- HasChildren:', this.teamData.currentUser.hasChildren);
                console.log('- Created_by:', this.teamData.currentUser.created_by);
            }
            
            // Deep inspection of each subordinate
            if (this.teamData?.subordinates) {
                console.log('🔍 SUBORDINATES DETAILED:');
                this.teamData.subordinates.forEach((sub, index) => {
                    console.log(`Subordinate ${index}:`, {
                        id: sub.id,
                        first_name: sub.first_name,
                        last_name: sub.last_name,
                        role: sub.role,
                        hasChildren: sub.hasChildren,
                        created_by: sub.created_by,
                        full_object: sub
                    });
                });
            }
            
            // Deep inspection of siblings
            if (this.teamData?.siblings) {
                console.log('🔍 SIBLINGS DETAILED:');
                this.teamData.siblings.forEach((sib, index) => {
                    console.log(`Sibling ${index}:`, {
                        id: sib.id,
                        first_name: sib.first_name,
                        last_name: sib.last_name,
                        role: sib.role,
                        hasChildren: sib.hasChildren,
                        created_by: sib.created_by
                    });
                });
            }
        },

        // Get assignment text for a user (simplified for pyramidal structure)
        getUserAssignmentText(user) {
            if (!user.access_assignments || user.access_assignments.length === 0) {
                return '';
            }

            const assignment = user.access_assignments[0];
            if (assignment.mesa) {
                return `Mesa ${assignment.mesa.numero}`;
            } else if (assignment.escuela) {
                return assignment.escuela.nombre;
            } else if (assignment.circuito) {
                return assignment.circuito.nombre;
            } else if (assignment.localidad) {
                return assignment.localidad.nombre;
            }
            return '';
        },



        // Load subordinates for a specific user (for dynamic modal)
        async loadUserSubordinates(userId, userName) {
            this.selectedUserForSubordinates = { id: userId, name: userName };
            this.showSubordinatesModal = true;
            this.loadingSubordinates = true;

            try {
                const response = await fetch(`/api/admin/users/${userId}/subordinates`);
                const result = await response.json();

                if (result.success) {
                    this.selectedUserSubordinates = result.data;
                } else {
                    this.showNotification(result.message || 'Error al cargar subordinados', 'error');
                }
            } catch (error) {
                console.error('Error loading subordinates:', error);
                this.showNotification('Error al cargar subordinados', 'error');
            } finally {
                this.loadingSubordinates = false;
            }
        },

        // Close subordinates modal
        closeSubordinatesModal() {
            this.showSubordinatesModal = false;
            this.selectedUserForSubordinates = null;
            this.selectedUserSubordinates = [];
        },

        // Update hierarchy data and re-render chart efficiently
        updateHierarchyAndRender(updatedNodeData, preserveTransform = null) {
            console.log('🔄 Updating hierarchy and re-rendering chart for node:', updatedNodeData.id);
            
            // Update the main hierarchy data with the new node information
            this.updateMainHierarchyData(updatedNodeData);
            
            // Get the updated hierarchy
            const currentData = this.createD3HierarchyData();
            
            if (!currentData) {
                console.error('❌ No data to render');
                return;
            }

            // Re-render the chart with updated data
            this.renderD3OrgChart(currentData);
            
            // Restore the zoom/pan position if provided
            if (preserveTransform && this.d3Chart && this.d3Chart.svg && this.d3Chart.zoom) {
                console.log('🎯 Restoring previous zoom/pan position');
                this.d3Chart.svg.call(this.d3Chart.zoom.transform, preserveTransform);
            }
        },

        // Update the main team data with new node information
        updateMainHierarchyData(updatedNodeData) {
            console.log('📊 Updating main hierarchy data for:', updatedNodeData.userId);
            
            // Update the node in the team data structure if it exists
            const updateInTeamData = (users, updatedNode) => {
                if (!users || !Array.isArray(users)) return false;
                
                for (let i = 0; i < users.length; i++) {
                    if (users[i].id === updatedNode.userId) {
                        // Mark this user as loaded in the original data
                        users[i].childrenLoaded = updatedNode.loaded;
                        users[i].hasUnloadedChildren = updatedNode.hasUnloadedChildren;
                        console.log('✅ Updated user in team data:', users[i].id);
                        return true;
                    }
                }
                return false;
            };

            // Try to update in different parts of team data
            if (this.teamData) {
                // Check current user
                if (this.teamData.currentUser && this.teamData.currentUser.id === updatedNodeData.userId) {
                    this.teamData.currentUser.childrenLoaded = updatedNodeData.loaded;
                    this.teamData.currentUser.hasUnloadedChildren = updatedNodeData.hasUnloadedChildren;
                }
                
                // Check subordinates
                updateInTeamData(this.teamData.subordinates, updatedNodeData);
                
                // Check siblings
                updateInTeamData(this.teamData.siblings, updatedNodeData);
                
                // Check superior
                if (this.teamData.superior && this.teamData.superior.id === updatedNodeData.userId) {
                    this.teamData.superior.childrenLoaded = updatedNodeData.loaded;
                    this.teamData.superior.hasUnloadedChildren = updatedNodeData.hasUnloadedChildren;
                }
            }
        },

        // Refresh the D3 org chart after loading new data
        refreshD3OrgChart() {
            console.log('🔄 Refreshing D3 org chart...');
            
            // Store current data hierarchy
            const currentData = this.createD3HierarchyData();
            
            if (!currentData) {
                console.error('❌ No data to refresh');
                return;
            }

            // Re-render the chart with updated data
            this.renderD3OrgChart(currentData);
        },

        // D3 org chart controls - expand all nodes
        expandAllNodes() {
            if (this.d3Chart) {
                console.log('🔄 Expanding all nodes in D3 chart');
                // This would require implementing a more complex expand-all logic in D3
                // For now, just refresh the chart
                this.refreshD3OrgChart();
            }
        },

        // D3 org chart controls - collapse all nodes
        collapseAllNodes() {
            if (this.d3Chart) {
                console.log('🔄 Collapsing all nodes in D3 chart');
                // Re-render with initial data (only direct children)
                const initialData = this.createD3HierarchyData();
                if (initialData) {
                    // Reset loaded state for all children
                    const resetNodeState = (node) => {
                        if (node.children) {
                            node.children.forEach(child => {
                                child.loaded = false;
                                child.children = [];
                                resetNodeState(child);
                            });
                        }
                    };
                    resetNodeState(initialData);
                    this.renderD3OrgChart(initialData);
                }
            }
        },

        // D3 org chart controls - center on current user
        centerOnCurrentUser() {
            if (this.d3Chart && this.teamData && this.d3Chart.zoom) {
                console.log('🎯 Centering on current user in D3 chart');
                
                // Reset zoom and pan to initial position
                const svg = this.d3Chart.svg;
                const containerElement = document.getElementById('orgChart');
                const width = containerElement.offsetWidth || 800;
                const height = containerElement.offsetHeight || 500;
                
                // Reset to initial transform
                const initialTransform = d3.zoomIdentity.translate(40, 40);
                
                svg.transition()
                    .duration(750)
                    .call(this.d3Chart.zoom.transform, initialTransform);
            }
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createUsersModule = createUsersModule;
} 