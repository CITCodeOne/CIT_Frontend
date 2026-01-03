// Hook der samler alt data og alle handlinger for en titel-side (detaljevisning)
import { useState, useEffect } from 'react'; // React hooks til tilstand og side-effekter
import mdb from '../business-logic-layer/ApiClient/ApiClient'; // Egen backend klient til API kald
import { getStoredToken } from '../components/utils/ExtractJwtData'; // Henter JWT token fra storage
import { normalizeDataUrl } from '../components/utils/profileImageUtils'; // Sikrer at profilbilleder kan vises som data-URL
import placeholderImage from '../pics/Image-not-found.png'; // Fallback billede hvis intet findes

/**
 * useTitleData Hook
 *
 * Dansk kort forklaring for ikke-kodere:
 * Denne funktion henter alt indhold til en titel-side: selve titlen, skuespillere, brugeranmeldelser,
 * bogmaerker og brugerens egen rating. Den giver ogsaa sma funktioner til at gemme/rette rating
 * og til at til- eller fravolge bogmaerker.
 *
 * @param {string} titleId - Id for titlen vi skal hente
 * @param {string} userId - Id for den loggede bruger (null hvis ikke logget ind)
 * @param {boolean} isLoggedIn - Om brugeren er logget ind lige nu
 * @param {string} pageId - Id for siden (bruges af bogmaerker)
 * @returns {object} Alt data og alle handlinger siden behoever
 */
