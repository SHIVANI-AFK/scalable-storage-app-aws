import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_ENDPOINT = 'https://cczq0na04m.execute-api.us-east-1.amazonaws.com/dev/files/list';
const DELETE_ENDPOINT = 'https://cczq0na04m.execute-api.us-east-1.amazonaws.com/dev/files/delete';

export const useFileService = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFiles = useCallback(async () => {
        if (!user || !user.token) {
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Authorization': user.token
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response Data:", data); // Debug log

            const rawFiles = data.files || [];

            // Normalize files to ensure they have consistent properties
            return rawFiles.map(f => {
                let key = f.fileKey;
                if (!key && f.download_url) {
                    try {
                        const urlObj = new URL(f.download_url);
                        key = decodeURIComponent(urlObj.pathname.substring(1));
                    } catch (e) {
                        console.error("Error parsing URL for key:", e);
                    }
                }

                // Normalize name
                // AllFilesPage expects 'name' to be the full path (key) for filtering and folder navigation.
                // If we have a key, use it. If not, use fileName or name.
                // We also preserve the original filename as 'displayName' if needed.

                const normalizedKey = key || f.name;
                const displayName = f.fileName || (normalizedKey ? normalizedKey.split('/').pop() : 'Unknown');

                // If normalizedKey doesn't look like a path (no slashes) and we have user info,
                // we might consider prepending userPath, but let's rely on the key being correct first.

                // Normalize date
                const lastModified = f.lastModified || f.LastModified || f.date || f.Date;

                // Normalize size
                const size = f.size || f.Size;

                return {
                    ...f,
                    key: normalizedKey,
                    name: normalizedKey, // IMPORTANT: Must be full path for AllFilesPage filtering
                    displayName: displayName,
                    lastModified: lastModified,
                    size: size
                };
            });

        } catch (err) {
            console.error("File fetch error:", err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    const deleteFile = useCallback(async (fileKey) => {
        if (!user || !user.token) {
            throw new Error("User not authenticated");
        }

        try {
            const url = `${DELETE_ENDPOINT}?filename=${encodeURIComponent(fileKey)}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': user.token
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete file");
            }

            return true;
        } catch (err) {
            console.error("Delete error:", err);
            throw err;
        }
    }, [user]);

    return { fetchFiles, deleteFile, loading, error };
};
