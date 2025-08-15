import React, { useState, useEffect } from 'react';
import './dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        fiscalesGenerales: 0,
        fiscalesMesa: 0,
        totalEscuelas: 0,
        totalMesas: 0,
        totalCiudadanos: 0,
        totalLocalidades: 0,
        totalCircuitos: 0,
        totalPages: 0,
        totalStories: 0,
        totalCategories: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load dashboard stats from multiple endpoints
            const responses = await Promise.allSettled([
                fetch('/api/admin/users?limit=1'),
                fetch('/api/admin/escuelas?limit=1'),
                fetch('/api/admin/mesas?limit=1'),
                fetch('/api/admin/ciudadanos?limit=1'),
                fetch('/api/admin/localidades?limit=1'),
                fetch('/api/admin/circuitos?limit=1'),
                fetch('/api/admin/pages'),
                fetch('/api/admin/stories'),
                fetch('/api/admin/categories')
            ]);

            const [users, escuelas, mesas, ciudadanos, localidades, circuitos, pages, stories, categories] = responses;

            let newStats = { ...stats };

            // Process users response
            if (users.status === 'fulfilled' && users.value.ok) {
                const data = await users.value.json();
                newStats.totalUsers = data.pagination?.total || 0;
                
                // Count fiscales generales (users with fiscal_general_id)
                if (data.data && data.data.length > 0) {
                    const allUsersResponse = await fetch('/api/admin/users?limit=1000');
                    if (allUsersResponse.ok) {
                        const allUsersData = await allUsersResponse.json();
                        newStats.fiscalesGenerales = allUsersData.data.filter(user => user.fiscal_general_id).length;
                        newStats.fiscalesMesa = allUsersData.data.filter(user => user.fiscal_mesa_id).length;
                    }
                }
            }

            // Process escuelas response
            if (escuelas.status === 'fulfilled' && escuelas.value.ok) {
                const data = await escuelas.value.json();
                newStats.totalEscuelas = data.pagination?.total || 0;
            }

            // Process mesas response
            if (mesas.status === 'fulfilled' && mesas.value.ok) {
                const data = await mesas.value.json();
                newStats.totalMesas = data.pagination?.total || 0;
            }

            // Process ciudadanos response
            if (ciudadanos.status === 'fulfilled' && ciudadanos.value.ok) {
                const data = await ciudadanos.value.json();
                newStats.totalCiudadanos = data.pagination?.total || 0;
            }

            // Process localidades response
            if (localidades.status === 'fulfilled' && localidades.value.ok) {
                const data = await localidades.value.json();
                newStats.totalLocalidades = data.pagination?.total || 0;
            }

            // Process circuitos response
            if (circuitos.status === 'fulfilled' && circuitos.value.ok) {
                const data = await circuitos.value.json();
                newStats.totalCircuitos = data.pagination?.total || 0;
            }

            // Process pages response
            if (pages.status === 'fulfilled' && pages.value.ok) {
                const data = await pages.value.json();
                newStats.totalPages = data.data?.length || 0;
            }

            // Process stories response
            if (stories.status === 'fulfilled' && stories.value.ok) {
                const data = await stories.value.json();
                newStats.totalStories = data.data?.length || 0;
            }

            // Process categories response
            if (categories.status === 'fulfilled' && categories.value.ok) {
                const data = await categories.value.json();
                newStats.totalCategories = data.data?.length || 0;
            }

            setStats(newStats);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="row">
                {/* Total Usuarios */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Usuarios
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalUsers}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fiscales Generales */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Fiscales Generales
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.fiscalesGenerales}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-user-tie fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fiscales Mesa */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Fiscales Mesa
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.fiscalesMesa}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-user-check fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Escuelas */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Total Escuelas
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalEscuelas}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-school fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Total Mesas */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-danger shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                        Total Mesas
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalMesas}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-table fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Ciudadanos */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-secondary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                                        Total Ciudadanos
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalCiudadanos}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-id-card fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Localidades */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-dark shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-dark text-uppercase mb-1">
                                        Total Localidades
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalLocalidades}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-map-marker-alt fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Circuitos */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Circuitos
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalCircuitos}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-circle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Content Stats */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h5>Pages</h5>
                            <h2>{stats.totalPages}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h5>Stories</h5>
                            <h2>{stats.totalStories}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                            <h5>Categories</h5>
                            <h2>{stats.totalCategories}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h5>Users</h5>
                            <h2>{stats.totalUsers}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
