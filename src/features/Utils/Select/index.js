// Generic Multi-Select Component for Admin Panel
// Allows searching and selecting multiple items from any entity

class GenericMultiSelect {
    constructor(element, options) {
        this.element = element;
        this.options = {
            entity: options.entity || '',
            value: options.value || 'id',
            label: options.label || 'name',
            multiple: options.multiple !== false, // Default to true
            placeholder: options.placeholder || 'Search and select...',
            searchMinLength: options.searchMinLength || 2,
            maxHeight: options.maxHeight || '200px',
            apiBase: options.apiBase || '/api/admin',
            selectedValues: options.selectedValues || [],
            onSelectionChange: options.onSelectionChange || null
        };

        this.selectedItems = [];
        this.availableItems = [];
        this.isLoading = false;
        this.isOpen = false;
        this.searchTimeout = null;

        this.init();
    }

    init() {
        this.clearState();
        this.createHTML();
        this.bindEvents();
        this.loadInitialData();
    }

    clearState() {
        // Clear all internal state to prevent data leakage between instances
        this.selectedItems = [];
        this.availableItems = [];
        this.isLoading = false;
        this.isOpen = false;

        console.log('🔥 clearState called');
        
        // Clear any pending search timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        
        // Clear existing element content to prevent residual data
        if (this.element) {
            this.element.innerHTML = '';
            // Remove only the specific classes added by the multiselect component
            this.element.classList.remove('generic-multiselect-wrapper', 'position-relative');
        }
        
        // Reset selected values if they weren't explicitly provided in options
        if (!this.options.selectedValues || this.options.selectedValues.length === 0) {
            this.options.selectedValues = [];
        }
    }

    createHTML() {
        // Use the original element as the wrapper and add necessary classes
        this.element.className = (this.element.className + ' generic-multiselect-wrapper position-relative').trim();
        
        this.element.innerHTML = `
            <div class="selected-items-container">
                <div class="selected-items d-flex flex-wrap gap-1 mb-2" style="min-height: 38px; border: 1px solid #ced4da; border-radius: 0.375rem; padding: 0.375rem 0.75rem; background-color: #fff;">
                    <div class="selected-items-list d-flex flex-wrap gap-1 flex-grow-1"></div>
                    <input type="text" class="search-input border-0 outline-0 flex-grow-1" 
                           placeholder="${this.options.placeholder}" 
                           style="min-width: 120px; background: transparent;">
                </div>
            </div>
            
            <div class="dropdown-menu-container position-absolute w-100" style="z-index: 1050; display: none;">
                <div class="dropdown-menu show w-100 p-0" style="max-height: ${this.options.maxHeight}; overflow-y: auto;">
                    <div class="loading-indicator p-3 text-center text-muted" style="display: none;">
                        <div class="spinner-border spinner-border-sm me-2" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        Searching...
                    </div>
                    <div class="no-results p-3 text-center text-muted" style="display: none;">
                        No results found
                    </div>
                    <div class="items-list"></div>
                </div>
            </div>
        `;

        // Keep the original element as wrapper
        this.wrapper = this.element;
        
        // Get references to important elements
        this.selectedItemsList = this.wrapper.querySelector('.selected-items-list');
        this.searchInput = this.wrapper.querySelector('.search-input');
        this.dropdownContainer = this.wrapper.querySelector('.dropdown-menu-container');
        this.loadingIndicator = this.wrapper.querySelector('.loading-indicator');
        this.noResultsElement = this.wrapper.querySelector('.no-results');
        this.itemsList = this.wrapper.querySelector('.items-list');
        this.selectedItemsContainer = this.wrapper.querySelector('.selected-items');
    }

