<<<<<<< Updated upstream
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Badge } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import RowComp from '../components/RowComp';
=======
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import MainDisplay from '../components/MainDisplay';
import List from '../components/List';
>>>>>>> Stashed changes
import MediaCard from '../components/MediaCard';
import ListManager from '../components/ListManager';
import useIndividualData from '../hooks/useIndividualData';
import placeholderImage from '../pics/Image-not-found.png';
import '../style/CTitlePage.css';

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
    
    // Dummy auth (replace with real auth later)
    const userId = '55';
    const isLoggedIn = true;

    // Modal state for "Add to List"
    const [showListModal, setShowListModal] = useState(false);

    // Use custom hook for all data fetching and state management
    const {
        individual,
        loading,
        error,
        knownForTitles,
        loadingKnownFor,
        isBookmarked,
        toggleBookmark
    } = useIndividualData(individualId, userId, isLoggedIn);

    // Handle opening the list modal
    const handleAddToList = () => {
        setShowListModal(true);
    };

    // Handle success when added to list
    const handleListSuccess = (result) => {
        if (result.action === 'created') {
            alert(`Created list "${result.listName}" and added ${result.itemName}!`);
        } else {
            alert(`Added ${result.itemName} to "${result.listName}"!`);
        }
    };

    // Handle error when adding to list
    const handleListError = (error) => {
        console.error('List operation failed:', error);
    };

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center loading-container">
            <Spinner animation="border" />
        </Container>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        </Container>
    );

    if (!individual) return (
        <Container className="mt-5">
            <Alert variant="warning">No individual found</Alert>
        </Container>
    );

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

    // Biography/Description section (placeholder - would need to be added to API)
    // Adding a placeholder section that can be filled when API provides this data
    sections.push({
        title: 'Biography',
        content: (
            <p className="text-muted">
                Biography information is currently not available from the API.
            </p>
        )
    });

    // Group titles by profession (if we had profession data in the response)
    // For now, we'll show all titles in a single "Known For" section
    const groupedTitles = knownForTitles.reduce((acc, title) => {
        // If we had profession data: const profession = title.profession || 'Actor';
        const profession = 'Actor'; // Default for now
        if (!acc[profession]) {
            acc[profession] = [];
        }
        acc[profession].push(title);
        return acc;
    }, {});

    return (
        <>
            <MainDisplay
                image={individual.image || placeholderImage}
                title={individual.name || 'Unknown'}
                subtitle={null}
                badges={badges}
                sections={sections}
                customAction={{
                    label: 'Add to List',
                    variant: 'primary',
                    icon: '📋',
                    onClick: handleAddToList
                }}
            >
            {/* Awards Section - Placeholder */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Awards & Nominations</h4>
                        <p className="text-muted">
                            Awards information is currently not available from the API.
                        </p>
                    </Card.Body>
                </Card>
            </Container>

            {/* Photo Gallery Section - Placeholder */}
            <Container className="mt-4">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">Photos</h4>
                        <p className="text-muted">
                            Photo gallery is currently not available from the API.
                        </p>
                    </Card.Body>
                </Card>
            </Container>

            {/* Known For Section - Grouped by Profession */}
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
                            <>
                                {Object.entries(groupedTitles).map(([profession, titles]) => (
                                    <div key={profession} className="mb-4">
                                        <h5 className="mb-3">
                                            <Badge bg="secondary">{profession}</Badge>
                                        </h5>
                                        <List
                                            variant="grid"
                                            items={titles}
                                            renderItem={(title) => (
                                                <MediaCard
                                                    key={title.id}
                                                    id={title.id}
                                                    type="title"
                                                    image={title.image}
                                                    title={title.name}
                                                    subtitle={title.startYear ? `(${title.startYear})` : null}
                                                    size="large"
                                                    actions={[
                                                        {
                                                            label: 'View',
                                                            variant: 'outline-primary',
                                                            onClick: (id) => window.location.href = `/title/${id}`
                                                        }
                                                    ]}
                                                />
                                            )}
                                        />
                                    </div>
                                ))}
                            </>
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
