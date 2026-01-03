// Side der viser en brugers profil, ratings og bookmarks
import { useState, useRef, useEffect } from "react"; // React hooks til tilstand, referencer og sideeffekter
import { useParams, useNavigate, Link } from "react-router-dom"; // Laeser URL parametre, navigerer og laver links
import UserBanner from "../components/UserBanner"; // Topbanner med navn, email, counts og avatar
import Rating from "../components/Rating"; // Stjernerating komponent
import useAuthStatus from "../hooks/useAuthStatus"; // Fortaeller om brugeren er logget ind og hvilket id
import { getStoredToken } from "../components/utils/ExtractJwtData"; // Henter gemt JWT token fra storage
import mdb from "../business-logic-layer/ApiClient/ApiClient"; // Egen API klient mod backend
import defaultAvatar from "../pics/DefaultProfilePicture.jpg"; // Fallback profilbillede
import placeholderImage from "../pics/Image-not-found.png"; // Fallback plakat ved manglende billede
import ToastConfirm from '../components/utils/ToastUtil'; // Lille modal/toast til bekraeftelser
import { encodeImageToBase64 } from "../components/utils/ImageBase64Utils"; // Konverterer uploadet billede til base64
import { formatPlotPre } from "../components/utils/PlotPreFormatter"; // Kutter/formatterer plot-tekst
import { LoadingState } from '../components/PageStates'; // Genbrug spinner visning

