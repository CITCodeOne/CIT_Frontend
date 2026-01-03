import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap'; // Bootstrap byggeklodser til kort, grid og knapper
import { Link } from 'react-router-dom'; // Link til at navigere uden fuld reload
import Rating from './Rating'; // Stjerne-rating komponent
import defaultProfilePic from '../pics/DefaultProfilePicture.jpg'; // Fallback billede hvis ingen avatar findes

/**
 * UserCard Component
 * 
 * A reusable card for displaying user-related content (reviews, ratings, comments)
 * Supports both editable (user's own content) and read-only modes
 * 
 * Horizontal layout:
 * - Avatar (circular image)
 * - Content area (username, text, etc.)
 * - Rating (if applicable)
 * - Actions (delete, edit, etc.)
 * 
 * @param {string} userId - User identifier
 * @param {string} username - Display name
 * @param {string} avatar - URL to profile picture
 * @param {number} rating - Rating value (0-10 scale)
 * @param {string} content - Review/comment text
 * @param {boolean} editable - Whether the content is editable
 * @param {boolean} showRating - Whether to show rating component
 * @param {function} onRatingChange - Callback when rating changes
 * @param {function} onContentChange - Callback when text content changes
 * @param {function} onDelete - Callback for delete action
 * @param {boolean} showDeleteButton - Whether to show delete button
 * @param {number} maxContentLength - Max characters before truncation (0 = no truncation)
 * @param {string} placeholder - Placeholder text for editable content
 */
export default function UserCard({
    userId,
    username = 'Anonymous',
    avatar = defaultProfilePic,
    rating = 0,
    content = '',
    editable = false,
    showRating = true,
    onRatingChange = null,
    onContentChange = null,
    onDelete = null,
    showDeleteButton = false,
    maxContentLength = 250,
    placeholder = 'Write your review here...'
}) {
    // Afkort tekst hvis den er laesevisning og for lang til kortet
    const displayContent = !editable && maxContentLength > 0 && content.length > maxContentLength
        ? content.substring(0, maxContentLength) + '...'
        : content;

    // Skal vi vise en fast rating-badge eller de redigerbare stjerner?
    const showRatingBox = showRating && !editable && rating > 0;
    const showEditableRating = showRating && editable;

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Row className="align-items-center">
                    {/* Profilbillede (auto bredde) */}
                    <Col xs="auto" className="text-center pe-3">
                        {userId ? (
                            <Link to={`/user/${userId}`} aria-label={`Go to ${username} profile`}>
                                <div className="circular-image-80">
                                    <img src={avatar} alt={username} />
                                </div>
                            </Link>
                        ) : (
                            <div className="circular-image-80">
                                <img src={avatar} alt={username} />
                            </div>
                        )}
                    </Col>

                    {/* Indhold (fleksibel bredde) */}
                    <Col>
                        <div className="border rounded p-3 bg-white review-content-box">
                            <div className="mb-2">
                                {userId ? (
                                    <Link to={`/user/${userId}`} className="text-decoration-none text-dark">
                                        <strong>{username}</strong>
                                    </Link>
                                ) : (
                                    <strong>{username}</strong>
                                )}
                            </div>
                            {editable ? (
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={content}
                                    onChange={(e) => onContentChange && onContentChange(e.target.value)} // Giver foraelder nyt tekstindhold
                                    placeholder={placeholder}
                                />
                            ) : (
                                <p className="mb-0 text-muted review-text">
                                    {displayContent || <em className="text-muted">No review text provided.</em>}
                                </p>
                            )}
                        </div>
                    </Col>

                    {/* Handlinger (rating/slet) - auto bredde, stabler lodret paa smaa skraerme */}
                    <Col xs="auto" className="text-center d-flex flex-column align-items-center gap-2">
                        {showRatingBox && (
                            <Badge bg="primary" style={{ fontSize: '0.95rem', padding: '0.6rem 0.75rem' }}>
                                {rating}/10
                            </Badge>
                        )}

                        {showEditableRating && (
                            <div className="d-flex align-items-center">
                                <Rating
                                    initialRating={rating}
                                    editable={true}
                                    onRatingChange={onRatingChange} // Sender ny rating op naar foraelder
                                    showNumber={true}
                                />
                            </div>
                        )}

                        {showDeleteButton && onDelete && (
                            <div>
                                <Button variant="outline-danger" size="sm" onClick={onDelete}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
