import React, { useState, useEffect } from 'react';
import UserModal from './UserModal';
import UserViewModal from './UserViewModal';
import './users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showUserViewModal, setShowUserViewModal] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [viewingUser, setViewingUser] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role_id: '',
        status: ''
    });

    useEffect(() => {
        loadRoles();
        loadUsers();
    }, []);

    useEffect(() => {
        loadUsers();
    }, [currentPage, pageSize, searchTerm, filters]);

    const loadRoles = async () => {
        try {
            const response = await fetch('/api/admin/roles');
            if (response.ok) {
                const data = await response.json();
                setRoles(data.data || []);
            }
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString()
            });

            if (searchTerm) params.append('search', searchTerm);
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`/api/admin/users?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setUsers(data.data || []);
                setTotalPages(data.pagination?.totalPages || 0);
                setTotalItems(data.pagination?.total || 0);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Load users error:', error);
            setError(`Error loading users: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNewUser = () => {
        setSelectedUser(null);
        setIsEditingUser(false);
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditingUser(true);
        setShowUserModal(true);
    };

    const handleViewUser = (user) => {
        setViewingUser(user);
        setShowUserViewModal(true);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadUsers();
                showNotification('Usuario eliminado exitosamente', 'success');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Error deleting user');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            showNotification(`Error eliminando usuario: ${error.message}`, 'error');
        }
    };

    const handleUserSaved = () => {
        setShowUserModal(false);
        loadUsers();
        showNotification(
            isEditingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 
            'success'
        );
    };

    const showNotification = (message, type = 'info') => {
        // Implementar sistema de notificaciones
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderTable = () => {
        if (loading) {
            return (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger">
                    {error}
                </div>
            );
        }

        if (users.length === 0) {
            return (
                <div className="text-center py-4">
                    <p className="text-muted">No se encontraron usuarios</p>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                <td>{user.email}</td>
                                <td>{user.username}</td>
                                <td>
                                    <span className={`badge bg-${user.role?.name === 'admin' ? 'danger' : 'primary'}`}>
                                        {user.role?.name || 'Sin rol'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge bg-${user.status === 'active' ? 'success' : 'secondary'}`}>
                                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleViewUser(user)}
                                            title="Ver"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-warning"
                                            onClick={() => handleEditUser(user)}
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                            title="Eliminar"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <nav aria-label="Users pagination">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                    </li>
                    
                    {pages.map(page => (
                        <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="users-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Usuarios</h2>
                <button
                    className="btn btn-primary"
                    onClick={handleNewUser}
                >
                    <i className="fas fa-plus"></i> Nuevo Usuario
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="row g-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filters.role_id}
                                onChange={(e) => handleFilterChange('role_id', e.target.value)}
                            >
                                <option value="">Todos los roles</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-outline-primary w-100">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                    Mostrando {users.length} de {totalItems} usuarios
                </p>
                <div className="d-flex align-items-center">
                    <label className="me-2">Mostrar:</label>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {renderTable()}

            {/* Pagination */}
            {renderPagination()}

            {/* Modals */}
            {showUserModal && (
                <UserModal
                    user={selectedUser}
                    roles={roles}
                    isEditing={isEditingUser}
                    onSave={handleUserSaved}
                    onClose={() => setShowUserModal(false)}
                />
            )}

            {showUserViewModal && (
                <UserViewModal
                    user={viewingUser}
                    onClose={() => setShowUserViewModal(false)}
                />
            )}
        </div>
    );
};

export default Users; 