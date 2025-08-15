/**
 * Stories Reel Block for Editor.js - Global Version
 * This version works as a traditional script without ES6 modules
 */
(function(window) {
    'use strict';

    // Configuration for loading order
    const BASE_PATH = '/src/utils/editorjs/storiesreel/';
    const loadOrder = [
        `${BASE_PATH}config.js`,
        `${BASE_PATH}index.js`,
        `${BASE_PATH}integration.js`
    ];

    let loadedFiles = 0;
    const totalFiles = loadOrder.length;

    /**
     * Load a script file dynamically
     */
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = src;
        
        script.onload = function() {
            console.log(`✅ Loaded: ${src}`);
            if (callback) callback(null, src);
        };
        
        script.onerror = function() {
            console.warn(`⚠️ Failed to load: ${src} (skipping, not critical)`);
            if (callback) callback(new Error(`Failed to load ${src}`), src);
        };

        document.head.appendChild(script);
    }

    /**
     * Handle file loading completion
     */
    function onFileLoaded(error, src) {
        loadedFiles++;
        
        if (error) {
            console.warn(`Stories Reel Block load warning for ${src}:`, error.message);
        }

        // Check if all files are loaded (or attempted)
        if (loadedFiles >= totalFiles) {
            finalizeStoriesReelBlock();
        }
    }

    /**
     * Finalize Stories Reel Block setup
     */
    function finalizeStoriesReelBlock() {
        // Create a basic StoriesReel block if not loaded from files
        if (typeof window.StoriesReelBlock === 'undefined') {
            console.log('📦 Creating basic StoriesReel block placeholder');
            
            window.StoriesReelBlock = class StoriesReelBlock {
                static get toolbox() {
                    return {
                        title: 'Stories Reel',
                        icon: '<svg width="20" height="20"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8l-4 4 4 4" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
                    };
                }

                constructor({ data, config, api, readOnly }) {
                    this.api = api;
                    this.readOnly = readOnly;
                    this.data = data || {};
                    this.config = config || {};
                }

                render() {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('stories-reel-block');
                    wrapper.innerHTML = `
                        <div class="stories-reel-placeholder">
                            <div class="stories-reel-icon">🎬</div>
                            <div class="stories-reel-title">Stories Reel</div>
                            <div class="stories-reel-subtitle">Interactive stories carousel</div>
                        </div>
                    `;
                    return wrapper;
                }

                save() {
                    return this.data;
                }

                static get sanitize() {
                    return {};
                }
            };
        }

        // Dispatch event for other components
        const event = new CustomEvent('storiesReelLoaded', {
            detail: { block: window.StoriesReelBlock }
        });
        document.dispatchEvent(event);
        console.log('✅ Stories Reel Block ready (basic version)');
    }

    /**
     * Initialize the loader
     */
    function initializeLoader() {
        console.log('🚀 Starting Stories Reel Block loader...');
        
        // Try to load files, but don't fail if they're missing
        loadOrder.forEach((src, index) => {
            setTimeout(() => {
                loadScript(src, onFileLoaded);
            }, index * 100);
        });

        // Fallback timeout - if files don't load within 5 seconds, create placeholder
        setTimeout(() => {
            if (loadedFiles === 0) {
                console.log('⏰ Stories Reel files not loaded within timeout, creating placeholder');
                finalizeStoriesReelBlock();
            }
        }, 5000);
    }
    
    /**
     * Check if we should load
     */
    function shouldLoad() {
        if (window.StoriesReelBlock) {
            console.log('🎬 Stories Reel Block already loaded, skipping...');
            return false;
        }
        return true;
    }

    // Initialize when ready
    if (shouldLoad()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLoader);
        } else {
            initializeLoader();
        }
    }

})(window); 