    bindEvents() {
        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.handleSearch(query);
        });

        this.searchInput.addEventListener('focus', () => {
            this.openDropdown();
            if (this.searchInput.value.length >= this.options.searchMinLength || this.availableItems.length > 0) {
                this.showDropdown();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Prevent dropdown from closing when clicking inside
        this.dropdownContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    async loadInitialData() {
        if (this.options.selectedValues && this.options.selectedValues.length > 0) {
            try {
                this.setLoading(true);
                
                // Load selected items data
                const response = await fetch(`${this.options.apiBase}/${this.options.entity}?ids=${this.options.selectedValues.join(',')}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    this.selectedItems = Array.isArray(data.data) ? data.data : [data.data];
                    this.renderSelectedItems();
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                this.setLoading(false);
            }
        }
    }

    async handleSearch(query) {
        clearTimeout(this.searchTimeout);
        
        if (query.length < this.options.searchMinLength && query.length > 0) {
            this.hideDropdown();
            return;
        }

        this.searchTimeout = setTimeout(async () => {
            await this.searchItems(query);
        }, 300);
    }

    async searchItems(query) {
        try {
            this.setLoading(true);
            this.showDropdown();

            const params = new URLSearchParams();
            if (query) {
                params.append('search', query);
            }
            params.append('limit', '50'); // Limit results for performance

            const response = await fetch(`${this.options.apiBase}/${this.options.entity}?${params}`);
            const data = await response.json();

            if (data.success) {
                this.availableItems = data.data || [];
                this.renderAvailableItems();
            } else {
                this.availableItems = [];
                this.renderAvailableItems();
            }
        } catch (error) {
            console.error('Error searching items:', error);
            this.availableItems = [];
            this.renderAvailableItems();
        } finally {
            this.setLoading(false);
        }
    }

    renderSelectedItems() {
        this.selectedItemsList.innerHTML = '';
        
        this.selectedItems.forEach((item, index) => {
            const tag = document.createElement('span');
            tag.className = 'badge bg-primary d-inline-flex align-items-center gap-1';
            tag.innerHTML = `
                ${item[this.options.label]}
                <button type="button" class="btn-close btn-close-white" style="font-size: 0.65em;" data-index="${index}"></button>
            `;
            
            // Add remove functionality
            const removeBtn = tag.querySelector('.btn-close');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem(index);
            });
            
            this.selectedItemsList.appendChild(tag);
        });

        // Trigger change event
        if (this.options.onSelectionChange) {
            this.options.onSelectionChange(this.getSelectedValues());
        }
    }

    renderAvailableItems() {
        this.itemsList.innerHTML = '';
        
        if (this.availableItems.length === 0) {
            this.noResultsElement.style.display = 'block';
            return;
        }

        this.noResultsElement.style.display = 'none';
        
        this.availableItems.forEach(item => {
            const isSelected = this.selectedItems.some(selected => 
                selected[this.options.value] === item[this.options.value]
            );
            
            if (!isSelected) {
                const itemElement = document.createElement('button');
                itemElement.type = 'button';
                itemElement.className = 'dropdown-item d-flex align-items-center gap-2';
                itemElement.innerHTML = `
                    <i class="fas fa-plus text-success" style="width: 16px;"></i>
                    ${item[this.options.label]}
                `;
                
                itemElement.addEventListener('click', () => {
                    this.selectItem(item);
                });
                
                this.itemsList.appendChild(itemElement);
            }
        });
    }

    selectItem(item) {
        if (this.options.multiple) {
            // Check if item is already selected
            const exists = this.selectedItems.some(selected => 
                selected[this.options.value] === item[this.options.value]
            );
            
            if (!exists) {
                this.selectedItems.push(item);
                this.renderSelectedItems();
                this.renderAvailableItems();
            }
        } else {
            this.selectedItems = [item];
            this.renderSelectedItems();
            this.closeDropdown();
        }
        
        // Clear search
        this.searchInput.value = '';
    }

    removeItem(index) {
        this.selectedItems.splice(index, 1);
        this.renderSelectedItems();
        this.renderAvailableItems();
    }

    openDropdown() {
        this.isOpen = true;
        this.selectedItemsContainer.style.borderColor = '#86b7fe';
        this.selectedItemsContainer.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
    }

    closeDropdown() {
        this.isOpen = false;
        this.hideDropdown();
        this.selectedItemsContainer.style.borderColor = '#ced4da';
        this.selectedItemsContainer.style.boxShadow = 'none';
    }

    showDropdown() {
        this.dropdownContainer.style.display = 'block';
    }

    hideDropdown() {
        this.dropdownContainer.style.display = 'none';
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.loadingIndicator.style.display = loading ? 'block' : 'none';
        
        if (loading) {
            this.noResultsElement.style.display = 'none';
        }
    }

    getSelectedValues() {
        return this.selectedItems.map(item => item[this.options.value]);
    }

    getSelectedItems() {
        return [...this.selectedItems];
    }

    setSelectedValues(values) {
        this.options.selectedValues = values;
        this.selectedItems = [];
        this.loadInitialData();
    }

    destroy() {
        // Clear the element content and remove component classes, but keep the original element
        if (this.element) {
            this.element.innerHTML = '';
            this.element.classList.remove('generic-multiselect-wrapper', 'position-relative');
        }
        
        // Clear any pending timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    }
}

// jQuery plugin wrapper for easy integration
if (typeof jQuery !== 'undefined') {
    (function($) {
        $.fn.createMultiSelect = function(options) {
            return this.each(function() {
                const instance = new GenericMultiSelect(this, options);
                $(this).data('multiselect-instance', instance);
            });
        };
    })(jQuery);
}

// Make available globally
if (typeof window !== 'undefined') {
    window.GenericMultiSelect = GenericMultiSelect;
} 