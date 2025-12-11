import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_ENDPOINT = 'https://cczq0na04m.execute-api.us-east-1.amazonaws.com/dev/files/list';

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

            // The API returns { files: [...] } or just [...]? 
            // Based on user's code: data.files
            return data.files || [];

        } catch (err) {
            console.error("File fetch error:", err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { fetchFiles, loading, error };
};
