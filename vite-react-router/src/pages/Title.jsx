// Reagerer paa URL, data-hooks og visuelle komponenter
import { useState, useEffect } from 'react'; // React hooks til lokal tilstand og sideeffekter
import { useParams, useNavigate } from 'react-router-dom'; // Laeser URL parametre og navigerer
import { Container, Card, Badge, Spinner, Button, Row, Col } from 'react-bootstrap'; // UI byggeklodser
import MainDisplay from '../components/MainDisplay'; // Overordnet layout for detail-side
import UserCard from '../components/UserCard'; // Viser bruger eller anmelder info
import ToggleButton from '../components/ToggleButton'; // Simpel on/off knap til bookmarks
import makeCarousel from '../components/MakeCarousel'; // Hjaelper med vandret carousel render
import { LoadingState, ErrorState, NotFoundState } from '../components/PageStates'; // Standard tilstande
import SignInOffcanvas from '../components/SignInOffcanvas'; // Sidepanel til login prompt
import { getStoredToken } from '../components/utils/ExtractJwtData'; // Laeser JWT fra storage
import { normalizeDataUrl } from '../components/utils/profileImageUtils'; // Gor profilbilleder brugbare
import useTitleData from '../hooks/useTitleData'; // Custom hook der samler titeldata + handlinger
import useAuthStatus from '../hooks/useAuthStatus'; // Checker om bruger er logget ind
import mdb from '../business-logic-layer/ApiClient/ApiClient'; // Eget backend API klient
import tmdb from '../business-logic-layer/TmdbIntegration'; // TMDB helper til plakater/billeder
import placeholderImage from '../pics/Image-not-found.png'; // Fallback billede hvis intet findes
import ToastConfirm from '../components/utils/ToastUtil'; // Toast/dialog helper
import '../style/CTitlePage.css'; // CSS for denne side

/**
 * Title Page - Display movie/show details with cast, reviews, and similar titles
 */

