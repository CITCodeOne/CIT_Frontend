import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import notFoundImage from '../pics/Image-not-found.png';
import { findPosterForItem, cacheKeyForItem } from './utils/PreviewCardsUtils';

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
    // Foretrak en eksplicit prop men fald tilbage til feltet paa item, saa komponenten kan bruges med faerre props
    const resolvedImageProp = image ?? item?.image ?? item?.poster ?? item?.posterUrl ?? null;
    // Normaliser lokale placeholders til null, saa vi kan udloese samme fallback-sti
    const providedImage = (typeof resolvedImageProp === 'string' && resolvedImageProp.includes('Image-not-found.png')) ? null : resolvedImageProp;
    const [imageSrc, setImageSrc] = useState(providedImage || notFoundImage); // styret billede-kilde der kan skifte ved fejl
    const tmdbFallbackTriedRef = useRef(false); // enkel bool der sikrer vi kun kalder TMDB fallback en gang per instans

    // cache key for lookups
    const cacheKey = cacheKeyForItem(item); // stabil noegle til caching, saa vi ikke rammer API unodigt
    const resolvedTitle = title ?? item?.name ?? item?.title ?? 'No Title'; // titlen prioriterer prop, derefter kendte felter
    const resolvedRating = rating ?? item?.rating ?? item?.avgRating ?? item?.averageRating ?? null; // samme pattern for rating

    const resolvedSubtitle = subtitle ?? (() => {
        if (!item) return subtitle;
        const mediaType = item.mediaType ?? item.type;
        const formattedDate = item.releaseDate ? new Date(item.releaseDate).toLocaleDateString('da-DK') : null;
        return [mediaType, formattedDate].filter(Boolean).join(' · ');
    })();

    // Naar vi mangler et billede, forsog at hente fra TMDB en enkelt gang (samme strategi som PreviewCards)
    useEffect(() => {
        // Har vi allerede et billede (prop eller item-felt), behold det og skip kald
        if (providedImage) {
            setImageSrc(providedImage);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                if (!tmdbFallbackTriedRef.current) tmdbFallbackTriedRef.current = true; // markering for at undgaa gentagne kald
                const poster = await findPosterForItem(item, cacheKey); // slank helper der slaar op i cache/API
                if (cancelled) return; // hvis hook afbrydes under async, undgaa setState
                if (poster) setImageSrc(poster); // opdater visning med fundet plakat
            } catch (err) {
                console.error('Failed to fetch TMDB poster for MainDisplay', err);
            }
        })();

        return () => { cancelled = true; };
    }, [providedImage, item, cacheKey]);

    const handleImageError = async (e) => {
        // Hvis vi ikke har proevet TMDB fallback endnu, goer det nu
        if (!tmdbFallbackTriedRef.current) {
            tmdbFallbackTriedRef.current = true;
            try {
                const poster = await findPosterForItem(item, cacheKey); // sekundart opslag naar billed-tag fejler
                if (poster) {
                    setImageSrc(poster); // opdater billedkilde, saa brugeren ser korrekt plakat
                    return;
                }
            } catch (err) {
                console.error('TMDB fallback failed on image error', err);
            }
        }

        // Endeligt fallback er det lokale "billede ikke fundet"-asset, saa UI aldrig staar tomt
        if (e && e.target) e.target.src = notFoundImage;
        setImageSrc(notFoundImage);
    };

    // Hvis der ingen mediaType er, antag at det er en person/medvirkende, saa vi tilpasser layoutet
    const isIndividual = !!(item && !item.mediaType && !item.media_type);

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
                            ) : (!isIndividual && resolvedRating !== undefined && resolvedRating !== null) ? (
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
                                            reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' }); // blid scroll ned til anmeldelser
                                        }}
                                    >
                                        Rate
                                    </Button>
                                </div>
                            ) : (
                                !isIndividual ? (
                                    <div className="text-end">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                const reviewsSection = document.getElementById('reviews-section');
                                                reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' }); // samme scroll for elementer uden rating endnu
                                            }}
                                        >
                                            ★ Rate
                                        </Button>
                                    </div>
                                ) : null
                            )}
                        </div>

                        <Row>
                            {/* Image and Genres Column */}
                            <Col md={4} className="text-center">
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={imageSrc}
                                        alt={resolvedTitle || 'Image'}
                                        className="img-fluid rounded poster-image"
                                        onError={handleImageError}
                                    />

                                    {/* Bookmark Button */}
                                    {bookmark && (
                                        <div className="bookmark-overlay">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // undgaa at klikket trigger navigations-linket
                                                    bookmark.onToggle(); // deleger til logik-lag, saadan at stat lagres globalt
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
                                        {sections.find(section => section.title === 'Genres').content} {/* viser genrer foerst, saa bruger hurtigt ser kategori */}
                                    </div>
                                )}
                            </Col>

                            {/* Info Column - Only Overview and other sections (not Genres) */}
                            <Col md={8}>
                                {/* Sections excluding Genres */}
                                {sections.filter(section => section.title !== 'Genres').map((section, index) => (
                                    <div key={index} className="mb-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {section.title && <h5>{section.title}</h5>}
                                        {section.content} {/* indhold leveres udefra, saa komponenten er fleksibel */}
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

    // Only wrap with a Link for non-individual items that have a pageId.
    // Wrapping Individual pages causes their children (which may have their own
    // navigation handlers) to trigger double navigation.
    // Denne vagt sikrer at kun film/serier med pageId faar link, personer forbliver statiske, saa klik-maal ikke fordobles
    if (item?.pageId && !isIndividual) {
        return (
            <Link to={`/page/${item.pageId}`} className="text-decoration-none">
                {content}
            </Link>
        );
    }

    return content;
}

export default MainDisplay;