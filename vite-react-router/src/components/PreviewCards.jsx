import { useEffect, useState } from 'react';
import fallbackImageAsset from '../pics/Image-not-found.png';
import tmdbApi from '../business-logic-layer/ApiClient/ApiClientTMDB';

const truncateText = (text, max = 240) => {
  if (!text) return "";
  const str = String(text);
  if (str.length <= max) return str;
  return `${str.slice(0, max - 3).trimEnd()}...`;
};

const resolveTitle = (item) => item?.title || item?.name || "Untitled";

const resolveSubtitle = (item, extraData) => {
  let sub = "";
  if (!item.mediaType && !item.media_type) {
    // Contributor - no subtitle
    sub = "";
  } else if (item.type === "Title" || item.mediaType) {
    sub = item.subtitle || "";
  } else {
    // For items without type, assume Title and return subtitle or empty
    sub = item.subtitle || "";
  }
  return sub;
};

const resolveDescription = (item, extraData) => {
  if (!item.mediaType && !item.media_type) {
    // For contributors, prioritize TMDB data
    if (extraData?.biography) return `Biography: ${extraData.biography}`;
    if (extraData?.known_for_title) {
      const overview = extraData.known_for_overview ? `\n${extraData.known_for_overview}` : "";
      return `Contributed to: ${extraData.known_for_title}${overview}`;
    }
    return "No data available for this entry.";
  }
  if (item?.description || item?.blurb || item?.bio || item?.plot) {
    return item.description || item.blurb || item.bio || item.plot;
  }
  if (extraData?.biography) return `Biography: ${extraData.biography}`;
  if (extraData?.known_for_title) {
    const overview = extraData.known_for_overview ? `\n${extraData.known_for_overview}` : "";
    return `Contributed to: ${extraData.known_for_title}${overview}`;
  }
  return "No data available for this entry.";
};

const resolveImage = (item, extraData) => {
  // For contributors, prefer TMDB profile image if available
  if (!item.mediaType && !item.media_type && extraData?.profile_path) {
    return `https://image.tmdb.org/t/p/w185${extraData.profile_path}`;
  }

  const raw = item?.image || item?.poster;
  if (!raw) return null;

  // Some API responses embed a dev-time path like "/src/pics/Image-not-found.png"; treat as missing
  if (typeof raw === "string" && raw.includes("/src/pics/Image-not-found.png")) {
    return null;
  }

  return raw;
};

const fallbackImage = fallbackImageAsset;

const resolveYear = (item) => {
  if (item.year && item.year !== "n/a") return item.year;
  if (item.startYear && item.startYear !== "n/a") return item.startYear;
  if (item.releaseDate && item.releaseDate !== "n/a") {
    const date = new Date(item.releaseDate);
    if (!isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }
  return "n/a";
};

export default function PreviewCards({ item = {}, focusKey }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [extraData, setExtraData] = useState(null);

  const displayFocusKey = (!item.mediaType && !item.media_type) ? (extraData?.known_for_department || "CONTRIBUTOR") : item.mediaType?.toUpperCase() || "TITLE";

  const title = resolveTitle(item);
  const subtitle = resolveSubtitle(item, extraData);
  const description = truncateText(resolveDescription(item, extraData));
  const image = resolveImage(item, extraData);
  const year = resolveYear(item);

  useEffect(() => {
    setImageSrc(image || fallbackImage);
  }, [image]);

  useEffect(() => {
    // Fetch TMDB data for contributors (items without mediaType but with name)
    if (item.name && !item.mediaType && !item.media_type) {
      console.log('Fetching TMDB for:', item.name);
      tmdbApi.searchPerson(item.name).then(data => {
        console.log('TMDB data:', data);
        if (data.results && data.results.length > 0) {
          // Default to the first result from TMDB and enrich with person details
          const result = data.results[0];

          const knownForItem = result.known_for?.[0];
          const knownForTitle = knownForItem?.title || knownForItem?.name || null;
          const knownForOverview = knownForItem?.overview || null;
          const knownForYear = (knownForItem?.release_date || knownForItem?.first_air_date || "").slice(0, 4) || null;

          // Fetch full person details
          tmdbApi.getPerson(result.id).then(personData => {
            console.log('Person details:', personData);

            const topCredit = personData?.combined_credits?.cast?.[0] || null;
            const topCreditRole = topCredit?.character || null;
            const topCreditTitle = topCredit?.title || topCredit?.name || null;
            const topCreditType = topCredit?.media_type || null;

            setExtraData({
              profile_path: result.profile_path,
              popularity: result.popularity,
              known_for_department: result.known_for_department,
              biography: personData?.biography,
              place_of_birth: personData?.place_of_birth,
              also_known_as: personData?.also_known_as,
              known_for_title: knownForTitle || topCreditTitle,
              known_for_year: knownForYear,
              known_for_overview: knownForOverview,
              top_credit_role: topCreditRole,
              top_credit_media_type: topCreditType,
              known_for: result.known_for
            });
          }).catch(err => console.error('Error fetching person details:', err));
        }
      }).catch(err => console.error('Error fetching TMDB data:', err));
    } else {
      console.log('Not fetching TMDB, mediaType:', item.mediaType, 'media_type:', item.media_type, 'name:', item.name);
    }
  }, [item.name, item.mediaType, item.media_type]);

  const handleImageError = () => {
    if (imageSrc !== fallbackImage) setImageSrc(fallbackImage);
  };

  // Check type to determine either mediaType or contributionType
  let typeLine = null;

  if (!item.mediaType && !item.media_type) {
    // Contributor
    const knownForTitles = extraData?.known_for ? extraData.known_for.map(kf => kf.title || kf.name).filter(Boolean).join(', ') : "";
    const truncatedKnownFor = truncateText(knownForTitles, 100); // Shorter truncate for typeLine
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

        <h5 className="card-title mb-1">{title}{(!item.mediaType && !item.media_type && extraData?.popularity) ? ` (${extraData.popularity})` : ''}</h5>
        <p className="card-subtitle text-muted mb-1">{subtitle}</p>

        {typeLine && <div className="mb-2">{typeLine}</div>}

        <p className="card-text small mb-0" style={{ whiteSpace: 'pre-line' }}>
          {description}
        </p>
      </div>
    </div>
  );
}