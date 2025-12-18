import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Button, Row, Col } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import UserCard from '../components/UserCard';
import ToggleButton from '../components/ToggleButton';
import makeCarousel from '../components/MakeCarousel';
import { LoadingState, ErrorState, NotFoundState } from '../components/PageStates';
import SignInOffcanvas from '../components/SignInOffcanvas';
import { getStoredToken } from '../components/utils/ExtractJwtData';
import { normalizeDataUrl } from '../components/utils/profileImageUtils';
import useTitleData from '../hooks/useTitleData';
import useAuthStatus from '../hooks/useAuthStatus';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import tmdb from '../business-logic-layer/TmdbIntegration';
import placeholderImage from '../pics/Image-not-found.png';
import '../style/CTitlePage.css';

/**
 * Title Page - Display movie/show details with cast, reviews, and similar titles
 */

function Title() {
    const { pageId, titleId, } = useParams();
    const navigate = useNavigate();
    const { isSignedIn, userId } = useAuthStatus();

    const {
        title,
        loading,
        error,
        cast,
        loadingCast,
        reviews,
        loadingReviews,
        isBookmarked,
        toggleBookmark,
        userRating,
        userReview,
        setUserReview,
        loadingUserRating,
        updateUserRating,
        deleteUserRating
    } = useTitleData(titleId, userId, isSignedIn, pageId); //Parsed page id from URL as required by api.client bookmark calls on main title

    // Local state
    const [tempRating, setTempRating] = useState(0);
    const [tempReviewText, setTempReviewText] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null);
    const [showSignIn, setShowSignIn] = useState(false);
    const [tmdbPoster, setTmdbPoster] = useState(null);
    const [castPhotos, setCastPhotos] = useState({});
    const [mdbSimilarTitles, setMdbSimilarTitles] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const [similarBookmarks, setSimilarBookmarks] = useState({});
    const [similarPosters, setSimilarPosters] = useState({});
    const [userAvatar, setUserAvatar] = useState(placeholderImage);

    // Fetch TMDB poster
    useEffect(() => {
        const fetchPoster = async () => {
            if (title?.name && title?.mediaType) {
                try {
                    const posterUrl = await tmdb.getTitlePoster(
                        title.name,
                        title.mediaType,
                        title.startYear
                    );
                    if (posterUrl) setTmdbPoster(posterUrl);
                } catch (err) {
                    console.error('Error fetching TMDB poster:', err);
                }
            }
        };
        fetchPoster();
    }, [title]);

    // Fetch TMDB cast photos
    useEffect(() => {
        const fetchCastPhotos = async () => {
            if (cast && cast.length > 0) {
                try {
                    const actorNames = cast.map(actor => actor.name);
                    const photos = await tmdb.getMultiplePersonPhotos(actorNames);
                    setCastPhotos(photos);
                } catch (err) {
                    console.error('Error fetching cast photos:', err);
                }
            }
        };
        fetchCastPhotos();
    }, [cast]);

    // Fetch similar titles (backend API only)
    useEffect(() => {
        const fetchSimilarTitles = async () => {
            if (!titleId) return;

            try {
                setLoadingSimilar(true);
                const backendSimilar = await mdb.apiv2.titles.getSimilar(titleId);

                if (backendSimilar && backendSimilar.length > 0) {
                    setMdbSimilarTitles(backendSimilar.slice(0, 20));
                } else {
                    setMdbSimilarTitles([]);
                }
            } catch (err) {
                console.error('Error fetching similar titles:', err);
                setMdbSimilarTitles([]);
            } finally {
                setLoadingSimilar(false);
            }
        };

        fetchSimilarTitles();
    }, [titleId, title]);

    // Fetch TMDB posters for similar titles
    useEffect(() => {
        const fetchSimilarPosters = async () => {
            if (mdbSimilarTitles.length === 0) {
                setSimilarPosters({});
                return;
            }

            try {
                const posterPromises = mdbSimilarTitles.map(async (similar) => {
                    try {
                        // Use pageId as the canonical key for similar titles
                        const key = similar.pageId || similar.id || null;

                        // If the similar title already has a poster from MDB API, use it
                        if (similar.poster) {
                            return { key, poster: similar.poster };
                        }

                        // Otherwise, fetch it from TMDB
                        const posterUrl = await tmdb.getTitlePoster(
                            similar.name,
                            similar.mediaType || 'movie',
                            similar.startYear
                        );
                        return { key, poster: posterUrl };
                    } catch (err) {
                        console.error(`Error fetching poster for ${similar.name}:`, err);
                        return { key: similar.pageId || similar.id || null, poster: null };
                    }
                });

                const posterResults = await Promise.all(posterPromises);
                const posterMap = {};
                posterResults.forEach(({ key, poster }) => {
                    if (key && poster) posterMap[String(key)] = poster;
                });
                setSimilarPosters(posterMap);
            } catch (err) {
                console.error('Error fetching similar title posters:', err);
            }
        };

        fetchSimilarPosters();
    }, [mdbSimilarTitles]);

    // Check bookmark status for similar titles (fetch bookmarks once)
    useEffect(() => {
        const checkSimilarBookmarks = async () => {
            if (!isSignedIn || !userId || mdbSimilarTitles.length === 0) {
                setSimilarBookmarks({});
                return;
            }

            try {
                const token = getStoredToken();
                // Fetch all bookmarks for the user in one call
                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, { authToken: token });

                const bookmarkedSet = new Set((Array.isArray(bookmarks) ? bookmarks : []).map(b => String(b.pageId)));

                const bookmarkMap = {};
                mdbSimilarTitles.forEach(similar => {
                    if (similar.pageId) bookmarkMap[similar.pageId] = bookmarkedSet.has(String(similar.pageId));
                });

                setSimilarBookmarks(bookmarkMap);
            } catch (err) {
                console.error('Error checking similar title bookmarks:', err);
                setSimilarBookmarks({});
            }
        };

        checkSimilarBookmarks();
    }, [isSignedIn, userId, mdbSimilarTitles]);

    // Fetch user avatar
    useEffect(() => {
        const fetchUserAvatar = async () => {
            if (!isSignedIn || !userId) {
                setUserAvatar(placeholderImage);
                return;
            }

            try {
                const user = await mdb.apiv2.user.get(userId);
                setUserAvatar(user && user.image ? normalizeDataUrl(user.image) : placeholderImage);
            } catch (err) {
                console.error('Failed to fetch user avatar:', err);
                setUserAvatar(placeholderImage);
            }
        };

        fetchUserAvatar();
    }, [isSignedIn, userId]);

    const handleSimilarTitleBookmark = async (similarTitleId, newState) => {
        if (!isSignedIn || !userId) {
            alert('Please sign in to bookmark titles');
            return;
        }

        try {
            const token = getStoredToken();
            if (newState) {
                await mdb.apiv2.user.addBookmark(userId, similarTitleId, { authToken: token });
            } else {
                await mdb.apiv2.user.removeBookmark(userId, similarTitleId, { authToken: token });
            }
            setSimilarBookmarks(prev => ({ ...prev, [similarTitleId]: newState }));
        } catch (err) {
            console.error('Error toggling similar title bookmark:', err);
        }
    };

    const navigateToIndividual = (person) => {
        const targetPageId = person?.pageId && person.pageId !== 'n/a' ? person.pageId : null;
        const targetIndividualId = person?.id && person.id !== 'n/a' ? person.id : null;

        if (!targetPageId || !targetIndividualId) return;

        navigate(`/page/${targetPageId}/individual/${targetIndividualId}`);
    };

    const handleSubmitReview = async () => {
        if (tempRating === 0) {
            alert('Please select a rating before submitting');
            return;
        }

        try {
            await updateUserRating(tempRating, tempReviewText);
            setSubmitStatus('success');
            setTimeout(() => setSubmitStatus(null), 3000);
        } catch (err) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 3000);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!title) return <NotFoundState message="No title found" />;

    const customTitle = (
        <div>
            {title.name || 'No Title'}{' '}
            {title.startYear && (
                <span className="title-year-text">({title.startYear})</span>
            )}
        </div>
    );

    const badges = [];
    if (title.mediaType) {
        badges.push({ text: title.mediaType, variant: 'primary' });
    }
    if (title.runtime > 0) {
        badges.push({ text: `${title.runtime} min`, variant: 'secondary' });
    }

    const sections = [];
    if (title.genres?.length > 0) {
        sections.push({
            title: 'Genres',
            content: title.genres.map((genre, index) => (
                <Badge key={index} bg="secondary" className="me-2">
                    {genre.name || genre}
                </Badge>
            ))
        });
    }
    if (title.plotPre || title.plot) {
        sections.push({
            title: 'Overview',
            content: <p className="text-muted">{title.plotPre || title.plot}</p>
        });
    }

    return (
        <MainDisplay
            image={tmdbPoster || title.image || placeholderImage}
            title={customTitle}
            subtitle={null}
            rating={title.rating}
            badges={badges}
            sections={sections}
            bookmark={{
                itemId: title.pageId,
                isBookmarked: isBookmarked,
                onToggle: toggleBookmark
            }}
        >
            {/* Top Cast */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Top Cast</h4>
                        {loadingCast ? (
                            <LoadingState message="Loading cast..." />
                        ) : cast.length === 0 ? (
                            <p className="text-muted">No cast information available.</p>
                        ) : (
                            <Row className="g-4 justify-content-center">
                                {cast.slice(0, 4).map((actor) => (
                                    <Col key={actor.pageId} xs={6} sm={4} md={3} lg={3} className="text-center">
                                        <div
                                            onClick={() => navigateToIndividual(actor)}
                                            className="top-cast-container"
                                        >
                                            <img
                                                src={castPhotos[actor.name] || actor.profilePath || placeholderImage}
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

            {/* Full Cast */}
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
                                        onClick={() => navigateToIndividual(actor)}
                                    >
                                        <img
                                            src={castPhotos[actor.name] || actor.profilePath || placeholderImage}
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

            {/* Similar Titles */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Similar Titles</h4>
                        {loadingSimilar ? (
                            <LoadingState message="Loading similar titles..." />
                        ) : mdbSimilarTitles.length === 0 ? (
                            <p className="text-muted">No similar titles available.</p>
                        ) : (
                            <div>
                                {makeCarousel(
                                    mdbSimilarTitles.map(similar => ({
                                        ...similar,
                                        title: similar.name,
                                        subtitle: similar.startYear ? `(${similar.startYear})` : null,
                                        isBookmarked: similarBookmarks[similar.pageId] || false,
                                        onBookmark: handleSimilarTitleBookmark
                                    })),
                                    'title',
                                    ({ item }) => (
                                        <div className="similar-title-card">

                                            <div
                                                className="similar-poster-container"
                                                onClick={() => navigate(`/page/${item.pageId}`)}
                                            >
                                                <img
                                                    src={similarPosters[item.pageId] || item.image || placeholderImage}
                                                    alt={item.name}
                                                    className="similar-poster-image"
                                                />
                                                <div className="similar-title-overlay">
                                                    <ToggleButton
                                                        itemId={item.pageId}
                                                        isActive={item.isBookmarked}
                                                        onToggle={item.onBookmark}
                                                        activeLabel="Remove bookmark"
                                                        inactiveLabel="Add bookmark"
                                                        className="similar-bookmark-btn"
                                                    >
                                                        {item.isBookmarked ? '★' : '☆'}
                                                    </ToggleButton>
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

            {/* Reviews */}
            <Container className="mt-4 mb-4" id="reviews-section">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Reviews</h4>

                        {!isSignedIn ? (
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
                        ) : loadingUserRating ? (
                            <LoadingState message="Loading your rating..." />
                        ) : (
                            <>
                                {submitStatus === 'success' && (
                                    <Card className="mb-3 border-success">
                                        <Card.Body className="text-success">
                                            ✓ Your review has been submitted successfully!
                                        </Card.Body>
                                    </Card>
                                )}
                                {submitStatus === 'error' && (
                                    <Card className="mb-3 border-danger">
                                        <Card.Body className="text-danger">
                                            ✗ Failed to submit review. Please try again.
                                        </Card.Body>
                                    </Card>
                                )}

                                <UserCard
                                    userId={userId}
                                    username="You"
                                    avatar={userAvatar}
                                    rating={tempRating || userRating}
                                    content={tempReviewText || userReview}
                                    editable={true}
                                    showRating={true}
                                    onRatingChange={(newRating) => setTempRating(newRating)}
                                    onContentChange={(text) => setTempReviewText(text)}
                                    onDelete={deleteUserRating}
                                    showDeleteButton={userRating > 0}
                                    maxContentLength={0}
                                    placeholder="Write your review here... (optional)"
                                />

                                {(tempRating > 0 || tempReviewText.trim()) && (
                                    <div className="text-end mt-2">
                                        <Button
                                            variant="primary"
                                            onClick={handleSubmitReview}
                                            disabled={tempRating === 0}
                                        >
                                            Submit Review
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {loadingReviews ? (
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
                                        maxContentLength={250}
                                    />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
            <SignInOffcanvas show={showSignIn} onClose={() => setShowSignIn(false)} />
        </MainDisplay>
    );
}

export default Title;