export default function User() {
    const { userId } = useParams(); // Fanger bruger-id fra URL'en
    const navigate = useNavigate(); // Bruges til at hoppe til andre sider
    const fileInputRef = useRef(null); // Ref til skjult file input for avatar upload
    const { isSignedIn, userId: tokenUserId } = useAuthStatus(); // Login-status og id fra token

    // Grunddata for profilen
    const [userData, setUserData] = useState(null); // Objekt med navn, email, rolle, tider m.m.
    const [loading, setLoading] = useState(true); // Viser loader mens vi henter data
    const [error, setError] = useState(null); // Fejlbesked hvis noget gaar galt

    // Liste over ratings brugeren har givet
    const [ratedTitles, setRatedTitles] = useState([]);

    // De seneste 3 ratings bruges i toppen
    const latestRatedTitles = ratedTitles.slice(0, 3);

    // Liste over sider/titler/personer brugeren har bookmarket
    const [bookmarkedPages, setBookmarkedPages] = useState([]);
    const [removingRatingId, setRemovingRatingId] = useState(null); // Hjaelper med "Removing..." knap-state
    const [removingBookmarkId, setRemovingBookmarkId] = useState(null); // Samme men for bookmarks

    // Henter brugerdata, ratings og bookmarks naar siden aabnes
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true); // Taend loader
                setError(null); // Nulstil fejl

                // Hent brugerprofil (tag token med hvis vi er logget ind)
                const token = getStoredToken(); // JWT fra localStorage
                const authOptions = token ? { authToken: token } : undefined; // Bruges af API klienten

                const user = await mdb.apiv2.user.get(userId, authOptions); // Hent profil
                setUserData(user); // Gem i state

                // Forsog at hente gemt profilbillede fra backend
                let apiProfileImage = null;
                try {
                    const imgDto = await mdb.apiv2.user.getProfileImage(userId, authOptions); // GET /users/{id}/profile-image
                    apiProfileImage = imgDto?.profileImage || imgDto?.ProfileImage || null; // API kan returnere forskelligt felt-navn
                } catch (err) {
                    // Ignorer 404 (intet billede) men log andre fejl
                    if (!err || err.status !== 404) console.debug('getProfileImage failed', err);
                }

                const initialAvatar = apiProfileImage || user?.image || null; // Vaelg server-billede eller brugerfelt
                setAvatarUrl(initialAvatar); // Vises i UI
                setOriginalAvatarUrl(initialAvatar); // Bruges til fortryd/undo

                // Hent ratings fra backend
                const ratings = await mdb.apiv2.user.getRatings(userId, authOptions);

                // Berig hver rating med titeldata (plakat, navn, aar, type, kort plot)
                const enrichedRatings = await Promise.all(
                    ratings.map(async (r) => {
                        try {
                            const title = await mdb.apiv2.titles.getById(r.titleId, authOptions); // Hent tilhoerende titel
                            return {
                                ...r,
                                title: title?.name ?? title?.title ?? 'Unknown',
                                poster: title?.image ?? placeholderImage,
                                startYear: title?.startYear ?? title?.releaseDate ?? null,
                                mediaType: title?.mediaType ?? 'unknown',
                                plotPre: title?.plot ? String(title.plot).slice(0, 200) : '',
                                pageId: title?.pageId ?? null,
                            };
                        } catch (err) { // Ved fejl, brug placeholders
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

                enrichedRatings.sort((a, b) => new Date(b.time) - new Date(a.time)); // Seneste foerst
                setRatedTitles(enrichedRatings); // Gem i state

                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, authOptions); // Hent bookmarks

                // Berig bookmarks: et pageId kan pege paa titel eller person
                const enrichedBookmarks = await Promise.all(
                    bookmarks.map(async (b) => {
                        try {
                            // Slaa op et pageId for at se om det er titel eller individ
                            const pageRef = await mdb.apiv2.page.getById(b.pageId, authOptions);

                            // API giver { pageId, tconst, iconst }
                            const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null; // Titel id
                            const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null; // Individ id

                            if (tconst) { // Hvis det er en titel
                                const title = await mdb.apiv2.titles.getById(tconst, authOptions); // Hent titel
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

                            if (iconst) { // Hvis det er en person
                                const individual = await mdb.apiv2.individuals.getById(iconst, authOptions); // Hent person
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

                            // Fallback hvis pageRef ikke har id'er
                            return {
                                ...b,
                                kind: 'unknown',
                                title: pageRef?.name ?? pageRef?.title ?? 'Unknown',
                                poster: pageRef?.image ?? placeholderImage,
                                plotPre: pageRef?.plot ? String(pageRef.plot).slice(0, 200) : '',
                                mediaType: 'unknown',
                                pageId: b.pageId,
                            };
                        } catch (err) { // Hvis vi ikke kan loese pageId
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
                setBookmarkedPages(enrichedBookmarks); // Gem i state
            } catch (err) {
                setError(err.message); // Gem fejl
            } finally {
                setLoading(false); // Sluk loader uanset udfald
            }
        };

        fetchUserData();
    }, [userId]);

    // Using shared `formatPlotPre` from utilities

    // get latest 3 bookmarks
    const latestBookmarks = bookmarkedPages.slice(0, 3);

    // Avatar og redigeringstilstand
    const [avatarUrl, setAvatarUrl] = useState(userData?.image || null); // Det billede vi viser nu
    const [originalAvatarUrl, setOriginalAvatarUrl] = useState(userData?.image || null); // Billede vi kan gaa tilbage til
    const [pendingAvatarFile, setPendingAvatarFile] = useState(null); // Fil valgt men ikke gemt endnu
    const [isEditMode, setIsEditMode] = useState(false); // Om brugeren er i rediger-tilstand
    const [shareMessage, setShareMessage] = useState(""); // Tekster til toasts/beskeder
    const [confirmDeleteRatingId, setConfirmDeleteRatingId] = useState(null); // Hvilken rating der skal slettes
    const [confirmDeleteBookmarkId, setConfirmDeleteBookmarkId] = useState(null); // Hvilket bookmark der skal slettes

    // Consider tokenUserId or userId may be string/number — compare as strings for robustness
    const isOwnProfile = isSignedIn && String(tokenUserId) === String(userId); // Sammenlign som tekst for sikkerhed

    const handleToggleEditMode = () => {
        if (!isOwnProfile) return; // Kun ejeren maa redigere
        const turningOff = isEditMode; // Vi er ved at slukke redigering?
        if (turningOff && pendingAvatarFile) { // Hvis vi lukker og der er valgt nyt billede
            (async () => {
                try {
                    const token = getStoredToken();
                    if (!token) throw new Error('Not authenticated'); // Skal vaere logget ind
                    // Konverter valgt fil til base64 og upload
                    const dataUrl = pendingAvatarFile ? await encodeImageToBase64(pendingAvatarFile) : null;
                    if (!dataUrl) throw new Error('No image data to upload');

                    // Brug v2 endpoint der gemmer profilbillede
                    await mdb.apiv2.user.upsertProfileImage(userId, dataUrl, { authToken: token });

                    setUserData((prev) => ({ ...(prev || {}), image: dataUrl })); // Opdater brugerobjektet
                    setOriginalAvatarUrl(dataUrl); // Nyt "original" til undo fremover
                    if (avatarUrl && avatarUrl.startsWith('blob:')) {
                        try { URL.revokeObjectURL(avatarUrl); } catch (e) {} // Ryd blob-URL fra hukommelse
                    }
                    setPendingAvatarFile(null); // Ingen ventende fil mere
                    setShareMessage('Profile image saved'); // Kort feedback
                    setTimeout(() => setShareMessage(''), 2000);
                } catch (err) {
                    console.error('Failed to save profile image', err);
                    setShareMessage('Failed to save image'); // Fejlbesked til brugeren
                    setTimeout(() => setShareMessage(''), 3000);
                }
            })();
        }

        setIsEditMode((prev) => !prev); // Skift til/fra redigering
    };

    // Del profil: kopierer URL eller viser fejl
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

    // Klik paa avatar: aabner filvalg hvis ejer og i redigering
    const handleAvatarClick = () => {
        if (!isOwnProfile || !isEditMode) return;
        fileInputRef.current?.click();
    };

    // Naar brugeren vaelger en ny avatar-fil
    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        // store original to allow undo
        if (!originalAvatarUrl) setOriginalAvatarUrl(avatarUrl || userData?.image || defaultAvatar);

        const newUrl = URL.createObjectURL(file);
        setPendingAvatarFile(file);
        setAvatarUrl(newUrl);

        // Behold valget kun i hukommelsen; upload foerst naar man slukker redigering

        // reset input so same file can be selected later
        event.target.value = null;
    };

    const handleUndoAvatar = () => {
        if (pendingAvatarFile && avatarUrl && avatarUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(avatarUrl); } catch (e) {} // Ryd midlertidig blob-URL
        }
        setPendingAvatarFile(null); // Drop valg
        setAvatarUrl(originalAvatarUrl || defaultAvatar); // Gaa tilbage til oprindelige billede
        if (fileInputRef.current) fileInputRef.current.value = null; // Nulstil file input
    };

    // Gaa til fuld ratings-liste for brugeren
    const handleBrowseAllRatings = () => {
        navigate(`/user/${userId}/ratings`);
    };

    // Gaa til fuld bookmark-liste for brugeren
    const handleBrowseAllBookmarks = () => {
        navigate(`/user/${userId}/bookmarks`);
    };

    // Slet bookmark via API
    const handleDeleteBookmark = async (pageId) => {
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

        setRemovingBookmarkId(pageId);
        try {
            const token = getStoredToken();
            const authOptions = token ? { authToken: token } : undefined;

            await mdb.apiv2.user.removeBookmark(userId, pageId, authOptions);

            setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId));
            setShareMessage("Bookmark removed.");
        } catch (err) {
            setShareMessage("Failed to remove bookmark: " + (err?.message ?? String(err)));
        } finally {
            setRemovingBookmarkId(null);
            setTimeout(() => setShareMessage(""), 2000);
        }
    };

    // Slet rating via API
    const handleDeleteRating = async (titleId) => {
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

        setRemovingRatingId(titleId);
        try {
            const token = getStoredToken();
            const authOptions = token ? { authToken: token } : undefined;

            await mdb.apiv2.user.removeRating(userId, titleId, authOptions);

            setRatedTitles((prev) => prev.filter((r) => r.titleId !== titleId));
            setShareMessage("Rating removed.");
        } catch (err) {
            setShareMessage("Failed to remove rating: " + (err?.message ?? String(err)));
        } finally {
            setRemovingRatingId(null);
            setTimeout(() => setShareMessage(""), 2000);
        }
    };

    return (
        <main className="container py-4">
            {loading && <LoadingState message="Loading user data..." />} {/* Viser spinner mens vi henter */}
            {error && <p className="text-danger">Error: {error}</p>} {/* Viser fejl hvis kald fejler */}
            {!loading && !error && userData && (
                <>
                    {/* Avatar: skjult filinput til upload */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="d-none"
                        onChange={handleAvatarFileChange}
                    />

                    <UserBanner
                        user_name={userData.name} // Brugernavn
                        email={userData.email} // Email vises i banner
                        createdAt={userData.createdAt} // Kontoens oprettelsesdato
                        ratingsCount={ratedTitles.length} // Antal ratings
                        bookmarksCount={bookmarkedPages.length} // Antal bookmarks
                        profile_image={avatarUrl || defaultAvatar} // Vist profilbillede
                        role={userData.role} // Rolle tekst
                        isOwnProfile={isOwnProfile} // Bruges til at styre knapper
                        isEditMode={isEditMode} // Viser redigeringsknapper
                        onEditClick={handleToggleEditMode} // Toggles redigering / gemmer avatar
                        onAvatarClick={handleAvatarClick} // Aabner filvalg
                        showUndo={!!pendingAvatarFile} // Viser fortryd hvis nyt billede ikke gemt
                        onUndoAvatar={handleUndoAvatar} // Fortryd avatarvalg
                        onShareClick={handleShareClick} // Kopier profil-link
                    />
                    {/* Seneste 3 ratings */}
                    <section className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Latest ratings</h3>
                            {ratedTitles.length > 0 && (
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

                                        {/* Rating og fjern-knap */}
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
                                                    onClick={() => setConfirmDeleteRatingId(item.titleId)}
                                                    disabled={removingRatingId === item.titleId}
                                                >
                                                        {removingRatingId === item.titleId ? 'Removing...' : 'Remove'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Seneste 3 bookmarks + knap til fuld liste */}
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

                                            {/* Titel og kort plot */}
                                            <div className="flex-grow-1">
                                                <div className="fs-5 fw-semibold">{item.title}</div>
                                                <div className="text-muted small">
                                                    {formatPlotPre(item.plotPre)}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Fjern bookmark knap */}
                                        {isOwnProfile && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger ms-auto"
                                                onClick={() => setConfirmDeleteBookmarkId(item.pageId)}
                                                disabled={removingBookmarkId === item.pageId}
                                            >
                                                {removingBookmarkId === item.pageId ? 'Removing...' : 'Remove'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <ToastConfirm
                        show={!!confirmDeleteRatingId} // Bekraeft slet rating
                        message="Delete this rating?"
                        onClose={() => setConfirmDeleteRatingId(null)}
                        onConfirm={async () => {
                            try {
                                await handleDeleteRating(confirmDeleteRatingId);
                            } catch (err) {
                                setShareMessage('Failed to delete rating.');
                                setTimeout(() => setShareMessage(''), 2500);
                            }
                        }}
                        onCancel={() => setConfirmDeleteRatingId(null)}
                    />

                    <ToastConfirm
                        show={!!confirmDeleteBookmarkId} // Bekraeft slet bookmark
                        message="Delete this bookmark?"
                        onClose={() => setConfirmDeleteBookmarkId(null)}
                        onConfirm={async () => {
                            try {
                                await handleDeleteBookmark(confirmDeleteBookmarkId);
                            } catch (err) {
                                setShareMessage('Failed to delete bookmark.');
                                setTimeout(() => setShareMessage(''), 2500);
                            }
                        }}
                        onCancel={() => setConfirmDeleteBookmarkId(null)}
                    />

                    <ToastConfirm
                        show={!!shareMessage} // Viser korte info-beskeder
                        message={shareMessage}
                        onClose={() => setShareMessage('')}
                    />
                </>
            )}
        </main>
    );
}