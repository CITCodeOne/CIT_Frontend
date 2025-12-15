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

    // Similar titles state
    const [similarTitles, setSimilarTitles] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(true);

    // Fetch similar titles
    useEffect(() => {
        const fetchSimilarTitles = async () => {
            try {
                setLoadingSimilar(true);
                const similar = await mdb.apiv2.titles.getSimilar(titleId);
                setSimilarTitles(similar || []);
            } catch (err) {
                console.error('Error fetching similar titles:', err);
                setSimilarTitles([]);
            } finally {
                setLoadingSimilar(false);
            }
        };

        if (titleId) {
            fetchSimilarTitles();
        }
    }, [titleId]);

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
            image={title.poster || placeholderImage}
            title={title.name || 'No Title'}
            subtitle={title.startYear ? `(${title.startYear})` : null}
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
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img
                                                src={actor.profilePath || placeholderImage}
                                                alt={actor.name}
                                                className="rounded-circle mb-3"
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    border: '3px solid #e0e0e0'
                                                }}
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
                            <RowComp
                                variant="grid"
                                items={cast}
                                renderItem={(actor) => (
                                    <MediaCard
                                        key={actor.id}
                                        id={actor.id}
                                        type="person"
                                        image={actor.profilePath}
                                        title={actor.name}
                                        subtitle={actor.character}
                                        size="large"
                                    />
                                )}
                            />
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Similar Movies Section with Carousel */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Similar Movies</h4>
                        {loadingSimilar ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : similarTitles.length === 0 ? (
                            <p className="text-muted">No similar titles available.</p>
                        ) : (
                            <>
                                {console.log('Similar titles for carousel:', similarTitles)}
                                {makeCarousel({
                                    items: similarTitles.map((similar) => {
                                        console.log('Mapping similar title:', similar);
                                        return (
                                            <MediaCard
                                                key={similar.id}
                                                id={similar.id}
                                                type="title"
                                                image={similar.image || similar.poster || placeholderImage}
                                                title={similar.name}
                                                subtitle={similar.startYear ? `(${similar.startYear})` : null}
                                                size="large"
                                            />
                                        );
                                    }),
                                    itemsPerSlide: 4,
                                    controls: true,
                                    indicators: false
                                })}
                            </>
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
                            <>
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
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </MainDisplay>
    );
}

export default Title;
