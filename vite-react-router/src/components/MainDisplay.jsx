import React from 'react';
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
                                        <span style={{ 
                                            color: '#f5c518', 
                                            fontSize: '2rem',
                                            lineHeight: '1'
                                        }}>★</span>
                                        <div>
                                            <div className="d-flex align-items-baseline gap-1">
                                                <strong style={{ fontSize: '1.5rem' }}>
                                                    {rating > 0 ? rating.toFixed(1) : 'N/A'}
                                                </strong>
                                                {rating > 0 && <span className="text-muted">/10</span>}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.75rem', 
                                                color: '#6c757d',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Rating
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => {
                                            const reviewsSection = document.getElementById('reviews-section');
                                            if (reviewsSection) {
                                                reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
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
                                            if (reviewsSection) {
                                                reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
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
                                        className="img-fluid rounded"
                                        style={{ 
                                            maxWidth: '100%', 
                                            height: '500px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    
                                    {/* Bookmark Button (top left corner with dark semi-transparent background) */}
                                    {bookmark && (
                                        <div style={{ position: 'absolute', top: '0', left: '0' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    bookmark.onToggle();
                                                }}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '0 0 8px 0',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '2rem',
                                                    fontWeight: '300',
                                                    color: 'white',
                                                    transition: 'all 0.2s',
                                                    lineHeight: '1'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                                }}
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
