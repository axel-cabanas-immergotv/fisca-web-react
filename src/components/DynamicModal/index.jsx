/**
 * DynamicModal Component
 * Generic modal component for simple entity editing
 * Used for entities with few fields that don't require complex layouts
 */
import { useState, useEffect } from 'react';
import './dynamicModal.css';

const DynamicModal = ({ 
    isOpen = false, 
    onClose, 
    onSave, 
    data = null, 
    config = {}, 
    loading = false,
    modalWidth = 'modal-lg' // Default to Bootstrap's modal-lg
}) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Initialize form data when modal opens or data changes
    useEffect(() => {
        if (isOpen) {
            if (data) {
                // Editing existing entity
                setFormData({ ...data });
            } else {
                // Creating new entity - use default values
                let defaultData = {};
                
                if (config.getDefaultData) {
                    // Use custom default data function
                    defaultData = config.getDefaultData();
                } else {
                    // Use field-based default values
                    config.fields?.forEach(field => {
                        defaultData[field.name] = field.defaultValue || getDefaultValueForType(field.type);
                    });
                }
                
                setFormData(defaultData);
            }
            setErrors({});
        }
    }, [isOpen, data, config.fields, config.getDefaultData]);

    // Get default value based on field type
    const getDefaultValueForType = (type) => {
        switch (type) {
            case 'checkbox': return false;
            case 'number': return 0;
            case 'color': return '#007cba';
            default: return '';
        }
    };

    // Handle form field changes
    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear error for this field
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: undefined
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        config.fields?.forEach(field => {
            if (field.required) {
                const value = formData[field.name];
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    newErrors[field.name] = `${field.label} is required`;
                }
            }
        });

        // Custom validation
        if (config.customValidation) {
            const customErrors = config.customValidation(formData);
            Object.assign(newErrors, customErrors);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            await onSave(formData, data?.id);
            onClose();
        } catch (error) {
            console.error('Error saving entity:', error);
            setErrors({ general: error.message || 'Failed to save entity' });
        } finally {
            setSaving(false);
        }
    };

    // Handle modal close
    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    // Render form field based on type
    const renderField = (field) => {
        const { name, label, type, required, placeholder, helpText, options, rows } = field;
        const value = formData[name] || '';
        const hasError = errors[name];

        const commonProps = {
            id: name,
            name: name,
            value: value,
            onChange: (e) => handleFieldChange(name, e.target.value),
            className: `form-control ${hasError ? 'is-invalid' : ''}`,
            required: required
        };

        let fieldElement;

        switch (type) {
            case 'text':
            case 'email':
            case 'url':
                fieldElement = (
                    <input 
                        type={type} 
                        placeholder={placeholder}
                        {...commonProps}
                    />
                );
                break;

            case 'textarea':
                fieldElement = (
                    <textarea 
                        rows={rows || 3}
                        placeholder={placeholder}
                        {...commonProps}
                    />
                );
                break;

            case 'select':
                fieldElement = (
                    <select {...commonProps}>
                        {placeholder && <option value="">{placeholder}</option>}
                        {options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
                break;

            case 'color':
                fieldElement = (
                    <input 
                        type="color" 
                        {...commonProps}
                        className={`form-control form-control-color ${hasError ? 'is-invalid' : ''}`}
                    />
                );
                break;

            case 'checkbox':
                fieldElement = (
                    <div className="form-check">
                        <input 
                            type="checkbox" 
                            id={name}
                            name={name}
                            checked={value || false}
                            onChange={(e) => handleFieldChange(name, e.target.checked)}
                            className={`form-check-input ${hasError ? 'is-invalid' : ''}`}
                            required={required}
                        />
                        <label className="form-check-label" htmlFor={name}>
                            {field.checkboxLabel || label}
                        </label>
                    </div>
                );
                break;

            case 'number':
                fieldElement = (
                    <input 
                        type="number" 
                        placeholder={placeholder}
                        {...commonProps}
                        onChange={(e) => handleFieldChange(name, parseFloat(e.target.value) || 0)}
                    />
                );
                break;

            case 'custom':
                if (field.render) {
                    fieldElement = field.render(value, (newValue) => handleFieldChange(name, newValue), formData);
                } else {
                    fieldElement = <p className="text-muted">Custom field render function not provided</p>;
                }
                break;

            case 'relation':
                fieldElement = <p className="text-muted">Relation fields are not supported in this version</p>;
                break;

            default:
                fieldElement = <p className="text-muted">Unknown field type: {type}</p>;
                break;
        }

        return (
            <div className="mb-3" key={name}>
                {type !== 'checkbox' && (
                    <label htmlFor={name} className="form-label">
                        {label} {required && <span className="text-danger">*</span>}
                    </label>
                )}
                {fieldElement}
                {helpText && <div className="form-text">{helpText}</div>}
                {hasError && <div className="invalid-feedback d-block">{hasError}</div>}
            </div>
        );
    };

    // Don't render if not open
    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className={`modal-dialog ${modalWidth}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {config.title || (data ? 'Edit Entity' : 'Create Entity')}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={handleClose}
                            disabled={saving}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        {errors.general && (
                            <div className="alert alert-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            {config.fields?.map(field => renderField(field))}
                            
                            {/* Custom render section */}
                            {config.customRender && (
                                <div className="mt-4">
                                    {(() => {
                                        console.log('🔍 DynamicModal calling customRender:', { hasData: !!data, formDataId: formData?.id });
                                        return config.customRender(formData, handleFieldChange, !!data);
                                    })()}
                                </div>
                            )}
                        </form>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={handleSave}
                            disabled={saving || loading}
                        >
                            {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                            {data ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicModal; 