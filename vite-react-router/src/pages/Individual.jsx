// React hooks: useState gemmer data i komponenten, useEffect koerer ekstra arbejde (fx datahentning)
import { useState, useEffect } from 'react';
// Router hooks: laeser URL-parametre og skifter side
import { useParams, useNavigate } from 'react-router-dom';
// UI dele fra React Bootstrap
import { Container, Card, Spinner, Carousel, Row, Col } from 'react-bootstrap';
// Genbrugt top-komponent til at vise hovedindholdet
import MainDisplay from '../components/MainDisplay';
// Lille knap der kan toggles (fx bogmaerke)
import ToggleButton from '../components/ToggleButton';
// Forhaandslavede sider til loading, fejl og ikke-fundet
import { LoadingState, ErrorState, NotFoundState } from '../components/PageStates';
// Special-hook der henter alle data om personen og styrer tilstande
import useIndividualData from '../hooks/useIndividualData';
// Hook der giver login-status og bruger-id
import useAuthStatus from '../hooks/useAuthStatus';
// Henter gemt login-token fra storage
import { getStoredToken } from '../components/utils/ExtractJwtData';
// Vores API-klient til backend
import mdb from '../business-logic-layer/ApiClient/ApiClient';
// TMDB-integration til billeder m.m.
import tmdb from '../business-logic-layer/TmdbIntegration';
// Reservebillede hvis et billede mangler
import placeholderImage from '../pics/Image-not-found.png';
// Lille toast til beskeder
import ToastConfirm from '../components/utils/ToastUtil';
// Slide-in panel til login-opfordring
import SignInOffcanvas from '../components/SignInOffcanvas';
// Side-styles
import '../style/CTitlePage.css';
import '../style/CIndividualPage.css';

/**
 * Individual Page Component
 * 
 * Displays detailed information about a person (actor, director, etc.)
 * including biography, photos, known titles, and filmography.
 */

