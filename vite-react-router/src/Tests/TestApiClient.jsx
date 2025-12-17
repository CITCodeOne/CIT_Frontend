import { useEffect, useState } from 'react';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import useAuthStatus from '../hooks/useAuthStatus';
import { getStoredToken, TOKEN_STORAGE_KEY } from '../components/ExtractJwtData';
import UserBanner from '../components/UserBanner';

// Utility to render the latest result/error for quick inspection.
const ResultPane = ({ label, data }) => (
    <div style={{ marginTop: '0.5rem' }}>
        <strong>{label}</strong>
        <div style={{ background: '#f6f8fa', padding: '0.75rem', borderRadius: 6, overflowX: 'auto', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {data}
        </div>
    </div>
);

export default function TestApiClient() {
	const { userId: authUserId, isSignedIn, syncAuthState } = useAuthStatus();
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState(() => getStoredToken());
    const [userId, setUserId] = useState('');
    const [demoUser, setDemoUser] = useState(null);
    const [titleId, setTitleId] = useState('tt10257794');
    const [individualId, setIndividualId] = useState('nm0000158');
    const [pageId, setPageId] = useState('');
    const [tmdbQuery, setTmdbQuery] = useState('');
    const [tmdbPersonId, setTmdbPersonId] = useState('');

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
    // creats a demo user banner by fetching user data and mapping it
    // use this as an example of how to use the ApiClient and mapping functions
    const runUserBannerDemo = async () => {
        setError('');
        setOutput('Loading user...');
        setDemoUser(null);
        try {
            const res = await mdb.apiv2.user.get(userId);
            setOutput(JSON.stringify(res, null, 2));
            setDemoUser(res);
        } catch (err) {
            setOutput('');
            setError(`user.bannerExample: ${err.message || err}`);
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

            {/* TMDB inputs */}
            <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
                <h4>TMDB proxy</h4>
                <label>
                    Person query (search):
                    <input value={tmdbQuery} onChange={(e) => setTmdbQuery(e.target.value)} style={{ width: '100%' }} placeholder="e.g. Tom Cruise" />
                </label>
                <label>
                    TMDB person id (leave empty to test blank):
                    <input value={tmdbPersonId} onChange={(e) => setTmdbPersonId(e.target.value)} style={{ width: '100%' }} placeholder="e.g. 500" />
                </label>
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
                    <button onClick={() => runCall('titles.getSimilar', () => mdb.apiv2.titles.getSimilar(titleId))}>Get similar</button>
                </div>
            </section>

            {/* Individuals */}
            <section>
                <h3>Individuals</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => runCall('individuals.list', () => mdb.apiv2.individuals.list({ page: 1, pageSize: 5 }))}>List page 1</button>
                    <button onClick={() => runCall('individuals.getById', () => mdb.apiv2.individuals.getById(individualId))}>Get by id</button>
                    <button onClick={() => runCall('individuals.getTitles', () => mdb.apiv2.individuals.getTitles(individualId))}>Get titles</button>
                    <button onClick={() => runCall('individuals.getPopularActors', () => mdb.apiv2.individuals.getPopularActors(individualId))}>Get popular actors</button>
                    <button onClick={() => runCall('individuals.getCoActors', () => mdb.apiv2.individuals.getCoActors('Tom Hanks'))}>Get co-actors</button>
                    <button onClick={() => runCall('individuals.search', () => mdb.apiv2.individuals.search('Tom'))}>Search individuals</button>
                </div>
            </section>

            {/* User */}
            <section>
                <h3>User</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <button onClick={() => runCall('user.get', () => mdb.apiv2.user.get(userId))}>Get user</button>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => runCall('user.getBookmarks', () => mdb.apiv2.user.getBookmarks(userId, { authToken: token }))}>Bookmarks</button>
                        <button onClick={() => runCall('user.getBookmark', () => mdb.apiv2.user.getBookmark(userId, 500, { authToken: token }))}>Get bookmark (500)</button>
                        <button onClick={() => runCall('user.addBookmark', () => mdb.apiv2.user.addBookmark(userId, 500, { authToken: token }))}>Add bookmark (500)</button>
                        <button onClick={() => runCall('user.removeBookmark', () => mdb.apiv2.user.removeBookmark(userId, 500, { authToken: token }))}>Remove bookmark (500)</button>
                    </div>
                    <label>
                        Page ID (visit):
                        <input value={pageId} onChange={(e) => setPageId(e.target.value)} style={{ width: '100%' }} placeholder="page id (e.g. 500)" />
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => runCall('user.getVisits', () => mdb.apiv2.user.getVisits(userId, { authToken: token }))}>Get visits</button>
                        <button onClick={() => {
                            if (!pageId) { setError('Page ID required for Add visit'); setOutput(''); return; }
                            runCall('user.addVisit', () => mdb.apiv2.user.addVisit(userId, pageId, { authToken: token }));
                        }}>Add visit (Page ID)</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => runCall('user.getRatings', () => mdb.apiv2.user.getRatings(userId, { authToken: token }))}>Ratings</button>
                        <button onClick={() => runCall('user.getRating', () => mdb.apiv2.user.getRating(userId, titleId, { authToken: token }))}>Get rating</button>
                        <button onClick={() => runCall('user.addRating', () => mdb.apiv2.user.addRating(userId, titleId, 5, { authToken: token }))}>Add rating (5)</button>
                        <button onClick={() => runCall('user.updateRating', () => mdb.apiv2.user.updateRating(userId, titleId, 4, { authToken: token }))}>Update rating (4)</button>
                        <button onClick={() => runCall('user.removeRating', () => mdb.apiv2.user.removeRating(userId, titleId, { authToken: token }))}>Remove rating</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/*<button onClick={() => runCall('user.getProfileImage', () => mdb.apiv2.user.getProfileImage(userId, { authToken: token }))}>Profile image</button>*/}
                        {/*<button onClick={() => runCall('user.upsertProfileImage', () => mdb.apiv2.user.upsertProfileImage(userId, 'base64imagedata', { authToken: token }))}>Update profile image</button>*/}
                    </div>
                    {/* Example of using mapping to render a UserBanner */}
                    <button onClick={runUserBannerDemo}>Example of using mapping (UserBanner)</button>
                </div>
            </section>

            {/* TMDB proxy */}
            <section>
                <h3>TMDB</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => runCall('tmdb.searchPerson', () => mdb.tmdb.searchPerson(tmdbQuery))}>Search person</button>
                    <button onClick={() => runCall('tmdb.getPerson', () => mdb.tmdb.getPerson(tmdbPersonId))}>Get person (append)</button>
                </div>
                <p style={{ marginTop: '0.25rem', color: '#555' }}>
                    Person ID defaults empty so you can paste TMDB ids (their ids differ from our own). Append list uses proxy default.
                </p>
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
            {demoUser && (
                <div>
                    <strong>Mapped user preview:</strong>
                    <UserBanner
                        user_name={demoUser.name}
                        email={demoUser.email}
                        createdAt={demoUser.createdAt}
                        ratingsCount={demoUser.ratingsCount}
                        bookmarksCount={demoUser.bookmarksCount}
                        profile_image={demoUser.image}
                        role={demoUser.role}
                        isOwnProfile={String(userId) === String(demoUser.id)}
                        isEditMode={false}
                        onEditClick={() => {}}
                        onAvatarClick={() => {}}
                        onShareClick={() => {}}
                    />
                </div>
            )}
        </div>
    );
}