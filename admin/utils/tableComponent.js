// Reusable table component for rendering entity instances with pagination
function createEntityTable(data, config) {
    // Handle both old format (array) and new format (object with data and pagination)
    const entities = Array.isArray(data) ? data : (data.data || []);
    const pagination = data.pagination || null;
    
    if (!entities.length) {
        const emptyStateHTML = `
            <div class="table-responsive">
                <!-- Search and Filter Controls - Always show even when no results -->
                ${renderSearchAndFilters(config)}
                
                <!-- Empty State Message -->
                <div class="alert alert-info text-center py-4">
                    <i class="fas fa-search fa-2x text-muted mb-3"></i>
                    <div class="h5">${config.emptyMessage || 'No items found.'}</div>
                    <p class="text-muted mb-0">
                        ${config.currentSearch || Object.keys(config.currentFilters || {}).length > 0 
                            ? 'Try adjusting your search criteria or clear the filters to see all items.' 
                            : 'Create your first item using the button above.'}
                    </p>
                </div>
                
                ${pagination ? renderPaginationControls(pagination, config) : ''}
            </div>
        `;

        // Set up event listeners for search and filters even in empty state
        setTimeout(() => {
            setupSearchListeners(config);
            setupPaginationListeners(config);
        }, 0);

        return emptyStateHTML;
    }

    // Store reference to admin app instance for use in event handlers
    window.currentAdminApp = config.adminAppInstance;

    const tableHTML = `
        <div class="table-responsive">
            <!-- Search and Filter Controls -->
            ${renderSearchAndFilters(config)}
            
            <!-- Table -->
            <table class="table table-hover" id="${config.tableId}">
                <thead>
                    <tr>
                        ${config.columns.map(col => `<th>${col.header}</th>`).join('')}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${entities.map(entity => `
                        <tr>
                            ${config.columns.map(col => `<td>${renderTableCell(entity, col)}</td>`).join('')}
                            <td>${renderActionButtons(entity, config)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Pagination Controls -->
            ${pagination ? renderPaginationControls(pagination, config) : ''}
        </div>
    `;

    // Set up event listeners after rendering
    setTimeout(() => {
        setupTableEventListeners(config.tableId, config);
        setupPaginationListeners(config);
        setupSearchListeners(config);
    }, 0);

    return tableHTML;
}

function renderTableCell(entity, column) {
    const value = getNestedProperty(entity, column.field);
    
    switch (column.type) {
        case 'text':
            return `<strong>${value || '-'}</strong>`;
            
        case 'text-with-subtitle':
            const subtitle = getNestedProperty(entity, column.subtitleField);
            return `
                <strong>${value || '-'}</strong>
                ${subtitle ? `<br><small class="text-muted">${subtitle}</small>` : ''}
            `;
            
        case 'badge':
            const badgeClass = column.badgeClass ? column.badgeClass(value) : 'bg-secondary';
            return `<span class="badge ${badgeClass}">${value || '-'}</span>`;
            
        case 'badge-with-color':
            const bgColor = getNestedProperty(entity, column.colorField) || '#6c757d';
            return `
                <span class="badge rounded-pill" style="background-color: ${bgColor}">
                    ${value || '-'}
                </span>
            `;
            
        case 'user-name':
            const firstName = getNestedProperty(entity, 'author.first_name');
            const lastName = getNestedProperty(entity, 'author.last_name');
            return firstName && lastName ? `${firstName} ${lastName}` : '-';
            
        case 'date':
            return value ? new Date(value).toLocaleDateString() : '-';
            
        case 'code':
            return `<code>/${value}</code>`;
            
        case 'system-badge':
            return entity.is_system ? '<span class="badge bg-info ms-2">System</span>' : '';
            
        case 'custom':
            return column.render ? column.render(entity, value) : value || '-';
            
        default:
            return value || '-';
    }
}

function renderActionButtons(entity, config) {
    const buttons = [];
    
    // Edit button (always shown if not disabled)
    if (!config.disableEdit && (!config.conditionalEdit || config.conditionalEdit(entity))) {
        buttons.push(`
            <button class="btn btn-sm btn-primary me-1" data-action="edit" data-type="${config.entityType}" data-id="${entity.id}">
                <i class="fas fa-edit"></i>
            </button>
        `);
    }
    
    // View/Preview button
    if (config.showViewButton && config.viewUrl) {
        const url = typeof config.viewUrl === 'function' ? config.viewUrl(entity) : config.viewUrl.replace(':id', entity.id);
        buttons.push(`
            <a href="${url}" target="_blank" class="btn btn-sm btn-secondary me-1">
                <i class="fas fa-eye"></i>
            </a>
        `);
    }
    
    // Delete button (conditionally shown)
    if (!config.disableDelete && (!config.conditionalDelete || config.conditionalDelete(entity))) {
        buttons.push(`
            <button class="btn btn-sm btn-danger" data-action="delete" data-type="${config.entityType}" data-id="${entity.id}">
                <i class="fas fa-trash"></i>
            </button>
        `);
    }
    
    // Custom action buttons
    if (config.customActions) {
        config.customActions.forEach(action => {
            if (!action.condition || action.condition(entity)) {
                buttons.push(`
                    <button class="btn btn-sm ${action.class || 'btn-outline-primary'} me-1" 
                            data-action="${action.action}" data-type="${config.entityType}" data-id="${entity.id}">
                        <i class="${action.icon}"></i> ${action.label || ''}
                    </button>
                `);
            }
        });
    }
    
    return buttons.join('');
}

function setupTableEventListeners(tableId, config) {
    const table = document.getElementById(tableId);
    if (!table) return;

    // Prevent duplicate event listeners
    if (table.hasAttribute('data-listeners-added')) {
        return;
    }
    table.setAttribute('data-listeners-added', 'true');

    // Use event delegation to handle button clicks
    table.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        e.preventDefault();
        
        const action = button.getAttribute('data-action');
        const type = button.getAttribute('data-type');
        const id = parseInt(button.getAttribute('data-id'));

        // Call the appropriate handler
        if (config.actionHandlers && config.actionHandlers[action]) {
            config.actionHandlers[action](type, id);
        }
    });
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

function renderSearchAndFilters(config) {
    if (!config.enableSearch && !config.filters) return '';
    
    return `
        <div class="row mb-3">
            ${config.enableSearch ? `
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search..." 
                               id="${config.tableId}-search" value="${config.currentSearch || ''}">
                        <button class="btn btn-outline-secondary" type="button" id="${config.tableId}-search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="btn btn-outline-secondary" type="button" id="${config.tableId}-clear-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            ` : ''}
            
            ${config.filters ? `
                <div class="col-md-6">
                    <div class="row">
                        ${config.filters.map(filter => `
                            <div class="col-md-6">
                                <select class="form-select" id="${config.tableId}-filter-${filter.field}" data-filter="${filter.field}">
                                    <option value="">${filter.placeholder || `All ${filter.label}`}</option>
                                    ${filter.options.map(option => `
                                        <option value="${option.value}" ${config.currentFilters && config.currentFilters[filter.field] === option.value ? 'selected' : ''}>
                                            ${option.label}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderPaginationControls(pagination, config) {
    if (!pagination || pagination.pages <= 1) return '';
    
    const { page, pages, total, limit } = pagination;
    const startItem = ((page - 1) * limit) + 1;
    const endItem = Math.min(page * limit, total);
    
    // Generate page numbers to show
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    
    return `
        <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="d-flex align-items-center">
                <span class="text-muted me-3">
                    Showing ${startItem}-${endItem} of ${total} items
                </span>
                <select class="form-select form-select-sm" style="width: auto;" id="${config.tableId}-page-size">
                    <option value="10" ${limit == 10 ? 'selected' : ''}>10</option>
                    <option value="20" ${limit == 20 ? 'selected' : ''}>20</option>
                    <option value="50" ${limit == 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${limit == 100 ? 'selected' : ''}>100</option>
                </select>
                <span class="text-muted ms-2">per page</span>
            </div>
            
            <nav>
                <ul class="pagination pagination-sm mb-0" id="${config.tableId}-pagination">
                    <!-- First Page -->
                    <li class="page-item ${page === 1 ? 'disabled' : ''}">
                        <button class="page-link" data-page="1" ${page === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                    </li>
                    
                    <!-- Previous Page -->
                    <li class="page-item ${page === 1 ? 'disabled' : ''}">
                        <button class="page-link" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-left"></i>
                        </button>
                    </li>
                    
                    <!-- Page Numbers -->
                    ${pageNumbers.map(pageNum => `
                        <li class="page-item ${pageNum === page ? 'active' : ''}" data-page-item="${pageNum}">
                            <button class="page-link" data-page="${pageNum}">${pageNum}</button>
                        </li>
                    `).join('')}
                    
                    <!-- Next Page -->
                    <li class="page-item ${page === pages ? 'disabled' : ''}">
                        <button class="page-link" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>
                            <i class="fas fa-angle-right"></i>
                        </button>
                    </li>
                    
                    <!-- Last Page -->
                    <li class="page-item ${page === pages ? 'disabled' : ''}">
                        <button class="page-link" data-page="${pages}" ${page === pages ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    `;
}

// Global pagination handler to prevent duplicates
window.paginationHandlers = window.paginationHandlers || {};

function setupPaginationListeners(config) {
    const tableId = config.tableId;
    
    // Only set up the global handler once
    if (!window.paginationHandlers.globalHandler) {
        window.paginationHandlers.globalHandler = function(e) {
            if (e.target.closest('.page-link[data-page]')) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.closest('.page-link[data-page]');
                const pageItem = button.closest('.page-item');
                const page = parseInt(button.getAttribute('data-page'));
                const tableContainer = button.closest('.table-responsive');
                const table = tableContainer?.querySelector('table[id]');
                const currentTableId = table?.getAttribute('id');
                
                // Don't process if already loading or disabled
                if (pageItem.classList.contains('loading') || pageItem.classList.contains('disabled')) {
                    return;
                }
                
                // Find the config for this specific table
                if (currentTableId && window.paginationHandlers[currentTableId] && !isNaN(page)) {
                    const tableConfig = window.paginationHandlers[currentTableId];
                    
                    if (tableConfig.onPageChange) {
                        // Show loading state
                        pageItem.classList.add('loading');
                        
                        // Store original text for numbers
                        const originalText = button.textContent;
                        
                        // Call the page change handler
                        const result = tableConfig.onPageChange(page);
                        
                        // Handle both sync and async responses
                        const cleanup = () => {
                            setTimeout(() => {
                                pageItem.classList.remove('loading');
                            }, 300); // Small delay so user can see the loading
                        };
                        
                        if (result && typeof result.then === 'function') {
                            // Async response
                            result.finally(cleanup);
                        } else {
                            // Sync response
                            cleanup();
                        }
                    }
                }
            }
        };
        
        document.addEventListener('click', window.paginationHandlers.globalHandler);
    }
    
    // Store this table's config
    window.paginationHandlers[tableId] = config;
    
    // Page size change handler
    setTimeout(() => {
        const pageSizeSelect = document.getElementById(`${tableId}-page-size`);
        if (pageSizeSelect && !pageSizeSelect.hasAttribute('data-listener-added')) {
            pageSizeSelect.setAttribute('data-listener-added', 'true');
            pageSizeSelect.addEventListener('change', (e) => {
                const newLimit = parseInt(e.target.value);
                if (config.onPageSizeChange && !isNaN(newLimit)) {
                    config.onPageSizeChange(newLimit);
                }
            });
        }
    }, 10);
}

function setupSearchListeners(config) {
    const searchInput = document.getElementById(`${config.tableId}-search`);
    const searchBtn = document.getElementById(`${config.tableId}-search-btn`);
    const clearBtn = document.getElementById(`${config.tableId}-clear-btn`);
    
    if (searchInput && !searchInput.hasAttribute('data-listeners-added')) {
        searchInput.setAttribute('data-listeners-added', 'true');
        
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(config);
            }
        });
        
        // Debounced search on input
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(config);
            }, 500);
        });
    }
    
    if (searchBtn && !searchBtn.hasAttribute('data-listener-added')) {
        searchBtn.setAttribute('data-listener-added', 'true');
        searchBtn.addEventListener('click', () => performSearch(config));
    }
    
    if (clearBtn && !clearBtn.hasAttribute('data-listener-added')) {
        clearBtn.setAttribute('data-listener-added', 'true');
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            performSearch(config);
        });
    }
    
    // Filter changes
    if (config.filters) {
        config.filters.forEach(filter => {
            const filterSelect = document.getElementById(`${config.tableId}-filter-${filter.field}`);
            if (filterSelect && !filterSelect.hasAttribute('data-listener-added')) {
                filterSelect.setAttribute('data-listener-added', 'true');
                filterSelect.addEventListener('change', () => performSearch(config));
            }
        });
    }
}

function performSearch(config) {
    const searchInput = document.getElementById(`${config.tableId}-search`);
    const search = searchInput ? searchInput.value.trim() : '';
    
    const filters = {};
    if (config.filters) {
        config.filters.forEach(filter => {
            const filterSelect = document.getElementById(`${config.tableId}-filter-${filter.field}`);
            if (filterSelect && filterSelect.value) {
                filters[filter.field] = filterSelect.value;
            }
        });
    }
    
    if (config.onSearch) {
        config.onSearch(search, filters);
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.createEntityTable = createEntityTable;
} 