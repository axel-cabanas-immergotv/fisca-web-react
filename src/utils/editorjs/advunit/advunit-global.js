/**
 * AdvUnit Block for Editor.js - Global Version
 * This file exposes the AdvUnit plugin globally for use in admin interface
 */

/**
 * Configuration for AdvUnit Block
 */
const AdvUnitConfig = {
    defaultSettings: {
        editing: 'Basic',
        className: 'AdvertisementUnit--wideGreyBase',
        contentClassification: [],
        application: '',
        type: 'dom',
        loadOrderIndex: 1,
        lazyLoad: true,
        localShare: 1,
        nationalShare: 0,
        sizeId: '41',
        outOfPage: false,
        adSizes: {
            xl: ['970x90', '728x90'],
            lg: ['970x90', '728x90'],
            md: ['728x90'],
            sm: ['320x50'],
            xs: ['320x50']
        },
        frnStyle: '{\n   "margin": "30px 0 30px 0"\n}'
    },

    applicationTypes: [
        { value: '', label: 'Select...' },
        { value: 'banner', label: 'Banner' },
        { value: 'video', label: 'Video' },
        { value: 'email', label: 'Email' },
        { value: 'slideshow', label: 'Slideshow' }
    ],

    adTypes: [
        { value: 'dom', label: 'Dom' },
        { value: 'inline', label: 'Inline' },
        { value: 'async', label: 'Async' }
    ],

    adSizes: [
        'None', '970x250', '970x90', '728x90', '300x250', '300x600', 
        '320x50', '300x100', '160x600', '336x280', '468x60'
    ],

    contentClassifications: [
        'About Us', 'Advertise', 'Agriculture', 'Auto', 'Business', 'Entertainment', 
        'Food Recipe', 'Gaming', 'Health', 'News', 'Sports', 'Weather', 'Technology',
        'Travel', 'Education', 'Money', 'Community', 'Shopping', 'Real Estate'
    ]
};

/**
 * Utilities for AdvUnit Block
 */
const AdvUnitUtils = {
    cloneConfig: function(config) {
        return JSON.parse(JSON.stringify(config || AdvUnitConfig.defaultSettings));
    },

    mergeWithDefaults: function(userConfig) {
        const defaults = this.cloneConfig(AdvUnitConfig.defaultSettings);
        if (!userConfig) return defaults;

        Object.keys(userConfig).forEach(key => {
            if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
                defaults[key] = { ...defaults[key], ...userConfig[key] };
            } else {
                defaults[key] = userConfig[key];
            }
        });

        return defaults;
    },

    validateConfig: function(config) {
        const errors = [];
        if (!config.className || !config.className.trim()) {
            errors.push('Class Name is required');
        }
        if (!config.type) {
            errors.push('Type is required');
        }
        return { isValid: errors.length === 0, errors };
    },

    generateAdHTML: function(config) {
        const divId = `div-gpt-ad-${config.className.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const styles = config.frnStyle ? JSON.parse(config.frnStyle) : { margin: '30px 0' };
        
        const styleString = Object.entries(styles)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');

        return `<div id="${divId}" class="${config.className} adv-unit-frontend${config.lazyLoad ? ' lazy-loading' : ''}" style="${styleString}" data-ad-type="${config.type}" data-load-order="${config.loadOrderIndex}"></div>`;
    }
};

/**
 * Main AdvUnit Block Class
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
        this.data = AdvUnitUtils.mergeWithDefaults(data);
        this.wrapper = null;
        this.settingsOpened = false;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('adv-unit-block');
        
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
                    <div class="adv-unit-sizes"><strong>Sizes:</strong> ${sizes}</div>
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
        const allSizes = [];
        Object.values(this.data.adSizes).forEach(sizeArray => {
            sizeArray.forEach(size => {
                if (size !== 'None' && !allSizes.includes(size)) {
                    allSizes.push(size);
                }
            });
        });
        return allSizes.join(', ');
    }

    createSettingsHTML() {
        return `
            <div class="adv-popover-settings-content">
                <div class="adv-popover-header">
                    <h4>Advertisement Unit Configuration</h4>
                </div>
                
                <div class="adv-form-group required">
                    <label class="adv-form-label">Class Name <span class="required">*</span></label>
                    <input type="text" class="adv-form-control" data-field="className" 
                           value="${this.data.className}" placeholder="AdvertisementUnit--wideGreyBase">
                </div>
                
                <div class="adv-form-group">
                    <label class="adv-form-label">Application</label>
                    <select class="adv-form-control" data-field="application">
                        ${AdvUnitConfig.applicationTypes.map(app => 
                            `<option value="${app.value}" ${this.data.application === app.value ? 'selected' : ''}>${app.label}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="adv-form-group required">
                    <label class="adv-form-label">Type <span class="required">*</span></label>
                    <select class="adv-form-control" data-field="type">
                        ${AdvUnitConfig.adTypes.map(type => 
                            `<option value="${type.value}" ${this.data.type === type.value ? 'selected' : ''}>${type.label}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="adv-form-group">
                    <label class="adv-form-label">Load Order Index</label>
                    <input type="number" min="0" class="adv-form-control" data-field="loadOrderIndex" 
                           value="${this.data.loadOrderIndex}">
                </div>
                
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
                
                <div class="adv-form-group">
                    <label class="adv-form-label">Size ID</label>
                    <input type="text" class="adv-form-control" data-field="sizeId" 
                           value="${this.data.sizeId}">
                </div>
                
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
                
                <div class="adv-sizes-section">
                    <h5 class="adv-section-title">Responsive Ad Sizes</h5>
                    <p class="adv-help-text">Configure ad sizes for different screen sizes</p>
                    ${this.createPopoverAdSizeInputs()}
                </div>
                
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
                        ${AdvUnitConfig.adSizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                </div>
            </div>
        `).join('');
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

// Expose globally for use in admin
window.AdvUnitBlock = AdvUnitBlock;
window.AdvUnitConfig = AdvUnitConfig;
window.AdvUnitUtils = AdvUnitUtils; 