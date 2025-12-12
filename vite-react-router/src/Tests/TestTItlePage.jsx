import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import MainDisplay, { renderBadges, renderText } from '../components/MainDisplay';
import Rating from '../components/Rating';
import BookmarkButton from '../components/BookmarkButton';
import '../style/CTitlePage.css';

function TestTitlePage() {
    console.log('TestTitlePage rendering');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movieData, setMovieData] = useState(null);
    const [cast, setCast] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const API_KEY = '1e9eb1fdefa6a2d8c83ca92e5e5198ca';
                const MOVIE_ID = 278; // The Shawshank Redemption
                
                // Fetch movie details
                const movieResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${MOVIE_ID}?api_key=${API_KEY}`
                );
                if (!movieResponse.ok) throw new Error('Failed to fetch movie data');
                const movieData = await movieResponse.json();
                console.log('Fetched movie data:', movieData);
                setMovieData(movieData);

                // Fetch cast
                const creditsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${MOVIE_ID}/credits?api_key=${API_KEY}`
                );
                if (creditsResponse.ok) {
                    const creditsData = await creditsResponse.json();
                    setCast(creditsData.cast.slice(0, 3)); // Get first 3 cast members to match wireframe
                    console.log('Fetched cast:', creditsData.cast.slice(0, 3));
                }

                // Fetch similar movies
                const similarResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${MOVIE_ID}/similar?api_key=${API_KEY}`
                );
                if (similarResponse.ok) {
                    const similarData = await similarResponse.json();
                    setSimilarMovies(similarData.results.slice(0, 3)); // Get first 3 similar movies
                    console.log('Fetched similar movies:', similarData.results.slice(0, 3));
                }

                // Fetch reviews
                const reviewsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${MOVIE_ID}/reviews?api_key=${API_KEY}`
                );
                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData.results.slice(0, 3)); // Get first 3 reviews
                    console.log('Fetched reviews:', reviewsData.results.slice(0, 3));
                }

            } catch (err) {
                console.error('Error fetching movie:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, []);

    const handleBookmarkToggle = () => {
        setIsBookmarked(!isBookmarked);
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error Loading Movie</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    if (!movieData) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">No movie data available</Alert>
            </Container>
        );
    }

    // Prepare data for MainDisplay - matching wireframe header layout
    const header = {
        title: movieData.title,
        image: movieData.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
            : null,
        rating: movieData.vote_average,
        showBookmark: true,
        isBookmarked: isBookmarked,
        onBookmarkToggle: handleBookmarkToggle
    };

    const metadata = [
        { label: 'Release Date', value: movieData.release_date },
        { label: 'Runtime', value: `${movieData.runtime} minutes` }
    ];

    const sections = [
        {
            title: 'Genres',
            content: renderBadges(movieData.genres?.map(g => g.name) || [])
        },
        {
            title: 'Overview',
            content: renderText(movieData.overview)
        }
    ];

    return (
        <div className="title-page-background">
            {/* Main Display with Header */}
            <MainDisplay
                header={header}
                metadata={metadata}
                sections={sections}
            />

            {/* Cast Section - Circular Profile Pictures */}
            {cast.length > 0 && (
                <Container className="mt-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="mb-4">Cast</h4>
                            <Row className="justify-content-start">
                                {cast.map((actor) => (
                                    <Col key={actor.id} xs={4} md={4} className="mb-3">
                                        <div className="text-center">
                                            <div className="circular-image-120">
                                                <img
                                                    src={
                                                        actor.profile_path
                                                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                                            : 'https://via.placeholder.com/120?text=Picture'
                                                    }
                                                    alt={actor.name}
                                                />
                                            </div>
                                            <div className="mt-2 p-2 border rounded bg-white cast-name-box">
                                                <small className="d-block"><strong>{actor.name}</strong></small>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Container>
            )}

            {/* Similar Movies Section - Movie Posters with Info/Rate buttons */}
            {similarMovies.length > 0 && (
                <Container className="mt-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="mb-4">Similar Movies</h4>
                            <Row>
                                {similarMovies.map((movie) => (
                                    <Col key={movie.id} xs={12} sm={6} md={4} className="mb-3">
                                        <Card className="h-100 shadow-sm">
                                            <div className="poster-container">
                                                <img
                                                    src={
                                                        movie.poster_path
                                                            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                                            : 'https://via.placeholder.com/342x513?text=Movie+Poster'
                                                    }
                                                    alt={movie.title}
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
            )}

            {/* Reviews Section - Profile Picture, Rating Number, and Review Text */}
            {reviews.length > 0 && (
                <Container className="mt-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="mb-4">Reviews</h4>
                            {reviews.map((review) => (
                                <Card key={review.id} className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Row className="align-items-center">
                                            <Col xs={3} md={2} lg={1} className="text-center">
                                                <div className="circular-image-80">
                                                    <img
                                                        src={
                                                            review.author_details?.avatar_path
                                                                ? review.author_details.avatar_path.startsWith('/https')
                                                                    ? review.author_details.avatar_path.substring(1)
                                                                    : `https://image.tmdb.org/t/p/w185${review.author_details.avatar_path}`
                                                                : 'https://via.placeholder.com/80?text=Profile'
                                                        }
                                                        alt={review.author}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={3} md={2} lg={1} className="text-center">
                                                <div className="review-rating-box">
                                                    {review.author_details?.rating ? (
                                                        <div>
                                                            <strong className="review-rating-number">
                                                                {review.author_details.rating}
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
                                                    <div className="mb-2">
                                                        <strong>{review.author}</strong>
                                                    </div>
                                                    <p className="mb-0 text-muted review-text">
                                                        {review.content.length > 250
                                                            ? `${review.content.substring(0, 250)}...`
                                                            : review.content}
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
            )}
        </div>
    );
}

export default TestTitlePage;
