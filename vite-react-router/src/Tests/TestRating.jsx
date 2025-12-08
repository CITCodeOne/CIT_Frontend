import React, { useState } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import Rating from '../components/Rating';


// ================================================
// TestRating Component
// A test page demonstrating the Rating component in various scenarios
// ================================================
function TestRating() {
    const [userRating, setUserRating] = useState(0);
    const handleRatingChange = (newRating) => {
        setUserRating(newRating);
        console.log('New rating:', newRating);
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="ContainerCstyle" style={{ paddingTop: '2rem' }}>
            <h1>Rating Component Test</h1>

            {/* ========================================== */}
            {/* BASIC RATING EXAMPLES                      */}
            {/* ========================================== */}

            {/* Example 1: Display-only rating */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3>Display Only (Not Editable)</h3>
                <p>Shows a fixed rating</p>
                <Rating initialRating={8.5} />
            </div>

            {/* Example 2: Different ratings */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3>Various Ratings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}>Perfect Score:</p>
                        <Rating initialRating={10} />
                    </div>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}>Good Rating:</p>
                        <Rating initialRating={7.5} />
                    </div>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}>Average Rating:</p>
                        <Rating initialRating={5} />
                    </div>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}>Poor Rating:</p>
                        <Rating initialRating={2} />
                    </div>
                </div>
            </div>

            {/* Example 3: Editable rating */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3>Editable Rating (Click to Rate)</h3>
                <p>Click on the stars to set your rating</p>
                <Rating 
                    initialRating={0} 
                    editable={true} 
                    onRatingChange={handleRatingChange}
                />
                {userRating > 0 && (
                    <p style={{ marginTop: '1rem', color: '#1f90f3' }}>
                        ✓ You rated: {userRating}/10
                    </p>
                )}
            </div>

            {/* Example 4: Without number display */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3>Stars Only (No Number)</h3>
                <p>Clean star display without numeric value</p>
                <Rating initialRating={8} showNumber={false} />
            </div>

            {/* Usage Examples */}
            <div style={{ padding: '1.5rem', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '1px solid #1f90f3' }}>
                <h3>Usage Examples:</h3>
                <pre style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '5px', overflow: 'auto' }}>
{`// Display only
<Rating initialRating={8.5} />

// Editable with callback
<Rating 
    initialRating={0} 
    editable={true} 
    onRatingChange={(rating) => console.log(rating)}
/>

// Stars only
<Rating initialRating={7} showNumber={false} />`}
                </pre>
            </div>

            {/* ========================================== */}
            {/* BOOTSTRAP CARD LAYOUT EXAMPLES             */}
            {/* ========================================== */}

            {/* Bootstrap Card Layout Examples */}
            <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                <h2>Bootstrap Card Layout Examples</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    Examples showing how Rating component looks in Bootstrap card layouts for Movies/Actors lists
                </p>
            </div>

            {/* --- Movie Card Examples --- */}

            {/* Movie Card Example */}
            <div style={{ marginBottom: '2rem' }}>
                <h3>Movie Card Example</h3>
                <Container fluid>
                    <Card 
                        className="mb-3"
                        style={{ 
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <Row className="g-0">
                            {/* Image Section - Left side */}
                            <Col md={3} sm={4}>
                                <Card.Img
                                    src="https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"
                                    alt="The Shawshank Redemption"
                                    style={{
                                        height: '100%',
                                        objectFit: 'cover',
                                        minHeight: '200px'
                                    }}
                                />
                            </Col>

                            {/* Preview Section - Right side */}
                            <Col md={9} sm={8}>
                                <Card.Body>
                                    {/* Title and Year */}
                                    <Card.Title style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                        The Shawshank Redemption (1994)
                                    </Card.Title>

                                    {/* Rating Component */}
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <Rating initialRating={9.3} />
                                    </div>

                                    {/* Genres */}
                                    <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ backgroundColor: '#1f90f3', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.85rem' }}>
                                            Drama
                                        </span>
                                        <span style={{ backgroundColor: '#1f90f3', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.85rem' }}>
                                            Crime
                                        </span>
                                    </div>

                                    {/* Plot Preview */}
                                    <Card.Text style={{ color: '#666', lineHeight: '1.5' }}>
                                        Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.
                                    </Card.Text>

                                    {/* View Details Button */}
                                    <button
                                        className="Cbutton"
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            border: 'none',
                                            marginTop: '0.5rem'
                                        }}
                                    >
                                        View Details
                                    </button>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>

                    {/* Second Movie Card */}
                    <Card 
                        className="mb-3"
                        style={{ 
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <Row className="g-0">
                            <Col md={3} sm={4}>
                                <Card.Img
                                    src="https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
                                    alt="The Godfather"
                                    style={{
                                        height: '100%',
                                        objectFit: 'cover',
                                        minHeight: '200px'
                                    }}
                                />
                            </Col>
                            <Col md={9} sm={8}>
                                <Card.Body>
                                    <Card.Title style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                        The Godfather (1972)
                                    </Card.Title>
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <Rating initialRating={9.2} />
                                    </div>
                                    <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ backgroundColor: '#1f90f3', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.85rem' }}>
                                            Crime
                                        </span>
                                        <span style={{ backgroundColor: '#1f90f3', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.85rem' }}>
                                            Drama
                                        </span>
                                    </div>
                                    <Card.Text style={{ color: '#666', lineHeight: '1.5' }}>
                                        The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.
                                    </Card.Text>
                                    <button className="Cbutton" style={{ padding: '0.5rem 1.5rem', border: 'none', marginTop: '0.5rem' }}>
                                        View Details
                                    </button>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>
                </Container>
            </div>

            {/* --- Actor Card Examples --- */}

            {/* Actor Card Example */}
            <div style={{ marginBottom: '2rem' }}>
                <h3>Actor Card Example</h3>
                <Container fluid>
                    <Card 
                        className="mb-3"
                        style={{ 
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <Row className="g-0">
                            {/* Image Section - Left side */}
                            <Col md={3} sm={4}>
                                <Card.Img
                                    src="https://image.tmdb.org/t/p/w500/jPsLqiYGSofU4s6BjrxnefMfabb.jpg"
                                    alt="Morgan Freeman"
                                    style={{
                                        height: '100%',
                                        objectFit: 'cover',
                                        minHeight: '200px'
                                    }}
                                />
                            </Col>

                            {/* Preview Section - Right side */}
                            <Col md={9} sm={8}>
                                <Card.Body>
                                    {/* Name */}
                                    <Card.Title style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                        Morgan Freeman
                                    </Card.Title>

                                    {/* Birth Year */}
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <span style={{ color: '#666', fontSize: '1rem' }}>
                                            Born: 1937
                                        </span>
                                    </div>

                                    {/* Bio Preview */}
                                    <Card.Text style={{ color: '#666', lineHeight: '1.5', marginBottom: '0.8rem' }}>
                                        Morgan Freeman is an American actor, director, and narrator. He has appeared in a range of film genres portraying character roles and is particularly known for his distinctive deep voice.
                                    </Card.Text>

                                    {/* Known For */}
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <strong style={{ color: '#1f90f3' }}>Known for: </strong>
                                        <span style={{ color: '#666' }}>
                                            The Shawshank Redemption, Se7en, The Dark Knight
                                        </span>
                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        className="Cbutton"
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            border: 'none',
                                            marginTop: '0.5rem'
                                        }}
                                    >
                                        View Details
                                    </button>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>

                    {/* Second Actor Card */}
                    <Card 
                        className="mb-3"
                        style={{ 
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <Row className="g-0">
                            <Col md={3} sm={4}>
                                <Card.Img
                                    src="https://image.tmdb.org/t/p/w500/eKF1sGJRrZJbfBG1KirPt1cfNd3.jpg"
                                    alt="Tom Hanks"
                                    style={{
                                        height: '100%',
                                        objectFit: 'cover',
                                        minHeight: '200px'
                                    }}
                                />
                            </Col>
                            <Col md={9} sm={8}>
                                <Card.Body>
                                    <Card.Title style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                        Tom Hanks
                                    </Card.Title>
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <span style={{ color: '#666', fontSize: '1rem' }}>
                                            Born: 1956
                                        </span>
                                    </div>
                                    <Card.Text style={{ color: '#666', lineHeight: '1.5', marginBottom: '0.8rem' }}>
                                        Thomas Jeffrey Hanks is an American actor and filmmaker. Known for both his comedic and dramatic roles, he is one of the most popular and recognizable film stars worldwide.
                                    </Card.Text>
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <strong style={{ color: '#1f90f3' }}>Known for: </strong>
                                        <span style={{ color: '#666' }}>
                                            Forrest Gump, Cast Away, Saving Private Ryan
                                        </span>
                                    </div>
                                    <button className="Cbutton" style={{ padding: '0.5rem 1.5rem', border: 'none', marginTop: '0.5rem' }}>
                                        View Details
                                    </button>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>
                </Container>
            </div>
        </div>
    );
}

export default TestRating;
