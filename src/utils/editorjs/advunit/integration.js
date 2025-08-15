/**
 * Integration helper for AdvUnit Block
 */

import AdvUnitBlock from './index.js';
import { AdvUnitConfig, AdvUnitUtils } from './config.js';

/**
 * Initialize the AdvUnit Block plugin
 * @param {Object} options - Plugin options
 * @returns {Object} Plugin configuration for Editor.js
 */
export function initAdvUnitPlugin(options = {}) {
    // Load CSS if path provided
    const cssPath = options.cssPath || '/src/utils/editorjs/advunit/advunit.css';
    AdvUnitUtils.loadCSS(cssPath);

    // Return plugin configuration
    return {
        class: AdvUnitBlock,
        config: {
            ...AdvUnitConfig.defaultSettings,
            ...options
        }
    };
}

/**
 * Get the AdvUnit Block class for manual integration
 * @returns {Class} AdvUnitBlock class
 */
export function getAdvUnitBlock() {
    return AdvUnitBlock;
}

/**
 * Get AdvUnit configuration and utilities
 * @returns {Object} Configuration and utilities
 */
export function getAdvUnitConfig() {
    return { AdvUnitConfig, AdvUnitUtils };
}

/**
 * Preload AdvUnit dependencies
 * @param {Object} options - Options for preloading
 */
export function preloadAdvUnitDependencies(options = {}) {
    const { cssPath = '/src/utils/editorjs/advunit/advunit.css' } = options;
    
    // Load CSS
    AdvUnitUtils.loadCSS(cssPath);
    
    // Preload any additional assets if needed
    if (options.additionalAssets) {
        options.additionalAssets.forEach(asset => {
            AdvUnitUtils.loadCSS(asset.url);
        });
    }
}

/**
 * Create a complete Editor.js configuration with AdvUnit plugin
 * @param {Object} editorConfig - Base Editor.js configuration
 * @param {Object} advUnitOptions - AdvUnit plugin options
 * @returns {Object} Complete Editor.js configuration
 */
export function createEditorConfigWithAdvUnit(editorConfig = {}, advUnitOptions = {}) {
    const advUnitPlugin = initAdvUnitPlugin(advUnitOptions);
    
    return {
        ...editorConfig,
        tools: {
            ...editorConfig.tools,
            advUnit: advUnitPlugin
        }
    };
}

/**
 * Validate if Editor.js environment is ready for AdvUnit plugin
 * @returns {Object} Validation result
 */
export function validateAdvUnitEnvironment() {
    const issues = [];
    
    // Check if Editor.js is available
    if (typeof window !== 'undefined' && typeof window.EditorJS === 'undefined') {
        issues.push('Editor.js is not loaded');
    }
    
    // Check if Font Awesome is available (for icons)
    if (typeof window !== 'undefined') {
        const fontAwesome = document.querySelector('link[href*="font-awesome"]') || 
                           document.querySelector('link[href*="fontawesome"]');
        if (!fontAwesome) {
            issues.push('Font Awesome is recommended for better icons');
        }
    }
    
    return {
        isReady: issues.length === 0,
        issues,
        recommendations: [
            'Ensure Google Ad Manager (googletag) is loaded for live ads',
            'Configure proper ad unit paths in Google Ad Manager',
            'Test ad configurations in different screen sizes'
        ]
    };
}

/**
 * Helper functions for ad unit management
 */
