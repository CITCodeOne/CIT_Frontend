/**
 * ToggleButton Component
 * 
 * A highly reusable, unstyled toggle button for binary state interactions.
 * Perfect for: bookmarks, favorites, likes, follow/unfollow, on/off switches, etc.
 * The parent component controls ALL styling and content.
 * 
 * @param {string|number} itemId - Unique identifier for the item being toggled (optional if no tracking needed)
 * @param {boolean} isActive - Current toggle state (true = active/on, false = inactive/off)
 * @param {function} onToggle - Callback when toggled. Receives (itemId, newState) or just (newState) if no itemId
 * @param {string} activeLabel - Aria label when active (e.g., "Remove bookmark", "Unlike")
 * @param {string} inactiveLabel - Aria label when inactive (e.g., "Add bookmark", "Like")
 * @param {string} className - Optional CSS classes for styling
 * @param {object} style - Optional inline styles
 * @param {node} children - Content to display (parent determines based on isActive state)
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} type - Button type attribute (default: "button")
 */
function ToggleButton({ 
    itemId,
    isActive = false,
    onToggle,
    activeLabel = 'Deactivate',
    inactiveLabel = 'Activate',
    className = '',
    style = {},
    children,
    disabled = false,
    type = 'button'
}) {
    const handleClick = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (disabled || !onToggle) return;
        
        const newState = !isActive;
        
        // Call with itemId if provided, otherwise just the state
        if (itemId !== undefined) {
            onToggle(itemId, newState);
        } else {
            onToggle(newState);
        }
    };

    const ariaLabel = isActive ? activeLabel : inactiveLabel;

    return (
        <button
            type={type}
            onClick={handleClick}
            className={className}
            style={style}
            aria-label={ariaLabel}
            aria-pressed={isActive}
            title={ariaLabel}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default ToggleButton;
