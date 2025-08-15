import React, { useState } from 'react';
import AdminEntityBase from '../../../components/AdminEntityBase';
import PagesModal from './PagesModal';
import PagesViewModal from './PagesViewModal';

const Pages = () => {
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
        <PagesModal
            pages={data}
            isEditing={isEditing}
            onSave={onSave}
            onClose={onClose}
        />
    );

    const renderViewModal = ({ data, onClose }) => (
        <PagesViewModal
            pages={data}
            onClose={onClose}
        />
    );

    return (
        <>
            <AdminEntityBase
                entityName="pages"
                entityLabel="Páginas"
                apiEndpoint="/api/admin/pages"
                columns={[
        {
                "key": "id",
                "label": "ID"
        },
        {
                "key": "title",
                "label": "Título"
        },
        {
                "key": "slug",
                "label": "Slug"
        },
        {
                "key": "status",
                "label": "Estado"
        },
        {
                "key": "created_at",
                "label": "Fecha de Creación"
        }
]}
                filters={[
        {
                "key": "status",
                "placeholder": "Todos los estados",
                "options": [
                        {
                                "value": "published",
                                "label": "Publicado"
                        },
                        {
                                "value": "draft",
                                "label": "Borrador"
                        }
                ]
        }
]}
                searchPlaceholder="Buscar páginas..."
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

export default Pages;
