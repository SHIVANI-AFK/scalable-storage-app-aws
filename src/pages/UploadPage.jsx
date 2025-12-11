import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UploadPage = () => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...fileArray]);
    setUploadStatus(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const API_ENDPOINT = "https://cczq0na04m.execute-api.us-east-1.amazonaws.com/dev/files/uploads";

    try {
      for (let i = 0; i < files.length; i++) {
        const currentFileObj = files[i];
        if (currentFileObj.status === 'uploaded') continue;

        // Sanitize Filename
        const cleanFileName = currentFileObj.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const SAFE_CONTENT_TYPE = 'application/octet-stream';

        // Step 1: Get Signed URL
        setUploadStatus(`Uploading ${cleanFileName}: Step 1 - Asking Lambda for URL...`);


        const lambdaResponse = await fetch(`${API_ENDPOINT}?filename=${encodeURIComponent(cleanFileName)}`, {
          method: 'POST',
          headers: {
            'Authorization': user.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: cleanFileName,
            contentType: SAFE_CONTENT_TYPE
          })
        });




        if (!lambdaResponse.ok) throw new Error(`Lambda failed for ${cleanFileName}`);

        const data = await lambdaResponse.json();
        const signedUrl = data.upload_url;

        console.log("Signed URL:", signedUrl);
        // Step 2: Upload to S3
        setUploadStatus(`Uploading ${cleanFileName}: Step 2 - Uploading to S3...`);

        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': SAFE_CONTENT_TYPE
          },
          body: currentFileObj.file
        });

        console.log("Upload Response:", uploadResponse);

        if (!uploadResponse.ok) throw new Error(`S3 Upload failed for ${currentFileObj.name}`);

        // Mark as uploaded
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].status = 'uploaded';
          return newFiles;
        });
      }

      setUploadStatus('success');
      setTimeout(() => {
        setFiles([]);
        setUploadStatus(null);
      }, 3000);

    } catch (error) {
      console.error("Upload failed", error);
      setUploadStatus('error');
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h1 className="page-title">Upload Files</h1>

      <div
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="file-input"
          onChange={handleChange}
          id="file-upload"
        />
        <label htmlFor="file-upload" className="upload-label">
          <UploadCloud size={64} className="upload-icon" />
          <p className="upload-text">Drag & Drop files here or <span className="browse-text">Browse</span></p>
          <p className="upload-hint">Supported formats: PDF, PNG, JPG, DOCX</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3 className="list-title">Selected Files ({files.length})</h3>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-info">
                <File size={20} className="file-icon" />
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{file.size}</span>
                </div>
              </div>
              <div className="file-actions">
                {file.status === 'uploaded' ? (
                  <CheckCircle size={20} className="success-icon" />
                ) : (
                  <button onClick={() => removeFile(index)} className="remove-btn">
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="upload-actions">
            <button
              className={`upload-submit-btn ${uploading ? 'disabled' : ''}`}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload All Files'}
            </button>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="success-message">
          <CheckCircle size={20} />
          <span>Files uploaded successfully!</span>
        </div>
      )}

      <style>{`
        .upload-page {
          padding: 32px;
          max-width: 800px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 32px;
        }

        .drop-zone {
          border: 2px dashed #D1D5DB;
          border-radius: 16px;
          padding: 64px;
          text-align: center;
          background-color: #F9FAFB;
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
        }

        .drop-zone.active {
          border-color: var(--primary-color);
          background-color: #EEF2FF;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .upload-icon {
          color: #9CA3AF;
        }

        .drop-zone.active .upload-icon {
          color: var(--primary-color);
        }

        .upload-text {
          font-size: 18px;
          font-weight: 500;
          color: #4B5563;
        }

        .browse-text {
          color: var(--primary-color);
          font-weight: 600;
        }

        .upload-hint {
          font-size: 14px;
          color: #9CA3AF;
        }

        .file-list {
          margin-top: 32px;
          background-color: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--card-shadow);
        }

        .list-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 16px;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-bottom: 1px solid #F3F4F6;
        }

        .file-item:last-child {
          border-bottom: none;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-icon {
          color: #6B7280;
        }

        .file-details {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .file-size {
          font-size: 12px;
          color: #6B7280;
        }

        .remove-btn {
          color: #EF4444;
          padding: 4px;
          border-radius: 4px;
        }

        .remove-btn:hover {
          background-color: #FEF2F2;
        }

        .success-icon {
          color: #10B981;
        }

        .upload-actions {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }

        .upload-submit-btn {
          background-color: var(--primary-color);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .upload-submit-btn:hover {
          background-color: var(--primary-hover);
        }

        .upload-submit-btn.disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 24px;
          padding: 16px;
          background-color: #D1FAE5;
          color: #065F46;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default UploadPage;
