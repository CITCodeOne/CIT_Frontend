import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UserBanner from "../components/UserBanner";
import Rating from "../components/Rating";
import useAuthStatus from "../hooks/useAuthStatus";
import { getStoredToken } from "../components/ExtractJwtData";
import mdb from "../business-logic-layer/ApiClient/ApiClient";
import defaultAvatar from "../pics/DefaultProfilePicture.jpg";
import placeholderImage from "../pics/Image-not-found.png";
import { encodeImageToBase64 } from "../components/utils/ImageBase64Utils";

export default function User() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // for avatar file input
    const { isSignedIn, userId: tokenUserId } = useAuthStatus();

    // State for user data
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // dummy ratings list as state
    const [ratedTitles, setRatedTitles] = useState([]);

    // get latest 3 ratings
    const latestRatedTitles = ratedTitles.slice(0, 3);

    // dummy bookmarks as state
    const [bookmarkedPages, setBookmarkedPages] = useState([]);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user profile (include auth token when available)
                const token = getStoredToken();
                const authOptions = token ? { authToken: token } : undefined;

                const user = await mdb.apiv2.user.get(userId, authOptions);
                setUserData(user);

                // try to fetch stored profile image from backend (GET /users/{userId}/profile-image)
                let apiProfileImage = null;
                try {
                    const imgDto = await mdb.apiv2.user.getProfileImage(userId, authOptions);
                    apiProfileImage = imgDto?.profileImage || imgDto?.ProfileImage || null;
                } catch (err) {
                    // ignore 404 (no image) but log other errors
                    if (!err || err.status !== 404) console.debug('getProfileImage failed', err);
                }

                const initialAvatar = apiProfileImage || user?.image || null;
                setAvatarUrl(initialAvatar);
                setOriginalAvatarUrl(initialAvatar);

                // No persisted pending avatar: pending selection is kept only in-memory while on this page

                // Fetch user ratings and bookmarks (use correct API signatures)
                const ratings = await mdb.apiv2.user.getRatings(userId, authOptions);

                // Enrich each rating with title data (poster, title name, year, mediaType, short plot)
                let enrichedRatings = [];
                if (Array.isArray(ratings) && ratings.length > 0) {
                    enrichedRatings = await Promise.all(
                                ratings.map(async (r) => {
                            try {
                                const title = await mdb.apiv2.titles.getById(r.titleId, authOptions);
                                return {
                                    ...r,
                                            title: title?.name ?? title?.title ?? 'Unknown',
                                            poster: title?.image ?? placeholderImage,
                                            startYear: title?.startYear ?? title?.releaseDate ?? null,
                                            mediaType: title?.mediaType ?? 'unknown',
                                            plotPre: title?.plot ? String(title.plot).slice(0, 200) : '',
                                            pageId: title?.pageId ?? null,
                                };
                            } catch (err) {
                                return {
                                    ...r,
                                    title: 'Unknown',
                                    poster: placeholderImage,
                                    startYear: null,
                                    mediaType: 'unknown',
                                    plotPre: '',
                                            pageId: null,
                                };
                            }
                        })
                    );
                }

                enrichedRatings.sort((a, b) => new Date(b.time) - new Date(a.time));
                setRatedTitles(enrichedRatings);

                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, authOptions);

                // Enrich bookmarks: a bookmark references a pageId which may point to a title or an individual
                let enrichedBookmarks = [];
                if (Array.isArray(bookmarks) && bookmarks.length > 0) {
                    enrichedBookmarks = await Promise.all(
                        bookmarks.map(async (b) => {
                            try {
                                // resolve page to find whether it's a title or individual
                                const pageRef = await mdb.apiv2.page.getById(b.pageId, authOptions);

                                // API returns { pageId, tconst, iconst }
                                const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null;
                                const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null;

                                if (tconst) {
                                    const title = await mdb.apiv2.titles.getById(tconst, authOptions);
                                    return {
                                        ...b,
                                        kind: 'title',
                                        title: title?.name ?? title?.title ?? 'Unknown',
                                        poster: title?.image ?? placeholderImage,
                                        plotPre: title?.plot ? String(title.plot).slice(0, 200) : '',
                                        mediaType: title?.mediaType ?? 'unknown',
                                        pageId: b.pageId,
                                    };
                                }

                                if (iconst) {
                                    const individual = await mdb.apiv2.individuals.getById(iconst, authOptions);
                                    return {
                                        ...b,
                                        kind: 'individual',
                                        title: individual?.name ?? 'Unknown',
                                        poster: individual?.image ?? placeholderImage,
                                        plotPre: individual?.bio ? String(individual.bio).slice(0, 200) : '',
                                        mediaType: 'individual',
                                        pageId: b.pageId,
                                    };
                                }

                                // fallback when pageRef doesn't contain ids
                                return {
                                    ...b,
                                    kind: 'unknown',
                                    title: pageRef?.name ?? pageRef?.title ?? 'Unknown',
                                    poster: pageRef?.image ?? placeholderImage,
                                    plotPre: pageRef?.plot ? String(pageRef.plot).slice(0, 200) : '',
                                    mediaType: 'unknown',
                                    pageId: b.pageId,
                                };
                            } catch (err) {
                                return {
                                    ...b,
                                    kind: 'error',
                                    title: 'Unknown',
                                    poster: placeholderImage,
                                    plotPre: '',
                                    mediaType: 'unknown',
                                    pageId: b.pageId,
                                };
                            }
                        })
                    );
                }
                enrichedBookmarks.sort((a, b) => new Date(b.time) - new Date(a.time));
                setBookmarkedPages(enrichedBookmarks);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // helper to format plot preview strings with "..."
    const formatPlotPre = (s) => {
        if (!s) return "";
        if (/\u2026$|\.{3}$/.test(s.trim())) return s.trim();
        return s.trim() + "...";
    };

    // get latest 3 bookmarks
    const latestBookmarks = bookmarkedPages.slice(0, 3);

    const [avatarUrl, setAvatarUrl] = useState(userData?.image || null);
    const [originalAvatarUrl, setOriginalAvatarUrl] = useState(userData?.image || null);
    const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [shareMessage, setShareMessage] = useState("");

    // Consider tokenUserId or userId may be string/number — compare as strings for robustness
    const isOwnProfile = isSignedIn && String(tokenUserId) === String(userId);

    const handleToggleEditMode = () => {
        if (!isOwnProfile) return;
        // if turning off edit mode, save pending avatar if present
        const turningOff = isEditMode;
        if (turningOff && pendingAvatarFile) {
            (async () => {
                try {
                    const token = getStoredToken();
                    if (!token) throw new Error('Not authenticated');
                    // Encode the selected File to base64 and upload
                    const dataUrl = pendingAvatarFile ? await encodeImageToBase64(pendingAvatarFile) : null;
                    if (!dataUrl) throw new Error('No image data to upload');

                    // Use ApiClient v2 upsert endpoint which includes consistent options handling
                    await mdb.apiv2.user.upsertProfileImage(userId, dataUrl, { authToken: token });

                    setUserData((prev) => ({ ...(prev || {}), image: dataUrl }));
                    setOriginalAvatarUrl(dataUrl);
                    if (avatarUrl && avatarUrl.startsWith('blob:')) {
                        try { URL.revokeObjectURL(avatarUrl); } catch (e) {}
                    }
                    setPendingAvatarFile(null);
                    setShareMessage('Profile image saved');
                    setTimeout(() => setShareMessage(''), 2000);
                } catch (err) {
                    console.error('Failed to save profile image', err);
                    setShareMessage('Failed to save image');
                    setTimeout(() => setShareMessage(''), 3000);
                }
            })();
        }

        setIsEditMode((prev) => !prev);
    };

    // share profile handler - copies profile URL to clipboard or shows fallback message
    const handleShareClick = async () => {
        const profileUrl = window.location.href;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(profileUrl);
                setShareMessage("Profile link copied to clipboard!");
                setTimeout(() => setShareMessage(""), 2000);
            } else {
                setShareMessage("Could not copy profile link.");
                setTimeout(() => setShareMessage(""), 4000);
            }
        } catch {
            setShareMessage("Could not copy profile link.");
            setTimeout(() => setShareMessage(""), 4000);
        }
    };

    // avatar click handler
    const handleAvatarClick = () => {
        if (!isOwnProfile || !isEditMode) return;
        fileInputRef.current?.click();
    };

    // avatar file change handler
    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        // store original to allow undo
        if (!originalAvatarUrl) setOriginalAvatarUrl(avatarUrl || userData?.image || defaultAvatar);

        const newUrl = URL.createObjectURL(file);
        setPendingAvatarFile(file);
        setAvatarUrl(newUrl);

        // keep selection in-memory only; encode/upload when the user saves (leaving edit mode)

        // reset input so same file can be selected later
        event.target.value = null;
    };

    const handleUndoAvatar = () => {
        if (pendingAvatarFile && avatarUrl && avatarUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(avatarUrl); } catch (e) {}
        }
        setPendingAvatarFile(null);
        setAvatarUrl(originalAvatarUrl || defaultAvatar);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    // navigate to user's full ratings list
    const handleBrowseAllRatings = () => {
        navigate(`/user/${userId}/ratings`);
    };

    // navigate to user's full bookmarks list
    const handleBrowseAllBookmarks = () => {
        navigate(`/user/${userId}/bookmarks`);
    };

    // delete bookmark handler (using dummy auth)
    const handleDeleteBookmark = (pageId) => {
        if (!isSignedIn) {
            setShareMessage("You must be logged in to remove bookmarks.");
            setTimeout(() => setShareMessage(""), 2500);
            return;
        }

        if (!isOwnProfile) {
            setShareMessage("You can only remove bookmarks from your own profile.");
            setTimeout(() => setShareMessage(""), 2500);
            return;
        }

        setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId));
        setShareMessage("Bookmark removed.");
        setTimeout(() => setShareMessage(""), 2000);
    };

    // delete rating handler (using dummy auth)
    const handleDeleteRating = (titleId) => {
        if (!isSignedIn) {
            setShareMessage("You must be logged in to remove ratings.");
            setTimeout(() => setShareMessage(""), 2500);
            return;
        }

        if (!isOwnProfile) {
            setShareMessage("You can only remove ratings from your own profile.");
            setTimeout(() => setShareMessage(""), 2500);
            return;
        }

        setRatedTitles((prev) => prev.filter((r) => r.titleId !== titleId));
        setShareMessage("Rating removed.");
        setTimeout(() => setShareMessage(""), 2000);
    };

    return (
        <main className="container py-4">
            {loading && <p>Loading user data...</p>}
            {error && <p className="text-danger">Error: {error}</p>}
            {!loading && !error && userData && (
                <>
                    {/* avatar change */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="d-none"
                        onChange={handleAvatarFileChange}
                    />

                    <UserBanner
                        user_name={userData.name}
                        email={userData.email}
                        createdAt={userData.createdAt}
                        ratingsCount={ratedTitles.length}
                        bookmarksCount={bookmarkedPages.length}
                        profile_image={avatarUrl || defaultAvatar}
                        role={userData.role}
                        isOwnProfile={isOwnProfile}
                        isEditMode={isEditMode}
                        onEditClick={handleToggleEditMode}
                        onAvatarClick={handleAvatarClick}
                        showUndo={!!pendingAvatarFile}
                        onUndoAvatar={handleUndoAvatar}
                        onShareClick={handleShareClick}
                    />
                    {/* latest 3 ratings */}
                    <section className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Latest ratings</h3>
                            {ratedTitles.length > 3 && (
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={handleBrowseAllRatings}
                                >
                                    Browse all ratings
                                </button>
                            )}
                        </div>

                        {latestRatedTitles.length === 0 ? (
                            <p className="text-muted">This user has not rated any titles yet.</p>
                        ) : (
                            <div className="list-group">
                                {latestRatedTitles.map((item) => (
                                    <div
                                        key={item.titleId}
                                        className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
                                    >
                                        <Link
                                            to={`/page/${item.pageId ?? ''}`}
                                            className="d-flex align-items-center gap-3 text-decoration-none text-reset"
                                            style={{ flex: 1 }}
                                        >
                                            <img
                                                src={item.poster || placeholderImage}
                                                alt={item.title}
                                                style={{
                                                    width: "100px",
                                                    height: "140px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                                onError={(e) => { e.target.src = placeholderImage; }}
                                            />
                                            <div>
                                                <div className="fs-5 fw-semibold">
                                                    {item.title} {" "}
                                                    {item.startYear && (
                                                        <span className="text-muted">({item.startYear})</span>
                                                    )}
                                                </div>
                                                <div className="text-muted small">{item.mediaType}</div>
                                            </div>
                                        </Link>

                                        {/* Rating and Remove button */}
                                        <div className="d-flex align-items-center gap-2 ms-md-3">
                                            <Rating
                                                initialRating={item.rating}
                                                editable={false}
                                                showNumber={true}
                                            />
                                            {isOwnProfile && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteRating(item.titleId)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* latest 3 bookmarks & 'browse all' button */}
                    <section className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Latest bookmarks</h3>
                            {bookmarkedPages.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={handleBrowseAllBookmarks}
                                >
                                    Browse all bookmarks
                                </button>
                            )}
                        </div>

                        {latestBookmarks.length === 0 ? (
                            <p className="text-muted">This user has not bookmarked any titles yet.</p>
                        ) : (
                            <div className="list-group">
                                {latestBookmarks.map((item) => (
                                    <div
                                        key={item.pageId}
                                        className="list-group-item d-flex align-items-center gap-3"
                                    >
                                        <Link
                                            to={`/page/${item.pageId ?? ''}`}
                                            className="d-flex align-items-center gap-3 text-decoration-none text-reset"
                                            style={{ flex: 1 }}
                                        >
                                            <img
                                                src={item.poster || placeholderImage}
                                                alt={item.title}
                                                style={{
                                                    width: "100px",
                                                    height: "140px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                                onError={(e) => { e.target.src = placeholderImage; }}
                                            />

                                            {/* Title & plot preview*/}
                                            <div className="flex-grow-1">
                                                <div className="fs-5 fw-semibold">{item.title}</div>
                                                <div className="text-muted small">
                                                    {formatPlotPre(item.plotPre)}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Delete bookmark button */}
                                        {isOwnProfile && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger ms-auto"
                                                onClick={() => handleDeleteBookmark(item.pageId)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* message popup */}
                    {shareMessage && (
                        <div
                            className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-4 py-3 rounded-3 shadow"
                            style={{
                                zIndex: 1080,
                                fontSize: "1rem",
                                textAlign: "center",
                                marginBottom: "2rem",
                            }}
                        >
                            {shareMessage}
                        </div>
                    )}
                </>
            )}
        </main>
    );
}