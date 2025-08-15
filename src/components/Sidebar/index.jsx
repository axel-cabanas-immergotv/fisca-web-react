import { useState } from 'react';
import './sidebar.css';

const Sidebar = ({ 
    currentSection = 'dashboard', 
    onSectionChange, 
    mobileSidebarOpen = false,
    userPermissions = []
}) => {
    
    // Helper function to check permissions
    const hasPermission = (permission) => {
        if (!userPermissions || userPermissions.length === 0) {
            return true; // Allow all if no permissions specified
        }
        return userPermissions.some(p => p.name === permission);
    };

    const handleSectionClick = (section) => {
        if (onSectionChange) {
            onSectionChange(section);
        }
    };

    const sidebarItems = [
        // Dashboard
        {
            section: 'dashboard',
            icon: 'fas fa-tachometer-alt',
            label: 'Panel de Control',
            standalone: true
        },
        
        // Mi Equipo
        {
            section: 'mi-equipo',
            icon: 'fas fa-users',
            label: 'Mi Equipo',
            permission: 'users.read',
            standalone: true
        },

        // TERRITORIO Section
        {
            group: 'TERRITORIO',
            items: [
                {
                    section: 'localidades',
                    icon: 'fas fa-map-marker-alt',
                    label: 'Localidades',
                    permission: 'localidades.read'
                },
                {
                    section: 'secciones',
                    icon: 'fas fa-layer-group',
                    label: 'Secciones',
                    permission: 'secciones.read'
                },
                {
                    section: 'circuitos',
                    icon: 'fas fa-circle',
                    label: 'Circuitos',
                    permission: 'circuitos.read'
                },
                {
                    section: 'escuelas',
                    icon: 'fas fa-school',
                    label: 'Escuelas',
                    permission: 'escuelas.read'
                },
                {
                    section: 'mesas',
                    icon: 'fas fa-table',
                    label: 'Mesas',
                    permission: 'mesas.read'
                },
                {
                    section: 'ciudadanos',
                    icon: 'fas fa-id-card',
                    label: 'Ciudadanos',
                    permission: 'ciudadanos.read'
                }
            ]
        },

        // USUARIOS Section
        {
            group: 'USUARIOS',
            items: [
                {
                    section: 'users',
                    icon: 'fas fa-users',
                    label: 'Usuarios',
                    permission: 'users.read'
                },
                {
                    section: 'roles',
                    icon: 'fas fa-user-shield',
                    label: 'Roles',
                    permission: 'roles.read'
                },
                {
                    section: 'permissions',
                    icon: 'fas fa-key',
                    label: 'Permisos',
                    permission: 'permissions.read'
                }
            ]
        },

        // CONTENIDO Section
        {
            group: 'CONTENIDO',
            items: [
                {
                    section: 'pages',
                    icon: 'fas fa-file-alt',
                    label: 'Páginas',
                    permission: 'pages.read'
                },
                {
                    section: 'stories',
                    icon: 'fas fa-newspaper',
                    label: 'Historias',
                    permission: 'stories.read'
                },
                {
                    section: 'modules',
                    icon: 'fas fa-cube',
                    label: 'Módulos',
                    permission: 'modules.read'
                },
                {
                    section: 'categories',
                    icon: 'fas fa-tags',
                    label: 'Categorías',
                    permission: 'categories.read'
                },
                {
                    section: 'menus',
                    icon: 'fas fa-bars',
                    label: 'Menús',
                    permission: 'menus.read'
                }
            ]
        },

        // SISTEMA Section
        {
            group: 'SISTEMA',
            items: [
                {
                    section: 'affiliates',
                    icon: 'fas fa-handshake',
                    label: 'Afiliados',
                    permission: 'affiliates.read'
                }
            ]
        }
    ];

    const renderSidebarItem = (item) => (
        <a
            key={item.section}
            href="#"
            className={`sidebar-item ${currentSection === item.section ? 'active' : ''}`}
            onClick={(e) => {
                e.preventDefault();
                handleSectionClick(item.section);
            }}
        >
            <i className={item.icon}></i>
            <span>{item.label}</span>
        </a>
    );

    const renderSidebarGroup = (group) => {
        // Filter items based on permissions
        const visibleItems = group.items.filter(item => {
            if (item.permission) {
                return hasPermission(item.permission);
            }
            return true;
        });

        // Don't render group if no items are visible
        if (visibleItems.length === 0) {
            return null;
        }

        return (
            <div key={group.group} className="sidebar-section">
                {group.group && <h6 className="sidebar-header">{group.group}</h6>}
                {visibleItems.map(item => renderSidebarItem(item))}
            </div>
        );
    };

    return (
        <div className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
            {/* Logo/Brand */}
            <div className="sidebar-brand">
                <h3>Fisca</h3>
            </div>

            {/* Sidebar Items */}
            {sidebarItems.map(item => {
                if (item.standalone) {
                    // Check permission for standalone items
                    if (item.permission && !hasPermission(item.permission)) {
                        return null;
                    }
                    return (
                        <div key={item.section} className="sidebar-section">
                            {renderSidebarItem(item)}
                        </div>
                    );
                }
                return renderSidebarGroup(item);
            })}
        </div>
    );
};

export default Sidebar; 