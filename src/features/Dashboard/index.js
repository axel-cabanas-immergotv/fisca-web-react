// Dashboard functionality for admin panel
function createDashboardModule() {
    return {
        stats: {
            stories: 0,
            pages: 0,
            users: 0,
            categories: 0
        },

        async loadDashboard() {
            try {
                // Load dashboard stats
                const responses = await Promise.allSettled([
                    fetch('/api/admin/stories?limit=1'),
                    fetch('/api/admin/pages?limit=1'),
                    fetch('/api/admin/users?limit=1'),
                    fetch('/api/admin/categories?limit=1')
                ]);

                const [storiesRes, pagesRes, usersRes, categoriesRes] = responses;

                if (storiesRes.status === 'fulfilled' && storiesRes.value.ok) {
                    const data = await storiesRes.value.json();
                    this.stats.stories = data.pagination?.total || 0;
                }

                if (pagesRes.status === 'fulfilled' && pagesRes.value.ok) {
                    const data = await pagesRes.value.json();
                    this.stats.pages = data.pagination?.total || 0;
                }

                if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                    const data = await usersRes.value.json();
                    this.stats.users = data.pagination?.total || 0;
                }

                if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
                    const data = await categoriesRes.value.json();
                    this.stats.categories = data.pagination?.total || 0;
                }

                this.renderDashboard();
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        },

        renderDashboard() {
            const container = document.getElementById('dashboard-content');
            if (!container) return;

            container.innerHTML = `
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-primary shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Stories
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.stories}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-newspaper fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-success shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Pages
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.pages}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-file-alt fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-info shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Users
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.users}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-warning shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Categories
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.categories}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-tags fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createDashboardModule = createDashboardModule;
} 