import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import RowComp from "../components/RowList";
import Rating from "../components/Rating";
import placeholderImage from "../pics/Image-not-found.png";
import useAuthStatus from "../hooks/useAuthStatus";
import { getStoredToken } from "../components/utils/ExtractJwtData";
import mdb from "../business-logic-layer/ApiClient/ApiClient";

export default function UserRatingsList() {
    const { userId } = useParams();
    const { isSignedIn, userId: tokenUserId } = useAuthStatus();
    const isOwnProfile = isSignedIn && String(tokenUserId) === String(userId);
    const isLoggedIn = isSignedIn;

    const [ratedTitles, setRatedTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // message for local UI actions
    const [message, setMessage] = useState("");

    const handleRemoveRating = (titleId) => {
        if (!isLoggedIn || !isOwnProfile) {
            setMessage("You must be the profile owner to remove ratings.");
            setTimeout(() => setMessage(""), 2000);
            return;
        }
        setRatedTitles((prev) => prev.filter((r) => r.titleId !== titleId));
        setMessage("Rating removed.");
        setTimeout(() => setMessage(""), 1500);
    };

    useEffect(() => {
        let cancelled = false;

        const fetchRatings = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = getStoredToken();
                const authOptions = token ? { authToken: token } : undefined;

                const ratings = await mdb.apiv2.user.getRatings(userId, authOptions);

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
                if (!cancelled) setRatedTitles(enrichedRatings);
            } catch (err) {
                if (!cancelled) setError(err?.message ?? String(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRatings();

        return () => { cancelled = true; };
    }, [userId]);

    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Your reviews:</h2>

            {loading && <p>Loading ratings...</p>}
            {error && <p className="text-danger">Error: {error}</p>}

            {!loading && !error && ratedTitles.length === 0 && (
                <p className="text-muted">You have not rated any titles yet.</p>
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
                                        } catch (err) {
                                            /* ignore */
                                        }
                                    }}
                                />

                                {/* Title, year & media type */}
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

                            {/* Rating and Remove button */}
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
                                            onClick={() => handleRemoveRating(item.titleId)}
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                />
            )}

            {/* message popup*/}
            {message && (
                <div
                    className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-4 py-2 rounded-3 shadow"
                    style={{ zIndex: 1080, marginBottom: "1.5rem" }}
                >
                    {message}
                </div>
            )}
        </main>
    );
}