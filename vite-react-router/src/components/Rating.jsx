import { useState } from 'react'; // Hook til lokal state haandtering
import { Badge } from 'react-bootstrap'; // Lille label-komponent fra Bootstrap til talvisning

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
    // Holder den vaerende rating i 0-10 skalaen
    const [rating, setRating] = useState(initialRating);
    // Midlertidig vaerdi der vises mens musen svaver, kun naar man maa redigere
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
        if (!editable) return; // Ignorer klik hvis kortet er laesebart men ikke redigerbart
        const rect = e.currentTarget.getBoundingClientRect(); // Finder stoerrelse/position paa stjernen
        const clickedRight = (e.clientX - rect.left) >= rect.width / 2; // Er klikket paa hoejre halvdel?
        const value = clickedRight ? starIndex * 2 : (starIndex * 2 - 1); // Hoeyre giver lige tal, venstre ulige (halv stjerne)
        const newRating = rating === value ? 0 : value; // Samme klik to gange nulstiller vaerdien som toggle
        setRating(newRating);
        if (onRatingChange) onRatingChange(newRating); // Informer foraeelder hvis callback er givet
    };

    // Handle mouse move over a star to show a preview (half/full) while hovering
    const handleStarMove = (starIndex, e) => {
        if (!editable) return; // Kun vis forhandsvisning naar brugeren faktisk kan aendre
        const rect = e.currentTarget.getBoundingClientRect(); // Paa samme maade bruger vi stjernens bredde
        const onRight = (e.clientX - rect.left) >= rect.width / 2; // Hover paa hoejre halvdel?
        const value = onRight ? starIndex * 2 : (starIndex * 2 - 1); // Beregner midlertidig rating
        setHoverRating(value); // Viser halv/hel stjerne visuelt under hover
    };

    // Reset hover state
    const handleMouseLeave = () => {
        if (!editable) return; // Intet at rydde hvis man ikke maa redigere
        setHoverRating(0); // Fjerner hoverstatus saa vi viser den gemte rating igen
    };

    // Which rating to display: hover takes precedence
    const displayRating = hoverRating || rating; // Hover-vardi har forrang, ellers vis gemt rating

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Star display - 5 stars representing 0-10 scale. Each star supports
                half precision by inspecting pointer position (left half = odd,
                right half = even on the 0..10 scale). */}
            <div
                className="d-flex gap-1"
                style={{ cursor: editable ? 'pointer' : 'default' }} // Viser hand-cursor hvis klik er tilladt
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const fullThreshold = star * 2; // Star 3 svarer til 6/10 for fuld stjerne
                    const halfThreshold = star * 2 - 1; // Star 3 halvt er 5/10

                    // Udregn hvilket udfyldningsniveau stjernen skal have
                    let fillType = 'empty';
                    if (displayRating >= fullThreshold) fillType = 'full';
                    else if (displayRating >= halfThreshold) fillType = 'half';

                    // Farven er den samme, men halv stjerne faar lavere opacitet for synlig forskel
                    const color = fillType === 'empty' ? '#ccc' : 'var(--accent-color, #1f90f3)';
                    const opacity = fillType === 'half' ? 0.6 : 1;

                    return (
                        <span
                            key={star}
                            onClick={(e) => handleStarClick(star, e)} // Klik saetter eller nulstiller rating
                            onMouseMove={(e) => handleStarMove(star, e)} // Hover justerer midlertidig visning
                            style={{
                                fontSize: '1.5rem',
                                color,
                                opacity,
                                transition: 'color 0.2s, opacity 0.15s',
                                userSelect: 'none'
                            }}
                            aria-hidden={!editable}
                            title={`Rate ${fullThreshold - 1}/10 or ${fullThreshold}/10`} // Hjælptekst viser hvilken score stjernen svarer til
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
                    {displayRating}/10 {/* Viser tallet saa brugeren kan se praecis score */}
                </Badge>
            )}
        </div>
    );
}

export default Rating;
