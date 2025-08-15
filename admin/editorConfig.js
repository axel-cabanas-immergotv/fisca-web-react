// Centralized Editor.js configuration
// This file contains all the tools and configurations for Editor.js
// Used by both Page Editor and Module Editor to ensure consistency

/**
 * Gets the complete Editor.js tools configuration
 * @returns {Object} Editor.js tools configuration
 */
function getEditorJSTools() {
    const tools = {
        header: {
            class: Header,
            config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
            }
        },
        paragraph: {
            class: Paragraph,
            inlineToolbar: ['bold', 'italic']
        },
        list: {
            class: List,
            inlineToolbar: ['bold', 'italic'],
            config: {
                defaultStyle: 'unordered'
            }
        },
        quote: {
            class: Quote,
            inlineToolbar: ['bold', 'italic'],
            shortcut: 'CMD+SHIFT+O',
            config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote author'
            }
        },
        table: {
            class: Table,
            inlineToolbar: ['bold', 'italic'],
            config: {
                rows: 2,
                cols: 3
            }
        },
        delimiter: Delimiter,
        image: {
            class: ImageTool,
            config: {
                endpoints: {
                    byFile: '/api/upload/image',
                    byUrl: '/api/upload/by-url'
                },
                field: 'image',
                types: 'image/*',
                captionPlaceholder: 'Image caption...',
                buttonContent: 'Select an image'
            }
        },
        columns: {
            class: ColumnsBlock
        },
        advUnit: {
            class: AdvUnitBlock
        },
        textAlign: {
            class: TextAlign,
            config: {
                blocks: {
                    header: 'center',
                    paragraph: 'left'
                },
                default: 'left'
            }
        }
    };

    // Add optional tools if available
    if (typeof StoriesReelBlock !== 'undefined') {
        tools.storiesReel = {
            class: StoriesReelBlock
        };
    }

    return tools;
}

/**
 * Creates a new Editor.js instance with standardized configuration
 * @param {Object} config - Configuration object
 * @param {string} config.holder - DOM element ID to mount the editor
 * @param {string} config.placeholder - Placeholder text for the editor
 * @param {Object} config.data - Initial data for the editor
 * @param {Function} config.onChange - Optional onChange callback
 * @param {Object} config.customTools - Optional additional tools to merge
 * @returns {EditorJS} Editor.js instance
 */
function createEditor(config) {
    const {
        holder,
        placeholder = 'Start creating your content...',
        data = { blocks: [] },
        onChange = null,
        customTools = {}
    } = config;

    // Check if Editor.js is available
    if (typeof EditorJS === 'undefined') {
        throw new Error('Editor.js not loaded');
    }

    // Check if required plugins are available
    const requiredPlugins = [
        { name: 'ColumnsBlock', class: ColumnsBlock },
        { name: 'AdvUnitBlock', class: AdvUnitBlock }
    ];

    // Check optional plugins
    const optionalPlugins = [
        { name: 'StoriesReelBlock', class: typeof StoriesReelBlock !== 'undefined' ? StoriesReelBlock : null }
    ];

    for (const plugin of requiredPlugins) {
        if (typeof plugin.class === 'undefined') {
            console.error(`${plugin.name} plugin not loaded`);
            throw new Error(`${plugin.name} plugin not available`);
        }
    }

    // Warn about missing optional plugins
    for (const plugin of optionalPlugins) {
        if (!plugin.class) {
            console.warn(`⚠️ Optional plugin ${plugin.name} not available yet`);
        }
    }

    // Get base tools and merge with custom tools
    const tools = { ...getEditorJSTools(), ...customTools };

    // Create editor configuration
    const editorConfig = {
        holder,
        placeholder,
        data,
        tools
    };

    // Add onChange if provided
    if (onChange && typeof onChange === 'function') {
        editorConfig.onChange = onChange;
    }

    console.log(`✅ Creating Editor.js instance for holder: ${holder}`);
    console.log('🔧 Available tools:', Object.keys(tools));

    return new EditorJS(editorConfig);
}

/**
 * Validates that all required Editor.js dependencies are available
 * @returns {Object} Validation result with success status and missing dependencies
 */
function validateEditorDependencies() {
    // Core required classes (must be available)
    const requiredClasses = [
        { name: 'EditorJS', class: EditorJS },
        { name: 'Header', class: Header },
        { name: 'Paragraph', class: Paragraph },
        { name: 'List', class: List },
        { name: 'Quote', class: Quote },
        { name: 'Table', class: Table },
        { name: 'Delimiter', class: Delimiter },
        { name: 'ImageTool', class: ImageTool },
        { name: 'TextAlign', class: TextAlign },
        { name: 'ColumnsBlock', class: ColumnsBlock },
        { name: 'AdvUnitBlock', class: AdvUnitBlock }
    ];

    // Optional classes (loaded asynchronously)
    const optionalClasses = [
        { name: 'StoriesReelBlock', class: typeof StoriesReelBlock !== 'undefined' ? StoriesReelBlock : null }
    ];

    const missing = [];
    const optionalMissing = [];
    
    // Check required dependencies
    for (const dependency of requiredClasses) {
        if (typeof dependency.class === 'undefined') {
            missing.push(dependency.name);
        }
    }

    // Check optional dependencies
    for (const dependency of optionalClasses) {
        if (!dependency.class) {
            optionalMissing.push(dependency.name);
        }
    }

    // Log optional missing (but don't fail)
    if (optionalMissing.length > 0) {
        console.warn('⚠️ Optional Editor.js dependencies not yet loaded:', optionalMissing);
    }

    return {
        success: missing.length === 0,
        missing,
        optionalMissing
    };
}

/**
 * Initialize global Editor.js tools for backward compatibility
 * This ensures existing code that depends on window.mainEditorTools continues to work
 */
function initializeGlobalEditorTools() {
    const validation = validateEditorDependencies();
    
    if (!validation.success) {
        console.error('❌ Missing required Editor.js dependencies:', validation.missing);
        return false;
    }

    // Expose tools globally for backward compatibility
    window.mainEditorTools = getEditorJSTools();
    console.log('✅ Global Editor.js tools initialized');

    // Set up listener for StoriesReelBlock when it loads
    if (validation.optionalMissing.includes('StoriesReelBlock')) {
        setupStoriesReelLoader();
    }

    return true;
}

/**
 * Set up listener for StoriesReelBlock async loading
 */
function setupStoriesReelLoader() {
    // Listen for the custom event dispatched by storiesreel-global.js
    document.addEventListener('storiesReelLoaded', function(event) {
        console.log('🎬 StoriesReelBlock loaded, updating global tools');
        // Update the global tools to include StoriesReelBlock
        window.mainEditorTools = getEditorJSTools();
    });

    // Also check periodically in case the event was missed
    let checkCount = 0;
    const maxChecks = 20; // Max 10 seconds (20 * 500ms)
    
    const intervalId = setInterval(() => {
        checkCount++;
        
        if (typeof StoriesReelBlock !== 'undefined') {
            console.log('🎬 StoriesReelBlock detected, updating global tools');
            window.mainEditorTools = getEditorJSTools();
            clearInterval(intervalId);
        } else if (checkCount >= maxChecks) {
            console.warn('⚠️ StoriesReelBlock not loaded after 10 seconds, continuing without it');
            clearInterval(intervalId);
        }
    }, 500);
}

// Auto-initialize global tools when this script loads
if (typeof window !== 'undefined') {
    // Wait for DOM and dependencies to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeGlobalEditorTools, 100);
        });
    } else {
        setTimeout(initializeGlobalEditorTools, 100);
    }
} 