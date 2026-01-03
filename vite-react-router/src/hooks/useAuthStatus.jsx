import { useState, useEffect, useCallback } from 'react';
import {
        TOKEN_STORAGE_KEY,
        deriveUserId,
        deriveUsername,
        getStoredToken,
        parseJwtClaims,
} from '../components/utils/ExtractJwtData';

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
        // Fortaeller UI om der er en bruger logget ind lige nu
        const [isSignedIn, setIsSignedIn] = useState(false);
        // Viser det viste brugernavn; tom streng betyder ingen bruger fundet
        const [username, setUsername] = useState('');
        // Unikt id for brugeren; bruges til backend-kald
        const [userId, setUserId] = useState('');

        // Opdaterer al login-tilstand ud fra token gemt i browserens lager
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

                const expMs = claims?.exp ? Number(claims.exp) * 1000 : null;
                if (expMs && expMs <= Date.now()) {
                        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
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
                // Koer straks ved indlaesning, sa siden ved om der er en bruger logget ind
                syncAuthState();
        }, [syncAuthState]);

        useEffect(() => {
                if (typeof window === 'undefined') return undefined;

                const handleStorageChange = (event) => {
                        // Hvis token aendres i en anden fane, synkroniser her ogsaa
                        if (event.key === TOKEN_STORAGE_KEY) {
                                syncAuthState();
                        }
                };

                window.addEventListener('storage', handleStorageChange);
                return () => window.removeEventListener('storage', handleStorageChange);
        }, [syncAuthState]);

        // Logger brugeren ud: fjerner token og rydder alle felter vi viser i UI
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
                // Viser forbogstav til avatar; falder tilbage til 'P' hvis tomt
                profileInitial: username ? username.trim().charAt(0).toUpperCase() : 'P',
                syncAuthState,
                handleLogout
        };
}
