import { Container, Spinner, Alert } from 'react-bootstrap';

/**
 * LoadingState Component
 * 
 * Reusable loading indicator for pages
 * @param {string} message - Optional loading message
 */
export function LoadingState({ message = 'Loading...' }) {
    return (
        <Container className="d-flex justify-content-center align-items-center loading-container">
            <div className="text-center">
                <Spinner animation="border" />
                {message && <p className="mt-3 text-muted">{message}</p>}
            </div>
        </Container>
    );
}

/**
 * ErrorState Component
 * 
 * Reusable error display for pages
 * @param {string} error - Error message to display
 * @param {string} title - Optional error title
 */
export function ErrorState({ error, title = 'Error' }) {
    return (
        <Container className="mt-5">
            <Alert variant="danger">
                <Alert.Heading>{title}</Alert.Heading>
                <p>{error}</p>
            </Alert>
        </Container>
    );
}

/**
 * NotFoundState Component
 * 
 * Reusable not found display for pages
 * @param {string} message - Not found message
 */
export function NotFoundState({ message = 'No data found' }) {
    return (
        <Container className="mt-5">
            <Alert variant="warning">{message}</Alert>
        </Container>
    );
}
