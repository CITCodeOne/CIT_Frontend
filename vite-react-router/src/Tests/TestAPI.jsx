import React, { useState } from 'react';
import { Container, Card, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import {
    getTitleById,
    getTitles,
    getIndividualById,
    getIndividuals,
    getRatingsByTitleId,
    getBookmarks,
    createBookmark,
    deleteBookmark,
    login,
    signup
} from '../config/api';

/**
 * TestAPI Component
 * 
 * Developer tool for testing API endpoints including authentication, titles, individuals,
 * ratings, and bookmarks. Displays formatted JSON responses and error messages.
 */
function TestAPI() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    // Generic handler for testing API functions
    const handleTest = async (apiFunc, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFunc(...args);
            setResult(JSON.stringify(data, null, 2));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Test login and store token
    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await login('testuser1', 'password12311');
            setResult(JSON.stringify(data, null, 2));
            if (data.token) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">API Testing Dashboard</h2>

            {/* Auth Section */}
            <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                    <h4>Authentication</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-2">
                        <Col xs={12} md={6}>
                            <Button 
                                variant="outline-primary" 
                                className="w-100"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                Login (testuser1)
                            </Button>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Control 
                                type="text" 
                                placeholder="Token" 
                                value={token} 
                                onChange={(e) => setToken(e.target.value)}
                                size="sm"
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Titles Section */}
            <Card className="mb-4">
                <Card.Header className="bg-success text-white">
                    <h4>Titles</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-2">
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-success" 
                                className="w-100"
                                onClick={() => handleTest(getTitleById, 'tt0052520')}
                                disabled={loading}
                            >
                                Get Title by ID (tt0052520)
                            </Button>
                        </Col>
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-success" 
                                className="w-100"
                                onClick={() => handleTest(getTitles, 1, 5)}
                                disabled={loading}
                            >
                                Get Titles (Page 1, Size 5)
                            </Button>
                        </Col>
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-success" 
                                className="w-100"
                                onClick={() => handleTest(getTitleById, 'tt10257794')}
                                disabled={loading}
                            >
                                Get Title (tt10257794)
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Individuals Section */}
            <Card className="mb-4">
                <Card.Header className="bg-info text-white">
                    <h4>Individuals</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-2">
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-info" 
                                className="w-100"
                                onClick={() => handleTest(getIndividualById, 'nm0000158')}
                                disabled={loading}
                            >
                                Get Individual (nm0000158)
                            </Button>
                        </Col>
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-info" 
                                className="w-100"
                                onClick={() => handleTest(getIndividuals, 1, 5)}
                                disabled={loading}
                            >
                                Get Individuals (Page 1, Size 5)
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Ratings Section */}
            <Card className="mb-4">
                <Card.Header className="bg-warning text-dark">
                    <h4>Ratings</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-2">
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-warning" 
                                className="w-100"
                                onClick={() => handleTest(getRatingsByTitleId, 'tt0052520')}
                                disabled={loading}
                            >
                                Get Ratings (tt0052520)
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Bookmarks Section */}
            <Card className="mb-4">
                <Card.Header className="bg-danger text-white">
                    <h4>Bookmarks (Requires Token)</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-2">
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-danger" 
                                className="w-100"
                                onClick={() => handleTest(getBookmarks, token)}
                                disabled={loading || !token}
                            >
                                Get My Bookmarks
                            </Button>
                        </Col>
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-danger" 
                                className="w-100"
                                onClick={() => handleTest(createBookmark, 500, token)}
                                disabled={loading || !token}
                            >
                                Create Bookmark (500)
                            </Button>
                        </Col>
                        <Col xs={12} md={4}>
                            <Button 
                                variant="outline-danger" 
                                className="w-100"
                                onClick={() => handleTest(deleteBookmark, 500, token)}
                                disabled={loading || !token}
                            >
                                Delete Bookmark (500)
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Results Display */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    <Alert.Heading>Error</Alert.Heading>
                    <pre>{error}</pre>
                </Alert>
            )}

            {result && (
                <Card className="mb-4">
                    <Card.Header className="bg-dark text-white">
                        <h5>Result</h5>
                    </Card.Header>
                    <Card.Body>
                        <pre style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: '1rem', 
                            borderRadius: '4px',
                            maxHeight: '400px',
                            overflow: 'auto'
                        }}>
                            {result}
                        </pre>
                    </Card.Body>
                </Card>
            )}

            {loading && (
                <Alert variant="info">
                    Loading...
                </Alert>
            )}
        </Container>
    );
}

export default TestAPI;
