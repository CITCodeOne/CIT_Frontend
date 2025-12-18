import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { LoadingState } from './PageStates';
import {
  fallbackImage,
  imageCache,
  extraDataCache,
  tmdbPosterCache,
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
import { getImageUrl } from '../business-logic-layer/TmdbIntegration';

export default function PreviewCards({ item = {}, focusKey }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [extraData, setExtraData] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const tmdbFallbackTriedRef = useRef(false);

  const cacheKey = cacheKeyForItem(item);

  const displayFocusKey = (!item.mediaType && !item.media_type) ? (extraData?.known_for_department || "CONTRIBUTOR") : item.mediaType?.toUpperCase() || "TITLE";

  const title = resolveTitle(item);
  const subtitle = resolveSubtitle(item, extraData);
  const description = loadingExtra ? 'Loading...' : truncateText(resolveDescription(item, extraData));
  const image = resolveImage(item, extraData);
  const year = resolveYear(item);
  useEffect(() => {
    const cachedImage = cacheKey ? imageCache.get(cacheKey) : null;
    if (cachedImage) {
      setImageSrc(cachedImage);
      return;
    }

    const next = image || fallbackImage;
    setImageSrc(next);
    if (cacheKey) imageCache.set(cacheKey, next);

    if (!image) {
      // If we have no primary image, try TMDB poster lookup
      (async () => {
        tmdbFallbackTriedRef.current = true;
        const poster = await findPosterForItem(item, cacheKey);
        if (poster) setImageSrc(poster);
      })();
    }
  }, [cacheKey, image, item]);

  // When extraData changes and provides a TMDB profile_path, update imageSrc and cache
  useEffect(() => {
    if (!item.mediaType && !item.media_type && extraData?.profile_path) {
      const tmdbProfileUrl = getImageUrl(extraData.profile_path, 'w185');
      setImageSrc(tmdbProfileUrl);
      if (cacheKey) imageCache.set(cacheKey, tmdbProfileUrl);
    }
  }, [extraData?.profile_path, item.mediaType, item.media_type, cacheKey]);

  useEffect(() => {
    let cancelled = false;
    if (item.name && !item.mediaType && !item.media_type) {
      (async () => {
        setLoadingExtra(true);
        try {
          const data = await fetchPersonExtraData(item.name, cacheKey);
          if (cancelled) return;
          if (data) {
            setExtraData(data);
          }
        } catch (err) {
          console.error('Error fetching TMDB data:', err);
        } finally {
          if (!cancelled) setLoadingExtra(false);
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [item.name, item.mediaType, item.media_type, cacheKey]);

  const handleImageError = () => {
    if (!tmdbFallbackTriedRef.current) {
      tmdbFallbackTriedRef.current = true;
      (async () => {
        const poster = await findPosterForItem(item, cacheKey);
        if (poster) {
          setImageSrc(poster);
          return;
        }
        if (imageSrc !== fallbackImage) {
          setImageSrc(fallbackImage);
          if (cacheKey) imageCache.set(cacheKey, fallbackImage);
        }
      })();
      return;
    }

    if (imageSrc !== fallbackImage) {
      setImageSrc(fallbackImage);
      if (cacheKey) imageCache.set(cacheKey, fallbackImage);
    }
  };

  // Check type to determine either mediaType or contributionType
  let typeLine = null;

  if (!item.mediaType && !item.media_type) {
    // Contributor
    const knownForTitles = extraData?.known_for ? extraData.known_for.map(kf => kf.title || kf.name).filter(Boolean).join(', ') : "";
    const truncatedKnownFor = truncateText(knownForTitles, 100);
    typeLine = (
      <span className="text-muted small">
        {truncatedKnownFor || "No known works"}
      </span>
    );
  } else if (item.type === "Title" || item.mediaType) {
    const mediaType = item.mediaType || item.media_type || "Title";
    typeLine = (
      <span className="text-muted small">
        {mediaType}
        {year ? ` · ${year}` : null}
      </span>
    );
  } else {
    // Fallback
    const mediaType = item.mediaType || item.media_type || "Title";
    typeLine = (
      <span className="text-muted small">
        {mediaType}
        {year ? ` · ${year}` : null}
      </span>
    );
  }

  return (
    <Link to={`/page/${item.pageId}`} className="text-decoration-none">
      <div className="card h-100 shadow-sm border-0" style={{ minHeight: '475px' }}>
        <img
          src={imageSrc}
          className="card-img-top"
          alt={title}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={handleImageError}
        />
        <div className="card-body ">
          <p className="text-uppercase text-muted small mb-2">{displayFocusKey}</p>

          <h5 className="card-title mb-1">{title}</h5>
          <p className="card-subtitle text-muted mb-1">{subtitle}</p>

          {loadingExtra ? (
            <div className="mb-2" style={{ height: 28, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%' }}>
                <LoadingState message={null} />
              </div>
            </div>
          ) : (
            typeLine && <div className="mb-2">{typeLine}</div>
          )}

          <p className="card-text small mb-0" style={{ whiteSpace: 'pre-line' }}>
            {truncateText(description, 150)}
          </p>
        </div>
      </div>
    </Link>
  );
}