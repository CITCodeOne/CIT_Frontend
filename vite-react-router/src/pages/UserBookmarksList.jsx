// Viser hele listen af en brugers bookmarks med mulighed for at slette egne
import { useState, useEffect } from "react"; // React hooks til tilstand og sideeffekter
import { useParams, Link } from "react-router-dom"; // Laeser bruger-id fra URL og laver links
import RowComp from "../components/RowList"; // Genbrugskomponent der lister items
import placeholderImage from "../pics/Image-not-found.png"; // Fallback billede hvis intet findes
import useAuthStatus from "../hooks/useAuthStatus"; // Fortaeller om vi er logget ind og hvilket id
import { getStoredToken } from "../components/utils/ExtractJwtData"; // Henter JWT fra storage
import { formatPlotPre } from "../components/utils/PlotPreFormatter"; // Kutter/formatterer korte plot tekster
import mdb from "../business-logic-layer/ApiClient/ApiClient"; // Egen backend klient
import { LoadingState } from '../components/PageStates'; // Spinner / laesse-tilstand
import ToastConfirm from '../components/utils/ToastUtil'; // Lille dialog/toast til bekraeftelser

export default function UserBookmarksList() {
    const { userId } = useParams(); // Bruger-id fra URL

    const { isSignedIn, userId: tokenUserId } = useAuthStatus(); // Login status + id fra token
    const isOwnProfile = isSignedIn && String(tokenUserId) === String(userId); // Ejer denne profil?
    const isLoggedIn = isSignedIn; // Alias for laesevenlighed

    // Tilstand for bookmarks og laesse-status
    const [bookmarkedPages, setBookmarkedPages] = useState([]); // Liste af berigede bookmarks
    const [loading, setLoading] = useState(true); // Viser spinner mens vi henter
    const [error, setError] = useState(null); // Fejltekst hvis kald fejler

    // Beskeder og sletteflow
    const [message, setMessage] = useState(""); // Toast-beskeder til bruger
    const [removingId, setRemovingId] = useState(null); // Hvilket bookmark viser "Removing..."
    const [confirmDeleteBookmarkId, setConfirmDeleteBookmarkId] = useState(null); // Hvilket id skal bekræftes slettet

    const handleRemoveBookmark = async (pageId) => {
        if (!isLoggedIn || !isOwnProfile) { // Kun ejeren maa slette egne bookmarks
            setMessage("You must be the profile owner to remove bookmarks.");
            setTimeout(() => setMessage(""), 2000);
            return;
        }

        setRemovingId(pageId); // Vis "Removing..." paa knappen
        try {
            const token = getStoredToken(); // JWT fra storage
            const authOptions = token ? { authToken: token } : undefined; // Til API kald

            await mdb.apiv2.user.removeBookmark(userId, pageId, authOptions); // Kald backend for at fjerne

            setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId)); // Fjern i UI
            setMessage("Bookmark removed.");
        } catch (err) {
            setMessage("Failed to remove bookmark: " + (err?.message ?? String(err)));
        } finally {
            setRemovingId(null); // Sluk "Removing..."
            setTimeout(() => setMessage(""), 1500); // Ryd besked
        }
    };

    // Henter bookmarks fra backend og beriger dem med titel/person data
    useEffect(() => {
        let cancelled = false;

        const fetchBookmarks = async () => {
            try {
                setLoading(true); // Taend spinner
                setError(null); // Nulstil fejl

                const token = getStoredToken(); // JWT hvis logget ind
                const authOptions = token ? { authToken: token } : undefined; // Bruges til autoriserede kald

                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, authOptions); // Hent alle bookmarks

                const enrichedBookmarks = await Promise.all(
                    bookmarks.map(async (b) => {
                            try {
                                const pageRef = await mdb.apiv2.page.getById(b.pageId, authOptions); // Find ud af hvad pageId peger paa

                                const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null; // Titel id
                                const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null; // Individ id

                                if (tconst) {
                                    const title = await mdb.apiv2.titles.getById(tconst, authOptions); // Hent titel info
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
                                    const individual = await mdb.apiv2.individuals.getById(iconst, authOptions); // Hent person info
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

                enrichedBookmarks.sort((a, b) => new Date(b.time) - new Date(a.time)); // Seneste foerst
                if (!cancelled) setBookmarkedPages(enrichedBookmarks); // Opdater state hvis stadig monteret
            } catch (err) {
                if (!cancelled) setError(err?.message ?? String(err)); // Vis fejl hvis kald fejler
            } finally {
                if (!cancelled) setLoading(false); // Sluk spinner
            }
        };

        fetchBookmarks();

        return () => { cancelled = true; };
    }, [userId]);

    // Returnerer en fuld liste af brugerens bookmarks
    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Your bookmarks</h2>

            {loading && <LoadingState message="Loading bookmarks..." />} {/* Viser spinner mens data hentes */}
            {error && <p className="text-danger">Error: {error}</p>} {/* Viser fejltekst */}

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
                                {/* Plakatbillede med fallback */}
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

                                {/* Titel, dato og kort plot */}
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

                            {/* Slet-knap vises kun for ejeren */}
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
                show={!!confirmDeleteBookmarkId} // Bekraeft slet bookmark
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