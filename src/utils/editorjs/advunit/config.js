/**
 * Configuration and utilities for AdvUnit Block
 */

export const AdvUnitConfig = {
    // Default settings for new ad units
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

    // Application types for advertisements
    applicationTypes: [
        { value: '', label: 'Select...' },
        { value: 'banner', label: 'Banner' },
        { value: 'video', label: 'Video' },
        { value: 'email', label: 'Email' },
        { value: 'slideshow', label: 'Slideshow' }
    ],

    // Ad unit types
    adTypes: [
        { value: 'dom', label: 'Dom' },
        { value: 'inline', label: 'Inline' },
        { value: 'async', label: 'Async' }
    ],

    // Available ad sizes
    adSizes: [
        'None',
        '970x250',  // Billboard
        '970x90',   // Super Banner
        '728x90',   // Leaderboard
        '300x250',  // Medium Rectangle
        '300x600',  // Half Page
        '320x50',   // Mobile Banner
        '300x100',  // Mobile Large Banner
        '160x600',  // Wide Skyscraper
        '336x280',  // Large Rectangle
        '468x60',   // Banner
        '234x60',   // Half Banner
        '120x600',  // Skyscraper
        '125x125',  // Square Button
        '240x400',  // Vertical Rectangle
        '250x250',  // Square
        '200x200',  // Small Square
        '180x150',  // Small Rectangle
        '320x100',  // Large Mobile Banner
        '320x480'   // Mobile Interstitial
    ],

    // Content classification options (extensive list)
    contentClassifications: [
        'About Us', 'Advertise', 'Agriculture', 'Auto', 'Auto - About', 'Auto - Browse',
        'Auto - Consumer', 'Auto - FSBO', 'Auto - Homepage', 'Auto - Local', 'Auto - Pricing',
        'Auto - Promotion', 'Auto - Quick Links', 'Auto - Reviews', 'Auto - Search',
        'Auto - Spanish', 'Auto - Video', 'BWF', 'Boxing', 'Business', 'CSMonitor',
        'Chat', 'Closings', 'ComediansSports', 'Community', 'Community - Calendar',
        'Community - Events', 'Consumer', 'Contests', 'Coupons', 'Crime', 'Derby',
        'Desktop Application', 'Direct Mail', 'E-Commerce', 'Education', 'Elections',
        'Entertainment', 'Entertainment - Fashion', 'Entertainment - Interview',
        'Entertainment - Local', 'Entertainment - Movies', 'Entertainment - Music',
        'Entertainment - TV', 'Food Recipe', 'Gaming', 'Gaming - Battle Royale Rundown',
        'Gaming - Challenger Series', 'Gaming - Collegiate Clash-Overwatch',
        'Gaming - Collegiate Clash-Rocket League', 'Gaming - Emergence Days',
        'Gaming - Esports Dispatch', 'Gaming - Fortnite', 'Gaming - Legends Series',
        'Gaming - Legion', 'Gaming - Minecraft', 'Gaming - Sunday Showdown',
        'Gaming - The Race', 'Gaming - Tournament Highlights', 'Gaming - UMG Champions',
        'Gaming - Valorant', 'Gaming - Weekly Rumble', 'Health', 'HealthiNation',
        'High School Sports', 'Homepage', 'IVillage', 'Inside', 'Jiu Jitsu', 'Judo',
        'Karate', 'Kickboxing', 'Legal', 'Livestreaming', 'Lottery', 'MMA',
        'Martial Arts', 'Money', 'Morning Show', 'Most Popular', 'MusiciansSports',
        'News', 'News - AP-National', 'News - AP-National-Business',
        'News - AP-National-Entertainment', 'News - AP-National-Health',
        'News - AP-National-Olympics', 'News - AP-National-Political',
        'News - AP-National-Sports', 'News - AP-National-Travel',
        'News - AP-National-Weather', 'News - Breaking News', 'News - Hard News',
        'News - Political', 'News - Special Coverage', 'Olympics', 'Opinion', 'Pets',
        'Political', 'Political - Democrat', 'Political - Independent',
        'Political - Republican', 'Programming', 'Reality', 'Registration',
        'Retirement', 'Reuters', 'Spanish', 'Sport', 'Sport - Athlete',
        'Sport - Basketball', 'Sport - Football', 'Sport - MLB', 'Sport - NBA',
        'Sport - NCAA', 'Sport - NFL', 'Sport - NHL', 'Sports', 'Technology',
        'Travel', 'Weather', 'Weather - Forecast', 'Weather - Severe'
    ],

    // Responsive breakpoints
    breakpoints: {
        xl: { label: 'Extra Large (≥1200px)', minWidth: 1200 },
        lg: { label: 'Large (≥992px)', minWidth: 992 },
        md: { label: 'Medium (≥768px)', minWidth: 768 },
        sm: { label: 'Small (≥576px)', minWidth: 576 },
        xs: { label: 'Extra Small (<576px)', minWidth: 0 }
    },

    // CSS class names
    cssClasses: {
        block: 'adv-unit-block',
        preview: 'adv-unit-preview',
        container: 'adv-unit-container',
        settings: 'adv-unit-settings',
        frontend: 'adv-unit-frontend'
    },

    // Plugin metadata
    metadata: {
        name: 'AdvUnit',
        version: '1.0.0',
        description: 'Google Advertisement Unit block for Editor.js'
    }
};

