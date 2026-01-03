import { useEffect, useRef, useState } from 'react'; // Hooks til state, lifecycle og mutable refs
import { Link } from 'react-router-dom'; // Link komponent der router uden fuld reload
import { LoadingState } from './PageStates'; // Lille spinner/placeholder naar ekstra data hentes
import {
  fallbackImage,
  imageCache,
  cacheKeyForItem,
  truncateText,
  resolveTitle,
  resolveSubtitle,
  resolveDescription,
  resolveImage,
  resolveYear,
  findPosterForItem,
  fetchPersonExtraData
} from './utils/PreviewCardsUtils';
import { getImageUrl, getTitlePoster } from '../business-logic-layer/TmdbIntegration'; // Kald til TMDB helpers for billeder

export default function PreviewCards({ item = {}, focusKey }) {
  const [imageSrc, setImageSrc] = useState(null); // Aktuelt billede der vises paa kortet
  const [tmdbPoster, setTmdbPoster] = useState(null); // TMDB plakat hvis vi finder en bedre version
  const [extraData, setExtraData] = useState(null); // Supplerende TMDB info om personer
  const [loadingExtra, setLoadingExtra] = useState(false); // Flag der viser at ekstra data haentes
  const tmdbFallbackTriedRef = useRef(false); // Holder styr paa om vi allerede har proevet TMDB fallback
  const cacheKey = cacheKeyForItem(item); // Stabil noegle saa billeder kan caches paa tvrs af renders

  const mediaType = item.mediaType || item.media_type; // Medietype fra API (film, serie, etc.)
  const isContributor = !mediaType; // Hvis ingen medietype, antager vi at det er en person/medvirkende

  const displayFocusKey = isContributor
    ? (extraData?.known_for_department || 'CONTRIBUTOR') // Viser f.eks. "Acting" hvis vi har det fra TMDB
    : (mediaType?.toUpperCase() || 'TITLE'); // Viser TITEL hvis ikke andet

  const title = resolveTitle(item); // Finder det bedste titelnavn der findes i dataen
  const subtitle = resolveSubtitle(item, extraData); // Undertekst som rolle eller aar
  const rawDescription = resolveDescription(item, extraData); // Beskrivelse fra data eller TMDB fallback
  const description = loadingExtra ? 'Loading...' : rawDescription; // Viser loading-tekst mens vi venter
  const image = resolveImage(item, extraData); // Lokalt eller TMDB baseret billede hvis tilgaengeligt
  const year = resolveYear(item); // Udgivelses- eller foedselsaar
  useEffect(() => {
    const cachedImage = cacheKey ? imageCache.get(cacheKey) : null; // Proev foerst at hente fra cache for hurtig visning
    if (cachedImage) {
      setImageSrc(cachedImage); // Rammer vi cache slipper vi for yderligere kald
      return;
    }

    const next = image || fallbackImage; // Brug beregnet billede eller et sikkert fallback
    setImageSrc(next);
    if (cacheKey) imageCache.set(cacheKey, next); // Cache sa fremtidige renders er hurtige

    if (!image) {
      // Hvis vi ingen primaer kilde har, soeg automatisk efter TMDB plakat
      (async () => {
        tmdbFallbackTriedRef.current = true; // Marker at vi har proevet TMDB fallback
        const poster = await findPosterForItem(item, cacheKey);
        if (poster) setImageSrc(poster); // Opdater billedet saa kortet ser bedre ud
      })();
    }
  }, [cacheKey, image, item]);

  // Fetch TMDB poster proactively and prefer it (align with Title page behavior)
  // Skip this for contributors (individuals) to avoid using title posters
  useEffect(() => {
    let cancelled = false; // Giver mulighed for at aflyse async arbejde hvis komponenten afmonteres
    const name = item?.title || item?.name; // Brug titelnavn eller personnavn
    if (!name || isContributor) return; // Springer personer over og hvis ingen navn findes

    (async () => {
      try {
        const year = item?.startYear || item?.year || (item?.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined); // Ansl aad saa TMDB kan matche bedre
        const poster = await getTitlePoster(name, item.mediaType || item.media_type, year); // Henter potentielt bedre plakat
        if (cancelled) return; // Afbryd hvis komponenten er fjernet
        if (poster) {
          setTmdbPoster(poster); // Gem TMDB varianten
          setImageSrc(poster); // Vis den nye plakat paa kortet
          if (cacheKey) imageCache.set(cacheKey, poster); // Cache sa den kan genbruges
        }
      } catch (err) {
        console.error('TMDB poster fetch failed in PreviewCards', err);
      }
    })();

    return () => { cancelled = true; }; // Cleanup der stopper videre state-opdatering
  }, [item.title, item.name, item.mediaType, item.media_type, item.startYear, item.year, item.releaseDate, cacheKey, isContributor]);

  // When extraData changes and provides a TMDB profile_path, update imageSrc and cache
  useEffect(() => {
    if (isContributor && extraData?.profile_path) {
      const tmdbProfileUrl = getImageUrl(extraData.profile_path, 'w185');
      setImageSrc(tmdbProfileUrl);
      if (cacheKey) imageCache.set(cacheKey, tmdbProfileUrl);
    }
  }, [extraData?.profile_path, isContributor, cacheKey]);

  useEffect(() => {
    let cancelled = false; // Beskytter mod state-opdatering efter unmount
    if (item.name && isContributor) { // Kun personer har brug for ekstra TMDB data
      (async () => {
        setLoadingExtra(true); // Viser spinner i UI mens vi henter
        try {
          const data = await fetchPersonExtraData(item.name, cacheKey); // Hent detaljer som kendt for, profilbillede
          if (cancelled) return;
          if (data) {
            setExtraData(data); // Gemmer ekstra data til videre brug (titel/afdeling/billede)
          }
        } catch (err) {
          console.error('Error fetching TMDB data:', err);
        } finally {
          if (!cancelled) setLoadingExtra(false); // Fjern spinner naar vi er faerdige
        }
      })();
    }

    return () => {
      cancelled = true; // Marker cleanup saa async callback ikke saetter state
    };
  }, [item.name, item.mediaType, item.media_type, cacheKey]);

  const handleImageError = () => {
    if (!tmdbFallbackTriedRef.current) { // Foerste fejl: proev at finde et andet billede via TMDB
      tmdbFallbackTriedRef.current = true;
      (async () => {
        const poster = await findPosterForItem(item, cacheKey);
        if (poster) {
          setImageSrc(poster);
          if (cacheKey) imageCache.set(cacheKey, poster);
          return;
        }
        if (imageSrc !== fallbackImage) { // Ingen poster fundet, brug generisk fallback
          setImageSrc(fallbackImage);
          if (cacheKey) imageCache.set(cacheKey, fallbackImage);
        }
      })();
      return;
    }

    if (imageSrc !== fallbackImage) { // Hvis vi allerede har proevet, ender vi paa fallback
      setImageSrc(fallbackImage);
      if (cacheKey) imageCache.set(cacheKey, fallbackImage);
    }
  };

  // Check type to determine either mediaType or contributionType
  let typeLine = null;
  if (isContributor) {
    const knownForTitles = extraData?.known_for ? extraData.known_for.map(kf => kf.title || kf.name).filter(Boolean).join(', ') : ''; // Samler kendte vaerker
    const truncatedKnownFor = truncateText(knownForTitles, 100); // Kutter teksten saa den passer paa kortet
    typeLine = (
      <span className="text-muted small">
        {truncatedKnownFor || 'No known works'}
      </span>
    );
  } else {
    const mediaLabel = mediaType || 'Title'; // Fald tilbage til ordet Title hvis intet andet
    typeLine = (
      <span className="text-muted small">
        {mediaLabel}
        {year ? ` · ${year}` : null}
      </span>
    );
  }

  return (
    <Link to={`/page/${item.pageId}`} className="text-decoration-none"> {/* Hele kortet linker til detaljesiden */}
      <div className="card h-100 shadow-sm border-0" style={{ minHeight: '475px' }}> {/* Kort layout med minimumshoejde for konsistent hoejde */}
        <img
          src={imageSrc}
          className="card-img-top"
          alt={title}
          style={{ height: '200px', objectFit: 'cover' }} // Beskaerer billedet pænt hvis aspektforholdet varierer
          onError={handleImageError} // Fallback hvis billedet fejler
        />
        <div className="card-body ">
          <p className="text-uppercase text-muted small mb-2">{displayFocusKey}</p> {/* Viser f.eks. TITLE eller ACTING */}

          <h5 className="card-title mb-1">{title}</h5>
          <p className="card-subtitle text-muted mb-1">{subtitle}</p>

          {loadingExtra ? (
            <div className="mb-2" style={{ height: 28, display: 'flex', alignItems: 'center' }}> {/* Pladsreservering saa layout ikke hopper mens der loades */}
              <div style={{ width: '100%' }}>
                <LoadingState message={null} />
              </div>
            </div>
          ) : (
            typeLine && <div className="mb-2">{typeLine}</div> // Viser enten kendte vaerker eller medietype/aar
          )}

          <p className="card-text small mb-0" style={{ whiteSpace: 'pre-line' }}>
            {truncateText(description, 150)} {/* Kort beskrivelse afkortet til at passe pa kortet */}
          </p>
        </div>
      </div>
    </Link>
  );
}