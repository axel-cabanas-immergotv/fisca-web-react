#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuración de módulos a migrar
const modules = [
    {
        name: 'Pages',
        label: 'Páginas',
        apiEndpoint: '/api/admin/pages',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'title', label: 'Título' },
            { key: 'slug', label: 'Slug' },
            { 
                key: 'status', 
                label: 'Estado',
                render: (value) => `<span class="badge bg-${value === 'published' ? 'success' : 'secondary'}">${value === 'published' ? 'Publicado' : 'Borrador'}</span>`
            },
            { key: 'created_at', label: 'Fecha de Creación' }
        ],
        filters: [
            {
                key: 'status',
                placeholder: 'Todos los estados',
                options: [
                    { value: 'published', label: 'Publicado' },
                    { value: 'draft', label: 'Borrador' }
                ]
            }
        ]
    },
    {
        name: 'Stories',
        label: 'Historias',
        apiEndpoint: '/api/admin/stories',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'title', label: 'Título' },
            { key: 'slug', label: 'Slug' },
            { 
                key: 'status', 
                label: 'Estado',
                render: (value) => `<span class="badge bg-${value === 'published' ? 'success' : 'secondary'}">${value === 'published' ? 'Publicado' : 'Borrador'}</span>`
            },
            { key: 'created_at', label: 'Fecha de Creación' }
        ],
        filters: [
            {
                key: 'status',
                placeholder: 'Todos los estados',
                options: [
                    { value: 'published', label: 'Publicado' },
                    { value: 'draft', label: 'Borrador' }
                ]
            }
        ]
    },
    {
        name: 'Modules',
        label: 'Módulos',
        apiEndpoint: '/api/admin/modules',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'slug', label: 'Slug' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Categories',
        label: 'Categorías',
        apiEndpoint: '/api/admin/categories',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'slug', label: 'Slug' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Menus',
        label: 'Menús',
        apiEndpoint: '/api/admin/menus',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'slug', label: 'Slug' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Roles',
        label: 'Roles',
        apiEndpoint: '/api/admin/roles',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Permissions',
        label: 'Permisos',
        apiEndpoint: '/api/admin/permissions',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Affiliates',
        label: 'Afiliados',
        apiEndpoint: '/api/admin/affiliates',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'slug', label: 'Slug' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Localidades',
        label: 'Localidades',
        apiEndpoint: '/api/admin/localidades',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Secciones',
        label: 'Secciones',
        apiEndpoint: '/api/admin/secciones',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Circuitos',
        label: 'Circuitos',
        apiEndpoint: '/api/admin/circuitos',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Escuelas',
        label: 'Escuelas',
        apiEndpoint: '/api/admin/escuelas',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'address', label: 'Dirección' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    },
    {
        name: 'Mesas',
        label: 'Mesas',
        apiEndpoint: '/api/admin/mesas',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha de Creación' }
        ]
    }
];

// Función para generar el componente React
function generateReactComponent(module) {
    const componentName = module.name;
    const entityLabel = module.label;
    const entityName = module.name.toLowerCase();
    
    return `import React, { useState } from 'react';
import AdminEntityBase from '../../../components/AdminEntityBase';
import ${componentName}Modal from './${componentName}Modal';
import ${componentName}ViewModal from './${componentName}ViewModal';

const ${componentName} = () => {
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleNew = () => {
        setModalData(null);
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (entity) => {
        setModalData(entity);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleView = (entity) => {
        setModalData(entity);
        setShowViewModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowViewModal(false);
        setModalData(null);
    };

    const renderModal = ({ data, isEditing, onClose, onSave }) => (
        <${componentName}Modal
            ${entityName}={data}
            isEditing={isEditing}
            onSave={onSave}
            onClose={onClose}
        />
    );

    const renderViewModal = ({ data, onClose }) => (
        <${componentName}ViewModal
            ${entityName}={data}
            onClose={onClose}
        />
    );

    return (
        <>
            <AdminEntityBase
                entityName="${entityName}"
                entityLabel="${entityLabel}"
                apiEndpoint="${module.apiEndpoint}"
                columns={${JSON.stringify(module.columns, null, 8)}}
                filters={${JSON.stringify(module.filters || [], null, 8)}}
                searchPlaceholder="Buscar ${entityLabel.toLowerCase()}..."
                onNew={handleNew}
                onEdit={handleEdit}
                onView={handleView}
                renderModal={renderModal}
                showModal={showModal}
                onCloseModal={handleCloseModal}
                modalData={modalData}
                isEditing={isEditing}
            />
            
            {showViewModal && renderViewModal({
                data: modalData,
                onClose: handleCloseModal
            })}
        </>
    );
};

export default ${componentName};
`;
}

