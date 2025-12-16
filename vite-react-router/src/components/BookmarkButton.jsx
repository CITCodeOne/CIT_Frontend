import ToggleButton from './ToggleButton';

/**
 * BookmarkButton - Thin wrapper around ToggleButton for bookmarks
 */
export default function BookmarkButton({ 
    itemId, 
    isBookmarked = false, 
    onToggle, 
    activeLabel,
    inactiveLabel,
    ...rest }) {
        
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


