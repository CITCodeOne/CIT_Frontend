import { useState } from 'react';
import { Badge } from 'react-bootstrap';

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

    // We represent ratings internally as integers 0..10.
    // The UI shows 5 visual stars but supports half-star precision
    // (i.e. steps of 1 on the 0..10 scale). We'll detect clicks on the
    // left/right half of each star to decide whether to select the
    // odd (left) or even (right) value for that star.

    // Handle click on a star element. We inspect the click position
    // relative to the element to decide whether the user clicked the
    // left half (half-star) or right half (full-star).
    const handleStarClick = (starIndex, e) => {
        if (!editable) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickedRight = (e.clientX - rect.left) >= rect.width / 2;
        const value = clickedRight ? starIndex * 2 : (starIndex * 2 - 1);
        const newRating = rating === value ? 0 : value; // toggle when clicking same value
        setRating(newRating);
        if (onRatingChange) onRatingChange(newRating);
    };

    // Handle mouse move over a star to show a preview (half/full) while hovering
    const handleStarMove = (starIndex, e) => {
        if (!editable) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const onRight = (e.clientX - rect.left) >= rect.width / 2;
        const value = onRight ? starIndex * 2 : (starIndex * 2 - 1);
        setHoverRating(value);
    };

    // Reset hover state
    const handleMouseLeave = () => {
        if (!editable) return;
        setHoverRating(0);
    };

    // Which rating to display: hover takes precedence
    const displayRating = hoverRating || rating;

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Star display - 5 stars representing 0-10 scale. Each star supports
                half precision by inspecting pointer position (left half = odd,
                right half = even on the 0..10 scale). */}
            <div
                className="d-flex gap-1"
                style={{ cursor: editable ? 'pointer' : 'default' }}
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const fullThreshold = star * 2; // e.g. star 3 -> 6
                    const halfThreshold = star * 2 - 1; // e.g. star 3 -> 5

                    // Decide visual state for this star based on displayRating
                    let fillType = 'empty';
                    if (displayRating >= fullThreshold) fillType = 'full';
                    else if (displayRating >= halfThreshold) fillType = 'half';

                    // Use the same accent color for full/half but reduce opacity
                    // for half to visually differentiate without extra assets.
                    const color = fillType === 'empty' ? '#ccc' : 'var(--accent-color, #1f90f3)';
                    const opacity = fillType === 'half' ? 0.6 : 1;

                    return (
                        <span
                            key={star}
                            onClick={(e) => handleStarClick(star, e)}
                            onMouseMove={(e) => handleStarMove(star, e)}
                            style={{
                                fontSize: '1.5rem',
                                color,
                                opacity,
                                transition: 'color 0.2s, opacity 0.15s',
                                userSelect: 'none'
                            }}
                            aria-hidden={!editable}
                            title={`Rate ${fullThreshold - 1}/10 or ${fullThreshold}/10`}
                        >
                            {fillType === 'empty' ? '☆' : '★'}
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
                    {displayRating}/10
                </Badge>
            )}
        </div>
    );
}

export default Rating;