export const AdvUnitHelpers = {
    /**
     * Create a sample ad unit configuration
     * @param {String} type - Type of ad unit (banner, video, etc.)
     * @returns {Object} Sample configuration
     */
    createSampleConfig(type = 'banner') {
        const baseConfig = AdvUnitUtils.cloneConfig(AdvUnitConfig.defaultSettings);
        
        switch (type) {
            case 'banner':
                return {
                    ...baseConfig,
                    className: 'AdvertisementUnit--banner',
                    application: 'banner',
                    adSizes: {
                        xl: ['970x90', '728x90'],
                        lg: ['728x90'],
                        md: ['728x90'],
                        sm: ['320x50'],
                        xs: ['320x50']
                    }
                };
                
            case 'video':
                return {
                    ...baseConfig,
                    className: 'AdvertisementUnit--video',
                    application: 'video',
                    type: 'async',
                    adSizes: {
                        xl: ['970x250'],
                        lg: ['970x250'],
                        md: ['728x90'],
                        sm: ['320x50'],
                        xs: ['320x50']
                    }
                };
                
            case 'sidebar':
                return {
                    ...baseConfig,
                    className: 'AdvertisementUnit--sidebar',
                    application: 'banner',
                    adSizes: {
                        xl: ['300x600', '300x250'],
                        lg: ['300x600', '300x250'],
                        md: ['300x250'],
                        sm: ['320x50'],
                        xs: ['320x50']
                    }
                };
                
            default:
                return baseConfig;
        }
    },

    /**
     * Export ad unit data for external systems
     * @param {Object} adUnitData - Ad unit data from Editor.js
     * @returns {Object} Exported data
     */
    exportAdUnitData(adUnitData) {
        return {
            type: 'advUnit',
            config: adUnitData,
            googleAdConfig: AdvUnitUtils.generateGoogleAdConfig(adUnitData),
            html: AdvUnitUtils.generateAdHTML(adUnitData),
            script: AdvUnitUtils.generateAdScript(adUnitData),
            validation: AdvUnitUtils.validateConfig(adUnitData)
        };
    },

    /**
     * Import ad unit data from external systems
     * @param {Object} exportedData - Previously exported data
     * @returns {Object} Ad unit data for Editor.js
     */
    importAdUnitData(exportedData) {
        if (exportedData.type !== 'advUnit') {
            throw new Error('Invalid ad unit data format');
        }
        
        return AdvUnitUtils.mergeWithDefaults(exportedData.config);
    }
};

/**
 * AdvUnit Plugin Manager for advanced use cases
 */
export class AdvUnitPluginManager {
    constructor() {
        this.instances = new Map();
        this.globalConfig = AdvUnitUtils.cloneConfig(AdvUnitConfig.defaultSettings);
    }
    
    /**
     * Register a new ad unit instance
     * @param {String} id - Instance ID
     * @param {Object} config - Ad unit configuration
     */
    register(id, config) {
        this.instances.set(id, {
            config: AdvUnitUtils.mergeWithDefaults(config),
            createdAt: new Date(),
            lastModified: new Date()
        });
    }
    
    /**
     * Update an existing ad unit instance
     * @param {String} id - Instance ID
     * @param {Object} updates - Configuration updates
     */
    update(id, updates) {
        const instance = this.instances.get(id);
        if (instance) {
            instance.config = AdvUnitUtils.mergeWithDefaults({
                ...instance.config,
                ...updates
            });
            instance.lastModified = new Date();
        }
    }
    
    /**
     * Get all registered instances
     * @returns {Map} All instances
     */
    getAllInstances() {
        return this.instances;
    }
    
    /**
     * Export all instances for backup
     * @returns {Array} Exported instances
     */
    exportAll() {
        return Array.from(this.instances.entries()).map(([id, instance]) => ({
            id,
            ...AdvUnitHelpers.exportAdUnitData(instance.config),
            metadata: {
                createdAt: instance.createdAt,
                lastModified: instance.lastModified
            }
        }));
    }
}

// Create a global instance
export const advUnitPluginManager = new AdvUnitPluginManager();

// Export everything
export {
    AdvUnitBlock,
    AdvUnitConfig,
    AdvUnitUtils,
    initAdvUnitPlugin,
    getAdvUnitBlock,
    getAdvUnitConfig,
    preloadAdvUnitDependencies,
    createEditorConfigWithAdvUnit,
    validateAdvUnitEnvironment,
    AdvUnitPluginManager,
    advUnitPluginManager
}; 