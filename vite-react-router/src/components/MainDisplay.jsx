import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import Rating from './Rating';
import BookmarkButton from './BookmarkButton';

/**
 * MainDisplay Component - Versatile layout for detail pages
 * 
 * Simple, reusable component for Title, Individual, and other detail pages
 * Displays image (3 cols) + info (9 cols) with optional sections
 * 
 * @param {string} image - Main image URL (poster, profile picture)
 * @param {string} title - Main heading
 * @param {string} subtitle - Optional subtitle (year, birth date, etc.)
 * @param {number} rating - Optional rating (0-10)
 * @param {Array} badges - Array of badge objects: [{ text: string, variant: string }]
 * @param {Array} sections - Array of content sections: [{ title: string, content: ReactNode }]
 * @param {Object} bookmark - Optional bookmark config: { itemId, isBookmarked, onToggle }
 * @param {ReactNode} children - Additional content rendered below main card
 */
function MainDisplay({
    image,
    title,
    subtitle,
    rating,
    badges = [],
    sections = [],
    bookmark,
    children
}) {
    return (
        <div className="title-page-background">
            {/* Main Display Card */}
            <Container className="py-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        {/* Title, Year, Runtime, and Rating Row */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h2 className="mb-1">{title || 'No Title'}</h2>
                                {(subtitle || badges.length > 0) && (
                                    <div className="text-muted" style={{ fontSize: '1.1rem' }}>
                                        {subtitle && <span>{subtitle}</span>}
                                        {subtitle && badges.length > 0 && <span> · </span>}
                                        {badges.map((badge, index) => (
                                            <span key={index}>
                                                {badge.text}
                                                {index < badges.length - 1 && ' · '}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rating in Top Right Corner */}
                            {rating !== undefined && rating !== null ? (
                                <div className="text-end">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="rating-star">★</span>
                                        <div>
                                            <div className="d-flex align-items-baseline gap-1">
                                                <strong className="rating-value">
                                                    {rating > 0 ? rating.toFixed(1) : 'N/A'}
                                                </strong>
                                                {rating > 0 && <span className="text-muted">/10</span>}
                                            </div>
                                            <div className="rating-label">Rating</div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => {
                                            const reviewsSection = document.getElementById('reviews-section');
                                            reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                    >
                                        Rate
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-end">
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={() => {
                                            const reviewsSection = document.getElementById('reviews-section');
                                            reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                    >
                                        ★ Rate
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Row>
                            {/* Image and Genres Column */}
                            <Col md={4} className="text-center">
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={image}
                                        alt={title || 'Image'}
                                        className="img-fluid rounded poster-image"
                                    />
                                    
                                    {/* Bookmark Button */}
                                    {bookmark && (
                                        <div className="bookmark-overlay">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    bookmark.onToggle();
                                                }}
                                                className="bookmark-btn"
                                                aria-label={bookmark.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                                title={bookmark.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                            >
                                                {bookmark.isBookmarked ? '✓' : '+'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Genres below the image */}
                                {sections.find(section => section.title === 'Genres') && (
                                    <div className="mt-3 text-start">
                                        {sections.find(section => section.title === 'Genres').content}
                                    </div>
                                )}
                            </Col>

                            {/* Info Column - Only Overview and other sections (not Genres) */}
                            <Col md={8}>
                                {/* Sections excluding Genres */}
                                {sections.filter(section => section.title !== 'Genres').map((section, index) => (
                                    <div key={index} className="mb-3">
                                        {section.title && <h5>{section.title}</h5>}
                                        {section.content}
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            {/* Additional Content */}
            {children}
        </div>
    );
}

export default MainDisplay;
