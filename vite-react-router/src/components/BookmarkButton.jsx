import React from 'react';

/**
 * BookmarkButton Component
 * 
 * A generic, unstyled button that handles bookmark toggle logic.
 * The parent component controls ALL styling and content.
 * 
 * @param {string|number} itemId - Unique identifier for the item to bookmark
 * @param {boolean} isBookmarked - Whether the item is currently bookmarked
 * @param {function} onToggle - Callback function when bookmark is toggled (receives itemId and new state)
 * @param {string} className - Optional CSS classes for styling
 * @param {object} style - Optional inline styles
 * @param {node} children - Content to display (required - parent determines based on isBookmarked)
 */
function BookmarkButton({ 
    itemId, 
    isBookmarked = false, 
    onToggle,
    className = '',
    style = {},
    children
}) {
    // Handle button click
    const handleClick = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (onToggle) {
            // Toggle the bookmark state
            onToggle(itemId, !isBookmarked);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={className}
            style={style}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
            {children}
        </button>
    );
}

export default BookmarkButton;