/**
 * Utility functions for the AdvUnit Block
 */
export const AdvUnitUtils = {
    /**
     * Validate ad unit configuration
     * @param {Object} config - Ad unit configuration
     * @returns {Object} Validation result
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];

        // Required fields validation
        if (!config.className || !config.className.trim()) {
            errors.push('Class Name is required');
        }

        if (!config.type) {
            errors.push('Type is required');
        }

        if (config.loadOrderIndex === undefined || config.loadOrderIndex < 0) {
            errors.push('Load Order Index must be 0 or greater');
        }

        if (config.localShare === undefined || config.localShare < 0) {
            errors.push('Local Share must be 0 or greater');
        }

        if (config.nationalShare === undefined || config.nationalShare < 0) {
            errors.push('National Share must be 0 or greater');
        }

        // Warnings for best practices
        if (config.localShare + config.nationalShare > 100) {
            warnings.push('Local Share + National Share exceeds 100%');
        }

        if (!config.adSizes || Object.keys(config.adSizes).length === 0) {
            warnings.push('No ad sizes configured');
        }

        // Validate FRN Style JSON
        if (config.frnStyle) {
            try {
                JSON.parse(config.frnStyle);
            } catch (e) {
                errors.push('FRN Style must be valid JSON');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Generate Google Ad Manager compatible configuration
     * @param {Object} config - Ad unit configuration
     * @returns {Object} Google Ad Manager configuration
     */
    generateGoogleAdConfig(config) {
        const adSizes = this.getFlexibleAdSizes(config.adSizes);
        
        return {
            adUnitPath: config.className,
            size: adSizes,
            sizeMapping: this.generateSizeMapping(config.adSizes),
            targeting: {
                content_classification: config.contentClassification,
                application: config.application,
                load_order: config.loadOrderIndex.toString()
            },
            lazyLoading: config.lazyLoad,
            outOfPage: config.outOfPage,
            styles: config.frnStyle ? JSON.parse(config.frnStyle) : {}
        };
    },

    /**
     * Get flexible ad sizes for Google Ad Manager
     * @param {Object} adSizes - Responsive ad sizes configuration
     * @returns {Array} Flexible ad sizes array
     */
    getFlexibleAdSizes(adSizes) {
        const allSizes = [];
        
        Object.values(adSizes).forEach(sizeArray => {
            sizeArray.forEach(size => {
                if (size !== 'None' && !allSizes.includes(size)) {
                    allSizes.push(size);
                }
            });
        });

        return allSizes.map(size => {
            const [width, height] = size.split('x').map(Number);
            return [width, height];
        });
    },

    /**
     * Generate size mapping for responsive ads
     * @param {Object} adSizes - Responsive ad sizes configuration
     * @returns {Array} Size mapping array
     */
    generateSizeMapping(adSizes) {
        const mapping = [];
        
        Object.entries(AdvUnitConfig.breakpoints).forEach(([key, breakpoint]) => {
            const sizes = adSizes[key] || [];
            const validSizes = sizes
                .filter(size => size !== 'None')
                .map(size => {
                    const [width, height] = size.split('x').map(Number);
                    return [width, height];
                });

            mapping.push([
                [breakpoint.minWidth, 0],
                validSizes.length > 0 ? validSizes : []
            ]);
        });

        return mapping.sort((a, b) => b[0][0] - a[0][0]); // Sort by breakpoint descending
    },

    /**
     * Generate JavaScript code for ad implementation
     * @param {Object} config - Ad unit configuration
     * @returns {String} JavaScript code
     */
    generateAdScript(config) {
        const googleAdConfig = this.generateGoogleAdConfig(config);
        
        return `
// Advertisement Unit: ${config.className}
(function() {
    var adConfig = ${JSON.stringify(googleAdConfig, null, 2)};
    
    // Google Ad Manager implementation
    googletag.cmd.push(function() {
        var adSlot = googletag.defineSlot('${googleAdConfig.adUnitPath}', 
            adConfig.size, 
            'div-gpt-ad-${config.className.replace(/[^a-zA-Z0-9]/g, '-')}');
        
        // Set size mapping for responsive ads
        if (adConfig.sizeMapping.length > 0) {
            var mapping = googletag.sizeMapping();
            adConfig.sizeMapping.forEach(function(map) {
                mapping.addSize(map[0], map[1]);
            });
            adSlot.defineSizeMapping(mapping.build());
        }
        
        // Set targeting
        Object.keys(adConfig.targeting).forEach(function(key) {
            adSlot.setTargeting(key, adConfig.targeting[key]);
        });
        
        // Configure lazy loading
        if (adConfig.lazyLoading) {
            googletag.pubads().enableLazyLoad({
                fetchMarginPercent: 500,
                renderMarginPercent: 200,
                mobileScaling: 2.0
            });
        }
        
        adSlot.addService(googletag.pubads());
        googletag.display('div-gpt-ad-${config.className.replace(/[^a-zA-Z0-9]/g, '-')}');
    });
})();
        `.trim();
    },

    /**
     * Generate HTML for ad unit display
     * @param {Object} config - Ad unit configuration
     * @returns {String} HTML code
     */
    generateAdHTML(config) {
        const divId = `div-gpt-ad-${config.className.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const styles = config.frnStyle ? JSON.parse(config.frnStyle) : { margin: '30px 0' };
        
        const styleString = Object.entries(styles)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');

        return `
<div id="${divId}" 
     class="${config.className} adv-unit-frontend${config.lazyLoad ? ' lazy-loading' : ''}"
     style="${styleString}"
     data-ad-type="${config.type}"
     data-load-order="${config.loadOrderIndex}"
     data-local-share="${config.localShare}"
     data-national-share="${config.nationalShare}">
</div>
        `.trim();
    },

    /**
     * Clone configuration object
     * @param {Object} config - Configuration to clone
     * @returns {Object} Cloned configuration
     */
    cloneConfig(config) {
        return JSON.parse(JSON.stringify(config || AdvUnitConfig.defaultSettings));
    },

    /**
     * Merge user configuration with defaults
     * @param {Object} userConfig - User provided configuration
     * @returns {Object} Merged configuration
     */
    mergeWithDefaults(userConfig) {
        const defaults = this.cloneConfig(AdvUnitConfig.defaultSettings);
        
        if (!userConfig) return defaults;

        // Deep merge
        Object.keys(userConfig).forEach(key => {
            if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
                defaults[key] = { ...defaults[key], ...userConfig[key] };
            } else {
                defaults[key] = userConfig[key];
            }
        });

        return defaults;
    },

    /**
     * Load CSS file
     * @param {String} cssPath - Path to CSS file
     */
    loadCSS(cssPath) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
    },

    /**
     * Get content classification suggestions based on search term
     * @param {String} searchTerm - Search term
     * @returns {Array} Filtered classifications
     */
    getClassificationSuggestions(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            return AdvUnitConfig.contentClassifications.slice(0, 20);
        }

        const term = searchTerm.toLowerCase();
        return AdvUnitConfig.contentClassifications
            .filter(cls => cls.toLowerCase().includes(term))
            .slice(0, 10);
    },

    /**
     * Format ad sizes for display
     * @param {Object} adSizes - Ad sizes configuration
     * @returns {String} Formatted sizes string
     */
    formatAdSizes(adSizes) {
        const allSizes = [];
        Object.values(adSizes).forEach(sizeArray => {
            sizeArray.forEach(size => {
                if (size !== 'None' && !allSizes.includes(size)) {
                    allSizes.push(size);
                }
            });
        });
        return allSizes.join(', ');
    }
};

export default { AdvUnitConfig, AdvUnitUtils }; 