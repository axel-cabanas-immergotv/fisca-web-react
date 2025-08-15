import React, { useState } from 'react';
import AdminEntityBase from '../../../components/AdminEntityBase';
import ModulesModal from './ModulesModal';
import ModulesViewModal from './ModulesViewModal';

const Modules = () => {
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
        <ModulesModal
            modules={data}
            isEditing={isEditing}
            onSave={onSave}
            onClose={onClose}
        />
    );

    const renderViewModal = ({ data, onClose }) => (
        <ModulesViewModal
            modules={data}
            onClose={onClose}
        />
    );

    return (
        <>
            <AdminEntityBase
                entityName="modules"
                entityLabel="Módulos"
                apiEndpoint="/api/admin/modules"
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
                "key": "slug",
                "label": "Slug"
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
                searchPlaceholder="Buscar módulos..."
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

export default Modules;
