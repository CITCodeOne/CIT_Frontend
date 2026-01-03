import ToggleButton from './ToggleButton';

// Denne komponent bruger ToggleButton som motor, men giver den et fokus paa bookmarks
// Saa en laeser uden kodebaggrund kan se dette som en lille adapter, der giver faste tekster og ikoner for favorit
function BookmarkButton({ itemId, isBookmarked = false, onToggle, ...rest }) {
    // itemId: unik noegle for det element der markeres
    // isBookmarked: sandt hvis brugeren allerede har gemt det (viser fyldt stjerne)
    // onToggle: funktion der kaldes, naar brugeren klikker (fjerner eller tilfoejer gemt status)
    // ...rest: alle andre props vi ikke kender her, men som skal sendes videre (f.eks. CSS klasser)
    return (
        <ToggleButton
            itemId={itemId} // send videre, saa ToggleButton ved hvilket element der aendres
            isActive={isBookmarked} // styrer om knappen vises som aktiv (gemt) eller ej
            onToggle={onToggle} // kaldes ved klik; haandterer gem/fjern logik i overliggende kode
            activeLabel="Remove bookmark" // tekst for skraemlaeser, naar element allerede er gemt
            inactiveLabel="Add bookmark" // tekst for skraemlaeser, naar element ikke er gemt endnu
            {...rest} // sikrer at andre indstillinger naar hele vejen ned til ToggleButton
        >
            {isBookmarked ? '★' : '☆'} {/* viser fyldt stjerne hvis gemt, ellers tom stjerne */}
        </ToggleButton>
    );
}

export default BookmarkButton;
