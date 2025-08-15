import React from 'react';

const CategoriesViewModal = ({ categories, onClose }) => {
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
                        <h5 className="modal-title">Detalles de Categorías</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">ID:</label>
                                <p className="form-control-plaintext">{categories.id}</p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre:</label>
                                <p className="form-control-plaintext">{categories.name}</p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Slug:</label>
                                <p className="form-control-plaintext">{categories.slug}</p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Descripción:</label>
                                <p className="form-control-plaintext">{categories.description}</p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Fecha de Creación:</label>
                                <p className="form-control-plaintext">{formatDate(categories.created_at)}</p>
                            </div>
                        </div>
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

export default CategoriesViewModal;
