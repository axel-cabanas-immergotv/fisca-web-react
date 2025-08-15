import React, { useState, useEffect } from 'react';
import './adminEntityBase.css';

const AdminEntityBase = ({ 
    entityName,
    entityLabel,
    apiEndpoint,
    columns,
    filters = [],
    searchPlaceholder = "Buscar...",
    onNew,
    onEdit,
    onView,
    onDelete,
    renderModal,
    showModal,
    onCloseModal,
    modalData,
    isEditing
}) => {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({});

    useEffect(() => {
        loadEntities();
    }, []);

    useEffect(() => {
        loadEntities();
    }, [currentPage, pageSize, searchTerm, activeFilters]);

    const loadEntities = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString()
            });

            if (searchTerm) params.append('search', searchTerm);
            Object.entries(activeFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`${apiEndpoint}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setEntities(data.data || []);
                setTotalPages(data.pagination?.totalPages || 0);
                setTotalItems(data.pagination?.total || 0);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error(`Load ${entityName} error:`, error);
            setError(`Error loading ${entityLabel}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = async (entityId) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar este ${entityLabel.toLowerCase()}?`)) {
            return;
        }

        try {
            const response = await fetch(`${apiEndpoint}/${entityId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadEntities();
                showNotification(`${entityLabel} eliminado exitosamente`, 'success');
            } else {
                const data = await response.json();
                throw new Error(data.message || `Error deleting ${entityLabel.toLowerCase()}`);
            }
        } catch (error) {
            console.error(`Delete ${entityName} error:`, error);
            showNotification(`Error eliminando ${entityLabel.toLowerCase()}: ${error.message}`, 'error');
        }
    };

    const showNotification = (message, type = 'info') => {
        // Implementar sistema de notificaciones
        console.log(`${type.toUpperCase()}: ${message}`);
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

        if (entities.length === 0) {
            return (
                <div className="text-center py-4">
                    <p className="text-muted">No se encontraron {entityLabel.toLowerCase()}s</p>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            {columns.map(column => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entities.map(entity => (
                            <tr key={entity.id}>
                                {columns.map(column => (
                                    <td key={column.key}>
                                        {column.render ? column.render(entity[column.key], entity) : entity[column.key]}
                                    </td>
                                ))}
                                <td>
                                    <div className="btn-group" role="group">
                                        {onView && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onView(entity)}
                                                title="Ver"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-warning"
                                                onClick={() => onEdit(entity)}
                                                title="Editar"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(entity.id)}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
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
            <nav aria-label={`${entityLabel} pagination`}>
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
        <div className="admin-entity-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de {entityLabel}</h2>
                {onNew && (
                    <button
                        className="btn btn-primary"
                        onClick={onNew}
                    >
                        <i className="fas fa-plus"></i> Nuevo {entityLabel}
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            {(searchTerm !== undefined || filters.length > 0) && (
                <div className="card mb-4">
                    <div className="card-body">
                        <form onSubmit={handleSearch} className="row g-3">
                            {searchTerm !== undefined && (
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                            
                            {filters.map(filter => (
                                <div key={filter.key} className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                    >
                                        <option value="">{filter.placeholder}</option>
                                        {filter.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                            
                            {searchTerm !== undefined && (
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-outline-primary w-100">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Results Info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                    Mostrando {entities.length} de {totalItems} {entityLabel.toLowerCase()}s
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

            {/* Modal */}
            {showModal && renderModal && (
                renderModal({
                    data: modalData,
                    isEditing,
                    onClose: onCloseModal,
                    onSave: () => {
                        onCloseModal();
                        loadEntities();
                    }
                })
            )}
        </div>
    );
};

export default AdminEntityBase;
