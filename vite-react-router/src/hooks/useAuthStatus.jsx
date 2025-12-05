import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'cit.jwt';

const extractUsernameFromToken = (token) => {
        try {
                const payloadSegment = token?.split?.('.')[1];
                if (!payloadSegment) return null;

                // Decode Base64URL payload so we can read the username claim.
                const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
                const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
                const decoded = (typeof window !== 'undefined' ? window.atob : atob)(padded);
                const jsonString = decodeURIComponent(
                        decoded
                                .split('')
                                .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                                .join('')
                );
                const payload = JSON.parse(jsonString);
                return payload?.username || payload?.user?.username || payload?.sub || '';
        } catch (error) {
                console.warn('Unable to parse cit.jwt payload', error);
                return null;
        }
};

export default function useAuthStatus() {
        const [isSignedIn, setIsSignedIn] = useState(false);
        const [username, setUsername] = useState('');

        const syncAuthState = useCallback(() => {
                if (typeof window === 'undefined') return;
                const token = window.localStorage.getItem(TOKEN_KEY);

                if (!token) {
                        setIsSignedIn(false);
                        setUsername('');
                        return;
                }

                const extractedUsername = extractUsernameFromToken(token);

                if (extractedUsername === null) {
                        setIsSignedIn(false);
                        setUsername('');
                        return;
                }

                setIsSignedIn(true);
                setUsername(extractedUsername || '');
        }, []);

        useEffect(() => {
                syncAuthState();
        }, [syncAuthState]);

        useEffect(() => {
                if (typeof window === 'undefined') return undefined;

                const handleStorageChange = (event) => {
                        if (event.key === TOKEN_KEY) {
                                syncAuthState();
                        }
                };

                window.addEventListener('storage', handleStorageChange);
                return () => window.removeEventListener('storage', handleStorageChange);
        }, [syncAuthState]);

        const handleLogout = useCallback(() => {
                        if (typeof window !== 'undefined') {
                                window.localStorage.removeItem(TOKEN_KEY);
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
