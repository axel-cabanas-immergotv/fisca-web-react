/**
 * DynamicStory Component
 * Full-screen story editor optimized for narrative content
 * Features minimal sidebar with basic configurations
 * Maintains admin sidebar (unlike DynamicPage)
 */
import { useState, useEffect, useRef } from 'react';
import EditorJs from '../EditorJs';
import './dynamicStory.css';

const DynamicStory = ({
    show = false,
    title = "Edit Story",
    config = {},
    entityData = null,
    onSave = null,
    onCancel = null,
    loading = false
}) => {

    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [asyncOptions, setAsyncOptions] = useState({});
    const [loadingOptions, setLoadingOptions] = useState({});
    const editorRef = useRef(null);

    // Extract configuration
    const {
        fields = [],
        entityType = 'story',
        editorConfig = null,
        customValidation = null
    } = config;

    // Initialize form data
    useEffect(() => {
        if (entityData) {
            setFormData({ ...entityData });
        } else {
            // Initialize with default values from field configuration
            const defaultData = {};
            fields.forEach(field => {
                defaultData[field.name] = field.defaultValue || '';
            });
            setFormData(defaultData);
        }
        setErrors({});
    }, [entityData, fields]);

    // Load async options for fields that need them
    useEffect(() => {
        fields.forEach(field => {
            if (field.async && field.loadOptions) {
                loadAsyncOptions(field.name, field.loadOptions);
            }
        });
    }, [fields]);

    // Check if has content field for Editor.js
    const hasContentField = () => {
        return fields.some(field => field.type === 'editor');
    };

    // Handle Editor.js onChange
    const handleEditorChange = async () => {
        if (editorRef.current) {
            try {
                const outputData = await editorRef.current.save();
                handleInputChange('content', outputData);
            } catch (error) {
                console.error('Saving failed:', error);
            }
        }
    };

    // Load async options for select fields
    const loadAsyncOptions = async (fieldName, loadOptionsFn) => {
        if (!loadOptionsFn || asyncOptions[fieldName]) return;

        setLoadingOptions(prev => ({ ...prev, [fieldName]: true }));
        try {
            const options = await loadOptionsFn();
            setAsyncOptions(prev => ({ ...prev, [fieldName]: options }));
        } catch (error) {
            console.error(`Error loading options for ${fieldName}:`, error);
        } finally {
            setLoadingOptions(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    // Handle input changes
    const handleInputChange = (fieldName, value) => {
        // Convert number fields to proper type
        let processedValue = value;
        const field = fields.find(f => f.name === fieldName);
        if (field && field.type === 'number') {
            if (value === '' || value === null || value === undefined) {
                processedValue = field.defaultValue || 0;
            } else {
                processedValue = parseInt(value) || field.defaultValue || 0;
            }
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: processedValue
        }));

        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: null
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate required fields
        fields.forEach(field => {
            if (field.required && (!formData[field.name] || formData[field.name] === '')) {
                newErrors[field.name] = `${field.label} is required`;
            }
        });

        // Run custom validation if provided
        if (customValidation) {
            const customErrors = customValidation(formData);
            Object.assign(newErrors, customErrors);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        
        try {
            // Get latest editor data if editor exists
            let finalData = { ...formData };
            if (hasContentField() && editorRef.current) {
                const editorData = await editorRef.current.save();
                finalData.content = editorData;
            }

            // Apply onBeforeSave if available
            let dataToSave = finalData;
            if (config.onBeforeSave) {
                dataToSave = config.onBeforeSave(finalData);
            }

            if (onSave) {
                await onSave(dataToSave);
            } else {
                console.error('DynamicStory: No onSave function provided');
            }
        } catch (error) {
            console.error('DynamicStory: Save failed:', error);
            setErrors({ general: error.message || 'Save failed. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    // 100% Configurable panels system - completely agnostic
    const panels = config.panels || {};
    
    // Initialize grouped fields dynamically based on configured panels only
    const groupedFields = {};
    Object.keys(panels).forEach(panelKey => {
        groupedFields[panelKey] = [];
    });

    // Group fields based on their panel property
    fields.forEach(field => {
        // Only use field.panel if specified and panel exists in config
        if (field.panel && panels[field.panel]) {
            groupedFields[field.panel].push(field);
        }
        // Alternative: Use field.group as alias for panel
        else if (field.group && panels[field.group]) {
            groupedFields[field.group].push(field);
        }
        // If no panel specified, add to main panel if it exists
        else if (panels.main) {
            groupedFields.main.push(field);
        }
    });

    const renderField = (field) => {
        const value = formData[field.name] || '';
        const hasError = errors[field.name];

        switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
                return (
                    <input
                        type={field.type}
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        value={value || ''}
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        value={value || ''}
                        placeholder={field.placeholder || '0'}
                        min={field.min || 0}
                        step={field.step || 1}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        rows={field.rows || 3}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                );

            case 'select':
                // Handle async options
                const options = field.async ? asyncOptions[field.name] || [] : field.options || [];
                const isLoading = loadingOptions[field.name];

                // Load async options if needed
                if (field.async && field.loadOptions && !asyncOptions[field.name] && !isLoading) {
                    loadAsyncOptions(field.name, field.loadOptions);
                }

                return (
                    <div>
                        <select
                            className={`form-select ${hasError ? 'is-invalid' : ''}`}
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">{field.placeholder || 'Select...'}</option>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {isLoading && (
                            <small className="text-muted">Loading options...</small>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={!!value}
                            onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        />
                        <label className="form-check-label">
                            {field.checkboxLabel || field.label}
                        </label>
                    </div>
                );

            case 'editor':
                // Get editor data for initialization
                const editorData = typeof value === 'object' ? value : null;
                
                return (
                    <div className="story-editor-container">
                        <EditorJs
                            ref={editorRef}
                            holderId={editorConfig?.holderId || 'story-content-editor'}
                            data={editorData}
                            placeholder={editorConfig?.placeholder || 'Start writing your story...'}
                            onChange={handleEditorChange}
                            customTools={editorConfig?.tools || {}}
                            className="dynamic-story-editor"
                        />
                    </div>
                );

            case 'file':
                return (
                    <div className="file-upload-container">
                        <input
                            type="file"
                            className={`form-control ${hasError ? 'is-invalid' : ''}`}
                            accept={field.accept || '*'}
                            onChange={(e) => handleInputChange(field.name, e.target.files[0])}
                        />
                        {value && (
                            <div className="mt-2">
                                <small className="text-muted">Current file: {typeof value === 'string' ? value : value?.name}</small>
                            </div>
                        )}
                    </div>
                );

            case 'custom':
                return field.render ? field.render(value, (newValue) => handleInputChange(field.name, newValue), formData) : null;

            default:
                return (
                    <input
                        type="text"
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                );
        }
    };

    const renderSidebarPanel = (title, fields, show = true, panelKey = null) => {
        if (!show || fields.length === 0) return null;

        return (
            <div key={panelKey || title} className="story-panel-section">
                <h6 className="story-panel-title">{title.toUpperCase()}</h6>
                {fields.map(field => (
                    <div key={field.name} className="form-group mb-3">
                        {field.type !== 'checkbox' && (
                            <label className="form-label">{field.label}</label>
                        )}
                        {renderField(field)}
                        {field.helpText && (
                            <small className="form-text text-muted">{field.helpText}</small>
                        )}
                        {errors[field.name] && (
                            <div className="invalid-feedback d-block">
                                {errors[field.name]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (!show) return null;

    return (
        <div className="dynamic-story-overlay">
            <div className="dynamic-story-container">
                {/* Story Header */}
                <div className="story-header">
                    <div className="story-header-left">
                        <button 
                            className="btn btn-link story-back-btn" 
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            <i className="fas fa-chevron-left me-2"></i>BACK
                        </button>
                        <h1 className="story-title">
                            {title}
                        </h1>
                    </div>
                    
                    <div className="story-header-right">
                        <button 
                            className="btn btn-primary story-save-btn" 
                            onClick={handleSave}
                            disabled={saving || loading}
                        >
                            {saving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-1"></i>
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-1"></i>
                                    SAVE
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Story Layout */}
                <div className="story-layout">
                    {/* Main Story Area */}
                    <div className="story-main">
                        <div className="story-content">
                            {errors.general && (
                                <div className="alert alert-danger mb-3">
                                    {errors.general}
                                </div>
                            )}
                            
                            {/* Dynamic Main Area Fields */}
                            {Object.keys(panels).map(panelKey => {
                                const panel = panels[panelKey];
                                if (!panel.showInMain || !groupedFields[panelKey] || groupedFields[panelKey].length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={panelKey} className="story-main-panel">
                                        {groupedFields[panelKey].map(field => (
                                            <div key={field.name} className="story-field mb-4">
                                                {field.type !== 'editor' && field.type !== 'custom' && (
                                                    <label className="story-field-label">{field.label}</label>
                                                )}
                                                {renderField(field)}
                                                {field.helpText && (
                                                    <small className="form-text text-muted mt-1">{field.helpText}</small>
                                                )}
                                                {errors[field.name] && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors[field.name]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Minimal Story Sidebar */}
                    <div className="story-sidebar">
                        <div className="story-sidebar-content">
                            {/* Dynamic Sidebar Panels */}
                            {Object.keys(panels).map(panelKey => {
                                const panel = panels[panelKey];
                                if (!panel.showInSidebar || !groupedFields[panelKey] || groupedFields[panelKey].length === 0) {
                                    return null;
                                }

                                return renderSidebarPanel(panel.title, groupedFields[panelKey], true, panelKey);
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicStory; 