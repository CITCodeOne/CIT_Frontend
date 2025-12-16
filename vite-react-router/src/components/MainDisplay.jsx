import { Link } from 'react-router-dom';
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
 * @param {Object} customAction - Optional custom action button: { label, variant, icon, onClick }
 * @param {ReactNode} children - Additional content rendered below main card
 */
function MainDisplay({
    item,
    image,
    title,
    subtitle,
    rating,
    badges = [],
    sections = [],
    bookmark,
    customAction,
    children
}) {
    // Prefer explicitly provided props but fall back to item fields when present
    const resolvedImage = image ?? item?.image ?? item?.poster ?? item?.posterUrl;
    const resolvedTitle = title ?? item?.name ?? item?.title ?? 'No Title';
    const resolvedRating = rating ?? item?.rating ?? item?.avgRating ?? item?.averageRating ?? null;

    const resolvedSubtitle = subtitle ?? (() => {
        if (!item) return subtitle;
        const mediaType = item.mediaType ?? item.type;
        const formattedDate = item.releaseDate ? new Date(item.releaseDate).toLocaleDateString('da-DK') : null;
        return [mediaType, formattedDate].filter(Boolean).join(' · ');
    })();

    const content = (
        <div className="title-page-background">
            {/* Main Display Card */}
            <Container className="py-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        {/* Title, Year, Runtime, and Rating Row */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h2 className="mb-1">{resolvedTitle}</h2>
                                {(resolvedSubtitle || badges.length > 0) && (
                                    <div className="text-muted" style={{ fontSize: '1.1rem' }}>
                                        {resolvedSubtitle && <span>{resolvedSubtitle}</span>}
                                        {resolvedSubtitle && badges.length > 0 && <span> · </span>}
                                        {badges.map((badge, index) => (
                                            <span key={index}>
                                                {badge.text}
                                                {index < badges.length - 1 && ' · '}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rating or Custom Action in Top Right Corner */}
                            {customAction ? (
                                <div className="text-end">
                                    <Button
                                        variant={customAction.variant || 'primary'}
                                        size="sm"
                                        onClick={customAction.onClick}
                                    >
                                        {customAction.icon && <span className="me-1">{customAction.icon}</span>}
                                        {customAction.label}
                                    </Button>
                                </div>
                            ) : resolvedRating !== undefined && resolvedRating !== null ? (
                                <div className="text-end">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="rating-star">★</span>
                                        <div>
                                            <div className="d-flex align-items-baseline gap-1">
                                                <strong className="rating-value">
                                                    {resolvedRating > 0 ? resolvedRating.toFixed(1) : 'N/A'}
                                                </strong>
                                                {resolvedRating > 0 && <span className="text-muted">/10</span>}
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
                                        src={resolvedImage}
                                        alt={resolvedTitle || 'Image'}
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

    return item?.pageId ? (
        <Link to={`/page/${item.pageId}`} className="text-decoration-none">
            {content}
        </Link>
    ) : (
        content
    );
}

export default MainDisplay;