export default function useTitleData(titleId, userId = null, isLoggedIn = false, pageId) {
    // Hovedtilstande for titel-siden
    const [title, setTitle] = useState(null); // Selve titeldata (navn, aar, billeder mv.)
    const [loading, setLoading] = useState(true); // Viser spinner mens vi henter titel
    const [error, setError] = useState(null); // Fejltekst hvis noget gaar galt

    // Skuespillere/personer medvirkende
    const [cast, setCast] = useState([]);
    const [loadingCast, setLoadingCast] = useState(true);

    // Bruger-anmeldelser og ratings fra andre
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Bogmaerke status for den loggede bruger
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Brugerens egen rating og anmeldelse
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [loadingUserRating, setLoadingUserRating] = useState(true);

    // 1. Fetch main title data
    useEffect(() => {
        const fetchTitleData = async () => {
            if (!titleId) return; // Ingen id = intet at hente

            try {
                setLoading(true);
                const titleData = await mdb.apiv2.titles.getById(titleId); // Hent titel fra backend
                setTitle(titleData);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load title'); // Vis venlig fejl
                setTitle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTitleData();
    }, [titleId]);

    // 2. Fetch cast/individuals data
    useEffect(() => {
        const fetchCast = async () => {
            if (!titleId) return; // Intet id = ingen cast at hente

            try {
                setLoadingCast(true);
                const castData = await mdb.apiv2.titles.getIndividuals(titleId); // Hent medvirkende

                // Format til MediaCard komponenten, saa UI kan vise navn og rolle
                const formattedCast = castData.map(person => ({
                    id: person.id,
                    pageId: person.pageId,
                    name: person.name || 'Unknown',
                    character: person.character || null,
                    profilePath: person.profilePath || placeholderImage
                }));

                setCast(formattedCast);
            } catch (err) {
                console.error('Failed to load cast:', err);
                setCast([]);
            } finally {
                setLoadingCast(false);
            }
        };

        fetchCast();
    }, [titleId]);

    // 3. Fetch reviews/ratings data
    useEffect(() => {
        const fetchReviews = async () => {
            if (!titleId) return; // Stop hvis ingen titel

            try {
                setLoadingReviews(true);
                const ratingsData = await mdb.apiv2.titles.getRatings(titleId); // Hent alle ratings og anmeldelser

                // Find unikke bruger-id'er, saa vi kan hente deres navne og profilbilleder
                const userIds = [...new Set(ratingsData.map(r => r.userId).filter(id => id))];

                // Hent brugerdata (navn, billede) for dem der har anmeldt
                let userMap = new Map();
                if (userIds.length > 0) {
                    const userPromises = userIds.map(id => mdb.apiv2.user.get(id));
                    const users = await Promise.all(userPromises);
                    userMap = new Map(users.map(u => [u.id, u]));
                }

                // Formater til UserCard komponenten, saa UI kan vise navn, tekst og billede
                const formattedReviews = ratingsData.map((rating, index) => {
                    const user = userMap.get(rating.userId);
                    const avatar = user && user.image ? normalizeDataUrl(user.image) : placeholderImage;
                    return {
                        id: rating.userId || index,
                        userId: rating.userId,
                        author: user ? user.name : 'Anonymous',
                        rating: rating.rating || 'N/A',
                        content: rating.reviewText || rating.content || 'No review content available.',
                        authorAvatar: avatar,
                        time: rating.time
                    };
                });

                setReviews(formattedReviews);
            } catch (err) {
                console.error('Failed to load reviews:', err);
                setReviews([]);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [titleId]);

    // 4. Tjek om titlen er bogmaerket (kun hvis bruger er logget ind)
    // TODO: Kalder korrekt med pageId (ikke titleId) som API forventer
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            // Krav: pageId skal findes, da API genkender bogmaerker via pageId
            if (!isLoggedIn || !userId || !pageId) {
                setIsBookmarked(false);
                return;
            }

            try {
                const token = getStoredToken();
                // Fetch user's bookmarks and check if this pageId is present
                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, { authToken: token });
                const bookmarkedSet = new Set((bookmarks || []).map(b => String(b.pageId)));
                setIsBookmarked(bookmarkedSet.has(String(pageId)));
            } catch (err) {
                console.error('Failed to check bookmark status:', err);
                setIsBookmarked(false);
            }
        };

        checkBookmarkStatus();
    }, [pageId, userId, isLoggedIn]);

    // 5. Hent brugerens egen rating for titlen (kun hvis logget ind)
    useEffect(() => {
        const fetchUserRating = async () => {
            if (!isLoggedIn || !userId || !titleId) {
                setLoadingUserRating(false);
                setUserRating(0);
                return;
            }

            try {
                setLoadingUserRating(true);
                const token = getStoredToken();
                const rating = await mdb.apiv2.user.getRating(userId, titleId, { authToken: token });
                setUserRating(rating?.rating || 0);
                setUserReview(rating?.reviewText || '');
            } catch (err) {
                console.error('Failed to fetch user rating:', err);
                setUserRating(0);
            } finally {
                setLoadingUserRating(false);
            }
        };

        fetchUserRating();
    }, [titleId, userId, isLoggedIn]);

    // Skifter bogmaerke til/fra for logget bruger
    const toggleBookmark = async () => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to bookmark titles');
            return;
        }

        try {
            const token = getStoredToken();
            if (isBookmarked) {
                await mdb.apiv2.user.removeBookmark(userId, pageId, { authToken: token });
                setIsBookmarked(false);
            } else {
                await mdb.apiv2.user.addBookmark(userId, pageId, { authToken: token });
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    // Tilfoej eller opdater rating (med valgfri tekstanmeldelse)
    const updateUserRating = async (newRating, reviewText = '') => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to rate titles');
            return;
        }

        try {
            const token = getStoredToken();
            const review = reviewText && reviewText.trim() ? reviewText.trim() : null;

            if (userRating === 0) {
                // Add new rating
                await mdb.apiv2.user.addRating(userId, titleId, newRating, review, { authToken: token });
            } else {
                // Update existing rating
                await mdb.apiv2.user.updateRating(userId, titleId, newRating, review, { authToken: token });
            }
            setUserRating(newRating);
            setUserReview(reviewText);
        } catch (err) {
            console.error('Failed to update rating:', err);
            alert('Failed to update rating. Please try again.');
        }
    };

    // Slet brugerens rating
    const deleteUserRating = async () => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to delete ratings');
            return;
        }
        // Confirmation is handled by the page UI (toast/confirm there). The hook only performs deletion.

        try {
            const token = getStoredToken();
            await mdb.apiv2.user.removeRating(userId, titleId, { authToken: token });
            setUserRating(0);
            setUserReview('');
        } catch (err) {
            console.error('Failed to delete rating:', err);
            alert('Failed to delete rating. Please try again.');
        }
    };

    // Return all data and handlers
    return {
        // Title data
        title,
        loading,
        error,

        // Cast data
        cast,
        loadingCast,

        // Reviews data
        reviews,
        loadingReviews,

        // Bookmark data
        isBookmarked,
        toggleBookmark,

        // User rating and review data
        userRating,
        userReview,
        setUserReview,
        loadingUserRating,
        updateUserRating,
        deleteUserRating
    };
}
