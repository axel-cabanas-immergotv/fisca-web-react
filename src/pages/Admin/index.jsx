import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Dashboard from './Dashboard';
import Users from './Users';
import Pages from './Pages';
import Stories from './Stories';
import Modules from './Modules';
import Categories from './Categories';
import Menus from './Menus';
import Roles from './Roles';
import Permissions from './Permissions';
import Affiliates from './Affiliates';
import Localidades from './Localidades';
import Secciones from './Secciones';
import Circuitos from './Circuitos';
import Escuelas from './Escuelas';
import Mesas from './Mesas';
import './admin.css';

const Admin = () => {
    const [currentSection, setCurrentSection] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
        // Extract section from URL path
        const path = location.pathname;
        const section = path.split('/admin/')[1] || 'dashboard';
        setCurrentSection(section);
    }, [location]);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (!data.success) {
                throw new Error('Not authenticated');
            }

            setUser(data.user);
        } catch (error) {
            console.error('Auth check failed:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permission) => {
        if (!user || !user.role || !user.role.permissions) {
            return false;
        }

        return user.role.permissions.some(p => p.name === permission);
    };

    const handleSectionChange = (section) => {
        setCurrentSection(section);
        setMobileSidebarOpen(false); // Close mobile sidebar when section changes
        navigate(`/admin/${section}`);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentSection) {
            case 'dashboard':
                return <Dashboard />;
            case 'users':
                if (hasPermission('users.read')) {
                    return <Users />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'pages':
                if (hasPermission('pages.read')) {
                    return <Pages />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'stories':
                if (hasPermission('stories.read')) {
                    return <Stories />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'modules':
                if (hasPermission('modules.read')) {
                    return <Modules />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'categories':
                if (hasPermission('categories.read')) {
                    return <Categories />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'menus':
                if (hasPermission('menus.read')) {
                    return <Menus />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'roles':
                if (hasPermission('roles.read')) {
                    return <Roles />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'permissions':
                if (hasPermission('permissions.read')) {
                    return <Permissions />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'affiliates':
                if (hasPermission('affiliates.read')) {
                    return <Affiliates />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'localidades':
                if (hasPermission('localidades.read')) {
                    return <Localidades />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'secciones':
                if (hasPermission('secciones.read')) {
                    return <Secciones />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'circuitos':
                if (hasPermission('circuitos.read')) {
                    return <Circuitos />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'escuelas':
                if (hasPermission('escuelas.read')) {
                    return <Escuelas />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            case 'mesas':
                if (hasPermission('mesas.read')) {
                    return <Mesas />;
                } else {
                    return (
                        <div className="alert alert-danger">
                            No tienes permisos para acceder a esta sección.
                        </div>
                    );
                }
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <header className="admin-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <button
                                className="btn btn-link d-md-none me-3"
                                onClick={toggleMobileSidebar}
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                            <h1 className="admin-title">Panel de Administración</h1>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="user-info me-3">
                                <span className="user-name">
                                    {user?.first_name} {user?.last_name}
                                </span>
                                <small className="user-role text-muted d-block">
                                    {user?.role?.name}
                                </small>
                            </div>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <Sidebar
                currentSection={currentSection}
                onSectionChange={handleSectionChange}
                mobileSidebarOpen={mobileSidebarOpen}
                userPermissions={user?.role?.permissions || []}
            />

            {/* Main Content */}
            <main className="admin-main">
                <div className="container-fluid">
                    {renderContent()}
                </div>
            </main>

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div 
                    className="mobile-sidebar-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Admin; 