import { useState, useEffect, useCallback } from 'react';
import {
        TOKEN_STORAGE_KEY,
        deriveUserId,
        deriveUsername,
        getStoredToken,
        parseJwtClaims,
} from '../components/ExtractJwtData';

/**
 * Tracks JWT authentication state sourced from localStorage.
 * @returns {{
 *  isSignedIn: boolean,
 *  username: string,
 *  userId: string,
 *  profileInitial: string,
 *  syncAuthState: () => void,
 *  handleLogout: () => void
 * }} Memoized auth snapshot plus helpers for resyncing/logging out.
 */
export default function useAuthStatus() {
        const [isSignedIn, setIsSignedIn] = useState(false);
        const [username, setUsername] = useState('');
        const [userId, setUserId] = useState('');

        // Refresh all auth-derived state from the persisted token.
        const syncAuthState = useCallback(() => {
                if (typeof window === 'undefined') return;
                const token = getStoredToken();

                if (!token) {
                        setIsSignedIn(false);
                        setUsername('');
                        setUserId('');
                        return;
                }

                const claims = parseJwtClaims(token);
                if (!claims) {
                        setIsSignedIn(false);
                        setUsername('');
                        setUserId('');
                        return;
                }

                setIsSignedIn(true);
                setUsername(deriveUsername(claims));
                setUserId(deriveUserId(claims));
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

        // Clears token, then wipe auth state locally.
        const handleLogout = useCallback(() => {
                        if (typeof window !== 'undefined') {
                                window.localStorage.removeItem(TOKEN_STORAGE_KEY);
                                window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_STORAGE_KEY, newValue: null }));
                        }
                        setIsSignedIn(false);
                        setUsername('');
                        setUserId('');
        }, []);

        return {
                isSignedIn,
                username,
                userId,
                profileInitial: username ? username.trim().charAt(0).toUpperCase() : 'P',
                syncAuthState,
                handleLogout
        };
}
