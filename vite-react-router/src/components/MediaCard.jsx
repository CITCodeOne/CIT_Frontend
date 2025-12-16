import { Card, Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '../pics/Image-not-found.png';

/**
 * MediaCard Component
 * 
 * A reusable card for displaying media content (people, titles, etc.)
 * Supports two variants:
 * - 'person': Circular image for cast/crew members
 * - 'title': Rectangular poster for movies/shows
 * 
 * @param {string} id - Unique identifier for navigation
 * @param {string} type - 'person' or 'title'
 * @param {string} image - URL to image (profile or poster)
 * @param {string} title - Primary text (name or title)
 * @param {string} subtitle - Secondary text (character, year, etc.)
 * @param {string} size - For person: 'large' (120px) or 'small' (80px)
 * @param {Array} actions - Optional action buttons [{label, variant, onClick}]
 * @param {function} onClick - Optional click handler for the entire card
 */
export default function MediaCard({
    id,
    type = 'title',
    image = placeholderImage,
    title = 'Untitled',
    subtitle = '',
    size = 'large',
    actions = [],
    onClick = null
}) {
    const navigate = useNavigate();

    // Handle card click for navigation
    const handleCardClick = () => {
        if (onClick) {
            onClick(id);
        } else if (type === 'person' && id) {
            navigate(`/individual/${id}`);
        } else if (type === 'title' && id) {
            navigate(`/title/${id}`);
        }
    };

    // Render person card (circular image)
    if (type === 'person') {
        const imageClass = size === 'large' ? 'circular-image-120' : 'circular-image-80';
        
        return (
            <Col xs={12} sm={6} md={4} className="mb-3">
                <div 
                    className="text-center" 
                    style={{ cursor: onClick || id ? 'pointer' : 'default' }}
                    onClick={handleCardClick}
                >
                    <div className={imageClass}>
                        <img
                            src={image}
                            alt={title}
                        />
                    </div>
                    <div className="mt-2 p-2 border rounded bg-white cast-name-box">
                        <small className="d-block"><strong>{title}</strong></small>
                        {subtitle && (
                            <small className="text-muted">{subtitle}</small>
                        )}
                    </div>
                </div>
            </Col>
        );
    }

    // Render title card (rectangular poster)
    if (type === 'title') {
        return (
            <Col xs={12} sm={6} md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                    <div 
                        className="poster-container" 
                        style={{ cursor: onClick || id ? 'pointer' : 'default' }}
                        onClick={handleCardClick}
                    >
                        <img
                            src={image}
                            alt={title}
                        />
                    </div>
                    {subtitle && (
                        <Card.Header className="text-center bg-light">
                            <small><strong>{title}</strong></small>
                            <br />
                            <small className="text-muted">{subtitle}</small>
                        </Card.Header>
                    )}
                    {actions.length > 0 && (
                        <Card.Body>
                            <div className="d-flex justify-content-between similar-buttons">
                                {actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant || 'outline-primary'}
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick && action.onClick(id);
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </Card.Body>
                    )}
                </Card>
            </Col>
        );
    }

    return null;
}
