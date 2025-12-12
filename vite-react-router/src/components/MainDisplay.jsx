import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import Rating from './Rating';
import BookmarkButton from './BookmarkButton';

/**
 * MainDisplay Component
 * 
 * Reusable layout component for detail pages (titles, individuals, etc.)
 * Layout: Image left (3 cols), Info right (9 cols) with header, metadata, and sections
 * 
 * @param {object} header - Image, title, subtitle, rating, bookmark controls
 * @param {array} metadata - Array of metadata items (labels, values, badges)
 * @param {array} sections - Array of content sections with titles and content
 * @param {node} children - Additional content to render below main card
 */

/**
 * Helper: Render badges from array of strings or objects
 */
const renderBadges = (items, color = 'primary') => {
    if (!items || !items.length) return null;
    
    return (
        <div>
            {items.map((item, index) => (
                <Badge 
                    key={index} 
                    bg={color} 
                    className="me-2"
                    style={color === 'primary' ? { backgroundColor: '#1f90f3' } : {}}
                >
                    {typeof item === 'string' ? item : item.name}
                </Badge>
            ))}
        </div>
    );
};

/**
 * Helper: Render text content with optional fallback
 */
const renderText = (text, fallback = 'No information available') => {
    return <p className="text-muted">{text || fallback}</p>;
};

/**
 * MainDisplay - Reusable layout component for detail pages
 * Layout: Image left (3 cols), Info right (9 cols)
 */
function MainDisplay({ header, metadata = [], sections = [], children }) {
    const {
        image,
        title,
        subtitle,
        rating,
        showBookmark = false,
        isBookmarked = false,
        onBookmarkToggle
    } = header || {};

    return (
        <Container fluid className="ContainerCstyle py-4">
            <Card>
                <Card.Body>
                    <Row>
                        {/* Left: Image */}
                        <Col md={3} className="text-center">
                            <div style={{ position: 'relative' }}>
                                {image ? (
                                    <img 
                                        src={image}
                                        alt={title || 'Image'}
                                        className="img-fluid rounded"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                    />
                                ) : (
                                    <div className="bg-secondary rounded d-flex align-items-center justify-content-center text-white"
                                         style={{ width: '100%', height: '300px' }}>
                                        No Image
                                    </div>
                                )}
                                
                                {showBookmark && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <BookmarkButton
                                            isBookmarked={isBookmarked}
                                            onToggle={onBookmarkToggle}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: isBookmarked ? '#1f90f3' : 'rgba(0, 0, 0, 0.6)',
                                                color: 'white',
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            {isBookmarked ? '★' : '☆'}
                                        </BookmarkButton>
                                    </div>
                                )}
                            </div>
                        </Col>

                        {/* Right: Info */}
                        <Col md={9}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h2 className="mb-1">{title || 'No Title'}</h2>
                                    {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                                </div>
                                {rating && <Rating initialRating={rating} />}
                            </div>

                            {metadata.length > 0 && (
                                <div className="mb-3">
                                    {metadata.map((item, index) => (
                                        <span key={index} className="me-2">
                                            {item.badge ? (
                                                <Badge bg={item.badgeColor || 'secondary'} className="me-1">
                                                    {item.value}
                                                </Badge>
                                            ) : (
                                                <span className={item.muted ? 'text-muted' : ''}>
                                                    {item.label && <strong>{item.label}: </strong>}
                                                    {item.value}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {sections.map((section, index) => (
                                <div key={index} className="mb-3">
                                    {section.title && <h5>{section.title}</h5>}
                                    <div>{section.content}</div>
                                </div>
                            ))}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {children && <div className="mt-4">{children}</div>}
        </Container>
    );
}

// Export helpers for use in pages
export { renderBadges, renderText };
export default MainDisplay;