// Función para generar el modal de edición
function generateEditModal(module) {
    const componentName = module.name;
    const entityName = module.name.toLowerCase();
    const entityLabel = module.label;
    
    // Generar campos del formulario basados en las columnas
    const formFields = module.columns
        .filter(col => !['id', 'created_at', 'updated_at'].includes(col.key))
        .map(col => {
            const fieldName = col.key;
            const fieldLabel = col.label;
            const isRequired = ['name', 'title'].includes(fieldName);
            
            if (fieldName === 'status') {
                return `                <div className="mb-3">
                    <label className="form-label">${fieldLabel}</label>
                    <select
                        className="form-select"
                        name="${fieldName}"
                        value={formData.${fieldName}}
                        onChange={handleInputChange}
                    >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>`;
            } else if (fieldName === 'description') {
                return `                <div className="mb-3">
                    <label className="form-label">${fieldLabel}</label>
                    <textarea
                        className="form-control"
                        name="${fieldName}"
                        value={formData.${fieldName}}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Ingrese ${fieldLabel.toLowerCase()}"
                    ></textarea>
                </div>`;
            } else {
                return `                <div className="mb-3">
                    <label className="form-label">
                        ${fieldLabel} ${isRequired ? '<span className="text-danger">*</span>' : ''}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="${fieldName}"
                        value={formData.${fieldName}}
                        onChange={handleInputChange}
                        placeholder="Ingrese ${fieldLabel.toLowerCase()}"
                        ${isRequired ? 'required' : ''}
                    />
                </div>`;
            }
        }).join('\n');

    return `import React, { useState, useEffect } from 'react';

const ${componentName}Modal = ({ ${entityName}, isEditing, onSave, onClose }) => {
    const [formData, setFormData] = useState({
${module.columns
    .filter(col => !['id', 'created_at', 'updated_at'].includes(col.key))
    .map(col => `        ${col.key}: ''`)
    .join(',\n')}
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (${entityName}) {
            setFormData({
${module.columns
    .filter(col => !['id', 'created_at', 'updated_at'].includes(col.key))
    .map(col => `                ${col.key}: ${entityName}.${col.key} || ''`)
    .join(',\n')}
            });
        }
    }, [${entityName}]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
${module.columns
    .filter(col => ['name', 'title'].includes(col.key))
    .map(col => `        if (!formData.${col.key}.trim()) {
            newErrors.${col.key} = 'El ${col.label.toLowerCase()} es requerido';
        }`)
    .join('\n')}

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const url = isEditing ? \`${module.apiEndpoint}/\${${entityName}.id}\` : '${module.apiEndpoint}';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSave(data.data);
            } else {
                throw new Error(data.message || 'Error saving ${entityLabel.toLowerCase()}');
            }
        } catch (error) {
            console.error('Error saving ${entityName}:', error);
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {isEditing ? 'Editar ${entityLabel}' : 'Nuevo ${entityLabel}'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {errors.submit && (
                                <div className="alert alert-danger">
                                    {errors.submit}
                                </div>
                            )}

${formFields}
                        </div>
                        
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Guardando...
                                    </>
                                ) : (
                                    isEditing ? 'Actualizar' : 'Crear'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ${componentName}Modal;
`;
}

// Función para generar el modal de vista
function generateViewModal(module) {
    const componentName = module.name;
    const entityName = module.name.toLowerCase();
    const entityLabel = module.label;
    
    const viewFields = module.columns.map(col => {
        const fieldName = col.key;
        const fieldLabel = col.label;
        
        if (fieldName === 'status') {
            return `                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">${fieldLabel}:</label>
                                <p className="form-control-plaintext">
                                    <span className="badge bg-${fieldName === 'published' ? 'success' : 'secondary'}">
                                        {${entityName}.${fieldName} === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                </p>
                            </div>
                        </div>`;
        } else if (fieldName === 'created_at' || fieldName === 'updated_at') {
            return `                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">${fieldLabel}:</label>
                                <p className="form-control-plaintext">{formatDate(${entityName}.${fieldName})}</p>
                            </div>
                        </div>`;
        } else {
            return `                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">${fieldLabel}:</label>
                                <p className="form-control-plaintext">{${entityName}.${fieldName}}</p>
                            </div>
                        </div>`;
        }
    }).join('\n');

    return `import React from 'react';

const ${componentName}ViewModal = ({ ${entityName}, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Detalles de ${entityLabel}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="row">
${viewFields}
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ${componentName}ViewModal;
`;
}

// Función principal para generar todos los archivos
function generateAllFiles() {
    const adminPagesDir = path.join(__dirname, '../src/pages/Admin');
    
    modules.forEach(module => {
        const moduleDir = path.join(adminPagesDir, module.name);
        
        // Crear directorio si no existe
        if (!fs.existsSync(moduleDir)) {
            fs.mkdirSync(moduleDir, { recursive: true });
        }
        
        // Generar archivos
        const componentContent = generateReactComponent(module);
        const modalContent = generateEditModal(module);
        const viewModalContent = generateViewModal(module);
        
        // Escribir archivos
        fs.writeFileSync(path.join(moduleDir, 'index.jsx'), componentContent);
        fs.writeFileSync(path.join(moduleDir, `${module.name}Modal.jsx`), modalContent);
        fs.writeFileSync(path.join(moduleDir, `${module.name}ViewModal.jsx`), viewModalContent);
        
        console.log(`✅ Generated ${module.name} component files`);
    });
    
    console.log('\n🎉 All admin module files generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update the main Admin component to include the new modules');
    console.log('2. Add the new routes to your router configuration');
    console.log('3. Test each module to ensure it works correctly');
}

// Ejecutar el script
if (require.main === module) {
    generateAllFiles();
}

module.exports = { generateAllFiles, modules };
