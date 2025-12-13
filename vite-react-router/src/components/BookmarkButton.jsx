import React from 'react';
import ToggleButton from './ToggleButton';

/**
 * BookmarkButton - Thin wrapper around ToggleButton for bookmarks
 */
function BookmarkButton({ itemId, isBookmarked = false, onToggle, ...rest }) {
    return (
        <ToggleButton
            itemId={itemId}
            isActive={isBookmarked}
            onToggle={onToggle}
            activeLabel="Remove bookmark"
            inactiveLabel="Add bookmark"
            {...rest}
        >
            {isBookmarked ? '★' : '☆'}
        </ToggleButton>
    );
}

export default BookmarkButton;
