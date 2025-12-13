import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import Rating from './Rating';
import defaultProfilePic from '../pics/DefaultProfilePicture.jpg';

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
    // Truncate content if read-only and exceeds max length
    const displayContent = !editable && maxContentLength > 0 && content.length > maxContentLength
        ? content.substring(0, maxContentLength) + '...'
        : content;

    // Determine if we should show the yellow rating box (read-only) or editable stars
    const showRatingBox = showRating && !editable && rating > 0;
    const showEditableRating = showRating && editable;

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Row className="align-items-center">
                    {/* Profile Picture */}
                    <Col xs={2} md={1} className="text-center">
                        <div className="circular-image-80">
                            <img
                                src={avatar}
                                alt={username}
                            />
                        </div>
                    </Col>

                    {/* Rating Box (read-only) */}
                    {showRatingBox && (
                        <Col xs={3} md={2} lg={1} className="text-center">
                            <div className="review-rating-box">
                                <div>
                                    <strong className="review-rating-number">
                                        {rating}
                                    </strong>
                                    <div className="review-rating-scale">/10</div>
                                </div>
                            </div>
                        </Col>
                    )}

                    {/* Content Area */}
                    <Col 
                        xs={showRatingBox ? 12 : 10} 
                        md={showRatingBox ? 8 : showEditableRating ? 7 : 9} 
                        lg={showRatingBox ? 10 : showEditableRating ? 8 : 10} 
                        className={showRatingBox ? "mt-3 mt-md-0" : ""}
                    >
                        <div className="border rounded p-3 bg-white review-content-box">
                            <div className="mb-2"><strong>{username}</strong></div>
                            {editable ? (
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={content}
                                    onChange={(e) => onContentChange && onContentChange(e.target.value)}
                                    placeholder={placeholder}
                                />
                            ) : (
                                <p className="mb-0 text-muted review-text">
                                    {displayContent || <em className="text-muted">No review text provided.</em>}
                                </p>
                            )}
                        </div>
                    </Col>

                    {/* Editable Rating (stars) */}
                    {showEditableRating && (
                        <Col xs={8} md={3} lg={2} className="text-center mt-3 mt-md-0">
                            <Rating
                                initialRating={rating}
                                editable={true}
                                onRatingChange={onRatingChange}
                                showNumber={true}
                            />
                        </Col>
                    )}

                    {/* Delete Button */}
                    {showDeleteButton && onDelete && (
                        <Col xs={4} md={1} className="text-center mt-3 mt-md-0">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                        </Col>
                    )}
                </Row>
            </Card.Body>
        </Card>
    );
}