function Individual() {
    // URL-parametre: id for personen og side-id til navigation
    const { individualId, pageId } = useParams();
    // Funktion til at sende brugeren videre til anden side
    const navigate = useNavigate();
    // Login-status og bruger-id (hvis logget ind)
    const { isSignedIn, userId } = useAuthStatus();

    // Lokale states til billeder fra TMDB
    const [tmdbImages, setTmdbImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [tmdbProfilePicture, setTmdbProfilePicture] = useState(null);
    // Husker hvilke titler der er bogmaerket (key = pageId)
    const [titleBookmarks, setTitleBookmarks] = useState({});

    // Special-hook der henter alle person-data og giver helper-funktioner
    const {
        individual,
        loading,
        error,
        knownForTitles,
        loadingKnownFor,
        isBookmarked,
        toggleBookmark
    } = useIndividualData(individualId, userId, isSignedIn, pageId);

    // Hent profilbillede fra TMDB ud fra personens navn
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

    // Hent foto-galleri fra TMDB (flere billeder af personen)
    useEffect(() => {
        const fetchTmdbImages = async () => {
            if (!individual?.name) {
                setLoadingImages(false);
                return;
            }

            try {
                setLoadingImages(true);
                
                const searchResults = await mdb.tmdb.searchPerson(individual.name); // soeg person i TMDB
                
                if (searchResults?.results?.length > 0) {
                    const personId = searchResults.results[0].id; // TMDB-id vi skal bruge
                    const personDetails = await mdb.tmdb.getPerson(personId); // hent detaljer inkl. billeder
                    
                    if (personDetails?.images?.profiles) { // kun hvis der er profiler
                        const imageUrls = personDetails.images.profiles
                            .slice(0, 10) // begræns til 10 billeder
                            .map(img => `https://image.tmdb.org/t/p/w500${img.file_path}`); // byg fuld URL
                        
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

    // Tjek bogmaerke-status for "Known For" titler (hent alle bogmaerker paa een gang)
    useEffect(() => {
        const checkTitleBookmarks = async () => {
            if (!isSignedIn || !userId || knownForTitles.length === 0) {
                setTitleBookmarks({}); // intet at markere
                return;
            }

            try {
                const token = getStoredToken(); // auth token
                // Hent alle bogmaerker i et kald
                const bookmarks = await mdb.apiv2.user.getBookmarks(userId, { authToken: token });

                // Lav opslagssaet til hurtige opslag
                const bookmarkedSet = new Set((bookmarks || []).map(b => String(b.pageId)));

                const bookmarkMap = {}; // pageId -> true/false
                knownForTitles.forEach(title => {
                    const pageRef = title.pageId || null;
                    if (pageRef) {
                        bookmarkMap[pageRef] = bookmarkedSet.has(String(pageRef));
                    }
                });

                setTitleBookmarks(bookmarkMap);
            } catch (err) {
                console.error('Failed to check title bookmarks:', err);
                setTitleBookmarks({});
            }
        };

        checkTitleBookmarks();
    }, [knownForTitles, userId, isSignedIn]);

    // Saet/fjern bogmaerke paa en titel
    const toggleTitleBookmark = async (pageId, titleId, titleName) => {
        if (!isSignedIn || !userId) {
            alert('Please log in to bookmark titles'); // skal vaere logget ind
            return;
        }

        if (!pageId) {
            console.warn('No pageId available for title, cannot bookmark');
            alert('Unable to bookmark this title');
            return;
        }

        try {
            const token = getStoredToken(); // auth token
            const isCurrentlyBookmarked = titleBookmarks[pageId]; // nuvaerende status
            
            if (isCurrentlyBookmarked) {
                await mdb.apiv2.user.removeBookmark(userId, pageId, { authToken: token }); // fjern
                setTitleBookmarks(prev => ({ ...prev, [pageId]: false })); // opdater lokalt
            } else {
                await mdb.apiv2.user.addBookmark(userId, pageId, { authToken: token }); // tilfoej
                setTitleBookmarks(prev => ({ ...prev, [pageId]: true })); // opdater lokalt
            }
        } catch (err) {
            console.error('Failed to toggle title bookmark:', err);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    // Lokal UI-tilstand: vise login-panel og korte beskeder
    const [showSignIn, setShowSignIn] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleMainBookmarkClick = async () => {
        if (!isSignedIn) {
            setToastMessage('Please sign in to bookmark individuals.');
            setShowSignIn(true);
            setTimeout(() => setToastMessage(''), 2500);
            return;
        }

        const willBeBookmarked = !isBookmarked; // hvad statusen bliver efter klik
        try {
            await toggleBookmark();
            setToastMessage(willBeBookmarked ? 'Bookmark added.' : 'Bookmark removed.');
        } catch (err) {
            console.error('Failed toggling bookmark:', err);
            setToastMessage('Failed to update bookmark.');
        } finally {
            setTimeout(() => setToastMessage(''), 2500);
        }
    };

    // Hjælp: gaa til en given titel-side (bruger pageId + titleId)
    const navigateToTitle = (title) => {
        const targetPageId = title.pageId && title.pageId !== 'n/a' ? title.pageId : null; // side-id i URL
        const targetTitleId = title.id && title.id !== 'n/a' ? title.id : null; // titel-id i URL

        if (!targetPageId || !targetTitleId) return;

        navigate(`/page/${targetPageId}/title/${targetTitleId}`, { replace: true }); // skift side
    };

    // (List functionality removed) 

    // Viser standard loading/fejl/404 komponenter hvis noedvendigt
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!individual) return <NotFoundState message="No individual found" />;

    // Byg navn med foedsels-/doedsaar (eller "Present" hvis i live)
    const customName = (
        <div>
            {individual.name || 'Unknown'}{' '}
            {individual.birthYear && individual.birthYear !== 'n/a' && (
                <span className="individual-year-text">
                    ({individual.birthYear} // foedselsaar
                    {individual.deathYear && individual.deathYear !== 'n/a' 
                        ? ` - ${individual.deathYear}`  // doedsaar
                        : ' - Present'}) // viser "Present" hvis ingen doedsaar
                </span>
            )}
        </div>
    );

    // Forbered badges (fx "Actor" naar vi har kendte titler)
    const badges = [];
    if (knownForTitles.length > 0) {
        badges.push({ text: 'Actor', variant: 'primary' });
    }

    // Forbered bio-sektion
    const sections = [];

    if (individual.bio || individual.description) {
        sections.push({
            title: 'Biography',
            content: <p className="text-muted">{individual.bio || individual.description}</p> // kort tekst om personen
        });
    }

    return (
        <>
            <MainDisplay
                item={individual}
                image={tmdbProfilePicture || individual.image || placeholderImage}
                title={customName}
                subtitle={null}
                badges={badges}
                sections={sections}
                bookmark={{
                    itemId: individualId,
                    isBookmarked: isBookmarked,
                    onToggle: handleMainBookmarkClick
                }}
                
            >
            {/* Foto-galleri */}
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
                                                                onError={(e) => { e.target.src = placeholderImage; }}
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

            {/* Known For - top 4 titler */}
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
                                                onClick={() => navigateToTitle(title)} // klik sender til titel-side
                                            >
                                                <img
                                                    src={title.image || title.poster || placeholderImage}
                                                    alt={title.name}
                                                    className="known-for-poster"
                                                    onError={(e) => { e.target.src = placeholderImage; }}
                                                />
                                                
                                                <div className="bookmark-overlay">
                                                    <ToggleButton
                                                        itemId={title.pageId || title.id}
                                                        isActive={titleBookmarks[title.pageId]}
                                                        onToggle={async (pageId, newState) => {
                                                            if (!pageId) return;
                                                            if (!isSignedIn) {
                                                                setToastMessage('Please sign in to bookmark titles');
                                                                setShowSignIn(true);
                                                                setTimeout(() => setToastMessage(''), 2500);
                                                                return;
                                                            }

                                                            try {
                                                                await toggleTitleBookmark(pageId, title.id, title.name);
                                                                setToastMessage(newState ? 'Bookmark added.' : 'Bookmark removed.');
                                                            } catch (err) {
                                                                console.error('Failed toggling known-for bookmark:', err);
                                                                setToastMessage('Failed to update bookmark.');
                                                            } finally {
                                                                setTimeout(() => setToastMessage(''), 2500);
                                                            }
                                                        }}
                                                        activeLabel="Remove bookmark"
                                                        inactiveLabel="Add bookmark"
                                                        className={`bookmark-btn ${titleBookmarks[title.pageId] ? 'bookmarked' : ''}`}
                                                    >
                                                        {titleBookmarks[title.pageId] ? '✓' : '+'} {/* viser ikon for status */}
                                                    </ToggleButton>
                                                </div>
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

            {/* Filmografi - fuld liste */}
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
                                        onClick={() => navigateToTitle(title)} // klik gaar til titel-side
                                    >
                                        <img
                                            src={title.image || title.poster || placeholderImage}
                                            alt={title.name}
                                            className="filmography-thumbnail me-3"
                                            onError={(e) => { e.target.src = placeholderImage; }}
                                        />
                                        <div>
                                            <h6 className="mb-0">{title.name}</h6>
                                            <p className="text-muted small mb-0">
                                                {title.startYear && title.startYear !== 'n/a' ? title.startYear : 'Year unknown'} {/* viser aar eller "ukendt" */}
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

        {/* List functionality removed */}
            <ToastConfirm
                show={!!toastMessage}
                message={toastMessage}
                onClose={() => setToastMessage('')}
            />

            <SignInOffcanvas show={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
    );
}

export default Individual;