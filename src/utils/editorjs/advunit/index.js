/**
 * AdvUnit Block for Editor.js
 * Google Advertisement Unit plugin with comprehensive configuration
 */
class AdvUnitBlock {
    static get toolbox() {
        return {
            title: 'Ad Unit',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 9h6v6H9z" fill="currentColor"/><text x="12" y="7" text-anchor="middle" font-size="8" fill="currentColor">AD</text></svg>'
        };
    }

    static get settings() {
        return [
            {
                name: 'advUnitSettings',
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6.5C8.067 6.5 6.5 8.067 6.5 10S8.067 13.5 10 13.5 13.5 11.933 13.5 10 11.933 6.5 10 6.5zM10 12C8.619 12 7.5 10.881 7.5 9.5S8.619 7 10 7s2.5 1.119 2.5 2.5S11.381 12 10 12z" fill="currentColor"/>
                    <path d="M17.5 10.5h-1.775c-0.131 0.522-0.331 1.019-0.594 1.481l1.256 1.256c0.394 0.394 0.394 1.031 0 1.425s-1.031 0.394-1.425 0l-1.256-1.256c-0.462 0.262-0.959 0.462-1.481 0.594V15.5c0 0.556-0.444 1-1 1s-1-0.444-1-1v-1.775c-0.522-0.131-1.019-0.331-1.481-0.594L6.487 14.387c-0.394 0.394-1.031 0.394-1.425 0s-0.394-1.031 0-1.425l1.256-1.256c-0.262-0.462-0.462-0.959-0.594-1.481H2.5c-0.556 0-1-0.444-1-1s0.444-1 1-1h1.775c0.131-0.522 0.331-1.019 0.594-1.481L3.613 5.487c-0.394-0.394-0.394-1.031 0-1.425s1.031-0.394 1.425 0l1.256 1.256c0.462-0.262 0.959-0.462 1.481-0.594V2.5c0-0.556 0.444-1 1-1s1 0.444 1 1v1.775c0.522 0.131 1.019 0.331 1.481 0.594l1.256-1.256c0.394-0.394 1.031-0.394 1.425 0s0.394 1.031 0 1.425l-1.256 1.256c0.262 0.462 0.462 0.959 0.594 1.481H17.5c0.556 0 1 0.444 1 1s-0.444 1-1 1z" fill="currentColor"/>
                </svg>`
            }
        ];
    }

    constructor({ data, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        
        // Default configuration
        this.data = {
            editing: data.editing || 'Basic',
            className: data.className || 'AdvertisementUnit--wideGreyBase',
            contentClassification: data.contentClassification || [],
            application: data.application || '',
            type: data.type || 'dom',
            loadOrderIndex: data.loadOrderIndex || 1,
            lazyLoad: data.lazyLoad !== undefined ? data.lazyLoad : true,
            localShare: data.localShare || 1,
            nationalShare: data.nationalShare || 0,
            sizeId: data.sizeId || '41',
            outOfPage: data.outOfPage || false,
            adSizes: data.adSizes || {
                xl: ['970x90', '728x90'],
                lg: ['970x90', '728x90'],
                md: ['728x90'],
                sm: ['320x50'],
                xs: ['320x50']
            },
            frnStyle: data.frnStyle || '{\n   "margin": "30px 0 30px 0"\n}'
        };
        
        this.wrapper = null;
        this.settingsOpened = false;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('adv-unit-block');
        
        // Create ad unit preview
        const preview = document.createElement('div');
        preview.classList.add('adv-unit-preview');
        preview.innerHTML = this.generatePreviewHTML();
        
        this.wrapper.appendChild(preview);
        
        return this.wrapper;
    }

    renderSettings() {
        const settingsContent = document.createElement('div');
        settingsContent.classList.add('adv-unit-popover-settings');
        settingsContent.innerHTML = this.createSettingsHTML();
        
        // Attach event listeners after creating HTML
        this.attachPopoverEvents(settingsContent);
        
        return settingsContent;
    }

    generatePreviewHTML() {
        const sizes = this.getResponsiveSizes();
        return `
            <div class="adv-unit-container" data-class="${this.data.className}">
                <div class="adv-unit-header">
                    <span class="adv-unit-label">
                        <i class="fas fa-ad"></i> Advertisement Unit
                    </span>
                    <span class="adv-unit-type">${this.data.type.toUpperCase()}</span>
                </div>
                <div class="adv-unit-info">
                    <div class="adv-unit-sizes">
                        <strong>Sizes:</strong> ${sizes}
                    </div>
                    <div class="adv-unit-details">
                        <span>Load Order: ${this.data.loadOrderIndex}</span>
                        <span>Local: ${this.data.localShare}%</span>
                        <span>National: ${this.data.nationalShare}%</span>
                        ${this.data.lazyLoad ? '<span class="lazy-badge">Lazy</span>' : ''}
                        ${this.data.outOfPage ? '<span class="oop-badge">OOP</span>' : ''}
                    </div>
                </div>
                <div class="adv-unit-mockup">
                    <div class="ad-placeholder">
                        <i class="fas fa-rectangle-ad"></i>
                        <span>Google Ad Unit</span>
                        <small>Size ID: ${this.data.sizeId}</small>
                    </div>
                </div>
            </div>
        `;
    }

    getResponsiveSizes() {
        const allSizes = [
            ...this.data.adSizes.xl,
            ...this.data.adSizes.lg,
            ...this.data.adSizes.md,
            ...this.data.adSizes.sm,
            ...this.data.adSizes.xs
        ];
        return [...new Set(allSizes)].join(', ');
    }

    createSettingsHTML() {
        return `
            <div class="adv-popover-settings-content">
                <div class="adv-popover-header">
                    <h4>Advertisement Unit Configuration</h4>
                </div>
                
                <!-- Class Name -->
                <div class="adv-form-group required">
                    <label class="adv-form-label">Class Name <span class="required">*</span></label>
                    <input type="text" class="adv-form-control" data-field="className" 
                           value="${this.data.className}" placeholder="AdvertisementUnit--wideGreyBase">
                </div>
                
                <!-- Application -->
                <div class="adv-form-group">
                    <label class="adv-form-label">Application</label>
                    <select class="adv-form-control" data-field="application">
                        <option value="">Select...</option>
                        <option value="banner" ${this.data.application === 'banner' ? 'selected' : ''}>Banner</option>
                        <option value="video" ${this.data.application === 'video' ? 'selected' : ''}>Video</option>
                        <option value="email" ${this.data.application === 'email' ? 'selected' : ''}>Email</option>
                        <option value="slideshow" ${this.data.application === 'slideshow' ? 'selected' : ''}>Slideshow</option>
                    </select>
                </div>
                
                <!-- Type -->
                <div class="adv-form-group required">
                    <label class="adv-form-label">Type <span class="required">*</span></label>
                    <select class="adv-form-control" data-field="type">
                        <option value="dom" ${this.data.type === 'dom' ? 'selected' : ''}>Dom</option>
                        <option value="inline" ${this.data.type === 'inline' ? 'selected' : ''}>Inline</option>
                        <option value="async" ${this.data.type === 'async' ? 'selected' : ''}>Async</option>
                    </select>
                </div>
                
                <!-- Load Order Index -->
                <div class="adv-form-group">
                    <label class="adv-form-label">Load Order Index</label>
                    <input type="number" min="0" class="adv-form-control" data-field="loadOrderIndex" 
                           value="${this.data.loadOrderIndex}">
                </div>
                
                <!-- Local and National Share -->
                <div class="adv-form-row">
                    <div class="adv-form-group">
                        <label class="adv-form-label">Local Share</label>
                        <input type="number" min="0" class="adv-form-control" data-field="localShare" 
                               value="${this.data.localShare}">
                    </div>
                    <div class="adv-form-group">
                        <label class="adv-form-label">National Share</label>
                        <input type="number" min="0" class="adv-form-control" data-field="nationalShare" 
                               value="${this.data.nationalShare}">
                    </div>
                </div>
                
                <!-- Size ID -->
                <div class="adv-form-group">
                    <label class="adv-form-label">Size ID</label>
                    <input type="text" class="adv-form-control" data-field="sizeId" 
                           value="${this.data.sizeId}">
                </div>
                
                <!-- Toggle Options -->
                <div class="adv-toggle-section">
                    <div class="adv-toggle-item">
                        <label class="adv-toggle-label">
                            <input type="checkbox" class="adv-toggle-input" ${this.data.lazyLoad ? 'checked' : ''} data-field="lazyLoad">
                            <span class="adv-toggle-slider"></span>
                            Lazy Load
                        </label>
                    </div>
                    <div class="adv-toggle-item">
                        <label class="adv-toggle-label">
                            <input type="checkbox" class="adv-toggle-input" ${this.data.outOfPage ? 'checked' : ''} data-field="outOfPage">
                            <span class="adv-toggle-slider"></span>
                            Out of Page
                        </label>
                    </div>
                </div>
                
                <!-- Ad Sizes -->
                <div class="adv-sizes-section">
                    <h5 class="adv-section-title">Responsive Ad Sizes</h5>
                    <p class="adv-help-text">Configure ad sizes for different screen sizes</p>
                    ${this.createPopoverAdSizeInputs()}
                </div>
                
                <!-- Content Classification -->
                <div class="adv-form-group">
                    <label class="adv-form-label">Content Classification</label>
                    <div class="adv-classification-input">
                        <input type="text" class="adv-form-control adv-classification-search" 
                               placeholder="Type to search and add...">
                        <div class="adv-classification-tags">
                            ${this.data.contentClassification.map(tag => 
                                `<span class="adv-tag">${tag} <span class="adv-remove-tag" data-tag="${tag}">×</span></span>`
                            ).join('')}
                        </div>
                        <div class="adv-classification-dropdown" style="display: none;">
                            ${this.getClassificationOptions()}
                        </div>
                    </div>
                </div>
                
                <!-- FRN Style -->
                <div class="adv-form-group">
                    <label class="adv-form-label">Custom CSS</label>
                    <textarea class="adv-form-control adv-textarea" rows="3" data-field="frnStyle" 
                              placeholder='{"margin": "30px 0 30px 0"}'>${this.data.frnStyle}</textarea>
                    <small class="adv-form-hint">JSON format for custom styling</small>
                </div>
            </div>
        `;
    }

    createPopoverAdSizeInputs() {
        const breakpoints = ['xl', 'lg', 'md', 'sm', 'xs'];
        const availableSizes = ['None', '970x250', '970x90', '728x90', '300x250', '300x600', '320x50', '300x100'];
        
        return breakpoints.map(bp => `
            <div class="adv-size-group">
                <label class="adv-size-label">${bp.toUpperCase()}</label>
                <div class="adv-size-tags-container">
                    <div class="adv-selected-sizes" data-breakpoint="${bp}">
                        ${this.data.adSizes[bp].map(size => 
                            `<span class="adv-size-tag">${size} <span class="adv-remove-size" data-bp="${bp}" data-size="${size}">×</span></span>`
                        ).join('')}
                    </div>
                    <select class="adv-size-selector" data-breakpoint="${bp}">
                        <option value="">Add size...</option>
                        ${availableSizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                </div>
            </div>
        `).join('');
    }

    getClassificationOptions() {
        const classifications = [
            'About Us', 'Advertise', 'Agriculture', 'Auto', 'Business', 'Entertainment', 
            'Food Recipe', 'Gaming', 'Health', 'News', 'Sports', 'Weather', 'Technology',
            'Travel', 'Education', 'Money', 'Community', 'Shopping', 'Real Estate'
        ];
        
        return classifications.map(cls => 
            `<div class="classification-option" data-value="${cls}">${cls}</div>`
        ).join('');
    }

    attachPopoverEvents(settingsContent) {
        // Basic form field changes
        settingsContent.querySelectorAll('[data-field]').forEach(field => {
            field.addEventListener('change', (e) => {
                const fieldName = e.target.dataset.field;
                if (e.target.type === 'checkbox') {
                    this.data[fieldName] = e.target.checked;
                } else {
                    this.data[fieldName] = e.target.value;
                }
                this.updatePreview();
            });
        });

        // Classification system
        const searchInput = settingsContent.querySelector('.adv-classification-search');
        const dropdown = settingsContent.querySelector('.adv-classification-dropdown');
        
        if (searchInput && dropdown) {
            searchInput.addEventListener('focus', () => dropdown.style.display = 'block');
            searchInput.addEventListener('blur', () => setTimeout(() => dropdown.style.display = 'none', 200));
            
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const options = dropdown.querySelectorAll('.classification-option');
                options.forEach(option => {
                    const text = option.textContent.toLowerCase();
                    option.style.display = text.includes(term) ? 'block' : 'none';
                });
            });
            
            settingsContent.querySelectorAll('.classification-option').forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    if (!this.data.contentClassification.includes(value)) {
                        this.data.contentClassification.push(value);
                        this.updateClassificationTags(settingsContent);
                        searchInput.value = '';
                        dropdown.style.display = 'none';
                    }
                });
            });
        }

        // Remove classification tags
        settingsContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('adv-remove-tag')) {
                const tag = e.target.dataset.tag;
                this.data.contentClassification = this.data.contentClassification.filter(t => t !== tag);
                this.updateClassificationTags(settingsContent);
                this.updatePreview();
            }
        });

        // Ad size selectors
        settingsContent.querySelectorAll('.adv-size-selector').forEach(select => {
            select.addEventListener('change', (e) => {
                const bp = e.target.dataset.breakpoint;
                const size = e.target.value;
                if (size && size !== 'None' && !this.data.adSizes[bp].includes(size)) {
                    this.data.adSizes[bp].push(size);
                    this.updateAdSizeTags(settingsContent, bp);
                    this.updatePreview();
                    e.target.value = '';
                }
            });
        });

        // Remove ad size tags
        settingsContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('adv-remove-size')) {
                const bp = e.target.dataset.bp;
                const size = e.target.dataset.size;
                this.data.adSizes[bp] = this.data.adSizes[bp].filter(s => s !== size);
                this.updateAdSizeTags(settingsContent, bp);
                this.updatePreview();
            }
        });
    }

    updateClassificationTags(settingsContent) {
        const container = settingsContent.querySelector('.adv-classification-tags');
        if (container) {
            container.innerHTML = this.data.contentClassification.map(tag => 
                `<span class="adv-tag">${tag} <span class="adv-remove-tag" data-tag="${tag}">×</span></span>`
            ).join('');
        }
    }

    updateAdSizeTags(settingsContent, breakpoint) {
        const container = settingsContent.querySelector(`[data-breakpoint="${breakpoint}"]`);
        if (container) {
            container.innerHTML = this.data.adSizes[breakpoint].map(size => 
                `<span class="adv-size-tag">${size} <span class="adv-remove-size" data-bp="${breakpoint}" data-size="${size}">×</span></span>`
            ).join('');
        }
    }

    updatePreview() {
        const preview = this.wrapper.querySelector('.adv-unit-preview');
        if (preview) {
            preview.innerHTML = this.generatePreviewHTML();
        }
    }

    save() {
        return this.data;
    }

    static get sanitize() {
        return {
            editing: {},
            className: {},
            contentClassification: {},
            application: {},
            type: {},
            loadOrderIndex: {},
            lazyLoad: {},
            localShare: {},
            nationalShare: {},
            sizeId: {},
            outOfPage: {},
            adSizes: {},
            frnStyle: {}
        };
    }
}

export default AdvUnitBlock; 