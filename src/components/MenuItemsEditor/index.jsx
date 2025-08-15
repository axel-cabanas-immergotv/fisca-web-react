/**
 * MenuItemsEditor Component
 * Specialized component for editing hierarchical menu items with drag & drop support
 * Supports up to 3 levels of nesting (main -> sub -> sub-sub)
 */
import { useState, useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import menusService from '../../services/menusService';
import './menuItemsEditor.css';

const MenuItemsEditor = ({ 
    value = [], 
    onChange, 
    onError 
}) => {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    
    const [menuItems, setMenuItems] = useState(value || []);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingMode, setEditingMode] = useState('new'); // 'new', 'edit'
    const [editingPath, setEditingPath] = useState([]); // [parentIndex, subIndex] for nested items
    const [sortableInstances, setSortableInstances] = useState([]);
    
    // Refs for DOM manipulation
    const mainContainerRef = useRef(null);
    const itemFormRef = useRef(null);
    const initTimeoutRef = useRef(null);

    // ============================================================================
    // EFFECTS & INITIALIZATION
    // ============================================================================

    useEffect(() => {
        setMenuItems(value || []);
    }, [value]);

    // Throttled initialization function
    const throttledInitialize = () => {
        if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
        }
        
        initTimeoutRef.current = setTimeout(() => {
            initializeSortables();
            initTimeoutRef.current = null;
        }, 250);
    };

    // Separate effect for initial mount
    useEffect(() => {

        throttledInitialize();
        
        return () => {
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
            }
        };
    }, []); // Only on mount

    // Effect for menu items structural changes
    useEffect(() => {
        // Calculate structure hash to detect actual changes
        const getStructureHash = (items) => {
            return JSON.stringify(items.map(item => ({
                id: item.id,
                hasChildren: item.children && item.children.length > 0,
                childCount: item.children ? item.children.length : 0,
                childIds: item.children ? item.children.map(child => child.id) : []
            })));
        };
        
        const currentHash = getStructureHash(menuItems);
        
        // Re-initialize if structure changed and we have existing instances
        if (sortableInstances.length > 0) {
            throttledInitialize();
        }
    }, [JSON.stringify(menuItems)]); // When actual structure changes

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
            }
            destroySortables();
        };
    }, []);

    // ============================================================================
    // DRAG & DROP FUNCTIONALITY
    // ============================================================================

    const initializeSortables = () => {
        // Always clean up first
        destroySortables();

        // Don't initialize if component is unmounting or ref is invalid
        if (!mainContainerRef.current || !mainContainerRef.current.isConnected) {
            return;
        }

        const newInstances = [];
        
        // Shared sortable configuration
        const sortableConfig = {
            group: {
                name: 'menu-items',
                pull: true,
                put: true
            },
            handle: '.menu-item-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            chosenClass: 'sortable-chosen',
            onEnd: handleSortEnd,
            // More defensive options
            fallbackTolerance: 3,
            forceFallback: false,
            disabled: false
        };

        // Main container sortable - with additional validation
        try {
            const mainContainer = mainContainerRef.current;
            if (mainContainer && mainContainer.nodeType === Node.ELEMENT_NODE && mainContainer.isConnected) {
                // Check if already has sortable
                if (mainContainer.sortable) {
                    mainContainer.sortable.destroy();
                }
                
                const mainSortable = Sortable.create(mainContainer, {
                    ...sortableConfig,
                    group: {
                        name: 'menu-items',
                        pull: true,
                        put: true
                    }
                });
                
                if (mainSortable) {
                    newInstances.push(mainSortable);
                    console.log('Main container sortable initialized');
                }
            }
        } catch (error) {
            console.error('Error initializing main sortable:', error);
        }

        // Sub-containers sortables - scope to our component only
        try {
            if (mainContainerRef.current) {
                const subContainers = mainContainerRef.current.querySelectorAll('.sub-items-container');
                console.log(`Found ${subContainers.length} sub-containers to initialize`);
                
                subContainers.forEach((container, index) => {
                    try {
                        // Validate container
                        if (!container || !container.isConnected || container.nodeType !== Node.ELEMENT_NODE) {
                            console.log(`Sub-container ${index + 1} is invalid`);
                            return;
                        }
                        
                        // Check if already has sortable
                        if (container.sortable) {
                            container.sortable.destroy();
                        }
                        
                        const subSortable = Sortable.create(container, {
                            ...sortableConfig,
                            group: {
                                name: 'menu-items',
                                pull: true,
                                put: true
                            }
                        });
                        
                        if (subSortable) {
                            newInstances.push(subSortable);
                            console.log(`Sub-container ${index + 1} sortable created successfully`);
                        }
                    } catch (error) {
                        console.error(`Error initializing sub sortable ${index + 1}:`, error);
                    }
                });
            }
        } catch (error) {
            console.error('Error during sub-containers initialization:', error);
        }

        setSortableInstances(newInstances);
    };

    const destroySortables = () => {
        if (sortableInstances.length === 0) {
            return;
        }
        
        sortableInstances.forEach((instance, index) => {
            try {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            } catch (error) {
                console.warn(`Error destroying sortable instance ${index + 1}:`, error);
            }
        });
        
        setSortableInstances([]);
    };

    const handleSortEnd = (evt) => {
        const { from, to, oldIndex, newIndex } = evt;
        
        // Validate event data
        if (!from || !to || oldIndex === undefined || newIndex === undefined) {
            console.warn('Invalid sort event data');
            return;
        }
        
        // Don't process if indices are the same and same container
        if (oldIndex === newIndex && from === to) {
            return;
        }
        
        try {
            // Clone current menu items to avoid mutation
            const newMenuItems = JSON.parse(JSON.stringify(menuItems));
            
            // Determine if it's a main item or sub item move
            const isMainContainer = from.classList.contains('main-items-container');
            const isSubContainer = from.classList.contains('sub-items-container');
            
            console.log('Drag and drop event:', {
                isMainContainer,
                isSubContainer,
                fromClasses: from.className,
                toClasses: to.className,
                oldIndex,
                newIndex
            });
            
            if (isMainContainer) {
                // Moving main items
                console.log('Moving main item from', oldIndex, 'to', newIndex);
                const movedItem = newMenuItems.splice(oldIndex, 1)[0];
                newMenuItems.splice(newIndex, 0, movedItem);
            } else if (isSubContainer) {
                // Moving sub items - need to find parent
                const parentId = from.getAttribute('data-parent-id');
                console.log('Moving sub item, parentId:', parentId);
                const parentIndex = newMenuItems.findIndex(item => item.id === parentId);
                console.log('Parent index found:', parentIndex);
                
                if (parentIndex !== -1 && newMenuItems[parentIndex].children) {
                    const movedItem = newMenuItems[parentIndex].children.splice(oldIndex, 1)[0];
                    
                    // If moving to different parent
                    if (from !== to) {
                        const newParentId = to.getAttribute('data-parent-id');
                        const newParentIndex = newMenuItems.findIndex(item => item.id === newParentId);
                        
                        if (newParentIndex !== -1) {
                            if (!newMenuItems[newParentIndex].children) {
                                newMenuItems[newParentIndex].children = [];
                            }
                            newMenuItems[newParentIndex].children.splice(newIndex, 0, movedItem);
                        }
                    } else {
                        // Same parent, just reorder
                        newMenuItems[parentIndex].children.splice(newIndex, 0, movedItem);
                    }
                }
            }
            
            // Update state and notify parent
            setMenuItems(newMenuItems);
            onChange(newMenuItems);
            
        } catch (error) {
            console.error('Error handling drag end:', error);
            if (onError) onError('Failed to reorder menu items');
        }
    };

    // ============================================================================
    // MENU ITEM CRUD OPERATIONS
    // ============================================================================

    const addMenuItem = (parentPath = []) => {
        setEditingItem(menusService.getDefaultMenuItemData());
        setEditingMode('new');
        setEditingPath(parentPath);
        setShowItemModal(true);
    };

    // Force re-initialization when menu structure changes
    const forceReinitializeSortables = () => {
        console.log('Force reinitializing sortables due to structure change');
        throttledInitialize();
    };

    const editMenuItem = (item, path) => {
        setEditingItem({ ...item });
        setEditingMode('edit');
        setEditingPath(path);
        setShowItemModal(true);
    };

    const removeMenuItem = (path) => {
        if (!window.confirm('Are you sure you want to remove this menu item?')) {
            return;
        }

        try {
            const newMenuItems = JSON.parse(JSON.stringify(menuItems));
            
            if (path.length === 1) {
                // Remove main item
                newMenuItems.splice(path[0], 1);
            } else if (path.length === 2) {
                // Remove sub item
                const [parentIndex, itemIndex] = path;
                if (newMenuItems[parentIndex] && newMenuItems[parentIndex].children) {
                    newMenuItems[parentIndex].children.splice(itemIndex, 1);
                }
            }
            
            setMenuItems(newMenuItems);
            onChange(newMenuItems);
            
            // Force reinitialize sortables after removing item
            setTimeout(() => {
                forceReinitializeSortables();
            }, 100);
        } catch (error) {
            console.error('Error removing menu item:', error);
            if (onError) onError('Failed to remove menu item');
        }
    };

    const saveMenuItem = () => {
        if (!editingItem || !editingItem.title || !editingItem.url) {
            if (onError) onError('Title and URL are required');
            return;
        }

        try {
            const newMenuItems = JSON.parse(JSON.stringify(menuItems));
            
            if (editingMode === 'new') {
                // Add new item
                const newItem = {
                    ...editingItem,
                    id: menusService.generateTempId(),
                    children: []
                };
                
                if (editingPath.length === 0) {
                    // Add to main level
                    newMenuItems.push(newItem);
                } else if (editingPath.length === 1) {
                    // Add as sub item
                    const parentIndex = editingPath[0];
                    if (!newMenuItems[parentIndex].children) {
                        newMenuItems[parentIndex].children = [];
                    }
                    newMenuItems[parentIndex].children.push(newItem);
                }
            } else {
                // Edit existing item
                if (editingPath.length === 1) {
                    // Edit main item
                    newMenuItems[editingPath[0]] = { ...newMenuItems[editingPath[0]], ...editingItem };
                } else if (editingPath.length === 2) {
                    // Edit sub item
                    const [parentIndex, itemIndex] = editingPath;
                    newMenuItems[parentIndex].children[itemIndex] = { 
                        ...newMenuItems[parentIndex].children[itemIndex], 
                        ...editingItem 
                    };
                }
            }
            
            setMenuItems(newMenuItems);
            onChange(newMenuItems);
            setShowItemModal(false);
            setEditingItem(null);
            
            // Force reinitialize sortables if structure changed (especially for new sub-items)
            setTimeout(() => {
                forceReinitializeSortables();
            }, 100);
        } catch (error) {
            console.error('Error saving menu item:', error);
            if (onError) onError('Failed to save menu item');
        }
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    const renderMenuItem = (item, index, level = 0, parentPath = []) => {
        const currentPath = [...parentPath, index];
        const hasChildren = item.children && item.children.length > 0;
        
        return (
            <div key={item.id || index} className={`menu-item level-${level}`} data-id={item.id}>
                <div className="menu-item-content">
                    <div className="menu-item-handle">
                        <i className="fas fa-grip-vertical"></i>
                    </div>
                    
                    <div className="menu-item-info flex-grow-1">
                        <div className="menu-item-title">
                            {item.title || 'Untitled'}
                        </div>
                        <div className="menu-item-url text-muted small">
                            {item.url || 'No URL'}
                        </div>
                    </div>
                    
                    <div className="menu-item-actions">
                        <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => editMenuItem(item, currentPath)}
                            title="Edit Item"
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        
                        {level < 2 && (
                            <button 
                                type="button"
                                className="btn btn-sm btn-outline-success me-1"
                                onClick={() => addMenuItem(currentPath)}
                                title="Add Sub Item"
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        )}
                        
                        <button 
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeMenuItem(currentPath)}
                            title="Remove Item"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                {hasChildren && (
                    <div className="sub-items-container" data-parent-id={item.id}>
                        {item.children.map((subItem, subIndex) => 
                            renderMenuItem(subItem, subIndex, level + 1, currentPath)
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderItemModal = () => {
        if (!showItemModal) return null;
        
        return (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {editingMode === 'edit' ? 'Edit Menu Item' : 'Add Menu Item'}
                            </h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setShowItemModal(false)}
                            ></button>
                        </div>
                        
                        <div className="modal-body">
                            <form ref={itemFormRef} onSubmit={(e) => { e.preventDefault(); saveMenuItem(); }}>
                                <div className="mb-3">
                                    <label className="form-label">Title *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={editingItem?.title || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Menu item title"
                                        required
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">URL *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={editingItem?.url || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://example.com or /page-slug"
                                        required
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Link Target</label>
                                    <select 
                                        className="form-select"
                                        value={editingItem?.target || '_self'}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, target: e.target.value }))}
                                    >
                                        <option value="_self">Same Window</option>
                                        <option value="_blank">New Window</option>
                                    </select>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Icon Class</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={editingItem?.icon || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, icon: e.target.value }))}
                                        placeholder="e.g., fas fa-home"
                                    />
                                    <div className="form-text">FontAwesome icon class (optional)</div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea 
                                        className="form-control"
                                        rows="2"
                                        value={editingItem?.description || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional description"
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setShowItemModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={saveMenuItem}
                            >
                                {editingMode === 'edit' ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div className="menu-items-editor">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Menu Items</h6>
                <button 
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => addMenuItem()}
                >
                    <i className="fas fa-plus me-1"></i>Add Item
                </button>
            </div>
            
            <div 
                ref={mainContainerRef}
                className="main-items-container"
            >
                {menuItems.length === 0 && (
                    <div className="text-center py-4">
                        <div className="text-muted mb-2">No menu items yet</div>
                        <button 
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => addMenuItem()}
                        >
                            <i className="fas fa-plus me-1"></i>Add First Item
                        </button>
                    </div>
                )}
                {menuItems.map((item, index) => renderMenuItem(item, index))}
            </div>
            
            <div className="mt-3">
                <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Drag items to reorder. You can create up to 3 levels: Main → Sub → Sub-sub
                </small>
            </div>
            
            {renderItemModal()}
        </div>
    );
};

export default MenuItemsEditor; 