import { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { convertToStars, convertFromStars } from '../utils/ratingUtils';

/**
 * Rating Component (React Bootstrap Version)
 * 
 * A simple, reusable star rating component that can display or allow editing of ratings.
 * Uses React Bootstrap components for consistent styling.
 * 
 * Rating system: 0-10 scale displayed as 5 stars (each star = 2 points)
 * 
 * @param {number} initialRating - The starting rating value (0-10)
 * @param {boolean} editable - Whether the user can change the rating (default: false)
 * @param {function} onRatingChange - Callback function when rating changes (optional)
 * @param {boolean} showNumber - Whether to display the numeric rating (default: true)
 */
function Rating({ initialRating = 0, editable = false, onRatingChange, showNumber = true }) {
    // State to track current rating (0-10 scale)
    const [rating, setRating] = useState(initialRating);
    // State for hover effect when editable
    const [hoverRating, setHoverRating] = useState(0);

    // Convert 0-10 rating to 0-5 stars
    const convertToStars = (ratingValue) => Math.round(ratingValue / 2);
    
    // Convert star number (1-5) to rating value (2-10)
    const convertFromStars = (starNumber) => starNumber * 2;

    // Handle rating click (only if editable)
    const handleClick = (starValue) => {
        if (editable) {
            // Convert star value (2, 4, 6, 8, 10) back to 0-10 rating
            const newRating = rating === starValue ? 0 : starValue;
            setRating(newRating);
            // Call callback function if provided
            if (onRatingChange) {
                onRatingChange(newRating);
            }
        }
    };

    // Handle mouse hover (only if editable)
    const handleMouseEnter = (starValue) => {
        if (editable) {
            setHoverRating(starValue);
        }
    };

    // Reset hover state when mouse leaves
    const handleMouseLeave = () => {
        if (editable) {
            setHoverRating(0);
        }
    };

    // Convert 0-10 rating to 0-5 stars (for display)
    const displayRating = hoverRating || rating;
    const stars = convertToStars(displayRating);

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Star display - 5 stars representing 0-10 scale */}
            <div 
                className="d-flex gap-1"
                style={{ cursor: editable ? 'pointer' : 'default' }}
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const starRatingValue = convertFromStars(star); // Convert to 0-10 scale
                    return (
                        <span
                            key={star}
                            onClick={() => handleClick(starRatingValue)}
                            onMouseEnter={() => handleMouseEnter(starRatingValue)}
                            style={{
                                fontSize: '1.5rem',
                                color: star <= stars ? 'var(--accent-color, #1f90f3)' : '#ccc',
                                transition: 'color 0.2s',
                                userSelect: 'none'
                            }}
                        >
                            {star <= stars ? '★' : '☆'}
                        </span>
                    );
                })}
            </div>

            {/* Numeric rating display (0-10 scale) using Bootstrap Badge */}
            {showNumber && (
                <Badge 
                    bg="primary" 
                    style={{ 
                        fontSize: '0.9rem',
                        fontWeight: 'normal',
                        backgroundColor: 'var(--accent-color, #1f90f3)'
                    }}
                >
                    {displayRating.toFixed(1)}/10
                </Badge>
            )}
        </div>
    );
}

export default Rating;
