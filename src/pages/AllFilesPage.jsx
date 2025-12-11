import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, Grid, List, Folder, MoreVertical, FileText, ArrowLeft, Image as ImageIcon, X, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFileService } from '../hooks/useFileService';

const AllFilesPage = () => {
  const { s3, BUCKET_NAME, user } = useAuth();
  const { fetchFiles, deleteFile, loading: apiLoading } = useFileService();
  const [viewMode, setViewMode] = useState('grid');
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]); // Store all files from API
  const [loading, setLoading] = useState(false);
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Initialize currentPrefix to userPath
    if (user && user.userPath && (currentPrefix === '' || !currentPrefix.startsWith(user.userPath))) {
      setCurrentPrefix(user.userPath);
    }
  }, [user]);

  const handleBackClick = () => {
    if (!currentPrefix || currentPrefix === user?.userPath) return;

    const parts = currentPrefix.split('/').filter(Boolean);
    parts.pop();
    // Reconstruct path. If parts is empty, it means root, but we should respect userPath.
    // However, if we are popping from userPath, we shouldn't.

    const newPrefix = parts.length > 0 ? parts.join('/') + '/' : '';

    // Ensure we don't go above userPath
    if (user?.userPath && newPrefix.length < user.userPath.length) {
      setCurrentPrefix(user.userPath);
    } else {
      setCurrentPrefix(newPrefix);
    }
  };

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      setCurrentPrefix(file.prefix);
    } else {
      // For files, we use the pre-generated URL from processFiles
      // or we could regenerate it here if needed.
      setSelectedFile(file);
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  useEffect(() => {
    if (allFiles.length > 0) {
      processFiles(allFiles, currentPrefix);
    }
  }, [allFiles, currentPrefix, user]);

  const loadFiles = async () => {
    setLoading(true);
    const data = await fetchFiles();
    setAllFiles(data);
    setLoading(false);
  };

  const processFiles = (data, prefix) => {
    if (!data) return;

    if (data.length > 0) {
      // console.log("First file keys:", Object.keys(data[0]));
      // console.log("First file object:", data[0]);
    }

    // Filter files that start with the current prefix
    const relevantFiles = data.filter(f => f.name && f.name.startsWith(prefix) && f.name !== prefix);

    const items = [];
    const folders = new Set();

    relevantFiles.forEach(f => {
      const relativePath = f.name.replace(prefix, '');
      const parts = relativePath.split('/');

      if (parts.length > 1) {
        const folderName = parts[0];
        if (!folders.has(folderName)) {
          folders.add(folderName);
          items.push({
            id: prefix + folderName + '/',
            name: folderName,
            type: 'folder',
            prefix: prefix + folderName + '/'
          });
        }
      } else {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name);
        const isPdf = /\.pdf$/i.test(f.name);
        const isText = /\.(txt|json|md|js|css|html)$/i.test(f.name);

        let url = '';
        if (s3 && user?.userPath) {
          // Check if the file name already contains the user path (full key vs relative path)
          // If the API returns the full key (e.g. tenant/user/file.txt), we shouldn't prepend userPath.
          // If it returns relative path (e.g. file.txt), we should.

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
          if (isText) params.ResponseContentType = 'text/plain';
          else if (isPdf) params.ResponseContentType = 'application/pdf';

          try {
            url = s3.getSignedUrl('getObject', params);
          } catch (e) {
            console.error("Error generating signed URL", e);
          }
        }

        const lastModified = f.lastModified || f.LastModified || f.date || f.Date;
        const size = f.size || f.Size;

        let dateDisplay = '-';
        if (lastModified) {
          try {
            dateDisplay = new Date(lastModified).toLocaleDateString();
            if (dateDisplay === 'Invalid Date') dateDisplay = '-';
          } catch (e) {
            dateDisplay = '-';
          }
        }

        items.push({
          id: f.name,
          name: f.name.split('/').pop(), // Show only filename
          size: formatBytes(size),
          date: dateDisplay,
          type: 'file',
          isImage,
          isPdf,
          isText,
          url,
          key: f.key || f.name
        });
      }
    });

    // Sort: Folders first, then files by date
    items.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    });

    setFiles(items);
  };

  const handleDelete = async (file, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      // Use the key from the file object (normalized in useFileService)
      // If file.key is not available, fallback to constructing it or using name
      // But fetchFiles now ensures 'key' property exists.

      const fileKey = file.key || file.id; // file.id was set to f.name or prefix+name in processFiles

      // Wait, processFiles creates new objects. I need to make sure I pass the correct key.
      // In processFiles:
      // items.push({ ..., key: f.name (which was the original name/key from API) })
      // But wait, fetchFiles now returns objects with a 'key' property.
      // In processFiles, 'f' is the object from fetchFiles.
      // So f.key should be the correct S3 key.

      // Let's check processFiles again.
      // It uses f.name.
      // I should update processFiles to use f.key if available for the 'key' property of the item.

      await deleteFile(file.key);

      // Remove from local state
      setAllFiles(prev => prev.filter(f => f.key !== file.key));
      setFiles(prev => prev.filter(f => f.key !== file.key));

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

  return (
    <div className="all-files-page">
      <div className="page-header">
        <div className="title-section">
          {currentPrefix && (
            <button className="back-btn" onClick={handleBackClick}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="page-title">
            {currentPrefix === user?.userPath ? 'All Files' : currentPrefix.split('/').filter(Boolean).pop()}
          </h1>
        </div>

        <div className="header-controls">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search files..." />
          </div>

          <button className="filter-btn">
            <Filter size={18} />
            <span>Filter</span>
          </button>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {!s3 ? (
        <div className="loading-state">Please login to view files.</div>
      ) : loading ? (
        <div className="loading-state">Loading S3 files...</div>
      ) : files.length === 0 ? (
        <div className="empty-state">No files found in this folder.</div>
      ) : (
        <div className="files-content">
          {viewMode === 'grid' ? (
            <div className="files-grid">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="file-card"
                  onClick={() => handleFileClick(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-header">
                    <div className="icon-container">
                      {file.type === 'folder' ? (
                        <Folder fill="#4F46E5" color="#4F46E5" size={24} />
                      ) : file.isImage ? (
                        <div className="image-preview" style={{ backgroundImage: `url(${file.url})` }} />
                      ) : (
                        <FileText color="#6B7280" size={24} />
                      )}
                    </div>
                    <div className="actions-container">
                      <button className="action-btn delete-btn" onClick={(e) => handleDelete(file, e)} title="Delete">
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                      <button className="more-btn" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} color="#9CA3AF" />
                      </button>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="file-name" title={file.name}>{file.name}</h3>
                    <p className="file-meta">
                      {file.type === 'folder' ? 'Folder' : file.size}
                    </p>
                  </div>

                  <div className="card-footer">
                    <span className="file-date">{file.date || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Last Modified</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => handleFileClick(file)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="file-name-cell">
                        <div className="name-wrapper">
                          <div className="list-icon-container">
                            {file.type === 'folder' ? (
                              <Folder size={20} fill="#4F46E5" color="#4F46E5" />
                            ) : file.isImage ? (
                              <ImageIcon size={20} color="#4F46E5" />
                            ) : (
                              <FileText size={20} color="#4F46E5" />
                            )}
                          </div>
                          {file.name}
                        </div>
                      </td>
                      <td>{file.size}</td>
                      <td>{file.date || '-'}</td>
                      <td>{file.type}</td>
                      <td>
                        <button className="action-btn delete-btn" onClick={(e) => handleDelete(file, e)} title="Delete">
                          <Trash2 size={16} color="#EF4444" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedFile.name}</h2>
              <div className="modal-actions">
                <a href={selectedFile.url} download target="_blank" rel="noopener noreferrer" className="download-btn">
                  <Download size={20} />
                </a>
                <button className="close-btn" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              {selectedFile.isImage ? (
                <img src={selectedFile.url} alt={selectedFile.name} className="preview-image" />
              ) : selectedFile.isPdf || selectedFile.isText ? (
                <iframe src={selectedFile.url} title={selectedFile.name} className="preview-frame" />
              ) : (
                <div className="no-preview">
                  <FileText size={64} color="#9CA3AF" />
                  <p>Preview not available for this file type.</p>
                  <a href={selectedFile.url} download className="download-link">Download File</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .all-files-page {
          padding: 32px;
        }

        /* ... existing styles ... */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .title-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .back-btn {
            padding: 8px;
            border-radius: 50%;
            background-color: #F3F4F6;
            color: #4B5563;
            transition: background-color 0.2s;
        }

        .back-btn:hover {
            background-color: #E5E7EB;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
        }

        .header-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background-color: #F3F4F6;
          padding: 10px 16px;
          border-radius: 10px;
          width: 300px;
          gap: 10px;
        }

        .search-bar input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 14px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          color: #374151;
          font-weight: 500;
          background-color: white;
        }

        .view-toggle {
          display: flex;
          background-color: #F3F4F6;
          padding: 4px;
          border-radius: 8px;
        }

        .toggle-btn {
          padding: 6px;
          border-radius: 6px;
          color: #6B7280;
          display: flex;
        }

        .toggle-btn.active {
          background-color: white;
          color: var(--primary-color);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        /* Grid View Styles */
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
          border: 1px solid transparent;
        }

        .file-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: #E5E7EB;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon-container {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-preview {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            border-radius: 6px;
        }

        .list-icon-container {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #EEF2FF;
            border-radius: 8px;
        }

        .more-btn {
          padding: 4px;
          border-radius: 50%;
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

        .file-meta {
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

        .file-date {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        /* List View Styles */
        .table-container {
          background-color: white;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 16px 24px;
          color: #9CA3AF;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 1px solid #F3F4F6;
        }

        td {
          padding: 16px 24px;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #F3F4F6;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .file-name-cell {
          font-weight: 500;
          color: #111827;
        }

        .name-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Modal Styles */
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

export default AllFilesPage;
