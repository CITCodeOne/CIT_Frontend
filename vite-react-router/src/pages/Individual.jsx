import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Badge, Spinner } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import RowComp from '../components/RowList';
import MediaCard from '../components/MediaCard';
import makeCarousel from '../components/MakeCarousel';
import ListManager from '../components/ListManager';
import { LoadingState, ErrorState, NotFoundState } from '../components/PageStates';
import useIndividualData from '../hooks/useIndividualData';
import useAuthStatus from '../hooks/useAuthStatus';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import placeholderImage from '../pics/Image-not-found.png';
import '../style/CTitlePage.css';
import '../style/CIndividualPage.css';

/**
 * Individual Page Component
 * 
 * Displays detailed information about a specific person (actor, director, producer, etc.)
 * 
 * Features:
 * - Full name with job badges
 * - Profile picture with bookmark functionality
 * - Biography/Description
 * - Birth and death years
 * - Known for titles (grouped by profession)
 * - Awards section (placeholder for future implementation)
 * - Photo gallery (placeholder for future implementation)
 * 
 * API Endpoints Used:
 * individuals.getById(id) - Fetches main individual data
 * individuals.getTitles(id) - Fetches titles the person is known for
 * user.getBookmark(userId, individualId) - Checks bookmark status
 * user.addBookmark(userId, individualId) - Adds bookmark
 * user.removeBookmark(userId, individualId) - Removes bookmark
 */

function Individual() {
    const { individualId } = useParams();
    const { isSignedIn, userId } = useAuthStatus();

    // Modal state for "Add to List"
    const [showListModal, setShowListModal] = useState(false);

    // TMDB images state
    const [tmdbImages, setTmdbImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);

    // Use custom hook for all data fetching and state management
    const {
        individual,
        loading,
        error,
        knownForTitles,
        loadingKnownFor,
        isBookmarked,
        toggleBookmark
    } = useIndividualData(individualId, userId, isSignedIn);

    // Fetch TMDB images for this individual
    useEffect(() => {
        const fetchTmdbImages = async () => {
            if (!individual?.name) {
                setLoadingImages(false);
                return;
            }

            try {
                setLoadingImages(true);
                
                console.log('Searching TMDB for:', individual.name);
                
                // First, search for the person by name
                const searchResults = await mdb.tmdb.searchPerson(individual.name);
                console.log('TMDB search results:', searchResults);
                
                if (searchResults?.results?.length > 0) {
                    // Get the first matching person (most likely match)
                    const personId = searchResults.results[0].id;
                    console.log('Getting TMDB person details for ID:', personId);
                    
                    // Fetch full person details with images
                    const personDetails = await mdb.tmdb.getPerson(personId);
                    console.log('TMDB person details:', personDetails);
                    
                    if (personDetails?.images?.profiles) {
                        // Get up to 10 profile images
                        const imageUrls = personDetails.images.profiles
                            .slice(0, 10)
                            .map(img => `https://image.tmdb.org/t/p/w500${img.file_path}`);
                        
                        console.log('TMDB image URLs:', imageUrls);
                        setTmdbImages(imageUrls);
                    } else {
                        console.log('No profiles found in TMDB data');
                    }
                } else {
                    console.log('No search results found for:', individual.name);
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

    // Handle opening the list modal
    const handleAddToList = () => {
        setShowListModal(true);
    };

    // Handle success when added to list
    const handleListSuccess = (result) => {
        console.log(`Successfully added ${result.itemName} to list "${result.listName}"`);
    };

    // Handle error when adding to list
    const handleListError = (error) => {
        console.error('List operation failed:', error);
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!individual) return <NotFoundState message="No individual found" />;

    // Prepare job badges (if we have profession data)
    const badges = [];
    // Note: The Individual class doesn't have profession field by default
    // This would need to be added to the API response or derived from knownFor data
    // For now, we'll show a generic "Actor" badge if knownFor data exists
    if (knownForTitles.length > 0) {
        badges.push({ text: 'Actor', variant: 'primary' });
    }

    // Prepare sections for MainDisplay
    const sections = [];

    // Birth - Death years section
    if (individual.birthYear || individual.deathYear) {
        const birthYear = individual.birthYear !== 'n/a' ? individual.birthYear : '?';
        const deathYear = individual.deathYear !== 'n/a' ? individual.deathYear : 'Present';
        sections.push({
            title: 'Lifespan',
            content: (
                <p className="text-muted">
                    <strong>Born:</strong> {birthYear}
                    {individual.deathYear && individual.deathYear !== 'n/a' && (
                        <> • <strong>Died:</strong> {deathYear}</>
                    )}
                </p>
            )
        });
    }

    return (
        <>
            <MainDisplay
                image={individual.image || placeholderImage}
                title={individual.name || 'Unknown'}
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
            {/* Photo Gallery Section - TMDB Images Carousel */}
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
                            makeCarousel({
                                items: tmdbImages.map((imageUrl, index) => (
                                    <div key={index} className="text-center">
                                        <img
                                            src={imageUrl}
                                            alt={`${individual.name} - Photo ${index + 1}`}
                                            className="individual-carousel-image"
                                        />
                                    </div>
                                )),
                                itemsPerSlide: 4,
                                controls: true,
                                indicators: false
                            })
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Known For Section - Movies Carousel */}
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
                            makeCarousel({
                                items: knownForTitles.map((title) => (
                                    <MediaCard
                                        key={title.id}
                                        id={title.id}
                                        type="title"
                                        image={title.image || placeholderImage}
                                        title={title.name}
                                        subtitle={title.startYear ? `(${title.startYear})` : null}
                                        size="medium"
                                    />
                                )),
                                itemsPerSlide: 4,
                                controls: true,
                                indicators: false
                            })
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </MainDisplay>

        {/* Add to List Modal */}
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
