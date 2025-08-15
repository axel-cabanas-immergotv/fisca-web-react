import React from 'react';

const UserViewModal = ({ user, onClose }) => {
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
                        <h5 className="modal-title">Detalles del Usuario</h5>
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
                                    <p className="form-control-plaintext">{user.id}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Estado:</label>
                                    <p className="form-control-plaintext">
                                        <span className={`badge bg-${user.status === 'active' ? 'success' : 'secondary'}`}>
                                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nombre:</label>
                                    <p className="form-control-plaintext">{user.first_name}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Apellido:</label>
                                    <p className="form-control-plaintext">{user.last_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Email:</label>
                                    <p className="form-control-plaintext">
                                        <a href={`mailto:${user.email}`}>{user.email}</a>
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Username:</label>
                                    <p className="form-control-plaintext">{user.username || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Rol:</label>
                                    <p className="form-control-plaintext">
                                        <span className={`badge bg-${user.role?.name === 'admin' ? 'danger' : 'primary'}`}>
                                            {user.role?.name || 'Sin rol'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Fecha de Creación:</label>
                                    <p className="form-control-plaintext">{formatDate(user.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Última Actualización:</label>
                                    <p className="form-control-plaintext">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Último Login:</label>
                                    <p className="form-control-plaintext">{formatDate(user.last_login_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Información adicional si está disponible */}
                        {user.fiscal_general_id && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">Fiscal General ID:</label>
                                <p className="form-control-plaintext">{user.fiscal_general_id}</p>
                            </div>
                        )}

                        {user.fiscal_mesa_id && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">Fiscal Mesa ID:</label>
                                <p className="form-control-plaintext">{user.fiscal_mesa_id}</p>
                            </div>
                        )}

                        {/* Permisos del rol si están disponibles */}
                        {user.role?.permissions && user.role.permissions.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">Permisos del Rol:</label>
                                <div className="form-control-plaintext">
                                    {user.role.permissions.map(permission => (
                                        <span key={permission.id} className="badge bg-info me-1 mb-1">
                                            {permission.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Afiliaciones si están disponibles */}
                        {user.affiliates && user.affiliates.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">Afiliaciones:</label>
                                <div className="form-control-plaintext">
                                    {user.affiliates.map(affiliate => (
                                        <span key={affiliate.id} className="badge bg-secondary me-1 mb-1">
                                            {affiliate.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
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

export default UserViewModal;
