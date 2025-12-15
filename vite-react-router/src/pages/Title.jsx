import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import RowComp from '../components/RowComp';
import MediaCard from '../components/MediaCard';
import UserCard from '../components/UserCard';
import useTitleData from '../hooks/useTitleData';
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
    
    // Dummy auth (replace with real auth later)
    const userId = '55';
    const isLoggedIn = true;

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
        loadingUserRating,
        updateUserRating,
        deleteUserRating
    } = useTitleData(titleId, userId, isLoggedIn);

    // Local state for user review text (not saved to backend yet)
    const [userReviewText, setUserReviewText] = useState('');

    // Dummy data for similar titles (no API endpoint available)
    const dummySimilarTitles = [
        {
            id: 'tt0111161',
            name: 'The Green Mile',
            poster: placeholderImage
        },
        {
            id: 'tt0468569',
            name: 'The Dark Knight',
            poster: placeholderImage
        },
        {
            id: 'tt0137523',
            name: 'Fight Club',
            poster: placeholderImage
        }
    ];

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center loading-container">
            <Spinner animation="border" />
        </Container>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        </Container>
    );

    if (!title) return (
        <Container className="mt-5">
            <Alert variant="warning">No title found</Alert>
        </Container>
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
            {/* Cast Section */}
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

            {/* Similar Titles Section */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Similar Titles</h4>
                        <RowComp
                            variant="grid"
                            items={dummySimilarTitles}
                            renderItem={(similarTitle) => (
                                <MediaCard
                                    key={similarTitle.id}
                                    id={similarTitle.id}
                                    type="title"
                                    image={similarTitle.poster}
                                    title={similarTitle.name}
                                    actions={[
                                        {
                                            label: 'Info',
                                            variant: 'outline-primary',
                                            onClick: (id) => window.location.href = `/title/${id}`
                                        },
                                        {
                                            label: 'Rate',
                                            variant: 'outline-warning',
                                            onClick: (id) => window.location.href = `/title/${id}#reviews-section`
                                        }
                                    ]}
                                />
                            )}
                        />
                    </Card.Body>
                </Card>
            </Container>

            {/* Reviews Section */}
            <Container className="mt-4 mb-4" id="reviews-section">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Reviews</h4>
                        
                        {/* User Rating Box (if logged in) */}
                        {isLoggedIn && (
                            loadingUserRating ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            ) : (
                                <UserCard
                                    userId={userId}
                                    username="You"
                                    avatar={placeholderImage}
                                    rating={userRating}
                                    content={userReviewText}
                                    editable={true}
                                    showRating={true}
                                    onRatingChange={updateUserRating}
                                    onContentChange={setUserReviewText}
                                    onDelete={deleteUserRating}
                                    showDeleteButton={userRating > 0}
                                    maxContentLength={0}
                                    placeholder="Write your review here... (optional)"
                                />
                            )
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
