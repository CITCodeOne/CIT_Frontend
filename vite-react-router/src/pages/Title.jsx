import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Row, Col, Card, Button } from 'react-bootstrap';
import { getTitleById, getTitleCast, getSimilarTitles, getTitleReviews } from '../config/api';
import MainDisplay, { renderBadges, renderText } from '../components/MainDisplay';
import '../style/CTitlePage.css';

/**
 * Title Page Component
 * 
 * Displays detailed information about a specific title including cast, similar titles, and reviews.
 * Fetches data from multiple API endpoints and renders using MainDisplay component.
 */

// ============================================
// Helper Components
// ============================================

/**
 * CastSection - Displays cast members with circular profile images
 * Shows up to 3 cast members with names and character information
 */
const CastSection = ({ cast }) => {
    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <h4 className="mb-4">Cast</h4>
                    {cast?.length > 0 ? (
                        <Row className="justify-content-start">
                            {cast.slice(0, 3).map((actor) => (
                                <Col key={actor.id} xs={4} md={4} className="mb-3">
                                    <div className="text-center">
                                        <div className="circular-image-120">
                                            <img
                                                src={actor.profilePath || actor.poster || 'https://via.placeholder.com/120?text=Picture'}
                                                alt={actor.name}
                                            />
                                        </div>
                                        <div className="mt-2 p-2 border rounded bg-white cast-name-box">
                                            <small className="d-block"><strong>{actor.name}</strong></small>
                                            {actor.character && <small className="text-muted">{actor.character}</small>}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Alert variant="info">
                            Cast information is coming soon! Backend endpoint needed: <code>GET /api/titles/:id/cast</code>
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

/**
 * SimilarTitlesSection - Displays similar titles with poster images
 * Shows up to 3 similar titles with Info and Rate buttons
 */
const SimilarTitlesSection = ({ similarTitles }) => {
    if (!similarTitles?.length) return null;

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <h4 className="mb-4">Similar Titles</h4>
                    <Row>
                        {similarTitles.slice(0, 3).map((title) => (
                            <Col key={title.id} xs={12} sm={6} md={4} className="mb-3">
                                <Card className="h-100 shadow-sm">
                                    <div className="poster-container">
                                        <img
                                            src={title.poster || 'https://via.placeholder.com/342x513?text=Movie+Poster'}
                                            alt={title.name || title.title}
                                        />
                                    </div>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between similar-buttons">
                                            <Button variant="outline-primary" size="sm">Info</Button>
                                            <Button variant="outline-warning" size="sm">Rate</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

/**
 * ReviewsSection - Displays user reviews with ratings
 * Shows up to 3 reviews with author avatar, rating, and truncated content
 */
const ReviewsSection = ({ reviews }) => {
    if (!reviews?.length) return null;

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <h4 className="mb-4">Reviews</h4>
                    {reviews.slice(0, 3).map((review) => (
                        <Card key={review.id} className="mb-3 shadow-sm">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col xs={3} md={2} lg={1} className="text-center">
                                        <div className="circular-image-80">
                                            <img
                                                src={review.authorAvatar || 'https://via.placeholder.com/80?text=Profile'}
                                                alt={review.author}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={3} md={2} lg={1} className="text-center">
                                        <div className="review-rating-box">
                                            {review.rating ? (
                                                <div>
                                                    <strong className="review-rating-number">
                                                        {review.rating}
                                                    </strong>
                                                    <div className="review-rating-scale">/10</div>
                                                </div>
                                            ) : (
                                                <span className="review-rating-na">N/A</span>
                                            )}
                                        </div>
                                    </Col>
                                    <Col xs={12} md={8} lg={10} className="mt-3 mt-md-0">
                                        <div className="border rounded p-3 bg-white review-content-box">
                                            <div className="mb-2"><strong>{review.author}</strong></div>
                                            <p className="mb-0 text-muted review-text">
                                                {review.content?.length > 250
                                                    ? `${review.content.substring(0, 250)}...`
                                                    : review.content || 'No review text available'}
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Card.Body>
            </Card>
        </Container>
    );
};

// ============================================
// Main Component
// ============================================

function Title() {
    const { titleId } = useParams();
    const [title, setTitle] = useState(null);
    const [cast, setCast] = useState([]);
    const [similarTitles, setSimilarTitles] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Fetch title data and related information on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const titleData = await getTitleById(titleId);
                setTitle(titleData);
                
                // Fetch related data in parallel
                const [castData, similarData, reviewsData] = await Promise.allSettled([
                    getTitleCast(titleId),
                    getSimilarTitles(titleId),
                    getTitleReviews(titleId)
                ]);
                
                if (castData.status === 'fulfilled') setCast(castData.value || []);
                if (similarData.status === 'fulfilled') setSimilarTitles(similarData.value || []);
                if (reviewsData.status === 'fulfilled') setReviews(reviewsData.value || []);
                
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load title');
            } finally {
                setLoading(false);
            }
        };

        if (titleId) fetchAllData();
    }, [titleId]);

    // Toggle bookmark status (TODO: integrate with API)
    const handleBookmarkToggle = () => {
        setIsBookmarked(!isBookmarked);
        // TODO: Call API to save bookmark
    };

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

    // Prepare data structure for MainDisplay component
    const header = {
        image: title.poster,
        title: title.name || 'No Title',
        subtitle: title.startYear ? `(${title.startYear})` : null,
        rating: title.avgRating,
        showBookmark: true,
        isBookmarked,
        onBookmarkToggle: handleBookmarkToggle
    };

    const metadata = [
        title.mediaType && { badge: true, value: title.mediaType, badgeColor: 'secondary' },
        title.runtime > 0 && { label: 'Runtime', value: `${title.runtime} min` },
        title.startYear && { label: 'Year', value: title.startYear }
    ].filter(Boolean);

    const sections = [
        title.genres?.length > 0 && {
            title: 'Genres',
            content: renderBadges(title.genres.map(g => g.name))
        },
        {
            title: 'Overview',
            content: renderText(title.plotPre || title.plot, 'No plot available')
        }
    ].filter(Boolean);

    return (
        <div className="title-page-background">
            <MainDisplay 
                header={header}
                metadata={metadata}
                sections={sections}
            />
            
            <CastSection cast={cast} />
            <SimilarTitlesSection similarTitles={similarTitles} />
            <ReviewsSection reviews={reviews} />
        </div>
    );
}

export default Title;
