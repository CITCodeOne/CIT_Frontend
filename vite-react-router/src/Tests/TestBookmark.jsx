import React, { useState } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import ToggleButton from '../components/ToggleButton';
import Rating from '../components/Rating';

function TestBookmark() {
    // State to track bookmarked items
    const [bookmarkedIds, setBookmarkedIds] = useState([2]); // Pre-bookmark item 2

    // Example movies
    const movies = [
        {
            id: 1,
            title: 'The Shawshank Redemption',
            year: 1994,
            rating: 9.3,
            duration: '2h 22m',
            plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
            genres: ['Drama', 'Crime'],
            image: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
        },
        {
            id: 2,
            title: 'The Godfather',
            year: 1972,
            rating: 9.2,
            duration: '2h 55m',
            plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
            genres: ['Crime', 'Drama'],
            image: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg'
        },
        {
            id: 3,
            title: 'The Dark Knight',
            year: 2008,
            rating: 9.0,
            duration: '2h 32m',
            plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.',
            genres: ['Action', 'Crime', 'Drama'],
            image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
        },
        {
            id: 4,
            title: 'Pulp Fiction',
            year: 1994,
            rating: 8.9,
            duration: '2h 34m',
            plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
            genres: ['Crime', 'Drama'],
            image: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'
        }
    ];

    // Handle bookmark toggle
    const handleToggle = (itemId, shouldBookmark) => {
        if (shouldBookmark) {
            setBookmarkedIds([...bookmarkedIds, itemId]);
            console.log(`Added bookmark: ${itemId}`);
        } else {
            setBookmarkedIds(bookmarkedIds.filter(id => id !== itemId));
            console.log(`Removed bookmark: ${itemId}`);
        }
    };

    // Check if item is bookmarked
    const isBookmarked = (itemId) => bookmarkedIds.includes(itemId);

    return (
        <div className="ContainerCstyle py-4">
            <h1 className="mb-4">Horizontal Cards with Bookmarks</h1>
            <p className="text-secondary mb-4">
                Layout matching your wireframe - image on left, preview on right with bookmark button.
            </p>

            <Container fluid>
                {/* Movies Section */}
                <div className="mb-4">
                    <h2 className="mb-3">Movies</h2>
                    
                    {movies.map((movie) => (
                        <Card 
                            key={movie.id}
                            className="mb-3"
                            style={{ 
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <Row className="g-0">
                                {/* Image Section - Left side with bookmark button */}
                                <Col md={3} sm={4}>
                                    <div style={{ position: 'relative', height: '100%' }}>
                                        <Card.Img
                                            src={movie.image}
                                            alt={movie.title}
                                            style={{
                                                height: '100%',
                                                minHeight: '250px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        
                                        {/* Bookmark Button Overlay - Top Left */}
                                        <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                                            <ToggleButton
                                                itemId={movie.id}
                                                isActive={isBookmarked(movie.id)}
                                                onToggle={handleToggle}
                                                activeLabel="Remove bookmark"
                                                inactiveLabel="Add bookmark"
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: isBookmarked(movie.id) ? '#1f90f3' : 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    fontSize: '1.5rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = isBookmarked(movie.id) ? '#1577c7' : 'rgba(0, 0, 0, 0.8)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = isBookmarked(movie.id) ? '#1f90f3' : 'rgba(0, 0, 0, 0.6)';
                                                }}
                                            >
                                                {isBookmarked(movie.id) ? '✓' : '+'}
                                            </ToggleButton>
                                        </div>
                                    </div>
                                </Col>

                                {/* Preview Section - Right side */}
                                <Col md={9} sm={8}>
                                    <Card.Body>
                                        {/* Title and Year */}
                                        <Card.Title style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                            {movie.title}
                                        </Card.Title>

                                        <div className="text-secondary mb-2">
                                            {movie.year} • {movie.duration}
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-3">
                                            <Rating initialRating={movie.rating} />
                                        </div>

                                        {/* Genres */}
                                        <div className="mb-3 d-flex gap-2 flex-wrap">
                                            {movie.genres.map((genre, index) => (
                                                <span
                                                    key={index}
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: '#1f90f3',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Plot Preview */}
                                        <Card.Text className="text-secondary">
                                            {movie.plot}
                                        </Card.Text>

                                        {/* View Details Button */}
                                        <button
                                            className="Cbutton mt-2"
                                            style={{
                                                padding: '0.5rem 1.5rem',
                                                border: 'none'
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </div>

                {/* Bookmarked Items Summary */}
                <div className="p-4 bg-light rounded">
                    <h3>Bookmarked Items: {bookmarkedIds.length}</h3>
                    {bookmarkedIds.length > 0 ? (
                        <div>
                            <p className="mb-2 text-secondary">
                                IDs: {bookmarkedIds.join(', ')}
                            </p>
                            <p className="mb-0 text-muted small">
                                Click the "+" button on any poster to bookmark it. Click "✓" to remove.
                            </p>
                        </div>
                    ) : (
                        <p className="mb-0 text-muted">No items bookmarked yet! Click the "+" button on any poster.</p>
                    )}
                </div>
            </Container>
        </div>
    );
}

export default TestBookmark;
