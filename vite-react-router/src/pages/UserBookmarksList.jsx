import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import RowComp from "../components/RowList";
import placeholderImage from "../pics/Image-not-found.png";
import useAuthStatus from "../hooks/useAuthStatus";
import { getStoredToken } from "../components/utils/ExtractJwtData";
import { formatPlotPre } from "../components/utils/PlotPreFormatter";
import mdb from "../business-logic-layer/ApiClient/ApiClient";
import { LoadingState } from '../components/PageStates';
import ToastConfirm from '../components/utils/ToastUtil';

export default function UserBookmarksList() {
    const { userId } = useParams();

    const { isSignedIn, userId: tokenUserId } = useAuthStatus();
    const isOwnProfile = isSignedIn && String(tokenUserId) === String(userId);
    const isLoggedIn = isSignedIn;

    // bookmarks state
    const [bookmarkedPages, setBookmarkedPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Using shared `formatPlotPre` from utilities

    // local bookmark deletion handler
    const [message, setMessage] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [confirmDeleteBookmarkId, setConfirmDeleteBookmarkId] = useState(null);

    const handleRemoveBookmark = async (pageId) => {
        if (!isLoggedIn || !isOwnProfile) {
            setMessage("You must be the profile owner to remove bookmarks.");
            setTimeout(() => setMessage(""), 2000);
            return;
        }

        setRemovingId(pageId);
        try {
            const token = getStoredToken();
            const authOptions = token ? { authToken: token } : undefined;

            await mdb.apiv2.user.removeBookmark(userId, pageId, authOptions);

            setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId));
            setMessage("Bookmark removed.");
        } catch (err) {
            setMessage("Failed to remove bookmark: " + (err?.message ?? String(err)));
        } finally {
            setRemovingId(null);
            setTimeout(() => setMessage(""), 1500);
        }
    };

    // Fetch bookmarks and enrich them like on the User page
    useEffect(() => {
        let cancelled = false;

        const fetchBookmarks = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = getStoredToken();
                const authOptions = token ? { authToken: token } : undefined;

                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, authOptions);

                const enrichedBookmarks = await Promise.all(
                    bookmarks.map(async (b) => {
                            try {
                                const pageRef = await mdb.apiv2.page.getById(b.pageId, authOptions);

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

                enrichedBookmarks.sort((a, b) => new Date(b.time) - new Date(a.time));
                if (!cancelled) setBookmarkedPages(enrichedBookmarks);
            } catch (err) {
                if (!cancelled) setError(err?.message ?? String(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBookmarks();

        return () => { cancelled = true; };
    }, [userId]);

    // returns a list of all the user's bookmarks
    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Bookmarks</h2>

            {loading && <LoadingState message="Loading bookmarks..." />}
            {error && <p className="text-danger">Error: {error}</p>}

            {!loading && !error && bookmarkedPages.length === 0 && (
                <p className="text-muted">You have not bookmarked any titles yet.</p>
            )}

            {!loading && !error && bookmarkedPages.length > 0 && (
                <RowComp
                    variant="list"
                    items={bookmarkedPages}
                    renderItem={(item) => (
                        <div className="d-flex w-100 h-100 bg-white rounded-4 overflow-hidden align-items-center">
                            <Link
                                to={`/page/${item.pageId ?? ""}`}
                                className="d-flex align-items-center gap-3 text-decoration-none text-reset"
                                style={{ flex: 1 }}
                            >
                                {/* Poster image */}
                                <img
                                    src={item.poster || placeholderImage}
                                    alt={item.title}
                                    className="img-fluid object-fit-cover"
                                    style={{ width: "80px", height: "120px", objectFit: "cover" }}
                                    onError={(e) => {
                                        try {
                                            if (e?.target?.src && e.target.src !== placeholderImage) {
                                                e.target.src = placeholderImage;
                                            }
                                        } catch (err) { }
                                    }}
                                />

                                {/* Title, added on {date} & plot preview */}
                                <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 className="h5 mb-1">{item.title}</h3>
                                    <p className="text-muted small mb-0">
                                        {formatPlotPre(item.plotPre)}
                                    </p>
                                    <div className="text-muted small mt-2">
                                        Added on: {new Date(item.time).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>

                            {/* Delete button */}
                            {isOwnProfile && (
                                <div className="p-3 ms-auto d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => setConfirmDeleteBookmarkId(item.pageId)}
                                        disabled={removingId === item.pageId}
                                    >
                                        {removingId === item.pageId ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            )}

            {/* ListManager Modal */}
            {/* ListManager removed */}

            <ToastConfirm
                show={!!confirmDeleteBookmarkId}
                message="Delete this bookmark?"
                onClose={() => setConfirmDeleteBookmarkId(null)}
                onConfirm={async () => {
                    try {
                        await handleRemoveBookmark(confirmDeleteBookmarkId);
                    } catch (err) {
                        setMessage('Failed to delete bookmark.');
                        setTimeout(() => setMessage(''), 2000);
                    }
                }}
                onCancel={() => setConfirmDeleteBookmarkId(null)}
            />

            <ToastConfirm
                show={!!message}
                message={message}
                onClose={() => setMessage('')}
            />
        </main>
    );
}