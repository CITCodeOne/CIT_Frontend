import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Button, Alert, Row, Col } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import RowComp from '../components/RowList';
import MediaCard from '../components/MediaCard';
import UserCard from '../components/UserCard';
import makeCarousel from '../components/MakeCarousel';
import { LoadingState, ErrorState, NotFoundState } from '../components/PageStates';
import useTitleData from '../hooks/useTitleData';
import useAuthStatus from '../hooks/useAuthStatus';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import tmdb from '../business-logic-layer/TmdbIntegration';
import placeholderImage from '../pics/Image-not-found.png';
import '../style/CTitlePage.css';

/**
 * Title Page Component
 * 
 * Displays detailed information about a specific title including cast, similar titles, and reviews.
 * 
 * API Endpoints Used:
 * ✅ titles.getById(id) - Fetches main title data
 * ✅ titles.getIndividuals(id) - Fetches cast/crew data
 * ✅ titles.getRatings(id) - Fetches reviews/ratings
 * ✅ user.getBookmark(userId, titleId) - Checks bookmark status
 * ✅ user.addBookmark(userId, titleId) - Adds bookmark
 * ✅ user.removeBookmark(userId, titleId) - Removes bookmark
 * ✅ user.getRating(userId, titleId) - Fetches user's rating
 * ✅ user.addRating(userId, titleId, rating) - Adds new rating
 * ✅ user.updateRating(userId, titleId, rating) - Updates existing rating
 * 
 * Dummy Data (no endpoints available):
 * ❌ Similar Titles - using hardcoded dummy data
 */

function Title() {
    const { titleId } = useParams();
    const { isSignedIn, userId } = useAuthStatus();

    // Use custom hook for all data fetching and state management
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
    } = useTitleData(titleId, userId, isSignedIn);

    // Local state for temporary rating and review text
    const [tempRating, setTempRating] = useState(0);
    const [tempReviewText, setTempReviewText] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

    // TMDB Integration states
    const [tmdbPoster, setTmdbPoster] = useState(null);
    const [castPhotos, setCastPhotos] = useState({});
    const [tmdbSimilarTitles, setTmdbSimilarTitles] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

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

    // Fetch TMDB cast photos (parallel)
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

    // Fetch TMDB similar titles
    useEffect(() => {
        const fetchSimilarTitles = async () => {
            if (title?.name && title?.mediaType) {
                try {
                    setLoadingSimilar(true);
                    const similar = await tmdb.getSimilarTitles(
                        title.name,
                        title.mediaType,
                        title.startYear,
                        20
                    );
                    setTmdbSimilarTitles(similar || []);
                } catch (err) {
                    console.error('Error fetching similar titles:', err);
                    setTmdbSimilarTitles([]);
                } finally {
                    setLoadingSimilar(false);
                }
            }
        };
        fetchSimilarTitles();
    }, [title]);

    // Handle submitting rating and review
    const handleSubmitReview = async () => {
        if (tempRating === 0) {
            alert('Please select a rating before submitting');
            return;
        }

        try {
            await updateUserRating(tempRating, tempReviewText);
            setSubmitStatus('success');
            setTimeout(() => setSubmitStatus(null), 3000); // Clear success message after 3 seconds
        } catch (err) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 3000);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!title) return <NotFoundState message="No title found" />;

    // Create custom title with year styling
    const customTitle = (
        <div>
            {title.name || 'No Title'}{' '}
            {title.startYear && (
                <span className="title-year-text">({title.startYear})</span>
            )}
        </div>
    );

    // Prepare badges (mediaType, runtime)
    const badges = [];
    if (title.mediaType) {
        badges.push({ text: title.mediaType, variant: 'primary' });
    }
    if (title.runtime > 0) {
        badges.push({ text: `${title.runtime} min`, variant: 'secondary' });
    }

    // Prepare sections (Genres, Overview)
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
            image={tmdbPoster || title.poster || placeholderImage}
            title={customTitle}
            subtitle={null}
            rating={title.rating}
            badges={badges}
            sections={sections}
            bookmark={{
                itemId: title.id,
                isBookmarked: isBookmarked,
                onToggle: toggleBookmark
            }}
        >
            {/* Top Cast Section - Show only 4 */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Top Cast</h4>
                        {loadingCast ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : cast.length === 0 ? (
                            <p className="text-muted">No cast information available.</p>
                        ) : (
                            <Row className="g-4 justify-content-center">
                                {cast.slice(0, 4).map((actor) => (
                                    <Col key={actor.id} xs={6} sm={4} md={3} lg={3} className="text-center">
                                        <div 
                                            onClick={() => window.location.href = `/individual/${actor.id}`}
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

            {/* Full Cast Section */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Cast</h4>
                        {loadingCast ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : cast.length === 0 ? (
                            <p className="text-muted">No cast information available.</p>
                        ) : (
                            <div>
                                {cast.map((actor) => (
                                    <div 
                                        key={actor.id} 
                                        className="d-flex align-items-center p-3 mb-2 border rounded bg-white"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => window.location.href = `/individual/${actor.id}`}
                                    >
                                        <img
                                            src={castPhotos[actor.name] || actor.profilePath || placeholderImage}
                                            alt={actor.name}
                                            className="cast-thumbnail me-3"
                                            style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
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

            {/* Similar Titles Section with TMDB */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Similar Titles</h4>
                        {loadingSimilar ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : tmdbSimilarTitles.length === 0 ? (
                            <p className="text-muted">No similar titles available.</p>
                        ) : (
                            <div>
                                {makeCarousel(
                                    tmdbSimilarTitles.map(similar => ({
                                        ...similar,
                                        title: similar.name,
                                        subtitle: similar.startYear ? `(${similar.startYear})` : null
                                    })),
                                    'title'
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Reviews Section */}
            <Container className="mt-4 mb-4" id="reviews-section">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Reviews</h4>
                        
                        {/* User Rating Box - Always show, but prompt login if not signed in */}
                        {!isSignedIn ? (
                            <Card className="mb-4 bg-light">
                                <Card.Body className="text-center py-4">
                                    <p className="mb-2 text-muted">
                                        <strong>Want to leave a review?</strong>
                                    </p>
                                    <p className="text-muted">
                                        Please <a href="/signin" className="text-primary">sign in</a> to rate and review this title.
                                    </p>
                                </Card.Body>
                            </Card>
                        ) : loadingUserRating ? (
                            <div className="text-center py-3">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : (
                            <>
                                {submitStatus === 'success' && (
                                    <Alert variant="success" className="mb-3">
                                        ✓ Your review has been submitted successfully!
                                    </Alert>
                                )}
                                {submitStatus === 'error' && (
                                    <Alert variant="danger" className="mb-3">
                                        ✗ Failed to submit review. Please try again.
                                    </Alert>
                                )}
                                
                                <UserCard
                                    userId={userId}
                                    username="You"
                                    avatar={placeholderImage}
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
                                
                                {/* Submit Button */}
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

                        {/* All Reviews */}
                        {loadingReviews ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <p className="text-muted">No reviews available yet.</p>
                        ) : (
                            <RowComp
                                variant="list"
                                items={reviews}
                                renderItem={(review) => (
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
                                )}
                            />
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </MainDisplay>
    );
}

export default Title;
