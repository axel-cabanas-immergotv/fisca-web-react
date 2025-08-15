/**
 * Stories Reel Block Integration
 * This file handles the integration of the Stories Reel widget with Editor.js
 */

// Integration functions for Stories Reel Block
const StoriesReelIntegration = {
    
    /**
     * Initialize the Stories Reel widget
     */
    init() {
        console.log('🎬 Initializing Stories Reel Block...');
        
        // Check if required dependencies are available
        if (!this.checkDependencies()) {
            console.error('❌ Stories Reel Block: Missing dependencies');
            return false;
        }
        
        // Load CSS if not already loaded
        this.loadCSS();
        
        // Register global widget
        if (typeof window !== 'undefined') {
            window.StoriesReelBlock = StoriesReelBlock;
            console.log('✅ Stories Reel Block registered globally');
        }
        
        return true;
    },
    
    /**
     * Check if all required dependencies are available
     */
    checkDependencies() {
        const required = [
            { name: 'StoriesReelBlock', obj: StoriesReelBlock },
            { name: 'StoriesReelConfig', obj: StoriesReelConfig }
        ];
        
        const missing = [];
        
        for (const dep of required) {
            if (typeof dep.obj === 'undefined') {
                missing.push(dep.name);
            }
        }
        
        if (missing.length > 0) {
            console.error('❌ Missing Stories Reel dependencies:', missing);
            return false;
        }
        
        return true;
    },
    
    /**
     * Load CSS file for the widget
     */
    loadCSS() {
        const cssId = 'stories-reel-css';
        
        // Check if CSS is already loaded
        if (document.getElementById(cssId)) {
            return;
        }
        
        // Create CSS link element
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/src/utils/editorjs/storiesreel/storiesreel.css';
        
        // Append to head
        document.head.appendChild(link);
        
        console.log('📄 Stories Reel CSS loaded');
    },
    
    /**
     * Get the widget configuration for Editor.js tools
     */
    getToolConfig() {
        return {
            class: StoriesReelBlock,
            config: StoriesReelConfig.defaults
        };
    },
    
    /**
     * Validate widget data
     */
    validateData(data) {
        const errors = [];
        
        // Validate count
        if (data.count < StoriesReelConfig.constraints.minCount) {
            errors.push(`Count must be at least ${StoriesReelConfig.constraints.minCount}`);
        }
        
        if (data.count > StoriesReelConfig.constraints.maxCount) {
            errors.push(`Count must not exceed ${StoriesReelConfig.constraints.maxCount}`);
        }
        
        // Validate layout
        const validLayouts = StoriesReelConfig.layoutOptions.map(option => option.value);
        if (!validLayouts.includes(data.layout)) {
            errors.push(`Invalid layout: ${data.layout}`);
        }
        
        // Validate title length
        if (data.title && data.title.length > StoriesReelConfig.constraints.maxTitleLength) {
            errors.push(`Title too long (max ${StoriesReelConfig.constraints.maxTitleLength} characters)`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },
    
    /**
     * Create default widget data
     */
    createDefaultData() {
        return { ...StoriesReelConfig.defaults };
    },
    
    /**
     * Get available categories for the settings
     */
    async getCategories() {
        try {
            const response = await fetch(StoriesReelConfig.endpoints.categories);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
        } catch (error) {
            console.warn('Could not load categories:', error);
        }
        
        return [];
    },
    
    /**
     * Utility function to generate random image URL
     */
    getRandomImageUrl(size = 'card', seed = null) {
        const service = StoriesReelConfig.imageServices.picsum;
        const randomSeed = seed || Math.floor(Math.random() * 1000);
        return `${service.baseUrl}/${service.sizes[size]}?random=${randomSeed}`;
    },
    
    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 7) {
            return date.toLocaleDateString();
        } else if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            const remainingMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''} ago`;
        } else {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${Math.max(1, diffInMinutes)} min${diffInMinutes > 1 ? 's' : ''} ago`;
        }
    },
    
    /**
     * Debug function to log widget information
     */
    debug() {
        console.group('🎬 Stories Reel Block Debug Info');
        console.log('Widget Class:', StoriesReelBlock);
        console.log('Configuration:', StoriesReelConfig);
        console.log('CSS Loaded:', !!document.getElementById('stories-reel-css'));
        console.log('Global Registration:', !!window.StoriesReelBlock);
        console.groupEnd();
    }
};

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    // Wait for DOM and dependencies to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => StoriesReelIntegration.init(), 200);
        });
    } else {
        setTimeout(() => StoriesReelIntegration.init(), 200);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoriesReelIntegration;
} else if (typeof window !== 'undefined') {
    window.StoriesReelIntegration = StoriesReelIntegration;
} 