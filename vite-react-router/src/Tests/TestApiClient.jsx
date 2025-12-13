import { useEffect, useState } from 'react';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import useAuthStatus from '../hooks/useAuthStatus';
import { getStoredToken, TOKEN_STORAGE_KEY } from '../components/extractJwtData';

// Utility to render the latest result/error for quick inspection.
const ResultPane = ({ label, data }) => (
    <div style={{ marginTop: '0.5rem' }}>
        <strong>{label}</strong>
        <pre style={{ background: '#f6f8fa', padding: '0.75rem', borderRadius: 6, overflowX: 'auto' }}>
            {data}
        </pre>
    </div>
);

export default function TestApiClient() {
	const { userId: authUserId, isSignedIn, syncAuthState } = useAuthStatus();
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState(() => getStoredToken());
    const [userId, setUserId] = useState('');
    const [titleId, setTitleId] = useState('tt10257794');
    const [individualId, setIndividualId] = useState('nm0000158');

    // Keep token in sync with localStorage default when the page mounts.
    useEffect(() => {
        setToken(getStoredToken());
    }, []);

    // Keep userId/token aligned with the signed-in user when available.
    useEffect(() => {
        if (!isSignedIn) return;
        setUserId(authUserId || '');
        setToken(getStoredToken());
    }, [authUserId, isSignedIn]);

    const refreshStoredToken = () => setToken(getStoredToken());

    const runCall = async (label, fn) => {
        setError('');
        setOutput('Loading...');
        try {
            const res = await fn();
            setOutput(JSON.stringify(res, null, 2));
        } catch (err) {
            setOutput('');
            setError(`${label}: ${err.message || err}`);
        }
    };

    return (
        <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
            <h2>API Client Sandbox</h2>
            <p>Trigger any endpoint from <code>mdb.apiv2</code>. Provide IDs/token where needed.</p>

            {/* Common inputs */}
            <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
                <label>
                    Title ID:
                    <input value={titleId} onChange={(e) => setTitleId(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label>
                    Individual ID:
                    <input value={individualId} onChange={(e) => setIndividualId(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label>
                    User ID:
                    <input value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label>
                    Auth token (Bearer):
                    <input value={token} onChange={(e) => setToken(e.target.value)} style={{ width: '100%' }} placeholder={TOKEN_STORAGE_KEY} />
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={refreshStoredToken}>Reload token from storage</button>
                    <button onClick={() => { syncAuthState(); setUserId(authUserId || ''); setToken(getStoredToken()); }} disabled={!isSignedIn}>
                        Use logged-in user
                    </button>
                </div>
            </div>

            {/* Health */}
            <section>
                <h3>Health</h3>
                <button onClick={() => runCall('health.status', () => mdb.apiv2.health.status())}>Health Status</button>
            </section>

            {/* Titles */}
            <section>
                <h3>Titles</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => runCall('titles.list', () => mdb.apiv2.titles.list({ page: 1, pageSize: 5 }))}>List page 1</button>
                    <button onClick={() => runCall('titles.getById', () => mdb.apiv2.titles.getById(titleId))}>Get by id</button>
                    <button onClick={() => runCall('titles.getRatings', () => mdb.apiv2.titles.getRatings(titleId))}>Get ratings</button>
                    <button onClick={() => runCall('titles.getIndividuals', () => mdb.apiv2.titles.getIndividuals(titleId))}>Get individuals</button>
                </div>
            </section>

            {/* Individuals */}
            <section>
                <h3>Individuals</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => runCall('individuals.list', () => mdb.apiv2.individuals.list({ page: 1, pageSize: 5 }))}>List page 1</button>
                    <button onClick={() => runCall('individuals.getById', () => mdb.apiv2.individuals.getById(individualId))}>Get by id</button>
                    <button onClick={() => runCall('individuals.getTitles', () => mdb.apiv2.individuals.getTitles(individualId))}>Get titles</button>
                </div>
            </section>

            {/* User */}
            <section>
                <h3>User</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <button onClick={() => runCall('user.get', () => mdb.apiv2.user.get(userId))}>Get user</button>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => runCall('user.getBookmarks', () => mdb.apiv2.user.getBookmarks(userId, { authToken: token }))}>Bookmarks</button>
                        <button onClick={() => runCall('user.getRatings', () => mdb.apiv2.user.getRatings(userId, { authToken: token }))}>Ratings</button>
                        <button onClick={() => runCall('user.getProfileImage', () => mdb.apiv2.user.getProfileImage(userId, { authToken: token }))}>Profile image</button>
                    </div>
                </div>
            </section>

            {/* Auth */}
            <section>
                <h3>Auth</h3>
                <p style={{ margin: 0 }}>These need valid payloads; adjust inside the calls if needed.</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => runCall('auth.signup', () => mdb.apiv2.auth.signup({ username: 'demo', password: 'Password123!', email: 'demo@example.com' }))}>Signup (demo payload)</button>
                    <button onClick={() => runCall('auth.login', () => mdb.apiv2.auth.login({ username: 'demo', password: 'Password123!' }))}>Login (demo payload)</button>
                </div>
            </section>

            {error && <ResultPane label="Error" data={error} />}
            {output && <ResultPane label="Result" data={output} />}
        </div>
    );
}