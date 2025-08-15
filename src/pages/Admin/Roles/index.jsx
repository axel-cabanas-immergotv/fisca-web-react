import React, { useState } from 'react';
import AdminEntityBase from '../../../components/AdminEntityBase';
import RolesModal from './RolesModal';
import RolesViewModal from './RolesViewModal';

const Roles = () => {
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
        <RolesModal
            roles={data}
            isEditing={isEditing}
            onSave={onSave}
            onClose={onClose}
        />
    );

    const renderViewModal = ({ data, onClose }) => (
        <RolesViewModal
            roles={data}
            onClose={onClose}
        />
    );

    return (
        <>
            <AdminEntityBase
                entityName="roles"
                entityLabel="Roles"
                apiEndpoint="/api/admin/roles"
                columns={[
        {
                "key": "id",
                "label": "ID"
        },
        {
                "key": "name",
                "label": "Nombre"
        },
        {
                "key": "description",
                "label": "Descripción"
        },
        {
                "key": "created_at",
                "label": "Fecha de Creación"
        }
]}
                filters={[]}
                searchPlaceholder="Buscar roles..."
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

export default Roles;
