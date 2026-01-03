// Viser alle ratings en bruger har lavet, og lader ejeren fjerne sine ratings
import { useState, useEffect } from "react"; // React hooks til tilstand og side-effekter
import { useParams, Link } from "react-router-dom"; // Laeser bruger-id fra URL og laver sikre links
import RowComp from "../components/RowList"; // Genbrugsliste der tegner kort i rader
import Rating from "../components/Rating"; // Stjerner og talvisning af rating
import placeholderImage from "../pics/Image-not-found.png"; // Fallback billede hvis vi mangler plakat
import useAuthStatus from "../hooks/useAuthStatus"; // Fortaeller om vi er logget ind og hvilket bruger-id vi har
import { getStoredToken } from "../components/utils/ExtractJwtData"; // Henter JWT token fra localStorage/sessionStorage
import mdb from "../business-logic-layer/ApiClient/ApiClient"; // Egen backend klient med alle API kald
import ToastConfirm from '../components/utils/ToastUtil'; // Lille dialog/toast til bekraeftelser og korte beskeder

export default function UserRatingsList() {
    const { userId } = useParams(); // Id paa profilen vi kigger paa (fra URL)
    const { isSignedIn, userId: tokenUserId } = useAuthStatus(); // Status for om vi er logget ind + vores eget id
    const isOwnProfile = isSignedIn && String(tokenUserId) === String(userId); // Er det her min egen profil?
    const isLoggedIn = isSignedIn; // Alias for laesevenlighed

    // Tilstand for data og status
    const [ratedTitles, setRatedTitles] = useState([]); // Alle ratings vi viser, beriget med titeldata
    const [loading, setLoading] = useState(true); // Viser spinner/tekst mens vi henter
    const [error, setError] = useState(null); // Fejlbesked hvis noget gaar galt
    const [removingId, setRemovingId] = useState(null); // Hvilket rating-id er ved at blive slettet lige nu
    const [confirmDeleteRatingId, setConfirmDeleteRatingId] = useState(null); // Hvilket rating beder vi om bekraeftelse paa at slette

    const [message, setMessage] = useState(""); // Kort besked til bruger (toast)

    const handleRemoveRating = async (titleId) => {
        // Brugeren skal vaere logget ind og eje profilen for at maatte slette sin rating
        if (!isLoggedIn || !isOwnProfile) {
            setMessage("You are not authorized to remove this rating.");
            setTimeout(() => setMessage(""), 2000);
            return;
        }

        setRemovingId(titleId); // Viser "Removing..." paa korrekt knap
        try {
            const token = getStoredToken(); // Hent JWT hvis den findes
            const authOptions = token ? { authToken: token } : undefined; // Sendes med til API hvis vi har token

            await mdb.apiv2.user.removeRating(userId, titleId, authOptions); // Kald backend for at fjerne rating

            setRatedTitles((prev) => prev.filter((r) => r.titleId !== titleId)); // Opdater UI straks
            setMessage("Rating removed.");
        } catch (err) {
            // Viser menneskevenlig fejl hvis noget fejler
            setMessage("Failed to remove rating: " + (err?.message ?? String(err)));
        } finally {
            setRemovingId(null); // Sluk spinner-tekst
            setTimeout(() => setMessage(""), 1500); // Ryd besked efter kort tid
        }
    };

    useEffect(() => {
        // Henter alle ratings for profilen, beriger dem med titeldata og sorterer nyeste foerst
        let cancelled = false; // Beskytter mod at saette state hvis komponenten unmountes midt i fetch

        const fetchRatings = async () => {
            try {
                setLoading(true); // Vis laesse-tekst
                setError(null); // Nulstil fejl

                const token = getStoredToken(); // Hent token hvis vi har en
                const authOptions = token ? { authToken: token } : undefined; // Bruges kun hvis tilgaengelig

                const ratings = await mdb.apiv2.user.getRatings(userId, authOptions); // Hent alle ratings for bruger

                // Berig hver rating med titelinfo (navn, billede, aar, side-id)
                const enrichedRatings = await Promise.all(
                    ratings.map(async (r) => {
                        try {
                            const title = await mdb.apiv2.titles.getById(r.titleId, authOptions); // Hent titel-oplysninger
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
                            // Hvis vi ikke kan hente titeldata, viser vi en simpel fallback i stedet for at crashe
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

                enrichedRatings.sort((a, b) => new Date(b.time) - new Date(a.time)); // Seneste rating foerst
                if (!cancelled) setRatedTitles(enrichedRatings); // Kun opdater hvis komponenten stadig er aktiv
            } catch (err) {
                if (!cancelled) setError(err?.message ?? String(err)); // Viser fejltekst hvis kald fejler
            } finally {
                if (!cancelled) setLoading(false); // Sluk laesse-tekst
            }
        };

        fetchRatings();

        return () => { cancelled = true; }; // Cleanup: marker at vi ikke maa saette state efter unmount
    }, [userId]);

    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Your reviews:</h2> {/* Simpel overskrift for siden */}

            {loading && <p>Loading ratings...</p>} {/* Viser laesse-tekst mens data hentes */}
            {error && <p className="text-danger">Error: {error}</p>} {/* Viser fejl hvis noget gik galt */}

            {!loading && !error && ratedTitles.length === 0 && (
                <p className="text-muted">You have not rated any titles yet.</p> // Tomt state tekst
            )}

            {!loading && !error && ratedTitles.length > 0 && (
                <RowComp
                    variant="list"
                    items={ratedTitles}
                    renderItem={(item) => (
                        <div className="d-flex w-100 h-100 bg-white rounded-4 overflow-hidden align-items-center">
                            <Link
                                to={`/page/${item.pageId ?? ""}`}
                                className="d-flex align-items-center gap-3 text-decoration-none text-reset"
                                style={{ flex: 1 }}
                            >
                                {/* Plakatbillede: viser film/serie-billede med fallback hvis mangler */}
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
                                        } catch (err) {
                                            /* ignore */
                                        }
                                    }}
                                />

                                {/* Titel, aar og typen af medie (film/serie/spil) */}
                                <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 className="mb-1 fs-5">
                                        {item.title}{" "}
                                        {item.startYear && (
                                            <span className="text-muted">({item.startYear})</span>
                                        )}
                                    </h3>
                                    <p className="mb-1 text-muted small">{item.mediaType}</p>
                                </div>
                            </Link>

                            {/* Rating-visning og slet-knap (kun hvis det er egen profil) */}
                            <div
                                className="d-flex align-items-center justify-content-center px-3 rounded-end-4"
                                style={{ minWidth: "90px", backgroundColor: "#ffffff" }}
                            >
                                <Rating
                                    initialRating={item.rating}
                                    editable={false}
                                    showNumber={true}
                                />
                                {isOwnProfile && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger ms-2"
                                            onClick={() => setConfirmDeleteRatingId(item.titleId)}
                                            disabled={removingId === item.titleId}
                                        >
                                            {removingId === item.titleId ? 'Removing...' : 'Remove'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                />
            )}

            {/* Bekraeftelses-popop: brugeren faar et ekstra klik foer vi sletter rating */}
            <ToastConfirm
                show={!!confirmDeleteRatingId}
                message="Delete this rating?"
                onClose={() => setConfirmDeleteRatingId(null)}
                onConfirm={async () => {
                    try {
                        await handleRemoveRating(confirmDeleteRatingId);
                    } catch (err) {
                        setMessage('Failed to delete rating.');
                        setTimeout(() => setMessage(''), 2000);
                    }
                }}
                onCancel={() => setConfirmDeleteRatingId(null)}
            />

            {/* Simpel toast til korte beskeder (fejl eller succes) */}
            <ToastConfirm
                show={!!message}
                message={message}
                onClose={() => setMessage('')}
            />
        </main>
    );
}