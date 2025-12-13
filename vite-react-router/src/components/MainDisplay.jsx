import React from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import Rating from './Rating';
import ToggleButton from './ToggleButton';

/**
 * MainDisplay - Minimal layout component for detail pages
 * Pages handle their own styling
 */

// Helper functions for pages to use
export const renderBadges = (items, color = 'primary') => {
    if (!items || !items.length) return null;
    return items.map((item, index) => (
        <Badge key={index} bg={color}>
            {typeof item === 'string' ? item : item.name}
        </Badge>
    ));
};

export const renderText = (text, fallback = 'No information available') => {
    return <p>{text || fallback}</p>;
};

function MainDisplay({ header, metadata = [], sections = [], children, className = '' }) {
    const {
        image,
        title,
        subtitle,
        rating,
        itemId,
        showBookmark = false,
        isBookmarked = false,
        onBookmarkToggle
    } = header || {};

    return (
        <Container fluid className={className}>
            <Row>
                {/* Image Column */}
                <Col md={3}>
                    {image && <img src={image} alt={title || 'Image'} />}
                    {showBookmark && (
                        <ToggleButton
                            itemId={itemId}
                            isActive={isBookmarked}
                            onToggle={onBookmarkToggle}
                            activeLabel="Remove bookmark"
                            inactiveLabel="Add bookmark"
                        >
                            {isBookmarked ? '★' : '☆'}
                        </ToggleButton>
                    )}
                </Col>

                {/* Content Column */}
                <Col md={9}>
                    {title && <h2>{title}</h2>}
                    {subtitle && <p>{subtitle}</p>}
                    {rating !== undefined && <Rating initialRating={rating} />}

                    {/* Metadata */}
                    {metadata.length > 0 && (
                        <div>
                            {metadata.map((item, index) => {
                                if (!item) return null;
                                if (item.badge) {
                                    return <Badge key={index} bg={item.badgeColor || 'secondary'}>{item.value}</Badge>;
                                }
                                return (
                                    <span key={index}>
                                        {item.label && <strong>{item.label}: </strong>}
                                        {item.value}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Sections */}
                    {sections.map((section, index) => section && (
                        <div key={index}>
                            {section.title && <h5>{section.title}</h5>}
                            <div>{section.content}</div>
                        </div>
                    ))}
                </Col>
            </Row>

            {children}
        </Container>
    );
}

export default MainDisplay;
