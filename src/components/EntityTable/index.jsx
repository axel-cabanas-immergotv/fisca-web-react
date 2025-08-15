import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import DynamicPage from '../DynamicPage';
import DynamicModal from '../DynamicModal';
import DynamicStory from '../DynamicStory';
import './entityTable.css';

const EntityTable = forwardRef(({ 
    data = [], 
    config = {},
    loading = false
}, ref) => {
    // Handle both old format (array) and new format (object with data and pagination)
    const entities = Array.isArray(data) ? data : (data.data || []);
    const pagination = data.pagination || null;

    const [searchTerm, setSearchTerm] = useState(config.currentSearch || '');
    const [filters, setFilters] = useState(config.currentFilters || {});
    const [searchTimeout, setSearchTimeout] = useState(null);
    
    // Editor state
    const [showEditor, setShowEditor] = useState(false);
    const [editingEntity, setEditingEntity] = useState(null);
    const [editorLoading, setEditorLoading] = useState(false);

    // Extract configuration with defaults
    const {
        tableId = 'entity-table',
        entityType = 'entity',
        emptyMessage = 'No items found.',
        enableSearch = false,
        columns = [],
        filters: filterOptions = [],
        actionHandlers = {},
        disableEdit = false,
        disableDelete = false,
        disableCreate = false,
        showViewButton = false,
        viewUrl = null,
        customActions = [],
        conditionalEdit = null,
        conditionalDelete = null,
        onSearch = null,
        onPageChange = null,
        onPageSizeChange = null,
        // Editor configuration
        editorType = 'page', // 'page', 'modal', 'story'
        editorConfig = {},
        onLoadEntity = null,
        onSaveEntity = null
    } = config;

    // Debounced search function
    const debouncedSearch = useCallback(() => {
        if (onSearch) {
            onSearch(searchTerm, filters);
        }
    }, [searchTerm, filters, onSearch]);

    // Handle search input changes
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            debouncedSearch();
        }, 500);
        
        setSearchTimeout(timeout);
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[field] = value;
        } else {
            delete newFilters[field];
        }
        setFilters(newFilters);
        
        if (onSearch) {
            onSearch(searchTerm, newFilters);
        }
    };

    // Handle search button click
    const handleSearchClick = () => {
        debouncedSearch();
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        setFilters({});
        if (onSearch) {
            onSearch('', {});
        }
    };

    // Handle enter key in search
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            debouncedSearch();
        }
    };

    // Handle edit action
    const handleEdit = async (type, id) => {
        if (id && onLoadEntity) {
            setEditorLoading(true);
            try {
                const entityData = await onLoadEntity(id);
                setEditingEntity(entityData);
            } catch (error) {
                console.error('Error loading entity:', error);
                setEditingEntity(null);
            } finally {
                setEditorLoading(false);
            }
        } else {
            setEditingEntity(null); // New entity
        }
        setShowEditor(true);
    };

    // Handle create new action  
    const handleCreateNew = () => {
        setEditingEntity(null);
        setShowEditor(true);
    };

    // Handle save entity
    const handleSaveEntity = async (entityData) => {
        if (onSaveEntity) {
            try {
                await onSaveEntity(entityData, editingEntity?.id || null);
                setShowEditor(false);
                setEditingEntity(null);
            } catch (error) {
                console.error('EntityTable: Error saving entity:', error);
                // Don't close editor if save failed
            }
        } else {
            console.error('EntityTable: No onSaveEntity function provided');
        }
    };

    // Expose functions to parent component via ref
    useImperativeHandle(ref, () => ({
        handleCreateNew,
        handleEdit
    }));

    // Handle cancel edit
    const handleCancelEdit = () => {
        setShowEditor(false);
        setEditingEntity(null);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Enhanced action handlers that support editing
    const enhancedActionHandlers = {
        ...actionHandlers,
        edit: (type, id) => {
            if (editorConfig && editorConfig.fields) {
                handleEdit(type, id);
            } else if (actionHandlers.edit) {
                actionHandlers.edit(type, id);
            }
        }
    };

    // Render table cell based on column type
    const renderTableCell = (entity, column) => {
        const value = getNestedProperty(entity, column.field);
        
        switch (column.type) {
            case 'text':
                return <strong>{value || '-'}</strong>;
                
            case 'text-with-subtitle':
                const subtitle = getNestedProperty(entity, column.subtitleField);
                return (
                    <div>
                        <strong>{value || '-'}</strong>
                        {subtitle && <><br /><small className="text-muted">{subtitle}</small></>}
                    </div>
                );
                
            case 'badge':
                const badgeClass = column.badgeClass ? column.badgeClass(value) : 'bg-secondary';
                return <span className={`badge ${badgeClass}`}>{value || '-'}</span>;
                
            case 'badge-with-color':
                const bgColor = getNestedProperty(entity, column.colorField) || '#6c757d';
                return (
                    <span 
                        className="badge rounded-pill" 
                        style={{ backgroundColor: bgColor }}
                    >
                        {value || '-'}
                    </span>
                );
                
            case 'user-name':
                const firstName = getNestedProperty(entity, 'author.first_name');
                const lastName = getNestedProperty(entity, 'author.last_name');
                return firstName && lastName ? `${firstName} ${lastName}` : '-';
                
            case 'date':
                return value ? new Date(value).toLocaleDateString() : '-';
                
            case 'code':
                return <code>/{value}</code>;
                
            case 'system-badge':
                return entity.is_system ? <span className="badge bg-info ms-2">System</span> : '';
                
            case 'custom':
                return column.render ? column.render(entity, value) : (value || '-');
                
            default:
                return value || '-';
        }
    };

    // Render action buttons
    const renderActionButtons = (entity) => {
        const buttons = [];
        
        // Edit button
        if (!disableEdit && (!conditionalEdit || conditionalEdit(entity))) {
            buttons.push(
                <button
                    key="edit"
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => enhancedActionHandlers.edit && enhancedActionHandlers.edit(entityType, entity.id)}
                >
                    <i className="fas fa-edit"></i>
                </button>
            );
        }
        
        // View/Preview button
        if (showViewButton && viewUrl) {
            const url = typeof viewUrl === 'function' ? viewUrl(entity) : viewUrl.replace(':id', entity.id);
            buttons.push(
                <a
                    key="view"
                    href={url}
                    target="_blank"
                    className="btn btn-sm btn-secondary me-1"
                    rel="noreferrer"
                >
                    <i className="fas fa-eye"></i>
                </a>
            );
        }
        
        // Delete button
        if (!disableDelete && (!conditionalDelete || conditionalDelete(entity))) {
            buttons.push(
                <button
                    key="delete"
                    className="btn btn-sm btn-danger"
                    onClick={() => enhancedActionHandlers.delete && enhancedActionHandlers.delete(entityType, entity.id)}
                >
                    <i className="fas fa-trash"></i>
                </button>
            );
        }
        
        // Custom action buttons
        if (customActions) {
            customActions.forEach((action, index) => {
                if (!action.condition || action.condition(entity)) {
                    buttons.push(
                        <button
                            key={`custom-${index}`}
                            className={`btn btn-sm ${action.class || 'btn-outline-primary'} me-1`}
                            onClick={() => enhancedActionHandlers[action.action] && enhancedActionHandlers[action.action](entityType, entity.id)}
                        >
                            <i className={action.icon}></i> {action.label || ''}
                        </button>
                    );
                }
            });
        }
        
        return buttons;
    };

    // Get nested property value
    const getNestedProperty = (obj, path) => {
        if (!path || typeof path !== 'string') return null;
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    };

    // Render search and filters
    const renderSearchAndFilters = () => {
        if (!enableSearch && !filterOptions.length) return null;
        
        return (
            <div className="row mb-3">
                {enableSearch && (
                    <div className="col-md-6">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={handleSearchClick}
                            >
                                <i className="fas fa-search"></i>
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={handleClearSearch}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                )}
                
                {filterOptions.length > 0 && (
                    <div className="col-md-6">
                        <div className="row">
                            {filterOptions.map((filter) => (
                                <div key={filter.field} className="col-md-6">
                                    <select
                                        className="form-select"
                                        value={filters[filter.field] || ''}
                                        onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                                    >
                                        <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render pagination
    const renderPagination = () => {
        if (!pagination || pagination.pages <= 1) return null;
        
        const { page, pages, total, limit } = pagination;
        const startItem = ((page - 1) * limit) + 1;
        const endItem = Math.min(page * limit, total);
        
        // Generate page numbers to show
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center">
                    <span className="text-muted me-3">
                        Showing {startItem}-{endItem} of {total} items
                    </span>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={limit}
                        onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value))}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-muted ms-2">per page</span>
                </div>
                
                <nav>
                    <ul className="pagination pagination-sm mb-0">
                        {/* First Page */}
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                disabled={page === 1}
                                onClick={() => onPageChange && onPageChange(1)}
                            >
                                <i className="fas fa-angle-double-left"></i>
                            </button>
                        </li>
                        
                        {/* Previous Page */}
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                disabled={page === 1}
                                onClick={() => onPageChange && onPageChange(page - 1)}
                            >
                                <i className="fas fa-angle-left"></i>
                            </button>
                        </li>
                        
                        {/* Page Numbers */}
                        {pageNumbers.map((pageNum) => (
                            <li
                                key={pageNum}
                                className={`page-item ${pageNum === page ? 'active' : ''}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange && onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            </li>
                        ))}
                        
                        {/* Next Page */}
                        <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                disabled={page === pages}
                                onClick={() => onPageChange && onPageChange(page + 1)}
                            >
                                <i className="fas fa-angle-right"></i>
                            </button>
                        </li>
                        
                        {/* Last Page */}
                        <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                disabled={page === pages}
                                onClick={() => onPageChange && onPageChange(pages)}
                            >
                                <i className="fas fa-angle-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    };

    // Render editor component based on type
    const renderEditor = () => {
        if (!showEditor || !editorConfig) return null;

        switch (editorType) {
            case 'page':
                return (
                    <DynamicPage
                        show={showEditor}
                        title={editorConfig.title || `${editingEntity ? 'Edit' : 'Create'} ${entityType}`}
                        config={editorConfig}
                        entityData={editingEntity}
                        onSave={handleSaveEntity}
                        onCancel={handleCancelEdit}
                        loading={editorLoading}
                    />
                );
            case 'modal':
                return (
                    <DynamicModal
                        isOpen={showEditor}
                        onClose={handleCancelEdit}
                        onSave={handleSaveEntity}
                        data={editingEntity}
                        config={editorConfig}
                        loading={editorLoading}
                        modalWidth={editorConfig.modalWidth}
                    />
                );
            case 'story':
                return (
                    <DynamicStory
                        show={showEditor}
                        title={editorConfig.title || `${entityType} Editor`}
                        config={editorConfig}
                        entityData={editingEntity}
                        onSave={handleSaveEntity}
                        onCancel={handleCancelEdit}
                        loading={loading}
                    />
                );
            default:
                return null;
        }
    };

    // Empty state
    if (!entities.length && !loading) {
        return (
            <>
                <div className="table-responsive">
                    {renderSearchAndFilters()}
                    
                    <div className="alert alert-info text-center py-4">
                        <i className="fas fa-search fa-2x text-muted mb-3"></i>
                        <div className="h5">{emptyMessage}</div>
                        <p className="text-muted mb-0">
                            {searchTerm || Object.keys(filters).length > 0
                                ? 'Try adjusting your search criteria or clear the filters to see all items.'
                                : 'Create your first item using the button above.'}
                        </p>
                    </div>
                    
                    {pagination && renderPagination()}
                </div>
                {renderEditor()}
            </>
        );
    }

    // Loading state
    if (loading) {
        return (
            <>
                <div className="table-responsive">
                    {renderSearchAndFilters()}
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                {renderEditor()}
            </>
        );
    }

    // Main table
    return (
        <>
            <div className="table-responsive">
                {renderSearchAndFilters()}
                
                <table className="table table-hover" id={tableId}>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index}>{col.header}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entities.map((entity) => (
                            <tr key={entity.id}>
                                {columns.map((col, index) => (
                                    <td key={index}>
                                        {renderTableCell(entity, col)}
                                    </td>
                                ))}
                                <td>
                                    {renderActionButtons(entity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {pagination && renderPagination()}
            </div>
            {renderEditor()}
        </>
    );
});

export default EntityTable; 