import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './editorjs.css';

const EditorJs = forwardRef(({
    data = { blocks: [] },
    placeholder = 'Start creating your content...',
    onChange = null,
    onReady = null,
    customTools = {},
    readOnly = false,
    className = ''
}, ref) => {
    const editorRef = useRef(null);
    const holderRef = useRef(null);
    const holderId = useRef(`editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const isInitializing = useRef(false);

    // Expose editor instance methods to parent component
    useImperativeHandle(ref, () => ({
        save: async () => {
            if (editorRef.current) {
                try {
                    return await editorRef.current.save();
                } catch (error) {
                    console.error('Error saving editor data:', error);
                    throw error;
                }
            }
            return { blocks: [] };
        },
        
        clear: async () => {
            if (editorRef.current) {
                try {
                    await editorRef.current.clear();
                } catch (error) {
                    console.error('Error clearing editor:', error);
                }
            }
        },
        
        render: async (data) => {
            if (editorRef.current) {
                try {
                    await editorRef.current.render(data);
                } catch (error) {
                    console.error('Error rendering editor data:', error);
                }
            }
        },
        
        destroy: async () => {
            if (editorRef.current) {
                try {
                    await editorRef.current.destroy();
                    editorRef.current = null;
                } catch (error) {
                    console.error('Error destroying editor:', error);
                }
            }
        },
        
        focus: () => {
            if (editorRef.current) {
                try {
                    editorRef.current.focus();
                } catch (error) {
                    console.error('Error focusing editor:', error);
                }
            }
        },
        
        getEditor: () => editorRef.current
    }));

    // Check if Editor.js dependencies are available
    const checkDependencies = () => {
        // Core Editor.js dependencies
        const coreGlobals = [
            'EditorJS',
            'Header', 
            'Paragraph',
            'List',
            'Quote',
            'Table',
            'Delimiter',
            'ImageTool'
        ];

        // Custom tools
        const customGlobals = [
            'ColumnsBlock',
            'AdvUnitBlock'
        ];

        // Optional tools
        const optionalGlobals = [
            'StoriesReelBlock',
            'TextAlign'
        ];

        const missingCore = coreGlobals.filter(dep => typeof window[dep] === 'undefined');
        const missingCustom = customGlobals.filter(dep => typeof window[dep] === 'undefined');
        const missingOptional = optionalGlobals.filter(dep => typeof window[dep] === 'undefined');
        
        // Check if createEditor function is available
        const hasCreateEditor = typeof window.createEditor === 'function';

        // Debug logging
        console.log('🔍 Editor.js Dependencies Check:');
        console.log('  Core tools available:', coreGlobals.filter(dep => typeof window[dep] !== 'undefined'));
        console.log('  Custom tools available:', customGlobals.filter(dep => typeof window[dep] !== 'undefined'));
        console.log('  Optional tools available:', optionalGlobals.filter(dep => typeof window[dep] !== 'undefined'));
        
        if (missingCore.length > 0) {
            console.warn('  ❌ Missing core tools:', missingCore);
        }
        if (missingCustom.length > 0) {
            console.warn('  ⚠️ Missing custom tools:', missingCustom);
        }
        if (missingOptional.length > 0) {
            console.info('  📝 Missing optional tools:', missingOptional);
        }
        
        console.log('  createEditor function:', hasCreateEditor ? '✅ Available' : '❌ Missing');

        // Check if we have window.mainEditorTools (from editorConfig.js)
        const hasMainTools = typeof window.mainEditorTools === 'object';
        console.log('  mainEditorTools:', hasMainTools ? '✅ Available' : '❌ Missing');
        
        if (hasMainTools) {
            console.log('  Available tools in mainEditorTools:', Object.keys(window.mainEditorTools));
        }

        return {
            hasAllCore: missingCore.length === 0,
            hasCustomTools: missingCustom.length === 0,
            hasCreateEditor,
            missingCore,
            missingCustom,
            missingOptional,
            ready: missingCore.length === 0 && hasCreateEditor
        };
    };

    // Initialize Editor.js
    useEffect(() => {
        const initializeEditor = async () => {
            // Prevent multiple initializations
            if (isInitializing.current) {
                return;
            }

            // Make sure the holder element exists
            if (!holderRef.current) {
                console.warn('Editor holder element not found');
                return;
            }

            isInitializing.current = true;

            try {
                // Wait for Editor.js dependencies to be loaded
                const maxWaitTime = 15000; // 15 seconds
                const checkInterval = 300; // 300ms
                let waited = 0;

                const waitForDependencies = () => {
                    return new Promise((resolve, reject) => {
                        const check = () => {
                            const deps = checkDependencies();
                            
                            if (deps.ready) {
                                console.log('✅ All required Editor.js dependencies loaded');
                                if (!deps.hasCustomTools) {
                                    console.warn('⚠️ Some custom tools missing, but proceeding with available tools');
                                }
                                resolve(deps);
                                return;
                            }

                            waited += checkInterval;
                            if (waited >= maxWaitTime) {
                                reject(new Error(`Editor.js dependencies not loaded within timeout.\nMissing core: ${deps.missingCore.join(', ')}\nMissing custom: ${deps.missingCustom.join(', ')}`));
                                return;
                            }

                            // Log progress every 3 seconds
                            if (waited % 3000 === 0) {
                                console.log(`⏳ Waiting for Editor.js dependencies... (${waited/1000}s)`);
                            }

                            setTimeout(check, checkInterval);
                        };
                        check();
                    });
                };

                const deps = await waitForDependencies();

                // Destroy existing editor if it exists
                if (editorRef.current) {
                    try {
                        await editorRef.current.destroy();
                    } catch (error) {
                        console.warn('Error destroying previous editor:', error);
                    }
                    editorRef.current = null;
                }

                // Parse data if it's a string
                let parsedData = data;
                if (typeof data === 'string') {
                    try {
                        parsedData = JSON.parse(data);
                    } catch (error) {
                        console.warn('Invalid JSON data provided, using empty blocks:', error);
                        parsedData = { blocks: [] };
                    }
                }

                // Ensure data has the correct structure
                if (!parsedData || typeof parsedData !== 'object') {
                    parsedData = { blocks: [] };
                }
                if (!Array.isArray(parsedData.blocks)) {
                    parsedData.blocks = [];
                }

                console.log('🔧 Creating Editor.js instance with data:', parsedData);

                // Use the global createEditor function from editorConfig.js
                const createEditorFn = window.createEditor;
                
                if (!createEditorFn) {
                    throw new Error('createEditor function not available');
                }

                editorRef.current = createEditorFn({
                    holder: holderId.current,
                    placeholder: placeholder,
                    data: parsedData,
                    readOnly: readOnly,
                    customTools: customTools,
                    onChange: onChange ? () => {
                        if (editorRef.current && onChange) {
                            // Debounce onChange to avoid too many calls
                            setTimeout(() => {
                                onChange();
                            }, 100);
                        }
                    } : undefined
                });

                // Log available tools
                if (editorRef.current && editorRef.current.configuration) {
                    console.log('🛠️ Editor initialized with tools:', Object.keys(editorRef.current.configuration.tools || {}));
                }

                // Call onReady callback if provided
                if (onReady && editorRef.current) {
                    // Wait a bit for editor to be fully initialized
                    setTimeout(() => {
                        onReady(editorRef.current);
                    }, 300);
                }

                console.log('✅ EditorJs component initialized successfully');

            } catch (error) {
                console.error('Failed to initialize EditorJs:', error);
                
                // Show error message in the editor container
                if (holderRef.current) {
                    holderRef.current.innerHTML = `
                        <div class="editor-error">
                            <div class="editor-error-icon">⚠️</div>
                            <div class="editor-error-title">Editor Loading Error</div>
                            <div class="editor-error-message">
                                Editor.js failed to initialize. Please ensure all Editor.js dependencies are loaded.
                            </div>
                            <div class="editor-error-details">${error.message}</div>
                            <button class="btn btn-sm btn-primary mt-2" onclick="window.location.reload()">
                                Reload Page
                            </button>
                        </div>
                    `;
                }
            } finally {
                isInitializing.current = false;
            }
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(initializeEditor, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []); // Empty dependency array - we'll handle updates manually

    // Handle data updates
    useEffect(() => {
        if (editorRef.current && data && !isInitializing.current) {
            // Only re-render if the data is significantly different
            const updateEditor = async () => {
                try {
                    let parsedData = data;
                    if (typeof data === 'string') {
                        parsedData = JSON.parse(data);
                    }
                    
                    if (parsedData && parsedData.blocks) {
                        // Get current data to compare
                        const currentData = await editorRef.current.save();
                        const currentBlocks = JSON.stringify(currentData.blocks);
                        const newBlocks = JSON.stringify(parsedData.blocks);
                        
                        // Only update if data is different
                        if (currentBlocks !== newBlocks) {
                            await editorRef.current.render(parsedData);
                        }
                    }
                } catch (error) {
                    console.warn('Error updating editor data:', error);
                }
            };

            // Debounce the update
            const timeoutId = setTimeout(updateEditor, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [data]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (editorRef.current) {
                try {
                    editorRef.current.destroy();
                } catch (error) {
                    console.warn('Error destroying editor on unmount:', error);
                }
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div className={`editorjs-wrapper ${className}`}>
            <div 
                ref={holderRef}
                id={holderId.current}
                className="editorjs-holder"
            />
        </div>
    );
});

EditorJs.displayName = 'EditorJs';

export default EditorJs; 