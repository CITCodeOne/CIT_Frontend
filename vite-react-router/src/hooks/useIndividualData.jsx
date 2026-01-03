import { useState, useEffect } from 'react';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import placeholderImage from '../pics/Image-not-found.png';
import { getStoredToken } from '../components/utils/ExtractJwtData';

/**
 * useIndividualData Hook
 * 
 * Manages all data fetching and state for an individual detail page.
 * Handles individual data, known-for titles, and bookmarks.
 * 
 * @param {string} individualId - ID of the individual to load
 * @param {string} userId - ID of logged-in user (null if not logged in)
 * @param {boolean} isLoggedIn - Whether a user is currently logged in
 * @returns {object} Complete individual data and interaction functions
 */
export default function useIndividualData(individualId, userId = null, isLoggedIn = false, pageId) {
    // Grunddata for personen; starter tomt fordi vi endnu ikke kender indholdet
    const [individual, setIndividual] = useState(null);
    // Viser om vi er midt i at hente hoveddata, sa UI kan vise spinner i mellemtiden
    const [loading, setLoading] = useState(true);
    // Gemmer tekst om der skete en fejl, sa brugeren kan faa klar besked
    const [error, setError] = useState(null);

    // Liste over titler personen er kendt for; starter tom indtil vi har hentet noget
    const [knownForTitles, setKnownForTitles] = useState([]);
    // Fortaeller UI om "kendt for" listen stadig bliver hentet
    const [loadingKnownFor, setLoadingKnownFor] = useState(true);

    // Marker om brugeren allerede har bogmaerket denne side
    const [isBookmarked, setIsBookmarked] = useState(false);

    // 1. Hent hovedoplysninger om personen (navn, billede, bio)
    useEffect(() => {
        const fetchIndividualData = async () => {
            if (!individualId) return; // uden id kan vi ikke hente noget

            try {
                setLoading(true); // viser at vi arbejder
                const individualData = await mdb.apiv2.individuals.getById(individualId);
                setIndividual(individualData); // gem data til senere brug i UI
                setError(null); // ryd tidligere fejl
                // Hvis backend ikke har bio/description, soeger vi hos TMDB som reservekilde
                try {
                    if (individualData?.name && (!individualData?.bio || individualData.bio === 'n/a') && (!individualData?.description || individualData.description === 'n/a')) {
                        const search = await mdb.tmdb.searchPerson(individualData.name);
                        if (search?.results && search.results.length > 0) {
                            const tmdbId = search.results[0].id;
                            const personDetails = await mdb.tmdb.getPerson(tmdbId);
                            const tmdbBio = personDetails?.biography;
                            if (tmdbBio) {
                                setIndividual(prev => ({ ...prev, bio: tmdbBio })); // suppler kun bio, resten bevares
                            }
                        }
                    }
                } catch (tmdbErr) {
                    // Fejl her er ikke kritisk; vi har stadig basisdata, sa vi logger blot
                    console.error('Failed to fetch TMDB biography:', tmdbErr);
                }
            } catch (err) {
                setError(err.message || 'Failed to load individual'); // del fejl med brugeren
                setIndividual(null); // undgaa halvvejs data
            } finally {
                setLoading(false); // vi er faerdige uanset succes eller fejl
            }
        };

        fetchIndividualData();
    }, [individualId]);

    // 2. Hent titler personen er kendt for (film/serier) til visning i kort
    useEffect(() => {
        const fetchKnownFor = async () => {
            if (!individualId) return; // ingen id, intet opslag

            try {
                setLoadingKnownFor(true);
                const titlesData = await mdb.apiv2.individuals.getTitles(individualId);

                // Tilpas til det format MediaCard forventer, sa kortene kan vises uden fejl
                const formattedTitles = titlesData.map(title => ({
                    id: title.id,
                    pageId: title.pageId,
                    name: title.name || title.title || 'Unknown',
                    image: title.image || title.poster || title.posterPath || placeholderImage,
                    startYear: title.startYear || title.releaseYear || title.year || null,
                    profession: title.profession || title.category || null
                }));

                setKnownForTitles(formattedTitles);
            } catch (err) {
                console.error('Failed to load known-for titles:', err);
                setKnownForTitles([]); // fald tilbage til tom liste sa UI ikke bryder ned
            } finally {
                setLoadingKnownFor(false);
            }
        };

        fetchKnownFor();
    }, [individualId]);

    // 3. Tjek om brugeren allerede har bogmaerket denne person (kraever login)
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (!isLoggedIn || !userId || !individualId) {
                setIsBookmarked(false); // kan ikke vaere bogmaerket uden bruger
                return;
            }
            
            try {
                const token = getStoredToken(); // token behoeves til sikre kald
                const bookmark = await mdb.apiv2.user.getBookmark(userId, pageId);
                setIsBookmarked(!!bookmark); // konverter til boolean
            } catch (err) {
                console.error('Failed to check bookmark status:', err);
                setIsBookmarked(false); // antag ingen bogmaerke hvis tjek fejler
            }
        };

        checkBookmarkStatus();
    }, [individualId, userId, isLoggedIn, pageId]);

    // Skifter bogmaerke-tilstand: tilfoejer eller fjerner hos backend og opdaterer UI
    const toggleBookmark = async () => {
        if (!isLoggedIn || !userId) {
            alert('Please log in to bookmark individuals'); // simpel besked til ulogget bruger
            return;
        }

        try {
            const token = getStoredToken();
            if (isBookmarked) {
                await mdb.apiv2.user.removeBookmark(userId, pageId, { authToken: token });
                setIsBookmarked(false);
            } else {
                await mdb.apiv2.user.addBookmark(userId, pageId, { authToken: token });
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
            alert('Failed to update bookmark. Please try again.');
        }
    };

    // Eksporterer alle data og funktioner sa andre komponenter kan bruge dem direkte
    return {
        // Individual data
        individual,
        loading,
        error,

        // Known-for titles data
        knownForTitles,
        loadingKnownFor,

        // Bookmark data
        isBookmarked,
        toggleBookmark
    };
}
