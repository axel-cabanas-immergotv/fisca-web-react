// Dashboard functionality for admin panel
function createDashboardModule() {
    return {
        stats: {
            totalUsers: 0,
            fiscalesGenerales: 0,
            fiscalesMesa: 0,
            totalEscuelas: 0,
            totalMesas: 0,
            totalCiudadanos: 0,
            totalLocalidades: 0,
            totalCircuitos: 0
        },

        async loadDashboard() {
            try {
                // Load dashboard stats from multiple endpoints
                const responses = await Promise.allSettled([
                    fetch('/api/admin/users?limit=1'),
                    fetch('/api/admin/escuelas?limit=1'),
                    fetch('/api/admin/mesas?limit=1'),
                    fetch('/api/admin/ciudadanos?limit=1'),
                    fetch('/api/admin/localidades?limit=1'),
                    fetch('/api/admin/circuitos?limit=1')
                ]);

                const [users, escuelas, mesas, ciudadanos, localidades, circuitos] = responses;

                // Process users response
                if (users.status === 'fulfilled' && users.value.ok) {
                    const data = await users.value.json();
                    this.stats.totalUsers = data.pagination?.total || 0;
                    
                    // Count fiscales generales (users with fiscal_general_id)
                    if (data.data && data.data.length > 0) {
                        const allUsersResponse = await fetch('/api/admin/users?limit=1000');
                        if (allUsersResponse.ok) {
                            const allUsersData = await allUsersResponse.json();
                            this.stats.fiscalesGenerales = allUsersData.data.filter(user => user.fiscal_general_id).length;
                            this.stats.fiscalesMesa = allUsersData.data.filter(user => user.fiscal_mesa_id).length;
                        }
                    }
                }

                // Process escuelas response
                if (escuelas.status === 'fulfilled' && escuelas.value.ok) {
                    const data = await escuelas.value.json();
                    this.stats.totalEscuelas = data.pagination?.total || 0;
                }

                // Process mesas response
                if (mesas.status === 'fulfilled' && mesas.value.ok) {
                    const data = await mesas.value.json();
                    this.stats.totalMesas = data.pagination?.total || 0;
                }

                // Process ciudadanos response
                if (ciudadanos.status === 'fulfilled' && ciudadanos.value.ok) {
                    const data = await ciudadanos.value.json();
                    this.stats.totalCiudadanos = data.pagination?.total || 0;
                }

                // Process localidades response
                if (localidades.status === 'fulfilled' && localidades.value.ok) {
                    const data = await localidades.value.json();
                    this.stats.totalLocalidades = data.pagination?.total || 0;
                }

                // Process circuitos response
                if (circuitos.status === 'fulfilled' && circuitos.value.ok) {
                    const data = await circuitos.value.json();
                    this.stats.totalCircuitos = data.pagination?.total || 0;
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
                <!-- Total Usuarios -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-primary shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Usuarios
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.totalUsers}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fiscales Generales -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-success shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Fiscales Generales
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.fiscalesGenerales}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-user-tie fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fiscales de Mesa -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-info shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Fiscales de Mesa
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.fiscalesMesa}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-user-check fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Escuelas -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-warning shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Total Escuelas
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.totalEscuelas}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-school fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Mesas -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-danger shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                        Total Mesas
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.totalMesas}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-table fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Ciudadanos -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-secondary shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                                        Total Ciudadanos
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.totalCiudadanos}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-id-card fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Localidades -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-dark shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-dark text-uppercase mb-1">
                                        Total Localidades
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.totalLocalidades}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-map-marker-alt fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Circuitos -->
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-primary shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Circuitos
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        ${this.stats.totalCircuitos}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-route fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen del Sistema -->
                <div class="col-12 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">Resumen del Sistema</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5 class="text-success">Estructura Organizacional</h5>
                                    <p class="mb-2">El sistema está organizado en <strong>${this.stats.totalLocalidades}</strong> localidades, que contienen <strong>${this.stats.totalCircuitos}</strong> circuitos electorales.</p>
                                    <p class="mb-2">Cada circuito contiene múltiples escuelas (<strong>${this.stats.totalEscuelas}</strong> en total) donde se ubican las mesas de votación (<strong>${this.stats.totalMesas}</strong> en total).</p>
                                </div>
                                <div class="col-md-6">
                                    <h5 class="text-info">Personal Electoral</h5>
                                    <p class="mb-2">El sistema cuenta con <strong>${this.stats.totalUsers}</strong> usuarios registrados, de los cuales:</p>
                                    <ul class="mb-0">
                                        <li><strong>${this.stats.fiscalesGenerales}</strong> son fiscales generales</li>
                                        <li><strong>${this.stats.fiscalesMesa}</strong> son fiscales de mesa</li>
                                    </ul>
                                    <p class="mt-2 mb-0">Estos fiscales supervisan el padrón electoral de <strong>${this.stats.totalCiudadanos}</strong> ciudadanos.</p>
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