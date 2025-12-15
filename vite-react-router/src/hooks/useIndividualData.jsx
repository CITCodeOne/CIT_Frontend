import { useState, useEffect } from 'react';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import placeholderImage from '../pics/Image-not-found.png';

/**
 * useIndividualData Hook
 * 
 * Manages all data fetching and state for an individual detail page.
 * Handles individual data, known-for titles, and bookmarks.
 * 
 * @param {string} individualId - ID of the individual to load
 * @param {string} userId - ID of logged-in user (null if not logged in)
 * @param {boolean} isLoggedIn - Whether a user is currently logged in
 * @returns {object} Complete individual data and interaction functions
 */
export default function useIndividualData(individualId, userId = null, isLoggedIn = false) {
    // Main individual data state
=======
=======
>>>>>>> Stashed changes

/**
 * Custom hook for fetching and managing individual (person) data
 * 
 * Centralizes all data fetching logic for the Individual page:
 * - Basic individual information (name, birth/death year, image, rating)
 * - Known for titles (movies/shows the person worked on)
 * 
 * @param {string} individualId - The ID of the individual to fetch
 * @param {string} userId - The current user's ID (for future bookmark/list features)
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @returns {Object} All state and handlers needed for the Individual page
 */
function useIndividualData(individualId, userId, isLoggedIn) {
    // Individual basic data state
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    const [individual, setIndividual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Known-for titles state
    const [knownForTitles, setKnownForTitles] = useState([]);
    const [loadingKnownFor, setLoadingKnownFor] = useState(true);

    // Bookmark state
    const [isBookmarked, setIsBookmarked] = useState(false);

    // 1. Fetch main individual data
    useEffect(() => {
        const fetchIndividualData = async () => {
            if (!individualId) return;

            try {
                setLoading(true);
                const individualData = await mdb.apiv2.individuals.getById(individualId);
                setIndividual(individualData);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load individual');
                setIndividual(null);
=======
=======
>>>>>>> Stashed changes
    // Known for titles state
    const [knownForTitles, setKnownForTitles] = useState([]);
    const [loadingKnownFor, setLoadingKnownFor] = useState(true);

    // Fetch individual basic data
    useEffect(() => {
        const fetchIndividual = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await mdb.apiv2.individuals.getById(individualId);
                setIndividual(data);
            } catch (err) {
                console.error('Error fetching individual:', err);
                setError(err.message || 'Failed to load individual data');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            } finally {
                setLoading(false);
            }
        };

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        fetchIndividualData();
    }, [individualId]);

    // 2. Fetch known-for titles
    useEffect(() => {
        const fetchKnownFor = async () => {
            if (!individualId) return;

            try {
                setLoadingKnownFor(true);
                const titlesData = await mdb.apiv2.individuals.getTitles(individualId);
                
                // Map to format expected by MediaCard component
                const formattedTitles = Array.isArray(titlesData) ? titlesData.map(title => ({
                    id: title.id,
                    name: title.name || title.title || 'Unknown',
                    poster: title.poster || title.posterPath || placeholderImage,
                    year: title.releaseYear || title.year || null,
                    profession: title.profession || title.category || null
                })) : [];
                
                setKnownForTitles(formattedTitles);
            } catch (err) {
                console.error('Failed to load known-for titles:', err);
=======
=======
>>>>>>> Stashed changes
        if (individualId) {
            fetchIndividual();
        }
    }, [individualId]);

    // Fetch known for titles
    useEffect(() => {
        const fetchKnownForTitles = async () => {
            try {
                setLoadingKnownFor(true);
                const titles = await mdb.apiv2.individuals.getTitles(individualId);
                setKnownForTitles(Array.isArray(titles) ? titles : []);
            } catch (err) {
                console.error('Error fetching known for titles:', err);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                setKnownForTitles([]);
            } finally {
                setLoadingKnownFor(false);
            }
        };

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        fetchKnownFor();
    }, [individualId]);

    // 3. Check if individual is bookmarked (if user is logged in)
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (!isLoggedIn || !userId || !individualId) {
                setIsBookmarked(false);
                return;
            }
            
            try {
                const bookmark = await mdb.apiv2.user.getBookmark(userId, individualId);
                setIsBookmarked(!!bookmark);
            } catch (err) {
                console.error('Failed to check bookmark status:', err);
                setIsBookmarked(false);
            }
        };

        checkBookmarkStatus();
    }, [individualId, userId, isLoggedIn]);

    // Bookmark toggle handler
    const toggleBookmark = async () => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to bookmark individuals');
            return;
        }

        try {
            if (isBookmarked) {
                await mdb.apiv2.user.removeBookmark(userId, individualId);
                setIsBookmarked(false);
            } else {
                await mdb.apiv2.user.addBookmark(userId, individualId);
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    // Return all data and handlers
    return {
        // Individual data
        individual,
        loading,
        error,

        // Known-for titles data
        knownForTitles,
        loadingKnownFor,

        // Bookmark data
        isBookmarked,
        toggleBookmark
    };
}
=======
=======
>>>>>>> Stashed changes
        if (individualId) {
            fetchKnownForTitles();
        }
    }, [individualId]);

    return {
        individual,
        loading,
        error,
        knownForTitles,
        loadingKnownFor
    };
}

export default useIndividualData;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
