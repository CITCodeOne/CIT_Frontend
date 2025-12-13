import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import ToggleButton from '../components/ToggleButton';
import Rating from '../components/Rating';

function TestBookmarkUserProfile() {
    // State for user info
    const [userInfo] = useState({
        username: 'JohnDoe123',
        email: 'john.doe@example.com',
        role: 'Premium User',
        timeCreated: '2023-05-15',
        ratingsCount: 42,
        bookmarksCount: 18,
        profilePicture: 'https://i.pinimg.com/1200x/ef/3e/e1/ef3ee14feee15daddd90a0751597c97f.jpg'
    });

    // State for ratings
    const [ratings, setRatings] = useState([
        {
            id: 1,
            type: 'movie',
            title: 'The Shawshank Redemption',
            profilePicture: 'https://image.tmdb.org/t/p/w200/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
            rating: 9,
            review: 'An absolute masterpiece! The story of hope and friendship is beautifully told.'
        },
        {
            id: 2,
            type: 'actor',
            title: 'Morgan Freeman',
            profilePicture: 'https://image.tmdb.org/t/p/w500/jPsLqiYGSofU4s6BjrxnefMfabb.jpg',
            rating: 10,
            review: 'One of the greatest actors of all time. Every performance is captivating.'
        }
    ]);

    // State for watchlist/bookmarks
    const [watchlist, setWatchlist] = useState([
        {
            id: 1,
            type: 'movie',
            img: 'https://image.tmdb.org/t/p/w200/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
            title: 'The Godfather',
            rating: 9.2
        },
        {
            id: 2,
            type: 'movie',
            img: 'https://image.tmdb.org/t/p/w200/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            title: 'The Dark Knight',
            rating: 9.0
        },
        {
            id: 3,
            type: 'actor',
            img: 'https://image.tmdb.org/t/p/w200/kuSlwTPsVlBMW0cvnFmbZce6PaV.jpg',
            title: 'Jim Carrey',
            rating: 8.8
        }
    ]);

    // Remove rating handler
    const handleRemoveRating = (itemId) => {
        setRatings(ratings.filter(rating => rating.id !== itemId));
        console.log(`Removed rating: ${itemId}`);
    };

    // Remove from watchlist handler
    const handleRemoveFromWatchlist = (itemId) => {
        setWatchlist(watchlist.filter(item => item.id !== itemId));
        console.log(`Removed from watchlist: ${itemId}`);
    };

    return (
        <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
                        <h2 className="mb-0">Nav</h2>
                        <div>
                            <Button variant="outline-secondary" size="sm" className="me-2">Edit</Button>
                            <Button variant="outline-secondary" size="sm">Share</Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* User Profile Section */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Row>
                                {/* Left: Profile Picture and Role */}
                                <Col md={3} className="text-center border-end">
                                    <Badge bg="info" className="mb-3">{userInfo.role}</Badge>
                                    <div className="mb-3">
                                        <img 
                                            src={userInfo.profilePicture}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </Col>

                                {/* Middle: User Details */}
                                <Col md={5} className="border-end">
                                    <div className="mb-3">
                                        <strong>Username</strong>
                                        <p className="text-muted mb-0">{userInfo.username}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Mail</strong>
                                        <p className="text-muted mb-0">{userInfo.email}</p>
                                    </div>
                                    <div>
                                        <strong>Time created</strong>
                                        <p className="text-muted mb-0">{new Date(userInfo.timeCreated).toLocaleDateString()}</p>
                                    </div>
                                </Col>

                                {/* Right: Stats */}
                                <Col md={4}>
                                    <div className="mb-3">
                                        <strong>Ratings</strong>
                                        <p className="fs-4 mb-0">{userInfo.ratingsCount}</p>
                                    </div>
                                    <div>
                                        <strong>Bookmarks</strong>
                                        <p className="fs-4 mb-0">{userInfo.bookmarksCount}</p>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Maybe Achievements/Badges Section */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body className="text-center text-muted py-4">
                            <p className="mb-0">Maybe Achivments/badges</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Ratings Section */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="mb-3">Ratings</h4>
                            
                            {ratings.length === 0 ? (
                                <p className="text-muted text-center py-4">No ratings yet</p>
                            ) : (
                                ratings.map((item) => (
                                    <Card key={item.id} className="mb-3 border">
                                        <Card.Body>
                                            <Row>
                                                {/* Profile Picture */}
                                                <Col md={2} className="text-center">
                                                    <img 
                                                        src={item.profilePicture}
                                                        alt={item.title}
                                                        className="rounded-circle"
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                    />
                                                </Col>

                                                {/* Title and Rating */}
                                                <Col md={2} className="d-flex flex-column justify-content-center">
                                                    <div className="mb-2">
                                                        <Badge bg={item.type === 'movie' ? 'primary' : 'success'}>
                                                            {item.type}
                                                        </Badge>
                                                    </div>
                                                    <h5 className="mb-2">{item.title}</h5>
                                                    <div className="d-flex align-items-center">
                                                        <strong className="me-2">Rating:</strong>
                                                        <Badge bg="warning" text="dark">{item.rating}/10</Badge>
                                                    </div>
                                                </Col>

                                                {/* Review Text */}
                                                <Col md={6} className="d-flex align-items-center">
                                                    <p className="mb-0 text-muted">{item.review}</p>
                                                </Col>

                                                {/* Remove Button */}
                                                <Col md={2} className="d-flex align-items-center justify-content-end">
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleRemoveRating(item.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))
                            )}

                            <div className="text-center mt-3">
                                <Button variant="outline-primary">Browse all ratings</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Watchlist Section */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="mb-3">Watchlist</h4>
                            
                            {watchlist.length === 0 ? (
                                <p className="text-muted text-center py-4">No items in watchlist</p>
                            ) : (
                                watchlist.map((item) => (
                                    <Card key={item.id} className="mb-3 border">
                                        <Card.Body>
                                            <Row>
                                                {/* Image */}
                                                <Col md={2}>
                                                    <img 
                                                        src={item.img}
                                                        alt={item.title}
                                                        className="img-fluid rounded"
                                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                                    />
                                                </Col>

                                                {/* Title */}
                                                <Col md={6} className="d-flex align-items-center">
                                                    <div>
                                                        <div className="mb-2">
                                                            <Badge bg={item.type === 'movie' ? 'primary' : 'success'}>
                                                                {item.type}
                                                            </Badge>
                                                        </div>
                                                        <h5 className="mb-0">{item.title}</h5>
                                                    </div>
                                                </Col>

                                                {/* Rating */}
                                                <Col md={2} className="d-flex align-items-center justify-content-center">
                                                    <div className="text-center">
                                                        <strong>Rating</strong>
                                                        <p className="fs-4 mb-0">{item.rating}</p>
                                                    </div>
                                                </Col>

                                                {/* Remove Button */}
                                                <Col md={2} className="d-flex align-items-center justify-content-end">
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleRemoveFromWatchlist(item.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))
                            )}

                            <div className="text-center mt-3">
                                <Button variant="outline-primary">Browse all watchlist</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default TestBookmarkUserProfile;
