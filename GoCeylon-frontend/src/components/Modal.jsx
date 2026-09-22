// components/Modal.jsx
import React, { useEffect } from 'react'; // Ensure React is imported
import ReactDOM from 'react-dom';
import { CiWarning } from "react-icons/ci";
import { MdDone } from "react-icons/md";

const Modal = ({ isOpen, onClose, type, title, children, buttons }) => {

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen) return null;

    if (type == 'delete') {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md p-5 flex flex-col items-center">
                    <CiWarning className="w-12 h-12 text-red-600 mb-3" />
                    <h3 className="text-lg font-semibold text-center">{title}</h3>
                    <p className="text-sm text-gray-600 text-center mt-2">{children}</p>
                    <div className="flex flex-col w-full gap-3 mt-4">
                        {buttons.map((button, index) => (
                            <button
                                key={index}
                                onClick={button.onClick}
                                className={`px-4 py-2 rounded ${button.className}`}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div >,
            document.getElementById('modal-root')
        );
    } else if (type == 'success') {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md p-5 flex flex-col items-center">
                    <MdDone className="w-12 h-12 text-[#007a55] mb-3" />
                    <h3 className="text-lg font-semibold text-center">{title}</h3>
                    <p className="text-sm text-gray-600 text-center mt-2">{children}</p>
                    <div className="flex flex-col w-full gap-3 mt-4">
                        {buttons.map((button, index) => (
                            <button
                                key={index}
                                onClick={button.onClick}
                                className={`px-4 py-2 rounded ${button.className}`}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div >,
            document.getElementById('modal-root')
        );
    } else {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>

                    <div className="p-4">
                        {children}
                    </div>

                    {buttons && (
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            {buttons.map((button, index) => (
                                <button
                                    key={index}
                                    onClick={button.onClick}
                                    className={`px-4 py-2 rounded ${button.className}`}
                                >
                                    {button.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>,
            document.getElementById('modal-root')
        );
    }


};

export default Modal;