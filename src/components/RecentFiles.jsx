import React, { useState, useEffect } from 'react';
import { Folder, MoreVertical, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFileService } from '../hooks/useFileService';

import FilePreviewModal from './FilePreviewModal';

const RecentFiles = () => {
  const { s3, BUCKET_NAME, user } = useAuth();
  const { fetchFiles, deleteFile, loading: apiLoading } = useFileService();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      loadRecentFiles();
    }
  }, [user]);

  const loadRecentFiles = async () => {
    setLoading(true);
    const data = await fetchFiles();

    // Filter out folders (if any) and sort by date
    // API returns flat list, so we just filter by prefix if needed, 
    // but fetchFiles already fetches user's files.
    // We just need to filter out "folder placeholders" if they exist in the list.
    // And sort by lastModified.

    const sortedFiles = data
      .filter(f => !f.name.endsWith('/')) // Exclude folder objects if any
      .sort((a, b) => {
        const dateA = new Date(a.lastModified || a.LastModified || a.date || a.Date);
        const dateB = new Date(b.lastModified || b.LastModified || b.date || b.Date);
        return dateB - dateA;
      })
      .slice(0, 4);

    const fileItems = sortedFiles.map(f => {
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name);
      const lastModified = f.lastModified || f.LastModified || f.date || f.Date;
      const size = f.size || f.Size;

      // Generate signed URL for preview
      let url = '';
      if (s3 && user?.userPath) {
        let fullKey = f.name;
        if (!f.name.startsWith(user.userPath)) {
          fullKey = user.userPath + f.name;
        }

        const params = {
          Bucket: BUCKET_NAME,
          Key: fullKey,
          Expires: 3600,
          ResponseContentDisposition: 'inline'
        };
        try {
          url = s3.getSignedUrl('getObject', params);
        } catch (e) {
          console.error("Error generating signed URL", e);
        }
      }

      return {
        id: f.name,
        key: f.key || f.name, // Use normalized key
        name: f.name.split('/').pop(), // Show only filename
        count: 1, // Placeholder
        size: formatBytes(size),
        color: '#4F46E5', // Placeholder color
        isImage: isImage,
        lastModified: lastModified,
        url
      };
    });

    setFiles(fileItems);
    setLoading(false);
  };

  const handleDelete = async (file, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      await deleteFile(file.key || file.id);
      // Remove from local state
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file: " + err.message);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleFileClick = (file) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: file.id,
      Expires: 3600,
      ResponseContentDisposition: 'inline'
    };

    if (file.isImage) {
      // No specific content type needed for images usually, but good practice
    } else if (file.name.endsWith('.pdf')) {
      params.ResponseContentType = 'application/pdf';
    } else if (file.name.endsWith('.txt')) {
      params.ResponseContentType = 'text/plain';
    }

    const fullKey = user?.userPath ? user.userPath + file.id : file.id;
    const url = s3.getSignedUrl('getObject', { ...params, Key: fullKey });

    setSelectedFile({
      ...file,
      url,
      isPdf: file.name.endsWith('.pdf'),
      isText: file.name.endsWith('.txt')
    });
  };

  return (
    <div className="recent-files">
      <h2 className="section-title">Recent files</h2>

      {loading ? (
        <div>Loading recent files...</div>
      ) : files.length === 0 ? (
        <div>No files found.</div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div
              key={file.id}
              className="file-card"
              onClick={() => handleFileClick(file)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header">
                <div className="folder-icon">
                  {file.isImage ? (
                    <ImageIcon color={file.color} size={24} />
                  ) : (
                    <FileText color={file.color} size={24} />
                  )}
                </div>
                <div className="actions-container">
                  <button className="action-btn delete-btn" onClick={(e) => handleDelete(file, e)} title="Delete">
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                  <button className="more-btn">
                    <MoreVertical size={16} color="#9CA3AF" />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <h3 className="file-name" title={file.name}>{file.name}</h3>
                <p className="file-count">{new Date(file.lastModified).toLocaleDateString()}</p>
              </div>

              <div className="card-footer">
                <span className="file-size">{file.size}</span>
                <div className="avatars">
                  {/* Placeholder avatars */}
                  <img src="https://i.pravatar.cc/150?u=1" alt="User" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .recent-files {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 20px;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .file-card {
          background-color: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
          height: 100%;
        }

        .file-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .folder-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #EEF2FF;
          border-radius: 8px;
        }

        .more-btn {
          padding: 4px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .more-btn:hover {
          background-color: #F3F4F6;
        }

        .actions-container {
            display: flex;
            gap: 4px;
        }

        .action-btn {
            padding: 4px;
            border-radius: 50%;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .action-btn:hover {
            background-color: #F3F4F6;
        }
        
        .delete-btn:hover {
            background-color: #FEE2E2;
        }

        .file-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-count {
          font-size: 13px;
          color: #9CA3AF;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #F3F4F6;
        }

        .file-size {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .avatars {
          display: flex;
          align-items: center;
          flex-direction: row-reverse;
        }

        .avatars img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          margin-left: -8px;
        }
      `}</style>

      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};

export default RecentFiles;
