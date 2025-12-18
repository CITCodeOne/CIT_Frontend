import tmdbApi from '../../business-logic-layer/ApiClient/ApiClientTMDB';
import { getImageUrl, getTitlePoster } from '../../business-logic-layer/TmdbIntegration';
import fallbackImageAsset from '../../pics/Image-not-found.png';

export const imageCache = new Map();
export const extraDataCache = new Map();
export const tmdbPosterCache = new Map();

export const fallbackImage = fallbackImageAsset;

export const cacheKeyForItem = (item) => {
  return (
    item?.pageId ||
    item?.id ||
    item?._id ||
    item?.imdbId ||
    item?.imdb_id ||
    item?.tmdbId ||
    item?.tmdb_id ||
    item?.name ||
    item?.title ||
    "unknown"
  );
};

export const truncateText = (text, max = 500) => {
  if (!text) return "";
  const str = String(text);
  if (str.length <= max) return str;
  return `${str.slice(0, max - 3).trimEnd()}...`;
};

export const resolveTitle = (item) => item?.title || item?.name || "Untitled";

export const resolveSubtitle = (item, extraData) => {
  let sub = "";
  if (!item.mediaType && !item.media_type) {
    sub = "";
  } else if (item.type === "Title" || item.mediaType) {
    sub = item.subtitle || "";
  } else {
    sub = item.subtitle || "";
  }
  return sub;
};

export const resolveDescription = (item, extraData) => {
  if (!item.mediaType && !item.media_type) {
    if (extraData?.biography) return `Biography: ${extraData.biography}`;
    if (extraData?.known_for_title) {
      const overview = extraData?.known_for_overview ? `\n${extraData.known_for_overview}` : "";
      return `Contributed to: ${extraData.known_for_title}${overview}`;
    }
    return "No data available for this entry.";
  }
  if (item?.description || item?.blurb || item?.bio || item?.plot) {
    return item.description || item.blurb || item.bio || item.plot;
  }
  if (extraData?.biography) return `Biography: ${extraData.biography}`;
  if (extraData?.known_for_title) {
    const overview = extraData?.known_for_overview ? `\n${extraData.known_for_overview}` : "";
    return `Contributed to: ${extraData.known_for_title}${overview}`;
  }
  return "No data available for this entry.";
};

export const resolveImage = (item, extraData) => {
  if (!item.mediaType && !item.media_type && extraData?.profile_path) {
    return getImageUrl(extraData.profile_path, 'w185');
  }

  const raw = item?.image || item?.poster;
  if (!raw) return null;

  if (typeof raw === "string" && raw.includes("/src/pics/Image-not-found.png")) {
    return null;
  }

  return raw;
};

export const resolveYear = (item) => {
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

export const findPosterForItem = async (item, cacheKey) => {
  if (cacheKey && tmdbPosterCache.has(cacheKey)) {
    return tmdbPosterCache.get(cacheKey);
  }

  try {
    let posterUrl = null;

    // Try to resolve a human-friendly title/name and year from multiple possible fields
    const titleName = item?.title || item?.name || item?.original_title || null;
    const mediaType = item?.mediaType || item?.media_type || (item?.type === 'Title' ? 'movie' : null) || 'movie';
    const titleYear = item?.year || item?.startYear || item?.releaseYear || item?.release_date || null;

    if (titleName) {
      posterUrl = await getTitlePoster(titleName, mediaType, titleYear);
    }

    if (!posterUrl && (item?.imdbId || item?.imdb_id)) {
      const movie = await tmdbApi.getMovieByImdb(item.imdbId || item.imdb_id);
      posterUrl = getImageUrl(movie?.poster_path) || null;
    }

    if (!posterUrl && (item?.tmdbId || item?.tmdb_id)) {
      const movie = await tmdbApi.getMovie(item.tmdbId || item.tmdb_id);
      posterUrl = getImageUrl(movie?.poster_path) || null;
    }

    if (posterUrl) {
      if (cacheKey) {
        imageCache.set(cacheKey, posterUrl);
        tmdbPosterCache.set(cacheKey, posterUrl);
      }
      return posterUrl;
    }
  } catch (err) {
    console.error('TMDB poster lookup failed', err);
  }

  if (cacheKey) imageCache.set(cacheKey, fallbackImage);
  return fallbackImage;
};

export const fetchPersonExtraData = async (name, cacheKey) => {
  if (!name) return null;
  if (cacheKey && extraDataCache.has(cacheKey)) return extraDataCache.get(cacheKey);

  try {
    const data = await tmdbApi.searchPerson(name);
    if (data?.results && data.results.length > 0) {
      const result = data.results[0];

      const knownForItem = result.known_for?.[0];
      const knownForTitle = knownForItem?.title || knownForItem?.name || null;
      const knownForOverview = knownForItem?.overview || null;
      const knownForYear = (knownForItem?.release_date || knownForItem?.first_air_date || "").slice(0, 4) || null;

      const personData = await tmdbApi.getPerson(result.id);

      const topCredit = personData?.combined_credits?.cast?.[0] || null;
      const topCreditRole = topCredit?.character || null;
      const topCreditTitle = topCredit?.title || topCredit?.name || null;
      const topCreditType = topCredit?.media_type || null;

      const enriched = {
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
      };

      if (cacheKey) extraDataCache.set(cacheKey, enriched);
      return enriched;
    }
  } catch (err) {
    console.error('Error fetching person extra data', err);
  }

  return null;
};

export default {
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
  fetchPersonExtraData,
  fallbackImage
};
