import { Card, Button, Col } from 'react-bootstrap'; // Henter Bootstrap komponenter til kort, knapper og grid kolonner
import { useNavigate } from 'react-router-dom'; // Hook der lader os skifte side programmatisk
import placeholderImage from '../pics/Image-not-found.png'; // Fallback billede hvis ingen URL leveres

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
    const navigate = useNavigate(); // giver adgang til at rykke brugeren til en anden route

    // Handle card click for navigation
    const handleCardClick = () => {
        if (onClick) { // Hvis der er en specialklikhook, brug den foerst
            onClick(id);
        } else if (type === 'person' && id) { // Klik paa personkort leder til individualsiden
            navigate(`/individual/${id}`);
        } else if (type === 'title' && id) { // Klik paa titelkort leder til titelview
            navigate(`/title/${id}`);
        }
    };

    // Render person card (circular image)
    if (type === 'person') {
        const imageClass = size === 'large' ? 'circular-image-120' : 'circular-image-80'; // Vaelger CSS klasse for stor eller lille cirkel
        
        return (
            <Col xs={12} sm={6} md={4} className="mb-3"> {/* Responsiv kolonne der tilpasser bredden paa grid */}
                <div 
                    className="text-center" 
                    style={{ cursor: onClick || id ? 'pointer' : 'default' }} // Viser haand kun hvis der er noget at klikke
                    onClick={handleCardClick} // Hele kortet reagerer paa klik
                >
                    <div className={imageClass}> {/* Ramme der styrer runding og stoerrelse */}
                        <img
                            src={image} // Billed-url eller fallback
                            alt={title} // Beskrivelse for skaermlaesere
                        />
                    </div>
                    <div className="mt-2 p-2 border rounded bg-white cast-name-box"> {/* Tekstboks under billedet */}
                        <small className="d-block"><strong>{title}</strong></small> {/* Navn paa personen */}
                        {subtitle && (
                            <small className="text-muted">{subtitle}</small> // Ekstra tekst kun vist hvis givet
                        )}
                    </div>
                </div>
            </Col>
        );
    }

    // Render title card (rectangular poster)
    if (type === 'title') {
        return (
            <Col xs={12} sm={6} md={4} className="mb-3"> {/* Grid kolonne for plakatslayout */}
                <Card className="h-100 shadow-sm"> {/* Bootstrap kort der fylder hoejden og har let skygge */}
                    <div 
                        className="poster-container" 
                        style={{ cursor: onClick || id ? 'pointer' : 'default' }} // Klikbar flade hvis der er handler/id
                        onClick={handleCardClick}
                    >
                        <img
                            src={image} // Poster-url eller fallback
                            alt={title} // Tilgaengelighedsbeskrivelse
                        />
                    </div>
                    {subtitle && (
                        <Card.Header className="text-center bg-light"> {/* Overskrift vises kun hvis der er undertekst */}
                            <small><strong>{title}</strong></small>
                            <br />
                            <small className="text-muted">{subtitle}</small>
                        </Card.Header>
                    )}
                    {actions.length > 0 && (
                        <Card.Body> {/* Knapomraade vises kun naar der er handlinger */}
                            <div className="d-flex justify-content-between similar-buttons"> {/* Fordeler knapper horisontalt */}
                                {actions.map((action, index) => (
                                    <Button
                                        key={index} // Index bruges som noegle fordi actions typisk er statisk liste
                                        variant={action.variant || 'outline-primary'} // Default knapstil hvis ingen er angivet
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Forhindrer at kortklikket ogsaa fyrer
                                            action.onClick && action.onClick(id); // Udfaerer den specifikke handling med id som parameter
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
