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

// ToggleButton: en lille grundkomponent der skifter mellem to tilstande (start/stop, gem/ikke gem)
// Tanken er at al udseende og tekst bestemmes udefra, saa denne kan bruges i mange scenarier
function ToggleButton({
    itemId, // valgfrit id der beskriver hvilket element der aendres
    isActive = false, // viser om knappen allerede er i aktiv tilstand (sand) eller ej (falsk)
    onToggle, // funktion fra foraeldre-komponenten der kender forretningslogik
    activeLabel = 'Deactivate', // tekst til skraemlaeser naar knappen er aktiv
    inactiveLabel = 'Activate', // tekst til skraemlaeser naar knappen er inaktiv
    className = '', // giver mulighed for at style via CSS klasser
    style = {}, // direkte inline-styles hvis der er behov
    children, // visuelt indhold, f.eks. ikon eller tekst, bestemt af foraeldre-komponenten
    disabled = false, // goer knappen uklikbar hvis sand
    type = 'button' // HTML button-type, standard er "button" saa formularer ikke sendes ved klik
}) {
    const handleClick = (e) => {
        e.preventDefault(); // undgaar at en formular sendes utilsigtet
        e.stopPropagation(); // stopper eventet fra at boble videre op i DOM

        if (disabled || !onToggle) return; // hvis knappen er slukket eller der mangler haandterer, saa goer intet

        const newState = !isActive; // vend den nuvaerende tilstand: aktiv bliver inaktiv og omvendt

        // Hvis vi har et itemId, saendes det med for at goere opkaldet spor-bart i logiklaget
        if (itemId !== undefined) {
            onToggle(itemId, newState);
        } else {
            onToggle(newState); // ellers sendes kun den nye tilstand
        }
    };

    const ariaLabel = isActive ? activeLabel : inactiveLabel; // skraemlaeser-tekst skifter med tilstand

    return (
        <button
            type={type}
            onClick={handleClick}
            className={className}
            style={style}
            aria-label={ariaLabel} // hjaelper brugere med skraemlaeser: beskriver hvad klik goer nu
            aria-pressed={isActive} // standard ARIA attribut der viser om knappen er trykket ned (aktiv)
            title={ariaLabel} // hover-tekst for visuelle brugere, matcher skraemlaeser-teksten
            disabled={disabled}
        >
            {children} {/* alt synligt indhold leveres af foraeldre, f.eks. ikon eller tekst */}
        </button>
    );
}

export default ToggleButton;
