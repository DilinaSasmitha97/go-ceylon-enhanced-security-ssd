import React, { createContext, useContext, useState } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '',
        title: '',
        content: null,
        buttons: []
    });

    const showModal = (config) => {
        setModalState({
            isOpen: true,
            type: config.type,
            title: config.title,
            content: config.content,
            buttons: config.buttons || []
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                type={modalState.type}
                title={modalState.title}
                buttons={modalState.buttons}
            >
                {modalState.content}
            </Modal>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
};