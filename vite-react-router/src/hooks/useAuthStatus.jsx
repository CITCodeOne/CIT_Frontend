import { useState, useEffect, useCallback } from 'react';
import {
        TOKEN_STORAGE_KEY,
        deriveUsername,
        getStoredToken,
        parseJwtClaims,
} from '../components/extractJwtData';

export default function useAuthStatus() {
        const [isSignedIn, setIsSignedIn] = useState(false);
        const [username, setUsername] = useState('');

        const syncAuthState = useCallback(() => {
                if (typeof window === 'undefined') return;
                const token = getStoredToken();

                if (!token) {
                        setIsSignedIn(false);
                        setUsername('');
                        return;
                }

                const claims = parseJwtClaims(token);
                if (!claims) {
                        setIsSignedIn(false);
                        setUsername('');
                        return;
                }

                setIsSignedIn(true);
                setUsername(deriveUsername(claims));
        }, []);

        useEffect(() => {
                syncAuthState();
        }, [syncAuthState]);

        useEffect(() => {
                if (typeof window === 'undefined') return undefined;

                const handleStorageChange = (event) => {
                        if (event.key === TOKEN_STORAGE_KEY) {
                                syncAuthState();
                        }
                };

                window.addEventListener('storage', handleStorageChange);
                return () => window.removeEventListener('storage', handleStorageChange);
        }, [syncAuthState]);

        const handleLogout = useCallback(() => {
                        if (typeof window !== 'undefined') {
                                window.localStorage.removeItem(TOKEN_STORAGE_KEY);
                        }
                        setIsSignedIn(false);
                        setUsername('');
        }, []);

        return {
                isSignedIn,
                username,
                profileInitial: username ? username.trim().charAt(0).toUpperCase() : 'P',
                syncAuthState,
                handleLogout
        };
}
