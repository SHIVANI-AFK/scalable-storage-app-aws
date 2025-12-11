import React from 'react';
import { X, Download, FileText } from 'lucide-react';

const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{file.name}</h2>
                    <div className="modal-actions">
                        <a href={file.url} download target="_blank" rel="noopener noreferrer" className="download-btn">
                            <Download size={20} />
                        </a>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    {file.isImage ? (
                        <img src={file.url} alt={file.name} className="preview-image" />
                    ) : file.isPdf || file.isText ? (
                        <iframe src={file.url} title={file.name} className="preview-frame" />
                    ) : (
                        <div className="no-preview">
                            <FileText size={64} color="#9CA3AF" />
                            <p>Preview not available for this file type.</p>
                            <a href={file.url} download className="download-link">Download File</a>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.75);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background-color: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 1000px;
                    height: 85vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: modalSlideUp 0.3s ease-out;
                }

                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #E5E7EB;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 70%;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .download-btn, .close-btn {
                    padding: 8px;
                    border-radius: 8px;
                    color: #6B7280;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: none;
                    background: transparent;
                }

                .download-btn:hover, .close-btn:hover {
                    background-color: #F3F4F6;
                    color: #111827;
                }

                .modal-body {
                    flex: 1;
                    padding: 24px;
                    background-color: #F9FAFB;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    border-bottom-left-radius: 16px;
                    border-bottom-right-radius: 16px;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .preview-frame {
                    width: 100%;
                    height: 100%;
                    border: none;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .no-preview {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    color: #6B7280;
                }

                .download-link {
                    color: var(--primary-color);
                    font-weight: 500;
                    text-decoration: none;
                }

                .download-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default FilePreviewModal;
