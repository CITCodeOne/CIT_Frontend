import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Carousel, Row, Col } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import ListManager from '../components/ListManager';
import ToggleButton from '../components/ToggleButton';
import { LoadingState, ErrorState, NotFoundState } from '../components/PageStates';
import useIndividualData from '../hooks/useIndividualData';
import useAuthStatus from '../hooks/useAuthStatus';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import tmdb from '../business-logic-layer/TmdbIntegration';
import placeholderImage from '../pics/Image-not-found.png';
import '../style/CTitlePage.css';
import '../style/CIndividualPage.css';

/**
 * Individual Page Component
 * 
 * Displays detailed information about a person (actor, director, etc.)
 * including biography, photos, known titles, and filmography.
 */

function Individual() {
    const { individualId, pageId } = useParams();
    const navigate = useNavigate();
    const { isSignedIn, userId } = useAuthStatus();

    // State management
    const [showListModal, setShowListModal] = useState(false);
    const [tmdbImages, setTmdbImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [tmdbProfilePicture, setTmdbProfilePicture] = useState(null);
    const [titleBookmarks, setTitleBookmarks] = useState({});

    // Use custom hook for all data fetching and state management
    const {
        individual,
        loading,
        error,
        knownForTitles,
        loadingKnownFor,
        isBookmarked,
        toggleBookmark
    } = useIndividualData(individualId, userId, isSignedIn, pageId);

    // Fetch TMDB profile picture
    useEffect(() => {
        const fetchTmdbProfilePicture = async () => {
            if (!individual?.name) return;

            try {
                const photoUrl = await tmdb.getPersonPhoto(individual.name);
                if (photoUrl) {
                    setTmdbProfilePicture(photoUrl);
                }
            } catch (err) {
                console.error('Error fetching TMDB profile picture:', err);
            }
        };

        fetchTmdbProfilePicture();
    }, [individual]);

    // Fetch TMDB photo gallery
    useEffect(() => {
        const fetchTmdbImages = async () => {
            if (!individual?.name) {
                setLoadingImages(false);
                return;
            }

            try {
                setLoadingImages(true);
                
                const searchResults = await mdb.tmdb.searchPerson(individual.name);
                
                if (searchResults?.results?.length > 0) {
                    const personId = searchResults.results[0].id;
                    const personDetails = await mdb.tmdb.getPerson(personId);
                    
                    if (personDetails?.images?.profiles) {
                        const imageUrls = personDetails.images.profiles
                            .slice(0, 10)
                            .map(img => `https://image.tmdb.org/t/p/w500${img.file_path}`);
                        
                        setTmdbImages(imageUrls);
                    }
                }
            } catch (err) {
                console.error('Error fetching TMDB images:', err);
                setTmdbImages([]);
            } finally {
                setLoadingImages(false);
            }
        };

        if (individual) {
            fetchTmdbImages();
        }
    }, [individual]);

    // Check bookmark status for Known For titles
    useEffect(() => {
        const checkTitleBookmarks = async () => {
            if (!isSignedIn || !userId || knownForTitles.length === 0) {
                setTitleBookmarks({});
                return;
            }

            try {
                const bookmarkChecks = await Promise.all(
                    knownForTitles.map(async (title) => {
                        try {
                            const bookmark = await mdb.apiv2.user.getBookmark(userId, title.id);
                            return { id: title.id, isBookmarked: !!bookmark };
                        } catch (err) {
                            console.error(`Failed to check bookmark for title ${title.id}:`, err);
                            return { id: title.id, isBookmarked: false };
                        }
                    })
                );

                const bookmarkMap = {};
                bookmarkChecks.forEach(({ id, isBookmarked }) => {
                    bookmarkMap[id] = isBookmarked;
                });
                setTitleBookmarks(bookmarkMap);
            } catch (err) {
                console.error('Failed to check title bookmarks:', err);
            }
        };

        checkTitleBookmarks();
    }, [knownForTitles, userId, isSignedIn]);

    // Toggle bookmark for a title
    const toggleTitleBookmark = async (titleId, titleName) => {
        if (!isSignedIn || !userId) {
            alert('Please log in to bookmark titles');
            return;
        }

        try {
            const isCurrentlyBookmarked = titleBookmarks[titleId];
            
            if (isCurrentlyBookmarked) {
                await mdb.apiv2.user.removeBookmark(userId, titleId);
                setTitleBookmarks(prev => ({ ...prev, [titleId]: false }));
            } else {
                await mdb.apiv2.user.addBookmark(userId, titleId);
                setTitleBookmarks(prev => ({ ...prev, [titleId]: true }));
            }
        } catch (err) {
            console.error('Failed to toggle title bookmark:', err);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    const navigateToTitle = (title) => {
        const targetPageId = title.pageId && title.pageId !== 'n/a' ? title.pageId : null;
        const targetTitleId = title.id && title.id !== 'n/a' ? title.id : null;

        if (!targetPageId || !targetTitleId) return;

        navigate(`/page/${targetPageId}/title/${targetTitleId}`, { replace: true });
    };

    // List modal handlers
    const handleAddToList = () => {
        setShowListModal(true);
    };

    const handleListSuccess = (result) => {
        console.log(`Successfully added ${result.itemName} to list "${result.listName}"`);
    };

    const handleListError = (error) => {
        console.error('List operation failed:', error);
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!individual) return <NotFoundState message="No individual found" />;

    // Prepare name with birth/death years
    const customName = (
        <div>
            {individual.name || 'Unknown'}{' '}
            {individual.birthYear && individual.birthYear !== 'n/a' && (
                <span className="individual-year-text">
                    ({individual.birthYear}
                    {individual.deathYear && individual.deathYear !== 'n/a' 
                        ? ` - ${individual.deathYear}` 
                        : ' - Present'})
                </span>
            )}
        </div>
    );

    // Prepare badges
    const badges = [];
    if (knownForTitles.length > 0) {
        badges.push({ text: 'Actor', variant: 'primary' });
    }

    // Prepare biography section
    const sections = [];

    if (individual.bio || individual.description) {
        sections.push({
            title: 'Biography',
            content: <p className="text-muted">{individual.bio || individual.description}</p>
        });
    }

    return (
        <>
            <MainDisplay
                image={tmdbProfilePicture || individual.image || placeholderImage}
                title={customName}
                subtitle={null}
                badges={badges}
                sections={sections}
                bookmark={isSignedIn ? {
                    itemId: individualId,
                    isBookmarked: isBookmarked,
                    onToggle: toggleBookmark
                } : null}
                customAction={{
                    label: 'Add to List',
                    variant: 'primary',
                    icon: '📋',
                    onClick: handleAddToList
                }}
            >
            {/* Photo Gallery */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Photos</h4>
                        {loadingImages ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : tmdbImages.length === 0 ? (
                            <p className="text-muted">No photos available.</p>
                        ) : (
                            <div className="position-relative">
                                <style>{`
                                    .photo-carousel .carousel-control-prev-icon,
                                    .photo-carousel .carousel-control-next-icon {
                                        background-color: #d8d8d8;
                                        border-radius: 25%;
                                        padding: 20px;
                                    }
                                    .photo-carousel .carousel-control-prev,
                                    .photo-carousel .carousel-control-next {
                                        opacity: 0.8;
                                    }
                                    .photo-carousel .carousel-control-prev:hover,
                                    .photo-carousel .carousel-control-next:hover {
                                        opacity: 1;
                                    }
                                `}</style>
                                <Carousel interval={null} controls={true} indicators={false} className="photo-carousel">
                                    {(() => {
                                        const slides = [];
                                        for (let i = 0; i < tmdbImages.length; i += 3) {
                                            slides.push(tmdbImages.slice(i, i + 3));
                                        }
                                        return slides.map((slideImages, slideIndex) => (
                                            <Carousel.Item key={slideIndex}>
                                                <div className="d-flex justify-content-center gap-3 py-4">
                                                    {slideImages.map((imageUrl, imgIndex) => (
                                                        <div key={imgIndex}>
                                                            <img
                                                                src={imageUrl}
                                                                alt={`Photo ${slideIndex * 3 + imgIndex + 1}`}
                                                                className="individual-carousel-image"
                                                                style={{ 
                                                                    width: '220px',
                                                                    height: '330px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </Carousel.Item>
                                        ));
                                    })()}
                                </Carousel>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Known For - Top 4 Titles */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Known For</h4>
                        {loadingKnownFor ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : knownForTitles.length === 0 ? (
                            <p className="text-muted">No known titles available.</p>
                        ) : (
                            <Row className="g-4 justify-content-center">
                                {knownForTitles.slice(0, 4).map((title) => (
                                    <Col key={title.id} xs={6} sm={6} md={3}>
                                        <Card className="h-100 shadow-sm known-for-card">
                                            <div 
                                                className="known-for-poster-container"
                                                onClick={() => navigateToTitle(title)}
                                            >
                                                <img
                                                    src={title.image || title.poster || placeholderImage}
                                                    alt={title.name}
                                                    className="known-for-poster"
                                                />
                                                
                                                {/* Bookmark button */}
                                                <ToggleButton
                                                    itemId={title.id}
                                                    isActive={titleBookmarks[title.id]}
                                                    onToggle={(id, newState) => {
                                                        if (!isSignedIn) {
                                                            alert('Please log in to bookmark titles');
                                                            return;
                                                        }
                                                        toggleTitleBookmark(id, title.name);
                                                    }}
                                                    activeLabel="Remove bookmark"
                                                    inactiveLabel="Add bookmark"
                                                    className={`known-for-bookmark ${titleBookmarks[title.id] ? 'bookmarked' : ''}`}
                                                >
                                                    <span className="known-for-bookmark-icon">
                                                        {titleBookmarks[title.id] ? '✓' : '+'}
                                                    </span>
                                                </ToggleButton>
                                            </div>
                                            <Card.Body className="text-center py-2">
                                                <small className="text-muted">
                                                    {title.name}
                                                </small>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Filmography - Full List */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Filmography</h4>
                        {loadingKnownFor ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : knownForTitles.length === 0 ? (
                            <p className="text-muted">No filmography available.</p>
                        ) : (
                            <div>
                                {knownForTitles.map((title) => (
                                    <div 
                                        key={title.id} 
                                        className="d-flex align-items-center p-3 mb-2 border rounded bg-white filmography-list-item"
                                        onClick={() => navigateToTitle(title)}
                                    >
                                        <img
                                            src={title.image || title.poster || placeholderImage}
                                            alt={title.name}
                                            className="filmography-thumbnail me-3"
                                        />
                                        <div>
                                            <h6 className="mb-0">{title.name}</h6>
                                            <p className="text-muted small mb-0">
                                                {title.startYear && title.startYear !== 'n/a' ? title.startYear : 'Year unknown'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </MainDisplay>

        {/* List Manager Modal */}
        <ListManager
            show={showListModal}
            onHide={() => setShowListModal(false)}
            itemName={individual?.name}
            itemId={individualId}
            itemType="individual"
            userId={userId}
            onSuccess={handleListSuccess}
            onError={handleListError}
        />
    </>
    );
}

export default Individual;