function Title() {
    const { pageId, titleId } = useParams(); // Henter side-id og titel-id direkte fra URL
    const navigate = useNavigate(); // Bruges til at hoppe til andre sider (personer, titler)
    const { isSignedIn, userId } = useAuthStatus(); // Status for om brugeren er logget ind samt id

    // Henter al titelrelateret data og handlinger fra custom hook
    const {
        title, // Selve titel-objektet (navn, aar, plot, billeder)
        loading, // Loader-flag for hoveddata
        error, // Fejlbesked hvis kaldet fejler
        cast, // Liste over skuespillere
        loadingCast, // Loader-flag for cast
        reviews, // Liste over anmeldelser fra andre brugere
        loadingReviews, // Loader-flag for anmeldelser
        isBookmarked, // Om hovedtitlen er bookmarket af brugeren
        toggleBookmark, // Funktion der skifter bookmark state for hovedtitlen
        userRating, // Brugerens gemte rating
        userReview, // Brugerens gemte anmeldelse
        setUserReview, // Setter til lokal tekst (ikke brugt direkte her)
        loadingUserRating, // Loader-flag for egen rating/anmeldelse
        updateUserRating, // Gemmer/overskriver rating + tekst
        deleteUserRating // Sletter egen rating
    } = useTitleData(titleId, userId, isSignedIn, pageId); // pageId er paakraevet til bookmark kald

    // Lokal visnings- og UI-tilstand
    const [tempRating, setTempRating] = useState(0); // Midlertidig rating foer submit
    const [tempReviewText, setTempReviewText] = useState(''); // Midlertidig anmeldelsestekst foer submit
    const [submitStatus, setSubmitStatus] = useState(null); // Kan bruges til feedback (ikke vist lige nu)
    const [showSignIn, setShowSignIn] = useState(false); // Styrer visning af login-panel
    const [tmdbPoster, setTmdbPoster] = useState(null); // Plakat hentet fra TMDB
    const [castPhotos, setCastPhotos] = useState({}); // Kort: actor-navn -> foto-URL
    const [mdbSimilarTitles, setMdbSimilarTitles] = useState([]); // Lignende titler fra backend
    const [loadingSimilar, setLoadingSimilar] = useState(false); // Loader-flag for lignende titler
    const [similarBookmarks, setSimilarBookmarks] = useState({}); // Kort: pageId -> bookmarked bool
    const [similarPosters, setSimilarPosters] = useState({}); // Kort: pageId -> plakat-URL
    const [userAvatar, setUserAvatar] = useState(placeholderImage); // Viser brugerens billede eller fallback
    const [confirmDelete, setConfirmDelete] = useState(false); // Styrer dialog for sletning af rating
    const [toastMessage, setToastMessage] = useState(''); // Tekst til korte beskeder/toasts

    // Hoved-bookmark knap for selve titlen
    const handleMainBookmarkClick = async () => {
        if (!isSignedIn) {
            setToastMessage('Please sign in to bookmark titles.'); // Vis besked hvis ikke logget ind
            setShowSignIn(true); // Aabn login-panel
            setTimeout(() => setToastMessage(''), 2500); // Fjern besked efter kort tid
            return; // Stop tidligt
        }

        const willBeBookmarked = !isBookmarked; // Forventet ny tilstand efter toggle
        try {
            await toggleBookmark(); // Kalder hook-funktionen der rammer backend
            setToastMessage(willBeBookmarked ? 'Bookmark added.' : 'Bookmark removed.'); // Feedback til bruger
        } catch (err) {
            console.error('Failed toggling bookmark:', err);
            setToastMessage('Failed to update bookmark.'); // Fejlbesked
        } finally {
            setTimeout(() => setToastMessage(''), 2500); // Ryd besked efter 2.5s uanset udfald
        }
    };

    // Henter TMDB-plakat hvis vi kender navn og type
    useEffect(() => {
        const fetchPoster = async () => {
            if (title?.name && title?.mediaType) { // Kraever mindst navn og type (film/serie)
                try {
                    const posterUrl = await tmdb.getTitlePoster(
                        title.name, // Navn bruges til soegning
                        title.mediaType, // Film/serie afgoer TMDB endpoint
                        title.startYear // Aar hjaelper med at ramme den rette titel
                    );
                    if (posterUrl) setTmdbPoster(posterUrl); // Gem URL hvis fundet
                } catch (err) {
                    console.error('Error fetching TMDB poster:', err);
                }
            }
        };
        fetchPoster();
    }, [title]);

    // Henter TMDB-billeder til skuespillere
    useEffect(() => {
        const fetchCastPhotos = async () => {
            if (cast && cast.length > 0) { // Kun hvis vi har cast-data
                try {
                    const actorNames = cast.map(actor => actor.name); // Traek kun navne ud
                    const photos = await tmdb.getMultiplePersonPhotos(actorNames); // Batch-kald til TMDB
                    setCastPhotos(photos); // Gem kort med navn -> billede
                } catch (err) {
                    console.error('Error fetching cast photos:', err);
                }
            }
        };
        fetchCastPhotos();
    }, [cast]);

    // Henter lignende titler fra backend (ikke TMDB)
    useEffect(() => {
        const fetchSimilarTitles = async () => {
            if (!titleId) return; // Hvis vi ikke kender titel-id, stop

            try {
                setLoadingSimilar(true); // Slaa loader flag til
                const backendSimilar = await mdb.apiv2.titles.getSimilar(titleId); // Kald backend

                if (backendSimilar && backendSimilar.length > 0) {
                    setMdbSimilarTitles(backendSimilar.slice(0, 20)); // Begraens til 20 for overskuelighed
                } else {
                    setMdbSimilarTitles([]); // Ingen resultater
                }
            } catch (err) {
                console.error('Error fetching similar titles:', err);
                setMdbSimilarTitles([]); // Ryd ved fejl
            } finally {
                setLoadingSimilar(false); // Sluk loader igen
            }
        };

        fetchSimilarTitles();
    }, [titleId, title]);

    // Henter TMDB-plakater til lignende titler hvis backend ikke gav en
    useEffect(() => {
        const fetchSimilarPosters = async () => {
            if (mdbSimilarTitles.length === 0) {
                setSimilarPosters({}); // Tom liste -> intet at hente
                return;
            }

            try {
                const posterPromises = mdbSimilarTitles.map(async (similar) => {
                    try {
                        const key = similar.pageId || similar.id || null; // Brug pageId som noegle

                        if (similar.poster) {
                            return { key, poster: similar.poster }; // Brug backend-plakat hvis vi allerede har den
                        }

                        // Ellers bed TMDB om en plakat
                        const posterUrl = await tmdb.getTitlePoster(
                            similar.name, // Titelnavn
                            similar.mediaType || 'movie', // Default til film hvis ukendt
                            similar.startYear // Hjaelp til at finde korrekt titel
                        );
                        return { key, poster: posterUrl }; // Kan vaere null hvis ikke fundet
                    } catch (err) {
                        console.error(`Error fetching poster for ${similar.name}:`, err);
                        return { key: similar.pageId || similar.id || null, poster: null };
                    }
                });

                const posterResults = await Promise.all(posterPromises); // Vent paa alle async kald
                const posterMap = {}; // Byg nyt kort pageId -> plakat
                posterResults.forEach(({ key, poster }) => {
                    if (key && poster) posterMap[String(key)] = poster; // Gem kun hvis begge findes
                });
                setSimilarPosters(posterMap); // Opdater state
            } catch (err) {
                console.error('Error fetching similar title posters:', err);
            }
        };

        fetchSimilarPosters();
    }, [mdbSimilarTitles]);

    // Tjekker om lignende titler allerede er bookmarket (hentes samlet)
    useEffect(() => {
        const checkSimilarBookmarks = async () => {
            if (!isSignedIn || !userId || mdbSimilarTitles.length === 0) {
                setSimilarBookmarks({}); // Ryd hvis ingen bruger eller ingen titler
                return;
            }

            try {
                const token = getStoredToken(); // JWT til auth
                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, { authToken: token }); // Hent alle bookmarks

                const bookmarkedSet = new Set((bookmarks || []).map(b => String(b.pageId))); // Hurtig lookup

                const bookmarkMap = {}; // pageId -> true/false
                mdbSimilarTitles.forEach(similar => {
                    if (similar.pageId) bookmarkMap[similar.pageId] = bookmarkedSet.has(String(similar.pageId));
                });

                setSimilarBookmarks(bookmarkMap); // Opdater state saa knapper kan vise aktiv/inaktiv
            } catch (err) {
                console.error('Error checking similar title bookmarks:', err);
                setSimilarBookmarks({}); // Fald tilbage til tomt kort ved fejl
            }
        };

        checkSimilarBookmarks();
    }, [isSignedIn, userId, mdbSimilarTitles]);

    // Henter bruger-avatar til egne anmeldelser
    useEffect(() => {
        const fetchUserAvatar = async () => {
            if (!isSignedIn || !userId) {
                setUserAvatar(placeholderImage); // Brug fallback hvis ingen bruger
                return;
            }

            try {
                const user = await mdb.apiv2.user.get(userId); // Hent brugerprofil
                setUserAvatar(user && user.image ? normalizeDataUrl(user.image) : placeholderImage); // Normaliser data-URL hvis sat
            } catch (err) {
                console.error('Failed to fetch user avatar:', err);
                setUserAvatar(placeholderImage); // Fallback ved fejl
            }
        };

        fetchUserAvatar();
    }, [isSignedIn, userId]);

    const handleSimilarTitleBookmark = async (similarTitleId, newState) => {
        if (!isSignedIn || !userId) {
            setToastMessage('Please sign in to bookmark titles'); // Kraever login
            setShowSignIn(true); // Vis login-panel
            setTimeout(() => setToastMessage(''), 2500); // Ryd besked efter kort tid
            return;
        }

        try {
            const token = getStoredToken(); // JWT til auth
            if (newState) {
                await mdb.apiv2.user.addBookmark(userId, similarTitleId, { authToken: token }); // Tilfoej
            } else {
                await mdb.apiv2.user.removeBookmark(userId, similarTitleId, { authToken: token }); // Fjern
            }
            setSimilarBookmarks(prev => ({ ...prev, [similarTitleId]: newState })); // Optimistisk UI-opdatering
            setToastMessage(newState ? 'Bookmark added.' : 'Bookmark removed.'); // Feedback
        } catch (err) {
            console.error('Error toggling similar title bookmark:', err);
            setToastMessage('Failed to update bookmark.'); // Fejlfeedback
        } finally {
            setTimeout(() => setToastMessage(''), 2500); // Ryd besked
        }
    };

    const navigateToIndividual = (person) => {
        const targetPageId = person?.pageId && person.pageId !== 'n/a' ? person.pageId : null; // Valider pageId
        const targetIndividualId = person?.id && person.id !== 'n/a' ? person.id : null; // Valider individ-id

        if (!targetPageId || !targetIndividualId) return; // Stop hvis data mangler

        navigate(`/page/${targetPageId}/individual/${targetIndividualId}`); // Hop til personsiden
    };

    const handleSubmitReview = async () => {
        if (tempRating === 0) {
            alert('Please select a rating before submitting'); // Kraever mindst en rating
            return;
        }

        try {
            await updateUserRating(tempRating, tempReviewText); // Gem rating + tekst via hook
            setToastMessage('Your rating has been submitted.'); // Bekraeftelse
        } catch (err) {
            setToastMessage('Failed to submit review. Please try again.'); // Fejlfeedback
        } finally {
            setTimeout(() => setToastMessage(''), 3000); // Fjern besked efter 3s
        }
    };

    // Enkel tidlig retur for laese/fejl/404
    if (loading) return <LoadingState />; // Viser spinner mens data hentes
    if (error) return <ErrorState error={error} />; // Viser fejlkomponent med besked
    if (!title) return <NotFoundState message="No title found" />; // Hvis ingen titel blev fundet

    // Forbereder data til MainDisplay komponenten
    const customTitle = (
        <div>
            {title.name || 'No Title'}{' '}
            {title.startYear && (
                <span className="title-year-text">({title.startYear})</span>
            )}
        </div>
    ); // Viser navn og aar i samme titelblok

    const badges = []; // Smaa badges under titlen
    if (title.mediaType) {
        badges.push({ text: title.mediaType, variant: 'primary' }); // Film/serie badge
    }
    if (title.runtime > 0) {
        badges.push({ text: `${title.runtime} min`, variant: 'secondary' }); // Spilletid badge
    }

    const sections = []; // Sektioner der vises i MainDisplay
    if (title.genres?.length > 0) {
        sections.push({
            title: 'Genres',
            content: title.genres.map((genre, index) => (
                <Badge key={index} bg="secondary" className="me-2">
                    {genre.name || genre}
                </Badge>
            ))
        }); // Liste af genre badges
    }
    if (title.plotPre || title.plot) {
        sections.push({
            title: 'Overview',
            content: <p className="text-muted">{title.plotPre || title.plot}</p>
        }); // Viser beskrivelse/plot
    }

    return (
        <MainDisplay
            image={tmdbPoster || title.image || placeholderImage} // Viser TMDB-plakat, ellers backend, ellers fallback
            title={customTitle} // Navn + aar
            subtitle={null} // Ingen undertekst lige nu
            rating={title.rating} // Officiel rating fra data
            badges={badges} // Smaa badges under titlen
            sections={sections} // Tekstsektioner som genres og overview
            bookmark={{
                itemId: title.pageId, // Brug pageId som noegle for bookmark
                isBookmarked: isBookmarked, // Aktuel bookmark-tilstand
                onToggle: handleMainBookmarkClick // Handler der kalder backend og giver toast
            }}
        >
            {/* Top Cast - kvik visning af de mest kendte navne */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Top Cast</h4>
                        {loadingCast ? ( // Viser spinner mens cast loades
                            <LoadingState message="Loading cast..." />
                        ) : cast.length === 0 ? ( // Ingen cast fundet
                            <p className="text-muted">No cast information available.</p>
                        ) : (
                            <Row className="g-4 justify-content-center"> {/* Grid til top 4 cast */}
                                {cast.slice(0, 4).map((actor) => (
                                    <Col key={actor.pageId} xs={6} sm={4} md={3} lg={3} className="text-center">
                                        <div
                                            onClick={() => navigateToIndividual(actor)} // Klik gaar til personsiden
                                            className="top-cast-container"
                                        >
                                            <img
                                                src={castPhotos[actor.name] || actor.profilePath || placeholderImage} // TMDB foto, ellers backend, ellers fallback
                                                alt={actor.name}
                                                className="rounded-circle mb-3 top-cast-image"
                                            />
                                            <h6 className="mb-1">{actor.name}</h6>
                                            <p className="text-muted small mb-0">{actor.character}</p>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Full Cast - komplet liste */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Cast</h4>
                        {loadingCast ? (
                            <LoadingState message="Loading cast..." />
                        ) : cast.length === 0 ? (
                            <p className="text-muted">No cast information available.</p>
                        ) : (
                            <div>
                                {cast.map((actor) => (
                                    <div
                                        key={actor.pageId}
                                        className="d-flex align-items-center p-3 mb-2 border rounded bg-white cast-list-item"
                                        onClick={() => navigateToIndividual(actor)} // Klik gaar til personsiden
                                    >
                                        <img
                                            src={castPhotos[actor.name] || actor.profilePath || placeholderImage} // TMDB foto fallback
                                            alt={actor.name}
                                            className="cast-thumbnail me-3"
                                        />
                                        <div>
                                            <h6 className="mb-0">{actor.name}</h6>
                                            <p className="text-muted small mb-0">{actor.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Similar Titles - carousel med lignende titler */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Similar Titles</h4>
                        {loadingSimilar ? ( // Loader for lignende titler
                            <LoadingState message="Loading similar titles..." />
                        ) : mdbSimilarTitles.length === 0 ? (
                            <p className="text-muted">No similar titles available.</p>
                        ) : (
                            <div>
                                {makeCarousel(
                                    mdbSimilarTitles.map(similar => ({
                                        ...similar, // Behold resten af felterne
                                        title: similar.name, // Navn skal ind i komponentens forventede felt
                                        subtitle: similar.startYear ? `(${similar.startYear})` : null, // Aar i parentes hvis findes
                                        isBookmarked: similarBookmarks[similar.pageId] || false, // Brug lookup map
                                        onBookmark: handleSimilarTitleBookmark // Kald handler med id og ny state
                                    })),
                                    'title', // Noegle for carousel caching
                                    ({ item }) => (
                                        <div className="similar-title-card">

                                            <div
                                                className="similar-poster-container"
                                                onClick={() => navigate(`/page/${item.pageId}`)} // Klik gaar til titel-siden
                                            >
                                                <img
                                                    src={similarPosters[item.pageId] || item.image || placeholderImage} // TMDB plakat fallback
                                                    alt={item.name}
                                                    className="similar-poster-image"
                                                />
                                                <div className="similar-title-overlay">
                                                    <div className="bookmark-overlay">
                                                        <ToggleButton
                                                            itemId={item.pageId}
                                                            isActive={item.isBookmarked}
                                                            onToggle={item.onBookmark}
                                                            activeLabel="Remove bookmark"
                                                            inactiveLabel="Add bookmark"
                                                            className={`bookmark-btn ${item.isBookmarked ? 'bookmarked' : ''}`}
                                                        >
                                                            {item.isBookmarked ? '✓' : '+'}
                                                        </ToggleButton>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="similar-title-info text-center mt-2">
                                                <h6 className="mb-0 similar-title-name">{item.name}</h6>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Reviews - egne og andres vurderinger */}
            <Container className="mt-4 mb-4" id="reviews-section">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Reviews</h4>

                        {!isSignedIn ? ( // Hvis ikke logget ind, vis opfordring
                            <Card className="mb-4 bg-light">
                                <Card.Body className="text-center py-4">
                                    <p className="mb-2 text-muted">
                                        <strong>Want to leave a review?</strong>
                                    </p>
                                    <p className="text-muted">
                                        Please <Button variant="link" className="p-0 text-primary" onClick={() => setShowSignIn(true)}>sign in</Button> to rate and review this title.
                                    </p>
                                </Card.Body>
                            </Card>
                        ) : loadingUserRating ? ( // Hvis vi henter egen rating
                            <LoadingState message="Loading your rating..." />
                        ) : (
                            <>
                                {/* Feedback paa submit sker via ToastConfirm */}

                                <UserCard
                                    userId={userId}
                                    username="You"
                                    avatar={userAvatar}
                                    rating={tempRating || userRating} // Viser midlertidig rating hvis valgt
                                    content={tempReviewText || userReview} // Viser tekst der er tastet eller gemt
                                    editable={true}
                                    showRating={true}
                                    onRatingChange={(newRating) => setTempRating(newRating)} // Opdater midlertidig rating
                                    onContentChange={(text) => setTempReviewText(text)} // Opdater midlertidig tekst
                                    onDelete={() => setConfirmDelete(true)} // Aabn bekraeft for slet
                                    showDeleteButton={userRating > 0} // Kun vis slet hvis der findes rating
                                    maxContentLength={0}
                                    placeholder="Write your review here... (optional)"
                                />

                                {(tempRating > 0 || tempReviewText.trim()) && ( // Kun vis submit hvis der er indhold
                                    <div className="text-end mt-2">
                                        <Button
                                            variant="primary"
                                            onClick={handleSubmitReview}
                                            disabled={(tempRating === 0) && (userRating === 0)} // Bloker hvis ingen rating
                                        >
                                            Submit Review
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {loadingReviews ? ( // Loader for alle anmeldelser
                            <LoadingState message="Loading reviews..." />
                        ) : reviews.length === 0 ? (
                            <p className="text-muted">No reviews available yet.</p>
                        ) : (
                            <div>
                                {reviews.map((review) => (
                                    <UserCard
                                        key={review.id}
                                        userId={review.userId}
                                        username={review.author}
                                        avatar={review.authorAvatar}
                                        rating={review.rating}
                                        content={review.content}
                                        editable={false}
                                        showRating={true}
                                        maxContentLength={250} // Trimmer lang tekst i kort visning
                                    />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
            <ToastConfirm
                show={confirmDelete} // Styrer slet-bekraeftelse
                message="Delete your rating?"
                onClose={() => setConfirmDelete(false)}
                onConfirm={async () => {
                    try {
                        await deleteUserRating(); // Sletter rating via hook
                        setToastMessage('Rating deleted.');
                    } catch (err) {
                        setToastMessage('Failed to delete rating.');
                    }
                }}
                onCancel={() => setConfirmDelete(false)}
            />

            <ToastConfirm
                show={!!toastMessage} // Viser toasts for korte beskeder
                message={toastMessage}
                onClose={() => setToastMessage('')}
            />

            <SignInOffcanvas show={showSignIn} onClose={() => setShowSignIn(false)} />
        </MainDisplay>
    );
}

export default Title;
