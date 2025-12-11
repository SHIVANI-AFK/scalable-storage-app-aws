import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AWS from 'aws-sdk';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [s3, setS3] = useState(null);

    // Cognito Configuration

    const REDIRECT_URI = "http://localhost:5173";

    const COGNITO_DOMAIN = "https://us-east-1gog63oqpl.auth.us-east-1.amazoncognito.com";
    const CLIENT_ID = "75fhim7k24ef258ihb9s7bq3dg";
    const USER_POOL_ID = "us-east-1_Gog63OqpL"; // Found in User Pool Overview
    const IDENTITY_POOL_ID = "us-east-1:a4b9673b-adac-4d03-ac0b-c532d1df5bd2"; // Found in Identity Pool settings
    const BUCKET_NAME = "sfs-dev-files";
    const REGION = "us-east-1";
    // ------------------------------
    // Initialize AWS Region
    AWS.config.region = REGION;

    const hasFetchedToken = useRef(false);

    useEffect(() => {
        const handleAuth = async () => {
            // Check for authorization code in the URL query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const authCode = urlParams.get('code');

            if (authCode) {
                if (hasFetchedToken.current) return;
                hasFetchedToken.current = true;
                try {
                    await exchangeCodeForToken(authCode);
                } catch (error) {
                    console.error("Exchange failed", error);
                    hasFetchedToken.current = false; // Reset on failure to allow retry if needed
                }
            } else {
                // Check for stored session
                const storedUser = localStorage.getItem('user_session');
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                        initializeS3(parsedUser.token);
                    } catch (e) {
                        console.error("Failed to restore session", e);
                        localStorage.removeItem('user_session');
                    }
                }
                setLoading(false);
            }
        };

        handleAuth();
    }, []);

    const exchangeCodeForToken = async (code) => {
        const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;

        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code: code,
            redirect_uri: REDIRECT_URI
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AWS Error: ${errorText}`);
            }

            const data = await response.json();

            // Decode ID Token to get user info
            const payload = JSON.parse(atob(data.id_token.split('.')[1]));
            const tenantId = payload['custom:tenant_id'] || 'NO-TENANT-ID';
            const email = payload.email || 'unknown-user';
            const role = payload['custom:role'] || 'user';
            const userPath = `${tenantId}/${email}/`;

            const userData = {
                email: email,
                name: payload.name || payload['cognito:username'] || 'User',
                picture: payload.picture,
                token: data.id_token,
                accessToken: data.access_token,
                tenantId: tenantId,
                userPath: userPath,
                role: role
            };

            setUser(userData);
            localStorage.setItem('user_session', JSON.stringify(userData));

            // Initialize S3 with the ID Token
            initializeS3(data.id_token);

            // Clean the URL so the code isn't visible anymore
            const redirectPath = role === 'admin' ? '/admin' : '/dashboard';
            window.history.replaceState({}, document.title, redirectPath);
            // Force navigation if needed, but replaceState just changes URL. 
            // We might need to reload or let the router handle it. 
            // Since we are in a SPA, changing state might not trigger router.
            // But usually this function is called on mount, and then the app renders based on user state.
            // Let's just update the URL for now, the App component will redirect based on user state if we were at /

            // Actually, if we are at /?code=..., we want to go to /dashboard or /admin.
            // window.location.href = redirectPath; // This would cause a reload.
            // Better to let the component consuming AuthContext handle redirect, OR just set the URL.
            // The previous code was: window.history.replaceState({}, document.title, "/dashboard");
            // So I will stick to that pattern but dynamic.
            window.history.replaceState({}, document.title, redirectPath);

            // However, replaceState doesn't trigger a popstate event, so React Router won't know.
            // But if we are on the LandingPage, and user state changes, LandingPage will redirect.
            // Let's check LandingPage logic. It redirects to /dashboard if user exists.
            // We need to update LandingPage too.

            // For now, just update the URL to be clean.
            if (window.location.pathname === '/') {
                // If we are on landing page, we might want to actually navigate.
                // But let's rely on the reactive 'user' state in LandingPage/App.
            }
        } catch (error) {
            console.error("Token exchange error:", error);
        } finally {
            setLoading(false);
        }
    };

    const initializeS3 = (idToken) => {
        const loginKey = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITY_POOL_ID,
            Logins: { [loginKey]: idToken }
        });

        AWS.config.credentials.refresh((error) => {
            if (error) {
                console.error("Auth Error:", error);
                return;
            }

            const s3Instance = new AWS.S3({
                apiVersion: '2006-03-01',
                params: { Bucket: BUCKET_NAME }
            });

            setS3(s3Instance);
        });
    };

    const login = () => {
        // Redirect to Cognito Hosted UI with response_type=code
        const loginUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
        window.location.href = loginUrl;
    };

    const logout = () => {
        if (AWS.config.credentials) {
            AWS.config.credentials.clearCachedId();
            AWS.config.credentials = null;
        }
        setUser(null);
        setS3(null);
        localStorage.removeItem('user_session');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, s3, BUCKET_NAME }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
