import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';

/**
 * Rating Component (React Bootstrap Version)
 * 
 * A simple, reusable star rating component that can display or allow editing of ratings.
 * Uses React Bootstrap components for consistent styling.
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

    // Handle rating click (only if editable)
    const handleClick = (value) => {
        if (editable) {
            setRating(value);
            // Call callback function if provided
            if (onRatingChange) {
                onRatingChange(value);
            }
        }
    };

    // Handle mouse hover (only if editable)
    const handleMouseEnter = (value) => {
        if (editable) {
            setHoverRating(value);
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
    const stars = Math.round(displayRating / 2); // Convert to 5-star scale

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Star display - 5 stars representing 0-10 scale */}
            <div 
                className="d-flex gap-1"
                style={{ cursor: editable ? 'pointer' : 'default' }}
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => handleClick(star * 2)} // Click sets rating (star * 2 for 0-10 scale)
                        onMouseEnter={() => handleMouseEnter(star * 2)}
                        style={{
                            fontSize: '1.5rem',
                            color: star <= stars ? '#1f90f3' : '#ccc', // App accent color for filled stars
                            transition: 'color 0.2s',
                            userSelect: 'none'
                        }}
                    >
                        {star <= stars ? '★' : '☆'}
                    </span>
                ))}
            </div>

            {/* Numeric rating display (0-10 scale) using Bootstrap Badge */}
            {showNumber && (
                <Badge 
                    bg="primary" 
                    style={{ 
                        fontSize: '0.9rem',
                        fontWeight: 'normal',
                        backgroundColor: '#1f90f3'
                    }}
                >
                    {displayRating.toFixed(1)}/10
                </Badge>
            )}
        </div>
    );
}

export default Rating;
