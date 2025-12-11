import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFileService } from '../hooks/useFileService';
import FilePreviewModal from './FilePreviewModal';


const SharedFiles = () => {
  const { s3, BUCKET_NAME, user } = useAuth();
  const { fetchFiles, loading: apiLoading } = useFileService();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, fetchFiles]);

  const loadFiles = async () => {
    setLoading(true);
    const data = await fetchFiles();

    // Filter out folders
    const fileItems = data
      .filter(f => !f.name.endsWith('/'))
      .map(f => {
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

        const lastModified = f.lastModified || f.LastModified || f.date || f.Date;
        const size = f.size || f.Size;

        let dateDisplay = '-';
        if (lastModified) {
          try {
            dateDisplay = new Date(lastModified).toLocaleString();
            if (dateDisplay === 'Invalid Date') dateDisplay = '-';
          } catch (e) {
            dateDisplay = '-';
          }
        }

        return {
          id: f.name,
          name: f.name.split('/').pop(), // Show only filename
          owner: user?.email || 'Me', // Default to current user
          size: formatBytes(size),
          date: dateDisplay,
          status: 'Public', // Mock status
          members: [
            { name: 'Me', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces' },
            { name: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=faces' }
          ],
          url
        };
      });

    setFiles(fileItems);
    setLoading(false);
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

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);

    if (isImage) {
      // No specific content type needed for images usually
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
      isImage,
      isPdf: file.name.endsWith('.pdf'),
      isText: file.name.endsWith('.txt')
    });
  };

  return (
    <div className="shared-files">
      <div className="section-header">
        <h2 className="section-title">Shared with me</h2>
        <div className="controls">
          <div className="search-input">
            <Search size={16} color="#9CA3AF" />
            <input type="text" placeholder="Search" />
          </div>
          <div className="sort-dropdown">
            <span>Sort by : <strong>Newest</strong></span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading files...</div>
        ) : files.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>No files found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File/Folder Name</th>
                <th>Owner</th>
                <th>File size</th>
                <th>Last modified</th>
                <th>Sharing Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="file-name-cell">{file.name}</td>
                  <td>{file.owner}</td>
                  <td>{file.size}</td>
                  <td>{file.date}</td>
                  <td>
                    <span className={`status-badge ${file.statusType}`}>
                      {file.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <span className="showing-text">Showing {files.length} entries</span>
        <div className="pagination-controls">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>

      <style>{`
        .shared-files {
          margin-top: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .controls {
          display: flex;
          gap: 16px;
        }

        .search-input {
          display: flex;
          align-items: center;
          background-color: white;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #F3F4F6;
          gap: 8px;
          width: 200px;
        }

        .search-input input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 13px;
        }

        .sort-dropdown {
          display: flex;
          align-items: center;
          background-color: white;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #F3F4F6;
          gap: 8px;
          font-size: 13px;
          color: #4B5563;
          cursor: pointer;
        }

        .table-container {
          background-color: white;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
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
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }

        .status-badge.public {
          background-color: #D1FAE5; /* Green 100 */
          color: #059669; /* Green 600 */
          border: 1px solid #A7F3D0;
        }

        .status-badge.private {
          background-color: #FEF3C7; /* Amber 100 */
          color: #D97706; /* Amber 600 */
          border: 1px solid #FDE68A;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          color: #9CA3AF;
          font-size: 13px;
        }

        .pagination-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .page-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background-color: #F3F4F6;
          color: #4B5563;
          font-size: 12px;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .page-btn:hover {
          background-color: #E5E7EB;
        }

        .page-btn.active {
          background-color: #4F46E5;
          color: white;
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

export default SharedFiles;
