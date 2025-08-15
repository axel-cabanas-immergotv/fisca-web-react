// Import all modules
import './Dashboard/index.js';
import './Pages/index.js';
import './Stories/index.js';
import './Modules/index.js';
import './Categories/index.js';
import './Menus/index.js';
import './Users/index.js';
import './Roles/index.js';
import './Permissions/index.js';
import './Affiliates/index.js';


// Main Admin app for Alpine.js - Refactored version using modules
function adminApp() {
    return {
        // Core app state
        loading: true,
        user: null,
        currentSection: 'dashboard',
        mobileSidebarOpen: false,
        
        // Module instances
        dashboardModule: null,
        pagesModule: null,
        storiesModule: null,
        modulesModule: null,
        categoriesModule: null,
        menusModule: null,
        usersModule: null,
        rolesModule: null,
        permissionsModule: null,
        affiliatesModule: null,

        // Initialize app and modules
        async init() {
            try {
                await this.checkAuth();
                this.initializeModules();
                await this.loadCurrentSection();
            } catch (error) {
                console.error('Error initializing admin:', error);
                window.location.href = '/login';
            } finally {
                this.loading = false;
            }
        },

        // Initialize all modules with shared context
        initializeModules() {
            const sharedContext = {
                setSection: this.setSection.bind(this),
                showNotification: this.showNotification.bind(this),
                hasPermission: this.hasPermission.bind(this),
                user: this.user,
                currentSection: this.currentSection,
                editorMode: 'visual'
            };

            this.dashboardModule = Object.assign(window.createDashboardModule(), sharedContext);
            this.pagesModule = Object.assign(window.createPagesModule(), sharedContext);
            this.storiesModule = Object.assign(window.createStoriesModule(), sharedContext);
            this.modulesModule = Object.assign(window.createModulesModule(), sharedContext);
            this.categoriesModule = Object.assign(window.createCategoriesModule(), sharedContext);
            
            this.menusModule = Object.assign(window.createMenusModule(), sharedContext);
            
            this.usersModule = Object.assign(window.createUsersModule(), sharedContext);
            this.rolesModule = Object.assign(window.createRolesModule(), sharedContext);
            this.permissionsModule = Object.assign(window.createPermissionsModule(), sharedContext);
            this.affiliatesModule = Object.assign(window.createAffiliatesModule(), sharedContext);

            console.log('✅ All modules initialized successfully');
        },

        // Authentication
        async checkAuth() {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();

                if (!data.success) {
                    throw new Error('Not authenticated');
                }

                this.user = data.user;
            } catch (error) {
                console.error('Auth check failed:', error);
                throw error;
            }
        },

        hasPermission(permission) {
            if (!this.user || !this.user.role || !this.user.role.permissions) {
                return false;
            }

            return this.user.role.permissions.some(p => p.name === permission);
        },

        // Navigation
        setSection(section) {
            console.log('Setting section:', section);
            this.currentSection = section;
            this.mobileSidebarOpen = false;
            this.loadCurrentSection();
        },

        async loadCurrentSection() {
            // Load content for the current section using appropriate module
            switch (this.currentSection) {
                case 'dashboard':
                    await this.dashboardModule.loadDashboard();
                    break;
                case 'pages':
                    await this.pagesModule.load();
                    break;
                case 'stories':
                    await this.storiesModule.load();
                    break;
                case 'modules':
                    await this.modulesModule.load();
                    break;
                case 'categories':
                    await this.categoriesModule.load();
                    break;
                case 'menus':
                    await this.menusModule.load();
                    break;
                case 'users':
                    if (this.hasPermission('users.read')) {
                        await this.usersModule.load();
                    }
                    break;
                case 'roles':
                    if (this.hasPermission('roles.read')) {
                        await this.rolesModule.load();
                    }
                    break;
                case 'permissions':
                    if (this.hasPermission('permissions.read')) {
                        await this.permissionsModule.load();
                    }
                    break;
                case 'affiliates':
                    if (this.hasPermission('affiliates.read')) {
                        await this.affiliatesModule.load();
                    }
                    break;
                case 'page-editor':
                case 'story-editor':
                case 'module-editor':
                case 'menu-editor':
                    // These are handled by the respective modules
                    break;
                default:
                    console.log(`Loading section: ${this.currentSection}`);
            }
        },

        // Dashboard
        async loadDashboard() {
            const container = document.getElementById('dashboard-content');
            if (!container) return;

            container.innerHTML = `
                <div class="col-md-3 mb-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h5>Pages</h5>
                            <h2 id="pages-count">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h5>Stories</h5>
                            <h2 id="stories-count">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="card bg-warning text-white">
                        <div class="card-body text-center">
                            <h5>Categories</h5>
                            <h2 id="categories-count">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h5>Users</h5>
                            <h2 id="users-count">0</h2>
                        </div>
                    </div>
                </div>
            `;

            // Load counts
            try {
                const [pagesRes, storiesRes, categoriesRes] = await Promise.all([
                    fetch('/api/admin/pages'),
                    fetch('/api/admin/stories'),
                    fetch('/api/admin/categories')
                ]);

                const [pages, stories, categories] = await Promise.all([
                    pagesRes.json(),
                    storiesRes.json(),
                    categoriesRes.json()
                ]);

                document.getElementById('pages-count').textContent = pages.data?.length || 0;
                document.getElementById('stories-count').textContent = stories.data?.length || 0;
                document.getElementById('categories-count').textContent = categories.data?.length || 0;

                if (this.hasPermission('users.read')) {
                    const usersRes = await fetch('/api/admin/users');
                    const users = await usersRes.json();
                    document.getElementById('users-count').textContent = users.data?.length || 0;
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        },


        // Notification system
        showNotification(message, type = 'info', duration = 4000) {
            const container = document.getElementById('notification-container');
            if (!container) return;

            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            // Get appropriate icon
            let icon = 'fas fa-info-circle';
            switch (type) {
                case 'success':
                    icon = 'fas fa-check-circle';
                    break;
                case 'error':
                    icon = 'fas fa-exclamation-circle';
                    break;
                case 'warning':
                    icon = 'fas fa-exclamation-triangle';
                    break;
                default:
                    icon = 'fas fa-info-circle';
            }

            notification.innerHTML = `
                <div class="notification-content">
                    <i class="notification-icon ${icon}"></i>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">&times;</button>
            `;

            // Add close button functionality
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                this.hideNotification(notification);
            });

            // Add to container and show
            container.appendChild(notification);
            
            // Trigger animation
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            // Auto-hide after duration
            if (duration > 0) {
                setTimeout(() => {
                    this.hideNotification(notification);
                }, duration);
            }
        },

        hideNotification(notification) {
            notification.classList.remove('show');
            notification.classList.add('hide');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        },

        // Profile and auth functions
        showProfile() {
            this.showNotification('Profile functionality will be implemented here.', 'info');
        },

        async logout() {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/login';
            }
        }
    };
}

// Make adminApp available globally for Alpine.js
window.adminApp = adminApp; 