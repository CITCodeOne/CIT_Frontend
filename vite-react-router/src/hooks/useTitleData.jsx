import { useState, useEffect } from 'react';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import placeholderImage from '../pics/Image-not-found.png';

/**
 * useTitleData Hook
 * 
 * Manages all data fetching and state for a title detail page.
 * Handles title data, cast, reviews, bookmarks, and user ratings.
 * 
 * @param {string} titleId - ID of the title to load
 * @param {string} userId - ID of logged-in user (null if not logged in)
 * @param {boolean} isLoggedIn - Whether a user is currently logged in
 * @returns {object} Complete title data and interaction functions
 */
export default function useTitleData(titleId, userId = null, isLoggedIn = false) {
    // Main title data state
    const [title, setTitle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cast data state
    const [cast, setCast] = useState([]);
    const [loadingCast, setLoadingCast] = useState(true);

    // Reviews data state
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Bookmark state
    const [isBookmarked, setIsBookmarked] = useState(false);

    // User rating state
    const [userRating, setUserRating] = useState(0);
    const [loadingUserRating, setLoadingUserRating] = useState(true);

    // 1. Fetch main title data
    useEffect(() => {
        const fetchTitleData = async () => {
            if (!titleId) return;

            try {
                setLoading(true);
                const titleData = await mdb.apiv2.titles.getById(titleId);
                setTitle(titleData);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load title');
                setTitle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTitleData();
    }, [titleId]);

    // 2. Fetch cast/individuals data
    useEffect(() => {
        const fetchCast = async () => {
            if (!titleId) return;

            try {
                setLoadingCast(true);
                const castData = await mdb.apiv2.titles.getIndividuals(titleId);
                
                // Map to format expected by MediaCard component
                const formattedCast = Array.isArray(castData) ? castData.map(person => ({
                    id: person.id,
                    name: person.name || 'Unknown',
                    character: person.character || null,
                    profilePath: person.profilePath || placeholderImage
                })) : [];
                
                setCast(formattedCast);
            } catch (err) {
                console.error('Failed to load cast:', err);
                setCast([]);
            } finally {
                setLoadingCast(false);
            }
        };

        fetchCast();
    }, [titleId]);

    // 3. Fetch reviews/ratings data
    useEffect(() => {
        const fetchReviews = async () => {
            if (!titleId) return;

            try {
                setLoadingReviews(true);
                const ratingsData = await mdb.apiv2.titles.getRatings(titleId);
                
                // Map to format expected by UserCard component
                const formattedReviews = Array.isArray(ratingsData) ? ratingsData.map((rating, index) => ({
                    id: rating.userId || index,
                    userId: rating.userId,
                    author: rating.userId || 'Anonymous',
                    rating: rating.rating || 'N/A',
                    content: rating.review || rating.content || 'No review content available.',
                    authorAvatar: placeholderImage,
                    time: rating.time
                })) : [];
                
                setReviews(formattedReviews);
            } catch (err) {
                console.error('Failed to load reviews:', err);
                setReviews([]);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [titleId]);

    // 4. Check if title is bookmarked (if user is logged in)
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (!isLoggedIn || !userId || !titleId) {
                setIsBookmarked(false);
                return;
            }
            
            try {
                const bookmark = await mdb.apiv2.user.getBookmark(userId, titleId);
                setIsBookmarked(!!bookmark);
            } catch (err) {
                console.error('Failed to check bookmark status:', err);
                setIsBookmarked(false);
            }
        };

        checkBookmarkStatus();
    }, [titleId, userId, isLoggedIn]);

    // 5. Fetch user's rating for this title (if logged in)
    useEffect(() => {
        const fetchUserRating = async () => {
            if (!isLoggedIn || !userId || !titleId) {
                setLoadingUserRating(false);
                setUserRating(0);
                return;
            }
            
            try {
                setLoadingUserRating(true);
                const rating = await mdb.apiv2.user.getRating(userId, titleId);
                setUserRating(rating?.rating || 0);
            } catch (err) {
                console.error('Failed to fetch user rating:', err);
                setUserRating(0);
            } finally {
                setLoadingUserRating(false);
            }
        };

        fetchUserRating();
    }, [titleId, userId, isLoggedIn]);

    // Bookmark toggle handler
    const toggleBookmark = async () => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to bookmark titles');
            return;
        }

        try {
            if (isBookmarked) {
                await mdb.apiv2.user.removeBookmark(userId, titleId);
                setIsBookmarked(false);
            } else {
                await mdb.apiv2.user.addBookmark(userId, titleId);
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    // Rating change handler (add or update)
    const updateUserRating = async (newRating) => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to rate titles');
            return;
        }

        try {
            if (userRating === 0) {
                // Add new rating
                await mdb.apiv2.user.addRating(userId, titleId, newRating);
            } else {
                // Update existing rating
                await mdb.apiv2.user.updateRating(userId, titleId, newRating);
            }
            setUserRating(newRating);
        } catch (err) {
            console.error('Failed to update rating:', err);
            alert('Failed to update rating. Please try again.');
        }
    };

    // Rating delete handler
    const deleteUserRating = async () => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to delete ratings');
            return;
        }

        if (!window.confirm('Are you sure you want to delete your rating?')) {
            return;
        }

        try {
            await mdb.apiv2.user.removeRating(userId, titleId);
            setUserRating(0);
        } catch (err) {
            console.error('Failed to delete rating:', err);
            alert('Failed to delete rating. Please try again.');
        }
    };

    // Return all data and handlers
    return {
        // Title data
        title,
        loading,
        error,

        // Cast data
        cast,
        loadingCast,

        // Reviews data
        reviews,
        loadingReviews,

        // Bookmark data
        isBookmarked,
        toggleBookmark,

        // User rating data
        userRating,
        loadingUserRating,
        updateUserRating,
        deleteUserRating
    };
}
